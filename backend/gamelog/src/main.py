from fastapi import FastAPI

from src.settings import get_settings

settings = get_settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)


@app.get("/hello")
def hello_world():
    return {"message": "Hello, World!"}


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


