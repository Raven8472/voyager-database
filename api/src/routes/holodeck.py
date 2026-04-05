from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ..support import (
    api_to_storage_user_holodeck_program_id,
    build_display_name,
    ensure_user_data_ready,
    execute_write,
    fetch_all,
    fetch_one,
    get_crew_identity,
    get_current_user,
    storage_to_api_user_holodeck_program_id,
    user_data_tables_exist,
)

router = APIRouter(prefix="/holodeck", tags=["holodeck"])


class HolodeckLogCreate(BaseModel):
    crew_id: int
    program_id: str = Field(min_length=1, max_length=20)
    holodeck_id: str = Field(min_length=1, max_length=10)
    stardate: str = Field(min_length=1, max_length=20)


class HolodeckProgramCreate(BaseModel):
    program_name: str = Field(min_length=1, max_length=100)
    holodeck_id: str = Field(min_length=1, max_length=10)
    created_by: Optional[str] = Field(default=None, max_length=50)
    access_level: Optional[str] = Field(default=None, max_length=20)
    genre: Optional[str] = Field(default=None, max_length=30)
    description: Optional[str] = None


@router.get("/logs")
def get_holodeck_logs(
    search: Optional[str] = Query(default=None),
    crew_id: Optional[int] = Query(default=None),
    program_id: Optional[str] = Query(default=None),
    holodeck_id: Optional[str] = Query(default=None),
    current_user=Depends(get_current_user),
):
    try:
        base_rows = fetch_all(
            """
            SELECT
                hul.UsageLogID AS usage_log_id,
                hul.CrewID AS crew_id,
                hul.ProgramID AS program_id,
                hul.HolodeckID AS holodeck_id,
                hul.Stardate AS stardate,
                hp.ProgramName AS program_name,
                hp.CreatedBy AS created_by,
                hp.Genre AS genre,
                h.HolodeckDesignation AS holodeck_designation,
                sc.CompartmentName AS compartment_name
            FROM holodeckusagelog hul
            INNER JOIN holodeckprograms hp
                ON hp.ProgramID = hul.ProgramID
            INNER JOIN holodecks h
                ON h.HolodeckID = hul.HolodeckID
            LEFT JOIN shipcompartments sc
                ON sc.CompartmentID = h.CompartmentID
            ORDER BY hul.UsageLogID DESC
            """
        )

        user_rows = []
        if user_data_tables_exist():
            user_rows = fetch_all(
                """
                SELECT
                    log_id,
                    crew_id,
                    program_id,
                    holodeck_id,
                    stardate,
                    created_at
                FROM user_holodeck_logs
                WHERE user_id = %s
                ORDER BY log_id DESC
                """,
                (current_user["user_id"],),
            )

        base_program_map = {
            row["program_id"]: row
            for row in fetch_all(
                """
                SELECT
                    hp.ProgramID AS program_id,
                    hp.ProgramName AS program_name,
                    hp.HolodeckID AS holodeck_id,
                    hp.CreatedBy AS created_by,
                    hp.AccessLevel AS access_level,
                    hp.Genre AS genre,
                    hp.Description AS description
                FROM holodeckprograms hp
                """
            )
        }
        user_program_map = {}
        if user_data_tables_exist():
            user_program_map = {
                storage_to_api_user_holodeck_program_id(row["program_id"]): row
                for row in fetch_all(
                    """
                    SELECT
                        program_id,
                        program_name,
                        holodeck_id,
                        created_by,
                        access_level,
                        genre,
                        description
                    FROM user_holodeck_programs
                    WHERE user_id = %s
                    """,
                    (current_user["user_id"],),
                )
            }

        unit_map = {
            row["holodeck_id"]: row
            for row in fetch_all(
                """
                SELECT
                    h.HolodeckID AS holodeck_id,
                    h.HolodeckDesignation AS holodeck_designation,
                    sc.CompartmentName AS compartment_name
                FROM holodecks h
                LEFT JOIN shipcompartments sc
                    ON sc.CompartmentID = h.CompartmentID
                """
            )
        }

        resolved_rows = []
        for row in base_rows:
            if crew_id is not None and row["crew_id"] != crew_id:
                continue
            if program_id is not None and row["program_id"] != program_id:
                continue
            if holodeck_id is not None and row["holodeck_id"] != holodeck_id:
                continue

            identity = get_crew_identity(current_user["user_id"], row["crew_id"])
            resolved = {
                "log_id": f"base-{row['usage_log_id']}",
                "usage_log_id": row["usage_log_id"],
                "crew_id": row["crew_id"],
                "program_id": row["program_id"],
                "holodeck_id": row["holodeck_id"],
                "stardate": row["stardate"],
                "program_name": row["program_name"],
                "created_by": row["created_by"],
                "genre": row["genre"],
                "holodeck_designation": row["holodeck_designation"],
                "compartment_name": row["compartment_name"],
                "first_name": identity["first_name"] if identity else "",
                "last_name": identity["last_name"] if identity else "",
                "display_name": build_display_name(identity["first_name"], identity["last_name"]) if identity else "Unknown Record",
            }
            search_blob = " ".join(
                [
                    resolved["display_name"] or "",
                    resolved["program_name"] or "",
                    resolved["created_by"] or "",
                    resolved["genre"] or "",
                    resolved["holodeck_id"] or "",
                    resolved["holodeck_designation"] or "",
                    resolved["compartment_name"] or "",
                    resolved["stardate"] or "",
                ]
            ).lower()
            if search and search.strip().lower() not in search_blob:
                continue
            resolved_rows.append(resolved)

        for row in user_rows:
            if crew_id is not None and row["crew_id"] != crew_id:
                continue
            if program_id is not None and row["program_id"] != program_id:
                continue
            if holodeck_id is not None and row["holodeck_id"] != holodeck_id:
                continue

            identity = get_crew_identity(current_user["user_id"], row["crew_id"])
            program = user_program_map.get(row["program_id"]) if str(row["program_id"]).startswith("UHP-") else base_program_map.get(row["program_id"])
            unit = unit_map.get(row["holodeck_id"], {})
            resolved = {
                "log_id": f"user-{row['log_id']}",
                "usage_log_id": row["log_id"],
                "crew_id": row["crew_id"],
                "program_id": row["program_id"],
                "holodeck_id": row["holodeck_id"],
                "stardate": row["stardate"],
                "program_name": program["program_name"] if program else row["program_id"],
                "created_by": program["created_by"] if program else None,
                "genre": program["genre"] if program else None,
                "holodeck_designation": unit.get("holodeck_designation"),
                "compartment_name": unit.get("compartment_name"),
                "first_name": identity["first_name"] if identity else "",
                "last_name": identity["last_name"] if identity else "",
                "display_name": build_display_name(identity["first_name"], identity["last_name"]) if identity else "Unknown Record",
            }
            search_blob = " ".join(
                [
                    resolved["display_name"] or "",
                    resolved["program_name"] or "",
                    resolved["created_by"] or "",
                    resolved["genre"] or "",
                    resolved["holodeck_id"] or "",
                    resolved["holodeck_designation"] or "",
                    resolved["compartment_name"] or "",
                    resolved["stardate"] or "",
                ]
            ).lower()
            if search and search.strip().lower() not in search_blob:
                continue
            resolved_rows.append(resolved)

        resolved_rows.sort(key=lambda row: (row["stardate"] or "", row["log_id"]), reverse=True)
        return resolved_rows
    except Exception as e:
        return {"error": str(e)}


@router.get("/programs")
def get_holodeck_programs(search: Optional[str] = Query(default=None), current_user=Depends(get_current_user)):
    try:
        filters = []
        params = []
        if search:
            filters.append("(hp.ProgramName LIKE %s OR hp.CreatedBy LIKE %s OR hp.Genre LIKE %s OR h.HolodeckDesignation LIKE %s)")
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term, search_term])

        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
        base_programs = fetch_all(
            f"""
            SELECT
                hp.ProgramID AS program_id,
                hp.ProgramName AS program_name,
                hp.HolodeckID AS holodeck_id,
                hp.CreatedBy AS created_by,
                hp.AccessLevel AS access_level,
                hp.Genre AS genre,
                hp.Description AS description,
                h.HolodeckDesignation AS holodeck_designation
            FROM holodeckprograms hp
            LEFT JOIN holodecks h
                ON h.HolodeckID = hp.HolodeckID
            {where_clause}
            """,
            tuple(params),
        )

        user_programs = []
        if user_data_tables_exist():
            user_filters = ["uhp.user_id = %s"]
            user_params = [current_user["user_id"]]
            if search:
                user_filters.append("(uhp.program_name LIKE %s OR uhp.created_by LIKE %s OR uhp.genre LIKE %s OR h.HolodeckDesignation LIKE %s)")
                search_term = f"%{search}%"
                user_params.extend([search_term, search_term, search_term, search_term])
            user_where = f"WHERE {' AND '.join(user_filters)}"
            user_programs = [
                {
                    "program_id": storage_to_api_user_holodeck_program_id(row["program_id"]),
                    "program_name": row["program_name"],
                    "holodeck_id": row["holodeck_id"],
                    "created_by": row["created_by"],
                    "access_level": row["access_level"],
                    "genre": row["genre"],
                    "description": row["description"],
                    "holodeck_designation": row["holodeck_designation"],
                }
                for row in fetch_all(
                    f"""
                    SELECT
                        uhp.program_id,
                        uhp.program_name,
                        uhp.holodeck_id,
                        uhp.created_by,
                        uhp.access_level,
                        uhp.genre,
                        uhp.description,
                        h.HolodeckDesignation AS holodeck_designation
                    FROM user_holodeck_programs uhp
                    LEFT JOIN holodecks h
                        ON h.HolodeckID = uhp.holodeck_id
                    {user_where}
                    """,
                    tuple(user_params),
                )
            ]

        return sorted(base_programs + user_programs, key=lambda row: ((row["program_name"] or "").lower(), row["program_id"]))
    except Exception as e:
        return {"error": str(e)}


@router.get("/units")
def get_holodeck_units(current_user=Depends(get_current_user)):
    try:
        return fetch_all(
            """
            SELECT
                h.HolodeckID AS holodeck_id,
                h.HolodeckDesignation AS holodeck_designation,
                h.AccessLevel AS access_level,
                h.CompartmentID AS compartment_id,
                sc.CompartmentName AS compartment_name
            FROM holodecks h
            LEFT JOIN shipcompartments sc
                ON sc.CompartmentID = h.CompartmentID
            ORDER BY h.HolodeckID
            """
        )
    except Exception as e:
        return {"error": str(e)}


@router.post("/programs")
def create_holodeck_program(program: HolodeckProgramCreate, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()
        holodeck_exists = fetch_one("SELECT HolodeckID FROM holodecks WHERE HolodeckID = %s", (program.holodeck_id,))
        if not holodeck_exists:
            raise HTTPException(status_code=404, detail="Holodeck bay not found")

        next_program_id = execute_write(
            """
            INSERT INTO user_holodeck_programs (
                user_id,
                program_name,
                holodeck_id,
                created_by,
                access_level,
                genre,
                description
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                current_user["user_id"],
                program.program_name,
                program.holodeck_id,
                program.created_by,
                program.access_level,
                program.genre,
                program.description,
            ),
        )

        return {"status": "ok", "program_id": storage_to_api_user_holodeck_program_id(next_program_id)}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


@router.post("/logs")
def create_holodeck_log(log: HolodeckLogCreate, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()
        crew_exists = get_crew_identity(current_user["user_id"], log.crew_id)
        if not crew_exists:
            raise HTTPException(status_code=404, detail="Crew member not found")

        holodeck_exists = fetch_one("SELECT HolodeckID FROM holodecks WHERE HolodeckID = %s", (log.holodeck_id,))
        if not holodeck_exists:
            raise HTTPException(status_code=404, detail="Holodeck bay not found")

        if str(log.program_id).startswith("UHP-"):
            program_exists = fetch_one(
                "SELECT program_id FROM user_holodeck_programs WHERE user_id = %s AND program_id = %s",
                (current_user["user_id"], api_to_storage_user_holodeck_program_id(log.program_id)),
            )
        else:
            program_exists = fetch_one("SELECT ProgramID FROM holodeckprograms WHERE ProgramID = %s", (log.program_id,))
        if not program_exists:
            raise HTTPException(status_code=404, detail="Holodeck program not found")

        log_id = execute_write(
            """
            INSERT INTO user_holodeck_logs (
                user_id,
                crew_id,
                program_id,
                holodeck_id,
                stardate
            ) VALUES (%s, %s, %s, %s, %s)
            """,
            (current_user["user_id"], log.crew_id, log.program_id, log.holodeck_id, log.stardate),
        )

        return {"status": "ok", "log_id": log_id}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}
