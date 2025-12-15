import os
from fastapi import FastAPI
import pymysql

app = FastAPI(title="Voyager API")

def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/crew")
def get_crew():
    # Temporary stub data — will be replaced with DB-backed query
    return [
        {
            "id": 1,
            "name": "Crew Member A",
            "rank": "Unknown",
            "department": "Unassigned"
        },
        {
            "id": 2,
            "name": "Crew Member B",
            "rank": "Unknown",
            "department": "Unassigned"
        }
    ]


@app.get("/test-db")
def test_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1;")
        result = cursor.fetchone()
        conn.close()
        return {"db_status": "connected", "result": result}
    except Exception as e:
        return {"db_status": "error", "detail": str(e)}

