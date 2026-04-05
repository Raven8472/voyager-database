
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ..support import (
    api_to_storage_custom_crew_id,
    build_display_name,
    ensure_user_data_ready,
    execute_write,
    fetch_all,
    fetch_custom_crew_rows,
    fetch_one,
    get_crew_identity,
    get_current_user,
    get_latest_user_actions_map,
    storage_to_api_custom_crew_id,
    user_data_tables_exist,
)

router = APIRouter(tags=["crew"])


class PersonnelActionCreate(BaseModel):
    crew_id: int
    action_type: str = Field(min_length=3, max_length=50)
    old_rank: Optional[str] = Field(default=None, max_length=30)
    new_rank: Optional[str] = Field(default=None, max_length=30)
    old_species: Optional[str] = Field(default=None, max_length=50)
    new_species: Optional[str] = Field(default=None, max_length=50)
    old_planet_of_origin: Optional[str] = Field(default=None, max_length=50)
    new_planet_of_origin: Optional[str] = Field(default=None, max_length=50)
    old_department_id: Optional[int] = None
    new_department_id: Optional[int] = None
    effective_stardate: Optional[str] = Field(default=None, max_length=30)
    episode_reference: Optional[str] = Field(default=None, max_length=100)
    entered_by: Optional[str] = Field(default="Records Officer", max_length=100)
    action_notes: Optional[str] = None


class CrewCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    crew_rank: Optional[str] = Field(default=None, max_length=30)
    birth_stardate: Optional[float] = None
    planet_of_origin: Optional[str] = Field(default=None, max_length=50)
    species: Optional[str] = Field(default=None, max_length=50)
    crew_designation: str = Field(min_length=1, max_length=20)
    service_number: Optional[str] = Field(default=None, max_length=20)
    department_id: Optional[int] = None


@router.get("/crew")
def get_crew(
    search: Optional[str] = Query(default=None),
    department_id: Optional[int] = Query(default=None),
    designation: Optional[str] = Query(default=None),
    current_user=Depends(get_current_user),
):
    try:
        filters = []
        params = []

        if search:
            filters.append(
                "(c.first_name LIKE %s OR c.last_name LIKE %s OR CONCAT(c.first_name, ' ', c.last_name) LIKE %s)"
            )
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])

        if department_id:
            filters.append("c.department_id = %s")
            params.append(department_id)

        if designation:
            filters.append("c.crew_designation = %s")
            params.append(designation)

        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
        rows = fetch_all(
            f"""
            SELECT
                c.crew_id,
                c.first_name,
                c.last_name,
                c.crew_rank,
                c.department_id,
                c.species,
                c.crew_designation,
                d.department_name
            FROM crew c
            LEFT JOIN departments d
                ON c.department_id = d.department_id
            {where_clause}
            ORDER BY c.last_name, c.first_name
            """,
            tuple(params),
        )
        latest_actions = get_latest_user_actions_map(current_user["user_id"], [row["crew_id"] for row in rows])
        base_results = []
        for row in rows:
            action = latest_actions.get(row["crew_id"])
            resolved_department_id = action["new_department_id"] if action else row["department_id"]
            resolved_department = (
                fetch_one("SELECT department_name FROM departments WHERE department_id = %s", (resolved_department_id,))
                if resolved_department_id
                else None
            )
            base_results.append(
                {
                    "crew_id": row["crew_id"],
                    "first_name": row["first_name"],
                    "last_name": row["last_name"],
                    "name": f'{row["first_name"]} {row["last_name"]}',
                    "rank": action["new_rank"] if action else row["crew_rank"],
                    "department_id": resolved_department_id,
                    "department": resolved_department["department_name"] if resolved_department else row["department_name"],
                    "species": action["new_species"] if action else row["species"],
                    "designation": row["crew_designation"],
                }
            )

        custom_results = [
            {
                "crew_id": storage_to_api_custom_crew_id(row["custom_crew_id"]),
                "first_name": row["first_name"],
                "last_name": row["last_name"],
                "name": f'{row["first_name"]} {row["last_name"]}',
                "rank": row["crew_rank"],
                "department_id": row["department_id"],
                "department": row["department_name"],
                "species": row["species"],
                "designation": row["crew_designation"],
            }
            for row in fetch_custom_crew_rows(current_user["user_id"], search, department_id, designation)
        ]

        return sorted(base_results + custom_results, key=lambda row: ((row["last_name"] or "").lower(), (row["first_name"] or "").lower()))
    except Exception as e:
        return {"error": str(e)}


@router.post("/crew")
def create_crew_member(crew_member: CrewCreate, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()
        if crew_member.department_id is not None:
            department = fetch_one(
                "SELECT department_id FROM departments WHERE department_id = %s",
                (crew_member.department_id,),
            )
            if not department:
                raise HTTPException(status_code=404, detail="Department not found")

        crew_id = execute_write(
            """
            INSERT INTO user_custom_crew (
                user_id,
                first_name,
                last_name,
                crew_rank,
                birth_stardate,
                planet_of_origin,
                species,
                crew_designation,
                service_number,
                department_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                current_user["user_id"],
                crew_member.first_name,
                crew_member.last_name,
                crew_member.crew_rank,
                crew_member.birth_stardate,
                crew_member.planet_of_origin,
                crew_member.species,
                crew_member.crew_designation,
                crew_member.service_number,
                crew_member.department_id,
            ),
        )

        return {"status": "ok", "crew_id": storage_to_api_custom_crew_id(crew_id)}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


@router.get("/crew/{crew_id}")
def get_crew_member(crew_id: int, current_user=Depends(get_current_user)):
    try:
        row = get_crew_identity(current_user["user_id"], crew_id)
        if not row:
            raise HTTPException(status_code=404, detail="Crew member not found")

        action_history = []
        if user_data_tables_exist():
            action_history = fetch_all(
                """
                SELECT
                    action_id,
                    action_type,
                    old_rank,
                    new_rank,
                    old_species,
                    new_species,
                    old_planet_of_origin,
                    new_planet_of_origin,
                    old_department_id,
                    new_department_id,
                    effective_stardate,
                    episode_reference,
                    entered_by,
                    action_notes,
                    created_at
                FROM user_personnel_actions
                WHERE user_id = %s
                  AND crew_id = %s
                ORDER BY created_at DESC, action_id DESC
                """,
                (current_user["user_id"], crew_id),
            )

        return {
            "crew_id": row["crew_id"],
            "first_name": row["first_name"],
            "last_name": row["last_name"],
            "name": f'{row["first_name"]} {row["last_name"]}',
            "rank": row["rank"],
            "birth_stardate": row["birth_stardate"],
            "planet_of_origin": row["planet_of_origin"],
            "species": row["species"],
            "designation": row["designation"],
            "service_number": row["service_number"],
            "department_id": row["department_id"],
            "department": row["department"],
            "personnel_actions": action_history,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


@router.get("/departments")
def get_departments(current_user=Depends(get_current_user)):
    try:
        return fetch_all(
            """
            SELECT
                department_id,
                department_name
            FROM departments
            ORDER BY department_name
            """
        )
    except Exception as e:
        return {"error": str(e)}


@router.get("/departments/{department_id}")
def get_department(department_id: int, current_user=Depends(get_current_user)):
    try:
        department = fetch_one(
            """
            SELECT
                department_id,
                department_name
            FROM departments
            WHERE department_id = %s
            """,
            (department_id,),
        )

        if not department:
            raise HTTPException(status_code=404, detail="Department not found")

        return department
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


@router.get("/crew-with-department")
def get_crew_with_department(current_user=Depends(get_current_user)):
    return get_crew(current_user=current_user)


@router.get("/personnel-actions/recent")
def get_recent_personnel_actions(limit: int = Query(default=10, ge=1, le=50), current_user=Depends(get_current_user)):
    try:
        if not user_data_tables_exist():
            return []

        rows = fetch_all(
            """
            SELECT
                action_id,
                crew_id,
                action_type,
                old_rank,
                new_rank,
                effective_stardate,
                episode_reference,
                entered_by,
                action_notes,
                created_at
            FROM user_personnel_actions
            WHERE user_id = %s
            ORDER BY created_at DESC, action_id DESC
            LIMIT %s
            """,
            (current_user["user_id"], limit),
        )

        response = []
        for row in rows:
            identity = get_crew_identity(current_user["user_id"], row["crew_id"])
            response.append(
                {
                    "action_id": row["action_id"],
                    "crew_id": row["crew_id"],
                    "first_name": identity["first_name"] if identity else "",
                    "last_name": identity["last_name"] if identity else "",
                    "name": build_display_name(identity["first_name"], identity["last_name"]) if identity else "Unknown Record",
                    "action_type": row["action_type"],
                    "old_rank": row["old_rank"],
                    "new_rank": row["new_rank"],
                    "effective_stardate": row["effective_stardate"],
                    "episode_reference": row["episode_reference"],
                    "entered_by": row["entered_by"],
                    "action_notes": row["action_notes"],
                    "created_at": row["created_at"],
                }
            )
        return response
    except Exception as e:
        return {"error": str(e)}


@router.post("/personnel-actions")
def create_personnel_action(action: PersonnelActionCreate, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()
        crew_member = get_crew_identity(current_user["user_id"], action.crew_id)
        if not crew_member:
            raise HTTPException(status_code=404, detail="Crew member not found")

        action_payload = {
            "old_rank": action.old_rank or crew_member["rank"],
            "new_rank": action.new_rank or crew_member["rank"],
            "old_species": action.old_species or crew_member["species"],
            "new_species": action.new_species or crew_member["species"],
            "old_planet_of_origin": action.old_planet_of_origin or crew_member["planet_of_origin"],
            "new_planet_of_origin": action.new_planet_of_origin or crew_member["planet_of_origin"],
            "old_department_id": action.old_department_id if action.old_department_id is not None else crew_member["department_id"],
            "new_department_id": action.new_department_id if action.new_department_id is not None else crew_member["department_id"],
        }

        action_id = execute_write(
            """
            INSERT INTO user_personnel_actions (
                user_id,
                crew_id,
                action_type,
                old_rank,
                new_rank,
                old_species,
                new_species,
                old_planet_of_origin,
                new_planet_of_origin,
                old_department_id,
                new_department_id,
                effective_stardate,
                episode_reference,
                entered_by,
                action_notes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                current_user["user_id"],
                action.crew_id,
                action.action_type,
                action_payload["old_rank"],
                action_payload["new_rank"],
                action_payload["old_species"],
                action_payload["new_species"],
                action_payload["old_planet_of_origin"],
                action_payload["new_planet_of_origin"],
                action_payload["old_department_id"],
                action_payload["new_department_id"],
                action.effective_stardate,
                action.episode_reference,
                action.entered_by,
                action.action_notes,
            ),
        )

        if action.crew_id < 0:
            execute_write(
                """
                UPDATE user_custom_crew
                SET crew_rank = %s,
                    species = %s,
                    planet_of_origin = %s,
                    department_id = %s
                WHERE user_id = %s
                  AND custom_crew_id = %s
                """,
                (
                    action_payload["new_rank"],
                    action_payload["new_species"],
                    action_payload["new_planet_of_origin"],
                    action_payload["new_department_id"],
                    current_user["user_id"],
                    api_to_storage_custom_crew_id(action.crew_id),
                ),
            )

        return {"status": "ok", "action_id": action_id}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}
