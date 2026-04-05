from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .routes.auth import router as auth_router
from .routes.crew import router as crew_router
from .routes.holodeck import router as holodeck_router
from .routes.medical import router as medical_router
from .routes.replicator import router as replicator_router
from .routes.systems import router as systems_router
from .routes.transporters import router as transporter_router
from .support import (
    auth_tables_exist,
    fetch_one,
    get_current_user,
    personnel_actions_table_exists,
    user_data_tables_exist,
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
app.include_router(auth_router)
app.include_router(crew_router)
app.include_router(holodeck_router)
app.include_router(medical_router)
app.include_router(replicator_router)
app.include_router(systems_router)
app.include_router(transporter_router)

# Serve the React production bundle from FastAPI so the portal and API share one origin.
if (FRONTEND_BUILD_DIR / "static").exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_BUILD_DIR / "static"), name="portal-static")


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "personnel_actions_ready": personnel_actions_table_exists(),
        "auth_ready": auth_tables_exist(),
        "user_data_ready": user_data_tables_exist(),
    }

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
