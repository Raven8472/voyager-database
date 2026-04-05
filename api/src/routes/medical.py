
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ..support import (
    build_display_name,
    ensure_user_data_ready,
    execute_write,
    fetch_all,
    fetch_one,
    fetch_custom_crew_rows,
    get_crew_identity,
    get_current_user,
    user_data_tables_exist,
)

router = APIRouter(prefix="/medical", tags=["medical"])


class MedicalProfileUpsert(BaseModel):
    crew_id: int
    blood_type: Optional[str] = Field(default=None, max_length=5)
    allergies: Optional[str] = Field(default=None, max_length=100)
    chronic_conditions: Optional[str] = Field(default=None, max_length=100)
    emergency_contact: Optional[str] = Field(default=None, max_length=100)


class MedicalRecordCreate(BaseModel):
    crew_id: int
    visit_stardate: Optional[str] = Field(default=None, max_length=50)
    reason_for_visit: Optional[str] = Field(default=None, max_length=100)
    treatment_provided: Optional[str] = Field(default=None, max_length=100)
    follow_up_required: bool = False


@router.get("/charts")
def get_medical_charts(search: Optional[str] = Query(default=None), current_user=Depends(get_current_user)):
    try:
        base_crew = fetch_all(
            """
            SELECT
                c.crew_id,
                c.first_name,
                c.last_name,
                c.crew_rank,
                c.birth_stardate,
                c.planet_of_origin,
                c.species,
                c.crew_designation,
                c.service_number,
                c.department_id,
                d.department_name
            FROM crew c
            LEFT JOIN departments d
                ON d.department_id = c.department_id
            WHERE (%s IS NULL OR c.first_name LIKE %s OR c.last_name LIKE %s OR CONCAT(c.first_name, ' ', c.last_name) LIKE %s)
            ORDER BY c.last_name, c.first_name
            """,
            (search, f"%{search}%" if search else None, f"%{search}%" if search else None, f"%{search}%" if search else None),
        )
        custom_crew = fetch_custom_crew_rows(current_user["user_id"], search=search)
        profile_map = {}
        record_count_map = {}
        if user_data_tables_exist():
            profile_rows = fetch_all(
                "SELECT crew_id, profile_id FROM user_medical_profiles WHERE user_id = %s",
                (current_user["user_id"],),
            )
            record_rows = fetch_all(
                """
                SELECT crew_id, COUNT(*) AS record_count
                FROM user_medical_records
                WHERE user_id = %s
                GROUP BY crew_id
                """,
                (current_user["user_id"],),
            )
            profile_map = {row["crew_id"]: row["profile_id"] for row in profile_rows}
            record_count_map = {row["crew_id"]: row["record_count"] for row in record_rows}

        chart_rows = []
        for crew_member in [*base_crew, *custom_crew]:
            source_crew_id = crew_member.get("crew_id", crew_member.get("custom_crew_id"))
            if source_crew_id is None:
                continue
            resolved_crew_id = source_crew_id if "crew_id" in crew_member else -int(source_crew_id)
            identity = get_crew_identity(current_user["user_id"], resolved_crew_id)
            if not identity:
                continue
            chart_rows.append(
                {
                    "crew_id": identity["crew_id"],
                    "first_name": identity["first_name"],
                    "last_name": identity["last_name"],
                    "display_name": build_display_name(identity["first_name"], identity["last_name"]),
                    "birth_stardate": identity["birth_stardate"],
                    "species": identity["species"],
                    "profile_exists": bool(profile_map.get(identity["crew_id"])),
                    "record_count": int(record_count_map.get(identity["crew_id"], 0)),
                }
            )
        return chart_rows
    except Exception as e:
        return {"error": str(e)}


@router.get("/charts/{crew_id}")
def get_medical_chart(crew_id: int, current_user=Depends(get_current_user)):
    try:
        crew_row = get_crew_identity(current_user["user_id"], crew_id)
        if not crew_row:
            raise HTTPException(status_code=404, detail="Crew member not found")

        profile = None
        records = []
        if user_data_tables_exist():
            profile = fetch_one(
                """
                SELECT
                    profile_id,
                    crew_id,
                    blood_type,
                    allergies,
                    chronic_conditions,
                    emergency_contact
                FROM user_medical_profiles
                WHERE user_id = %s
                  AND crew_id = %s
                """,
                (current_user["user_id"], crew_id),
            )

            records = fetch_all(
                """
                SELECT
                    record_id,
                    crew_id,
                    visit_stardate,
                    reason_for_visit,
                    treatment_provided,
                    follow_up_required
                FROM user_medical_records
                WHERE user_id = %s
                  AND crew_id = %s
                ORDER BY record_id DESC
                """,
                (current_user["user_id"], crew_id),
            )

        return {
            "crew_id": crew_row["crew_id"],
            "first_name": crew_row["first_name"],
            "last_name": crew_row["last_name"],
            "display_name": build_display_name(crew_row["first_name"], crew_row["last_name"]),
            "birth_stardate": crew_row["birth_stardate"],
            "species": crew_row["species"],
            "medical_profile": profile,
            "medical_records": records,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


@router.post("/charts/profile")
def upsert_medical_profile(profile: MedicalProfileUpsert, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()
        crew_exists = get_crew_identity(current_user["user_id"], profile.crew_id)
        if not crew_exists:
            raise HTTPException(status_code=404, detail="Crew member not found")

        existing = fetch_one(
            "SELECT profile_id FROM user_medical_profiles WHERE user_id = %s AND crew_id = %s",
            (current_user["user_id"], profile.crew_id),
        )

        if existing:
            execute_write(
                """
                UPDATE user_medical_profiles
                SET blood_type = %s,
                    allergies = %s,
                    chronic_conditions = %s,
                    emergency_contact = %s
                WHERE user_id = %s
                  AND crew_id = %s
                """,
                (
                    profile.blood_type,
                    profile.allergies,
                    profile.chronic_conditions,
                    profile.emergency_contact,
                    current_user["user_id"],
                    profile.crew_id,
                ),
            )
            profile_id = existing["profile_id"]
        else:
            profile_id = execute_write(
                """
                INSERT INTO user_medical_profiles (
                    user_id,
                    crew_id,
                    blood_type,
                    allergies,
                    chronic_conditions,
                    emergency_contact
                ) VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    current_user["user_id"],
                    profile.crew_id,
                    profile.blood_type,
                    profile.allergies,
                    profile.chronic_conditions,
                    profile.emergency_contact,
                ),
            )

        return {"status": "ok", "profile_id": profile_id, "crew_id": profile.crew_id}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


@router.post("/charts/records")
def create_medical_record(record: MedicalRecordCreate, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()
        crew_exists = get_crew_identity(current_user["user_id"], record.crew_id)
        if not crew_exists:
            raise HTTPException(status_code=404, detail="Crew member not found")

        record_id = execute_write(
            """
            INSERT INTO user_medical_records (
                user_id,
                crew_id,
                visit_stardate,
                reason_for_visit,
                treatment_provided,
                follow_up_required
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                current_user["user_id"],
                record.crew_id,
                record.visit_stardate,
                record.reason_for_visit,
                record.treatment_provided,
                1 if record.follow_up_required else 0,
            ),
        )

        return {"status": "ok", "record_id": record_id, "crew_id": record.crew_id}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}
