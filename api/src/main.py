from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .routes.crew import router as crew_router
from .routes.holodeck import router as holodeck_router
from .routes.medical import router as medical_router
from .routes.replicator import router as replicator_router
from .routes.transporters import router as transporter_router
from .support import (
    api_to_storage_custom_crew_id,
    auth_tables_exist,
    build_display_name,
    create_user_session,
    ensure_user_data_ready,
    execute_write,
    fetch_all,
    fetch_custom_crew_rows,
    fetch_one,
    get_crew_identity,
    get_current_user,
    normalize_email,
    personnel_actions_table_exists,
    serialize_user,
    storage_to_api_custom_crew_id,
    user_data_tables_exist,
    verify_password,
    hash_password,
    hash_session_token,
)

BASE_DIR = Path(__file__).resolve().parents[1]  # points to /api
load_dotenv(BASE_DIR / ".env")
FRONTEND_BUILD_DIR = BASE_DIR.parent / "frontend" / "build"

app = FastAPI(title="Voyager API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(crew_router)
app.include_router(holodeck_router)
app.include_router(medical_router)
app.include_router(replicator_router)
app.include_router(transporter_router)

# Serve the React production bundle from FastAPI so the portal and API share one origin.
if (FRONTEND_BUILD_DIR / "static").exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_BUILD_DIR / "static"), name="portal-static")


class AuthRegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=200)


class AuthLoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=200)


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

        holodeck_usage_logs = fetch_all(
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
                h.HolodeckDesignation AS holodeck_designation
            FROM holodeckusagelog hul
            INNER JOIN holodecks h
                ON h.HolodeckID = hul.HolodeckID
            INNER JOIN holodeckprograms hp
                ON hp.ProgramID = hul.ProgramID
            WHERE h.CompartmentID = %s
            ORDER BY hul.UsageLogID DESC
            """,
            (compartment_id,),
        )

        resolved_holodeck_usage_logs = []
        for row in holodeck_usage_logs:
            identity = get_crew_identity(current_user["user_id"], row["crew_id"])
            resolved_holodeck_usage_logs.append(
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
                    "first_name": identity["first_name"] if identity else "",
                    "last_name": identity["last_name"] if identity else "",
                    "display_name": build_display_name(identity["first_name"], identity["last_name"]) if identity else "Unknown Record",
                }
            )

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


@app.get("/test-db")
def test_db(current_user=Depends(get_current_user)):
    try:
        row = fetch_one("SELECT DATABASE() AS database_name, @@hostname AS hostname")
        return {"db_status": "connected", "result": row}
    except Exception as e:
        return {"db_status": "error", "detail": str(e)}


def _portal_index() -> FileResponse:
    index_path = FRONTEND_BUILD_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Portal build not found")
    return FileResponse(index_path)


@app.get("/portal")
def portal_root():
    return _portal_index()


# Let the SPA router handle nested portal paths after FastAPI confirms no file exists.
@app.get("/portal/{full_path:path}")
def portal_paths(full_path: str):
    candidate = (FRONTEND_BUILD_DIR / full_path).resolve()
    try:
        candidate.relative_to(FRONTEND_BUILD_DIR)
    except ValueError:
        return _portal_index()

    if candidate.exists() and candidate.is_file():
        return FileResponse(candidate)

    return _portal_index()
