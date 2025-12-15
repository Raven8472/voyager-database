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
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        cursor.execute("""
            SELECT id, name, rank, department
            FROM crew
        """)

        crew = cursor.fetchall()
        conn.close()
        return crew

    except Exception as e:
        return {"error": str(e)}


@app.get("/crew/{crew_id}")
def get_crew_member(crew_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        cursor.execute("""
            SELECT id, name, rank, department
            FROM crew
            WHERE id = %s
        """, (crew_id,))

        member = cursor.fetchone()
        conn.close()

        if member:
            return member
        else:
            return {"error": "Crew member not found"}

    except Exception as e:
        return {"error": str(e)}



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

