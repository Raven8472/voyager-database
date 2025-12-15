import os
from fastapi import FastAPI
import pymysql
from fastapi import FastAPI, HTTPException

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
            SELECT
                crew_id,
                first_name,
                last_name,
                crew_rank,
                department_id
            FROM crew
        """)

        rows = cursor.fetchall()
        conn.close()

        crew = []
        for row in rows:
            crew.append({
                "id": row["crew_id"],
                "name": f'{row["first_name"]} {row["last_name"]}',
                "rank": row["crew_rank"],
                "department_id": row["department_id"]
            })

        return crew

    except Exception as e:
        return {"error": str(e)}



@app.get("/crew/{crew_id}")
def get_crew_member(crew_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        cursor.execute("""
            SELECT
                crew_id,
                first_name,
                last_name,
                crew_rank,
                department_id
            FROM crew
            WHERE crew_id = %s
        """, (crew_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Crew member not found")

        return {
            "id": row["crew_id"],
            "name": f'{row["first_name"]} {row["last_name"]}',
            "rank": row["crew_rank"],
            "department_id": row["department_id"]
        }

    except HTTPException:
        raise
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

