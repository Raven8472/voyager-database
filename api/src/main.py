from fastapi import FastAPI

app = FastAPI(title="Voyager API")

@app.get("/health")
def health_check():
    return {"status": "ok"}

