from datetime import datetime, timedelta, timezone
import base64
import hashlib
from pathlib import Path
import os
import secrets
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pymysql

BASE_DIR = Path(__file__).resolve().parents[1]  # points to /api
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="Voyager API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


class TransporterLogCreate(BaseModel):
    transporter_unit_id: str = Field(min_length=1, max_length=10)
    operator_crew_id: Optional[int] = None
    stardate: str = Field(min_length=1, max_length=20)
    transport_direction: str = Field(min_length=1, max_length=20)
    ship_location_id: str = Field(min_length=1, max_length=10)
    off_ship_location: Optional[str] = Field(default=None, max_length=100)
    passenger_crew_ids: list[int] = Field(default_factory=list, max_length=10)


class AuthRegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=200)


class AuthLoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=200)


def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", "3306")),
    )


def fetch_all(query: str, params: tuple = ()):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute(query, params)
        return cursor.fetchall()
    finally:
        conn.close()


def fetch_one(query: str, params: tuple = ()):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute(query, params)
        return cursor.fetchone()
    finally:
        conn.close()


def execute_write(query: str, params: tuple = ()):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def personnel_actions_table_exists() -> bool:
    row = fetch_one(
        """
        SELECT COUNT(*) AS table_count
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = 'personnel_actions'
        """
    )
    return bool(row and row["table_count"])


def user_data_tables_exist() -> bool:
    row = fetch_one(
        """
        SELECT COUNT(*) AS table_count
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name IN (
              'user_personnel_actions',
              'user_custom_crew',
              'user_medical_profiles',
              'user_medical_records',
              'user_replicator_patterns',
              'user_replicator_logs',
              'user_transporter_events',
              'user_transporter_event_passengers'
          )
        """
    )
    return bool(row and row["table_count"] == 8)


def build_display_name(first_name: Optional[str], last_name: Optional[str]) -> str:
    first_name = (first_name or "").strip()
    last_name = (last_name or "").strip()
    if not first_name or first_name == "N/A":
        return last_name or "Unnamed Record"
    if not last_name:
        return first_name
    return f"{last_name}, {first_name}"


def auth_tables_exist() -> bool:
    row = fetch_one(
        """
        SELECT COUNT(*) AS table_count
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name IN ('users', 'user_sessions')
        """
    )
    return bool(row and row["table_count"] == 2)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def get_auth_secret() -> str:
    return os.getenv("APP_AUTH_SECRET", "voyager-dev-auth-secret")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
    return f"{base64.b64encode(salt).decode('ascii')}${base64.b64encode(derived_key).decode('ascii')}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_b64, digest_b64 = stored_hash.split("$", 1)
        salt = base64.b64decode(salt_b64.encode("ascii"))
        expected_digest = base64.b64decode(digest_b64.encode("ascii"))
    except (ValueError, TypeError):
        return False

    actual_digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
    return secrets.compare_digest(actual_digest, expected_digest)


def hash_session_token(token: str) -> str:
    secret = get_auth_secret().encode("utf-8")
    return hashlib.sha256(secret + token.encode("utf-8")).hexdigest()


def create_user_session(user_id: int):
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_session_token(raw_token)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30)
    execute_write(
        """
        INSERT INTO user_sessions (
            user_id,
            token_hash,
            created_at,
            expires_at
        ) VALUES (%s, %s, %s, %s)
        """,
        (
            user_id,
            token_hash,
            now.strftime("%Y-%m-%d %H:%M:%S"),
            expires_at.strftime("%Y-%m-%d %H:%M:%S"),
        ),
    )
    execute_write(
        """
        UPDATE users
        SET last_login_at = %s
        WHERE user_id = %s
        """,
        (now.strftime("%Y-%m-%d %H:%M:%S"), user_id),
    )
    return raw_token, expires_at.isoformat()


def serialize_user(row):
    return {
        "user_id": row["user_id"],
        "email": row["email"],
        "access_id": row["email"],
        "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
        "last_login_at": row["last_login_at"].isoformat() if row.get("last_login_at") else None,
    }


def get_current_user(authorization: Optional[str] = Header(default=None)):
    if not auth_tables_exist():
        raise HTTPException(status_code=503, detail="Authentication schema has not been installed yet")

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    token_hash = hash_session_token(token)
    user = fetch_one(
        """
        SELECT
            u.user_id,
            u.email,
            u.created_at,
            u.last_login_at
        FROM user_sessions s
        INNER JOIN users u
            ON u.user_id = s.user_id
        WHERE s.token_hash = %s
          AND s.revoked_at IS NULL
          AND s.expires_at > UTC_TIMESTAMP()
          AND u.is_active = 1
        """,
        (token_hash,),
    )

    if not user:
        raise HTTPException(status_code=401, detail="Session invalid or expired")

    return user


def ensure_user_data_ready():
    if not user_data_tables_exist():
        raise HTTPException(
            status_code=503,
            detail="User save-data schema is not installed yet. Run sql/schema/v1/voyager_user_data.sql first.",
        )


def storage_to_api_custom_crew_id(custom_crew_id: int) -> int:
    return -int(custom_crew_id)


def api_to_storage_custom_crew_id(crew_id: int) -> int:
    return abs(int(crew_id))


def storage_to_api_user_pattern_id(pattern_id: int) -> int:
    return -int(pattern_id)


def api_to_storage_user_pattern_id(pattern_id: int) -> int:
    return abs(int(pattern_id))


def get_latest_user_actions_map(user_id: int, crew_ids):
    if not crew_ids or not user_data_tables_exist():
        return {}

    placeholders = ", ".join(["%s"] * len(crew_ids))
    rows = fetch_all(
        f"""
        SELECT upa.*
        FROM user_personnel_actions upa
        INNER JOIN (
            SELECT crew_id, MAX(action_id) AS latest_action_id
            FROM user_personnel_actions
            WHERE user_id = %s
              AND crew_id IN ({placeholders})
            GROUP BY crew_id
        ) latest
            ON latest.latest_action_id = upa.action_id
        """,
        tuple([user_id, *crew_ids]),
    )
    return {row["crew_id"]: row for row in rows}


def fetch_custom_crew_rows(user_id: int, search: Optional[str] = None, department_id: Optional[int] = None, designation: Optional[str] = None):
    if not user_data_tables_exist():
        return []

    filters = ["uc.user_id = %s"]
    params = [user_id]

    if search:
        filters.append(
            "(uc.first_name LIKE %s OR uc.last_name LIKE %s OR CONCAT(uc.first_name, ' ', uc.last_name) LIKE %s)"
        )
        search_term = f"%{search}%"
        params.extend([search_term, search_term, search_term])

    if department_id:
        filters.append("uc.department_id = %s")
        params.append(department_id)

    if designation:
        filters.append("uc.crew_designation = %s")
        params.append(designation)

    where_clause = f"WHERE {' AND '.join(filters)}"
    return fetch_all(
        f"""
        SELECT
            uc.custom_crew_id,
            uc.first_name,
            uc.last_name,
            uc.crew_rank,
            uc.birth_stardate,
            uc.planet_of_origin,
            uc.species,
            uc.crew_designation,
            uc.service_number,
            uc.department_id,
            d.department_name
        FROM user_custom_crew uc
        LEFT JOIN departments d
            ON d.department_id = uc.department_id
        {where_clause}
        ORDER BY uc.last_name, uc.first_name
        """,
        tuple(params),
    )


def get_crew_identity(user_id: int, crew_id: int):
    if crew_id < 0:
        custom_row = fetch_one(
            """
            SELECT
                uc.custom_crew_id,
                uc.first_name,
                uc.last_name,
                uc.crew_rank,
                uc.birth_stardate,
                uc.planet_of_origin,
                uc.species,
                uc.crew_designation,
                uc.service_number,
                uc.department_id,
                d.department_name
            FROM user_custom_crew uc
            LEFT JOIN departments d
                ON d.department_id = uc.department_id
            WHERE uc.user_id = %s
              AND uc.custom_crew_id = %s
            """,
            (user_id, api_to_storage_custom_crew_id(crew_id)),
        )
        if not custom_row:
            return None
        return {
            "crew_id": crew_id,
            "first_name": custom_row["first_name"],
            "last_name": custom_row["last_name"],
            "rank": custom_row["crew_rank"],
            "birth_stardate": custom_row["birth_stardate"],
            "planet_of_origin": custom_row["planet_of_origin"],
            "species": custom_row["species"],
            "designation": custom_row["crew_designation"],
            "service_number": custom_row["service_number"],
            "department_id": custom_row["department_id"],
            "department": custom_row["department_name"],
            "is_custom": True,
        }

    base_row = fetch_one(
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
        WHERE c.crew_id = %s
        """,
        (crew_id,),
    )
    if not base_row:
        return None

    latest_action = get_latest_user_actions_map(user_id, [crew_id]).get(crew_id)
    department_id = latest_action["new_department_id"] if latest_action else base_row["department_id"]
    department_row = (
        fetch_one("SELECT department_name FROM departments WHERE department_id = %s", (department_id,))
        if department_id
        else None
    )
    return {
        "crew_id": crew_id,
        "first_name": base_row["first_name"],
        "last_name": base_row["last_name"],
        "rank": latest_action["new_rank"] if latest_action else base_row["crew_rank"],
        "birth_stardate": base_row["birth_stardate"],
        "planet_of_origin": latest_action["new_planet_of_origin"] if latest_action else base_row["planet_of_origin"],
        "species": latest_action["new_species"] if latest_action else base_row["species"],
        "designation": base_row["crew_designation"],
        "service_number": base_row["service_number"],
        "department_id": department_id,
        "department": department_row["department_name"] if department_row else None,
        "is_custom": False,
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "personnel_actions_ready": personnel_actions_table_exists(),
        "auth_ready": auth_tables_exist(),
        "user_data_ready": user_data_tables_exist(),
    }


@app.post("/auth/register")
def register_user(payload: AuthRegisterRequest):
    if not auth_tables_exist():
        raise HTTPException(status_code=503, detail="Authentication schema has not been installed yet")

    normalized_email = normalize_email(payload.email)
    existing_user = fetch_one("SELECT user_id FROM users WHERE email = %s", (normalized_email,))
    if existing_user:
        raise HTTPException(status_code=409, detail="An account already exists for that access ID")

    user_id = execute_write(
        """
        INSERT INTO users (
            email,
            password_hash,
            created_at,
            is_active
        ) VALUES (%s, %s, %s, %s)
        """,
        (
            normalized_email,
            hash_password(payload.password),
            datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            1,
        ),
    )
    user = fetch_one(
        """
        SELECT user_id, email, created_at, last_login_at
        FROM users
        WHERE user_id = %s
        """,
        (user_id,),
    )
    token, expires_at = create_user_session(user_id)
    return {"status": "ok", "token": token, "expires_at": expires_at, "user": serialize_user(user)}


@app.post("/auth/login")
def login_user(payload: AuthLoginRequest):
    if not auth_tables_exist():
        raise HTTPException(status_code=503, detail="Authentication schema has not been installed yet")

    normalized_email = normalize_email(payload.email)
    user = fetch_one(
        """
        SELECT user_id, email, password_hash, created_at, last_login_at, is_active
        FROM users
        WHERE email = %s
        """,
        (normalized_email,),
    )
    if not user or not user["is_active"] or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Access denied. Credentials not recognized")

    token, expires_at = create_user_session(user["user_id"])
    return {"status": "ok", "token": token, "expires_at": expires_at, "user": serialize_user(user)}


@app.get("/auth/me")
def get_me(current_user=Depends(get_current_user)):
    return {"status": "ok", "user": serialize_user(current_user)}


@app.post("/auth/logout")
def logout_user(authorization: Optional[str] = Header(default=None), current_user=Depends(get_current_user)):
    token = authorization.removeprefix("Bearer ").strip()
    execute_write(
        """
        UPDATE user_sessions
        SET revoked_at = %s
        WHERE token_hash = %s
        """,
        (
            datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            hash_session_token(token),
        ),
    )
    return {"status": "ok"}


@app.get("/crew")
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
            base_results.append(
                {
                    "crew_id": row["crew_id"],
                    "first_name": row["first_name"],
                    "last_name": row["last_name"],
                    "name": f'{row["first_name"]} {row["last_name"]}',
                    "rank": action["new_rank"] if action else row["crew_rank"],
                    "department_id": action["new_department_id"] if action else row["department_id"],
                    "department": fetch_one(
                        "SELECT department_name FROM departments WHERE department_id = %s",
                        ((action["new_department_id"] if action else row["department_id"]),),
                    )["department_name"]
                    if (action["new_department_id"] if action else row["department_id"])
                    else row["department_name"],
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


@app.post("/crew")
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


@app.get("/crew/{crew_id}")
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


@app.get("/departments")
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


@app.get("/departments/{department_id}")
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


@app.get("/crew-with-department")
def get_crew_with_department(current_user=Depends(get_current_user)):
    return get_crew(current_user=current_user)


@app.get("/medical/charts")
def get_medical_charts(search: Optional[str] = Query(default=None), current_user=Depends(get_current_user)):
    try:
        base_crew = get_crew(
            search=search,
            department_id=None,
            designation=None,
            current_user=current_user,
        )
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
        for crew_member in base_crew:
            identity = get_crew_identity(current_user["user_id"], crew_member["crew_id"])
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


@app.get("/medical/charts/{crew_id}")
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


@app.get("/systems/compartments")
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


@app.get("/systems/compartments/{compartment_id}")
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

        return {
            **compartment,
            "replicators": replicators,
            "transporters": transporters,
            "holodecks": holodecks,
            "holodeck_programs": holodeck_programs,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


@app.get("/transporter/units")
def get_transporter_units(current_user=Depends(get_current_user)):
    try:
        return fetch_all(
            """
            SELECT
                tu.TransporterUnitID AS unit_id,
                tu.CompartmentID AS compartment_id,
                sc.CompartmentName AS compartment_name
            FROM transporterunits tu
            INNER JOIN shipcompartments sc
                ON sc.CompartmentID = tu.CompartmentID
            ORDER BY tu.TransporterUnitID
            """
        )
    except Exception as e:
        return {"error": str(e)}


@app.get("/transporter/locations")
def get_transporter_locations(current_user=Depends(get_current_user)):
    try:
        return fetch_all(
            """
            SELECT
                CompartmentID AS compartment_id,
                CompartmentName AS compartment_name
            FROM shipcompartments
            WHERE CompartmentName = 'Bridge'
               OR CompartmentName = 'Engineering Core'
               OR CompartmentName LIKE 'Transporter Room%%'
            ORDER BY CompartmentName
            """
        )
    except Exception as e:
        return {"error": str(e)}


@app.get("/transporter/logs")
def get_transporter_logs(
    search: Optional[str] = Query(default=None),
    current_user=Depends(get_current_user),
):
    try:
        if not user_data_tables_exist():
            return []

        event_rows = fetch_all(
            """
            SELECT
                event_id,
                transporter_unit_id,
                operator_crew_id,
                stardate,
                transport_direction,
                ship_location_id,
                off_ship_location,
                created_at
            FROM user_transporter_events
            WHERE user_id = %s
            ORDER BY event_id DESC
            """,
            (current_user["user_id"],),
        )

        if not event_rows:
            return []

        passenger_rows = fetch_all(
            """
            SELECT
                passenger_id,
                event_id,
                crew_id,
                passenger_order
            FROM user_transporter_event_passengers
            WHERE event_id IN (
                SELECT event_id
                FROM user_transporter_events
                WHERE user_id = %s
            )
            ORDER BY event_id DESC, passenger_order ASC
            """,
            (current_user["user_id"],),
        )
        passenger_map = {}
        for row in passenger_rows:
            passenger_map.setdefault(row["event_id"], []).append(row)

        unit_map = {
            row["unit_id"]: row
            for row in fetch_all(
                """
                SELECT
                    tu.TransporterUnitID AS unit_id,
                    sc.CompartmentName AS compartment_name
                FROM transporterunits tu
                INNER JOIN shipcompartments sc
                    ON sc.CompartmentID = tu.CompartmentID
                """
            )
        }
        location_map = {
            row["compartment_id"]: row["compartment_name"]
            for row in fetch_all(
                """
                SELECT
                    CompartmentID AS compartment_id,
                    CompartmentName AS compartment_name
                FROM shipcompartments
                """
            )
        }

        logs = []
        for event in event_rows:
            operator = get_crew_identity(current_user["user_id"], event["operator_crew_id"]) if event["operator_crew_id"] else None
            passengers = []
            for passenger in passenger_map.get(event["event_id"], []):
                identity = get_crew_identity(current_user["user_id"], passenger["crew_id"])
                if identity:
                    passengers.append(
                        {
                            "crew_id": identity["crew_id"],
                            "first_name": identity["first_name"],
                            "last_name": identity["last_name"],
                            "display_name": build_display_name(identity["first_name"], identity["last_name"]),
                            "passenger_order": passenger["passenger_order"],
                        }
                    )

            resolved = {
                "event_id": event["event_id"],
                "transporter_unit_id": event["transporter_unit_id"],
                "transporter_room": unit_map.get(event["transporter_unit_id"], {}).get("compartment_name"),
                "operator_crew_id": event["operator_crew_id"],
                "operator_display_name": build_display_name(operator["first_name"], operator["last_name"]) if operator else "No operator logged",
                "stardate": event["stardate"],
                "transport_direction": event["transport_direction"],
                "ship_location_id": event["ship_location_id"],
                "ship_location_name": location_map.get(event["ship_location_id"]),
                "off_ship_location": event["off_ship_location"],
                "passengers": passengers,
                "passenger_count": len(passengers),
                "created_at": event["created_at"],
            }

            search_blob = " ".join(
                [
                    resolved["transporter_unit_id"] or "",
                    resolved["transporter_room"] or "",
                    resolved["operator_display_name"] or "",
                    resolved["ship_location_name"] or "",
                    resolved["off_ship_location"] or "",
                    " ".join(passenger["display_name"] for passenger in passengers),
                ]
            ).lower()
            if search and search.strip().lower() not in search_blob:
                continue
            logs.append(resolved)

        return logs
    except Exception as e:
        return {"error": str(e)}


@app.post("/transporter/logs")
def create_transporter_log(log: TransporterLogCreate, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()

        passenger_ids = [crew_id for crew_id in log.passenger_crew_ids if crew_id]
        deduped_passenger_ids = []
        for crew_id in passenger_ids:
            if crew_id not in deduped_passenger_ids:
                deduped_passenger_ids.append(crew_id)
        passenger_ids = deduped_passenger_ids

        if not passenger_ids:
            raise HTTPException(status_code=422, detail="At least one transported crew member is required")
        if len(passenger_ids) > 10:
            raise HTTPException(status_code=422, detail="Transport logs support up to 10 crew members per event")
        if log.transport_direction not in ("Inbound", "Outbound"):
            raise HTTPException(status_code=422, detail="Transport direction must be Inbound or Outbound")

        unit_exists = fetch_one(
            "SELECT TransporterUnitID FROM transporterunits WHERE TransporterUnitID = %s",
            (log.transporter_unit_id,),
        )
        if not unit_exists:
            raise HTTPException(status_code=404, detail="Transporter unit not found")

        location_exists = fetch_one(
            """
            SELECT CompartmentID
            FROM shipcompartments
            WHERE CompartmentID = %s
              AND (
                  CompartmentName = 'Bridge'
                  OR CompartmentName = 'Engineering Core'
                  OR CompartmentName LIKE 'Transporter Room%%'
              )
            """,
            (log.ship_location_id,),
        )
        if not location_exists:
            raise HTTPException(status_code=404, detail="Transporter control location must be Bridge, Engineering, or a transporter room")

        if log.operator_crew_id is not None and not get_crew_identity(current_user["user_id"], log.operator_crew_id):
            raise HTTPException(status_code=404, detail="Transporter operator not found")

        for crew_id in passenger_ids:
            if not get_crew_identity(current_user["user_id"], crew_id):
                raise HTTPException(status_code=404, detail=f"Passenger crew record not found: {crew_id}")

        event_id = execute_write(
            """
            INSERT INTO user_transporter_events (
                user_id,
                transporter_unit_id,
                operator_crew_id,
                stardate,
                transport_direction,
                ship_location_id,
                off_ship_location
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                current_user["user_id"],
                log.transporter_unit_id,
                log.operator_crew_id,
                log.stardate,
                log.transport_direction,
                log.ship_location_id,
                log.off_ship_location,
            ),
        )

        for index, crew_id in enumerate(passenger_ids, start=1):
            execute_write(
                """
                INSERT INTO user_transporter_event_passengers (
                    event_id,
                    crew_id,
                    passenger_order
                ) VALUES (%s, %s, %s)
                """,
                (event_id, crew_id, index),
            )

        return {"status": "ok", "event_id": event_id}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


@app.get("/replicator/logs")
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


@app.get("/replicator/patterns")
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


@app.post("/replicator/patterns")
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


@app.get("/replicator/units")
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


@app.post("/replicator/logs")
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


@app.post("/medical/charts/profile")
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


@app.post("/medical/charts/records")
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
                int(record.follow_up_required),
            ),
        )

        return {"status": "ok", "record_id": record_id, "crew_id": record.crew_id}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


@app.get("/personnel-actions/recent")
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


@app.post("/personnel-actions")
def create_personnel_action(action: PersonnelActionCreate, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()
        crew_member = get_crew_identity(current_user["user_id"], action.crew_id)
        if not crew_member:
            raise HTTPException(status_code=404, detail="Crew member not found")

        old_rank = action.old_rank or crew_member["rank"]
        old_department_id = action.old_department_id or crew_member["department_id"]
        new_rank = action.new_rank or crew_member["rank"]
        new_department_id = action.new_department_id or crew_member["department_id"]
        old_species = action.old_species or crew_member["species"]
        new_species = action.new_species or crew_member["species"]
        old_planet_of_origin = action.old_planet_of_origin or crew_member["planet_of_origin"]
        new_planet_of_origin = action.new_planet_of_origin or crew_member["planet_of_origin"]

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
                old_rank,
                new_rank,
                old_species,
                new_species,
                old_planet_of_origin,
                new_planet_of_origin,
                old_department_id,
                new_department_id,
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
                    new_rank,
                    new_species,
                    new_planet_of_origin,
                    new_department_id,
                    current_user["user_id"],
                    api_to_storage_custom_crew_id(action.crew_id),
                ),
            )

        return {
            "status": "ok",
            "action_id": action_id,
            "crew_id": action.crew_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


@app.get("/test-db")
def test_db(current_user=Depends(get_current_user)):
    try:
        row = fetch_one("SELECT DATABASE() AS database_name, @@hostname AS hostname")
        return {"db_status": "connected", "result": row}
    except Exception as e:
        return {"db_status": "error", "detail": str(e)}
