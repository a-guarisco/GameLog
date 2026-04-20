from fastapi import FastAPI

from src.core.settings import get_settings
from src.achievements.router import router as achievements_router

settings = get_settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)
app.include_router(achievements_router)

@app.get("/hello")
def hello_world():
    return {"message": "Hello, World!"}


@app.get("/health")
def healthcheck():
    return {"status": "ok"}
