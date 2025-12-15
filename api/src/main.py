from fastapi import FastAPI
import pymysql

app = FastAPI(title="Voyager API")

def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="0027480d",
        database="voyager_db"
    )

@app.get("/health")
def health_check():
    return {"status": "ok"}

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

