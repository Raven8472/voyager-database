from datetime import datetime, timedelta, timezone
import base64
import hashlib
from pathlib import Path
import os
import secrets
from typing import Optional

from dotenv import load_dotenv
from fastapi import Header, HTTPException
import pymysql

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")


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
              'user_holodeck_programs',
              'user_holodeck_logs',
              'user_transporter_events',
              'user_transporter_event_passengers'
          )
        """
    )
    return bool(row and row["table_count"] == 10)


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


def create_user_session(user_id: int) -> tuple[str, str]:
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


def serialize_user(row: dict) -> dict:
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


def ensure_user_data_ready() -> None:
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


def storage_to_api_user_holodeck_program_id(program_id: int) -> str:
    return f"UHP-{int(program_id)}"


def api_to_storage_user_holodeck_program_id(program_id: str) -> int:
    return abs(int(str(program_id).split("-", 1)[1]))


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


def get_consolidated_holodeck_usage_logs(user_id: int, compartment_id: Optional[str] = None):
    canon_filters = []
    canon_params = []
    custom_filters = ["uhl.user_id = %s"]
    custom_params = [user_id]

    if compartment_id:
        canon_filters.append("h.CompartmentID = %s")
        canon_params.append(compartment_id)
        custom_filters.append("h.CompartmentID = %s")
        custom_params.append(compartment_id)

    canon_where = f"WHERE {' AND '.join(canon_filters)}" if canon_filters else ""
    custom_where = f"WHERE {' AND '.join(custom_filters)}"

    canon_logs = fetch_all(
        f"""
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
            c.first_name AS first_name,
            c.last_name AS last_name
        FROM holodeckusagelog hul
        INNER JOIN holodecks h
            ON h.HolodeckID = hul.HolodeckID
        INNER JOIN holodeckprograms hp
            ON hp.ProgramID = hul.ProgramID
        LEFT JOIN crew c
            ON c.crew_id = hul.CrewID
        {canon_where}
        """,
        tuple(canon_params),
    )

    custom_logs = []
    if user_data_tables_exist():
        custom_logs = fetch_all(
            f"""
            SELECT
                CONCAT('UHL-', uhl.log_id) AS usage_log_id,
                -ucc.custom_crew_id AS crew_id,
                CONCAT('UHP-', up.program_id) AS program_id,
                uhl.holodeck_id AS holodeck_id,
                uhl.stardate AS stardate,
                up.program_name AS program_name,
                up.created_by AS created_by,
                up.genre AS genre,
                h.HolodeckDesignation AS holodeck_designation,
                ucc.first_name AS first_name,
                ucc.last_name AS last_name
            FROM user_holodeck_logs uhl
            INNER JOIN user_holodeck_programs up
                ON up.program_id = uhl.program_id
               AND up.user_id = uhl.user_id
            INNER JOIN holodecks h
                ON h.HolodeckID = uhl.holodeck_id
            LEFT JOIN user_custom_crew ucc
                ON ucc.custom_crew_id = uhl.crew_id
               AND ucc.user_id = uhl.user_id
            {custom_where}
            """,
            tuple(custom_params),
        )

    combined_logs = [*canon_logs, *custom_logs]
    combined_logs.sort(key=lambda row: str(row["usage_log_id"]), reverse=True)
    return combined_logs
