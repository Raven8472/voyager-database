from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from ..support import (
    build_display_name,
    fetch_all,
    fetch_one,
    get_consolidated_holodeck_usage_logs,
    get_current_user,
)

router = APIRouter(prefix="/systems", tags=["systems"])


@router.get("/compartments")
def get_system_compartments(search: Optional[str] = Query(default=None), current_user=Depends(get_current_user)):
    try:
        filters = []
        params = []
        if search:
            filters.append("(CompartmentID LIKE %s OR CompartmentName LIKE %s OR CompartmentDesignation LIKE %s)")
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])

        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
        rows = fetch_all(
            f"""
            SELECT
                sc.CompartmentID AS compartment_id,
                sc.CompartmentName AS compartment_name,
                sc.CompartmentDesignation AS compartment_designation,
                COUNT(DISTINCT ru.ReplicatorUnitID) AS replicator_count,
                COUNT(DISTINCT tu.TransporterUnitID) AS transporter_count,
                COUNT(DISTINCT hd.HolodeckID) AS holodeck_count
            FROM shipcompartments sc
            LEFT JOIN replicatorunits ru
                ON ru.CompartmentID = sc.CompartmentID
            LEFT JOIN transporterunits tu
                ON tu.CompartmentID = sc.CompartmentID
            LEFT JOIN holodecks hd
                ON hd.CompartmentID = sc.CompartmentID
            {where_clause}
            GROUP BY sc.CompartmentID, sc.CompartmentName, sc.CompartmentDesignation
            ORDER BY sc.CompartmentID
            """,
            tuple(params),
        )
        return rows
    except Exception as e:
        return {"error": str(e)}


@router.get("/compartments/{compartment_id}")
def get_system_compartment(compartment_id: str, current_user=Depends(get_current_user)):
    try:
        compartment = fetch_one(
            """
            SELECT
                CompartmentID AS compartment_id,
                CompartmentName AS compartment_name,
                CompartmentDesignation AS compartment_designation
            FROM shipcompartments
            WHERE CompartmentID = %s
            """,
            (compartment_id,),
        )
        if not compartment:
            raise HTTPException(status_code=404, detail="Compartment not found")

        replicators = fetch_all(
            """
            SELECT
                ReplicatorUnitID AS unit_id,
                ReplicatorType AS unit_type,
                AccessLevel AS access_level
            FROM replicatorunits
            WHERE CompartmentID = %s
            ORDER BY ReplicatorUnitID
            """,
            (compartment_id,),
        )

        transporters = fetch_all(
            """
            SELECT
                TransporterUnitID AS unit_id
            FROM transporterunits
            WHERE CompartmentID = %s
            ORDER BY TransporterUnitID
            """,
            (compartment_id,),
        )

        holodecks = fetch_all(
            """
            SELECT
                h.HolodeckID AS holodeck_id,
                h.HolodeckDesignation AS holodeck_designation,
                h.AccessLevel AS access_level,
                COUNT(hp.ProgramID) AS program_count
            FROM holodecks h
            LEFT JOIN holodeckprograms hp
                ON hp.HolodeckID = h.HolodeckID
            WHERE h.CompartmentID = %s
            GROUP BY h.HolodeckID, h.HolodeckDesignation, h.AccessLevel
            ORDER BY h.HolodeckID
            """,
            (compartment_id,),
        )

        holodeck_programs = fetch_all(
            """
            SELECT
                hp.ProgramID AS program_id,
                hp.ProgramName AS program_name,
                hp.HolodeckID AS holodeck_id,
                hp.CreatedBy AS created_by,
                hp.AccessLevel AS access_level,
                hp.Genre AS genre
            FROM holodeckprograms hp
            INNER JOIN holodecks h
                ON h.HolodeckID = hp.HolodeckID
            WHERE h.CompartmentID = %s
            ORDER BY hp.HolodeckID, hp.ProgramName
            """,
            (compartment_id,),
        )

        holodeck_usage_logs = get_consolidated_holodeck_usage_logs(
            current_user["user_id"],
            compartment_id=compartment_id,
        )
        resolved_holodeck_usage_logs = [
            {
                "usage_log_id": row["usage_log_id"],
                "crew_id": row["crew_id"],
                "program_id": row["program_id"],
                "holodeck_id": row["holodeck_id"],
                "stardate": row["stardate"],
                "program_name": row["program_name"],
                "created_by": row["created_by"],
                "genre": row["genre"],
                "holodeck_designation": row["holodeck_designation"],
                "first_name": row.get("first_name") or "",
                "last_name": row.get("last_name") or "",
                "display_name": build_display_name(row.get("first_name"), row.get("last_name")),
            }
            for row in holodeck_usage_logs
        ]

        return {
            **compartment,
            "replicators": replicators,
            "transporters": transporters,
            "holodecks": holodecks,
            "holodeck_programs": holodeck_programs,
            "holodeck_usage_logs": resolved_holodeck_usage_logs,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}
