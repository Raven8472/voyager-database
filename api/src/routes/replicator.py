from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ..support import (
    api_to_storage_user_pattern_id,
    build_display_name,
    ensure_user_data_ready,
    execute_write,
    fetch_all,
    fetch_one,
    get_crew_identity,
    get_current_user,
    storage_to_api_user_pattern_id,
    user_data_tables_exist,
)

router = APIRouter(prefix="/replicator", tags=["replicator"])


class ReplicatorLogCreate(BaseModel):
    crew_id: int
    replicator_unit_id: str = Field(min_length=1, max_length=20)
    pattern_id: int
    timestamp: str = Field(min_length=1, max_length=25)


class ReplicatorPatternCreate(BaseModel):
    pattern_name: str = Field(min_length=1, max_length=100)
    category: Optional[str] = Field(default=None, max_length=50)
    origin_species: Optional[str] = Field(default=None, max_length=50)
    energy_cost: Optional[float] = None
    description: Optional[str] = None
    last_updated_stardate: Optional[str] = Field(default=None, max_length=50)


@router.get("/logs")
def get_replicator_logs(
    search: Optional[str] = Query(default=None),
    crew_id: Optional[int] = Query(default=None),
    current_user=Depends(get_current_user),
):
    try:
        if not user_data_tables_exist():
            return []

        rows = fetch_all(
            """
            SELECT
                log_id,
                crew_id,
                replicator_unit_id,
                pattern_id,
                timestamp
            FROM user_replicator_logs
            WHERE user_id = %s
            ORDER BY log_id DESC
            """,
            (current_user["user_id"],),
        )

        base_pattern_map = {
            row["pattern_id"]: row
            for row in fetch_all(
                """
                SELECT
                    PatternID AS pattern_id,
                    PatternName AS pattern_name,
                    Category AS category
                FROM replicatorpatterns
                """
            )
        }
        user_pattern_map = {
            storage_to_api_user_pattern_id(row["pattern_id"]): row
            for row in fetch_all(
                """
                SELECT
                    pattern_id,
                    pattern_name,
                    category
                FROM user_replicator_patterns
                WHERE user_id = %s
                """,
                (current_user["user_id"],),
            )
        }
        unit_map = {
            row["unit_id"]: row
            for row in fetch_all(
                """
                SELECT
                    ru.ReplicatorUnitID AS unit_id,
                    ru.ReplicatorType AS replicator_type,
                    ru.AccessLevel AS access_level,
                    sc.CompartmentName AS compartment_name
                FROM replicatorunits ru
                LEFT JOIN shipcompartments sc
                    ON sc.CompartmentID = ru.CompartmentID
                """
            )
        }

        resolved_rows = []
        for row in rows:
            if crew_id is not None and row["crew_id"] != crew_id:
                continue
            identity = get_crew_identity(current_user["user_id"], row["crew_id"])
            pattern = user_pattern_map.get(row["pattern_id"]) if row["pattern_id"] < 0 else base_pattern_map.get(row["pattern_id"])
            unit = unit_map.get(row["replicator_unit_id"], {})
            resolved = {
                "log_id": row["log_id"],
                "crew_id": row["crew_id"],
                "replicator_unit_id": row["replicator_unit_id"],
                "pattern_id": row["pattern_id"],
                "timestamp": row["timestamp"],
                "first_name": identity["first_name"] if identity else "",
                "last_name": identity["last_name"] if identity else "",
                "pattern_name": pattern["pattern_name"] if pattern else None,
                "category": pattern["category"] if pattern else None,
                "replicator_type": unit.get("replicator_type"),
                "access_level": unit.get("access_level"),
                "compartment_name": unit.get("compartment_name"),
                "display_name": build_display_name(identity["first_name"], identity["last_name"]) if identity else "Unknown Record",
            }
            search_blob = " ".join(
                [
                    resolved["pattern_name"] or "",
                    resolved["replicator_unit_id"] or "",
                    resolved["compartment_name"] or "",
                    resolved["display_name"] or "",
                ]
            ).lower()
            if search and search.strip().lower() not in search_blob:
                continue
            resolved_rows.append(resolved)
        return resolved_rows
    except Exception as e:
        return {"error": str(e)}


@router.get("/patterns")
def get_replicator_patterns(search: Optional[str] = Query(default=None), current_user=Depends(get_current_user)):
    try:
        filters = []
        params = []
        if search:
            filters.append("(PatternName LIKE %s OR Category LIKE %s OR OriginSpecies LIKE %s)")
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])

        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
        base_patterns = fetch_all(
            f"""
            SELECT
                PatternID AS pattern_id,
                PatternName AS pattern_name,
                Category AS category,
                OriginSpecies AS origin_species,
                EnergyCost AS energy_cost,
                Description AS description,
                LastUpdatedStardate AS last_updated_stardate
            FROM replicatorpatterns
            {where_clause}
            """,
            tuple(params),
        )

        user_patterns = []
        if user_data_tables_exist():
            user_filters = ["user_id = %s"]
            user_params = [current_user["user_id"]]
            if search:
                user_filters.append("(pattern_name LIKE %s OR category LIKE %s OR origin_species LIKE %s)")
                search_term = f"%{search}%"
                user_params.extend([search_term, search_term, search_term])
            user_where = f"WHERE {' AND '.join(user_filters)}"
            user_patterns = [
                {
                    "pattern_id": storage_to_api_user_pattern_id(row["pattern_id"]),
                    "pattern_name": row["pattern_name"],
                    "category": row["category"],
                    "origin_species": row["origin_species"],
                    "energy_cost": row["energy_cost"],
                    "description": row["description"],
                    "last_updated_stardate": row["last_updated_stardate"],
                }
                for row in fetch_all(
                    f"""
                    SELECT
                        pattern_id,
                        pattern_name,
                        category,
                        origin_species,
                        energy_cost,
                        description,
                        last_updated_stardate
                    FROM user_replicator_patterns
                    {user_where}
                    """,
                    tuple(user_params),
                )
            ]

        return sorted(base_patterns + user_patterns, key=lambda row: ((row["pattern_name"] or "").lower(), row["pattern_id"]))
    except Exception as e:
        return {"error": str(e)}


@router.post("/patterns")
def create_replicator_pattern(pattern: ReplicatorPatternCreate, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()
        next_pattern_id = execute_write(
            """
            INSERT INTO user_replicator_patterns (
                user_id,
                pattern_name,
                category,
                origin_species,
                energy_cost,
                description,
                last_updated_stardate
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                current_user["user_id"],
                pattern.pattern_name,
                pattern.category,
                pattern.origin_species,
                pattern.energy_cost,
                pattern.description,
                pattern.last_updated_stardate,
            ),
        )

        return {"status": "ok", "pattern_id": storage_to_api_user_pattern_id(next_pattern_id)}
    except Exception as e:
        return {"error": str(e)}


@router.get("/units")
def get_replicator_units(search: Optional[str] = Query(default=None), current_user=Depends(get_current_user)):
    try:
        filters = []
        params = []
        if search:
            filters.append(
                "(ru.ReplicatorUnitID LIKE %s OR ru.ReplicatorType LIKE %s OR ru.AccessLevel LIKE %s OR sc.CompartmentName LIKE %s)"
            )
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term, search_term])

        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
        return fetch_all(
            f"""
            SELECT
                ru.ReplicatorUnitID AS unit_id,
                ru.ReplicatorType AS replicator_type,
                ru.AccessLevel AS access_level,
                ru.CompartmentID AS compartment_id,
                sc.CompartmentName AS compartment_name
            FROM replicatorunits ru
            LEFT JOIN shipcompartments sc
                ON sc.CompartmentID = ru.CompartmentID
            {where_clause}
            ORDER BY ru.ReplicatorUnitID
            """,
            tuple(params),
        )
    except Exception as e:
        return {"error": str(e)}


@router.post("/logs")
def create_replicator_log(log: ReplicatorLogCreate, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()
        crew_exists = get_crew_identity(current_user["user_id"], log.crew_id)
        if not crew_exists:
            raise HTTPException(status_code=404, detail="Crew member not found")

        unit_exists = fetch_one("SELECT ReplicatorUnitID FROM replicatorunits WHERE ReplicatorUnitID = %s", (log.replicator_unit_id,))
        if not unit_exists:
            raise HTTPException(status_code=404, detail="Replicator unit not found")

        if log.pattern_id < 0:
            pattern_exists = fetch_one(
                "SELECT pattern_id FROM user_replicator_patterns WHERE user_id = %s AND pattern_id = %s",
                (current_user["user_id"], api_to_storage_user_pattern_id(log.pattern_id)),
            )
        else:
            pattern_exists = fetch_one("SELECT PatternID FROM replicatorpatterns WHERE PatternID = %s", (log.pattern_id,))
        if not pattern_exists:
            raise HTTPException(status_code=404, detail="Replicator pattern not found")

        log_id = execute_write(
            """
            INSERT INTO user_replicator_logs (
                user_id,
                crew_id,
                replicator_unit_id,
                pattern_id,
                timestamp
            ) VALUES (%s, %s, %s, %s, %s)
            """,
            (current_user["user_id"], log.crew_id, log.replicator_unit_id, log.pattern_id, log.timestamp),
        )

        return {"status": "ok", "log_id": log_id}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}
