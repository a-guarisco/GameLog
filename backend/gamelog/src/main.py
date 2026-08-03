from fastapi import Depends, FastAPI

from src.achievements.router import router as achievements_router
from src.auth.auth import get_current_user
from src.auth.firebase_init import initialize_firebase_app
from src.auth.schemas import AuthenticatedUser
from src.core.scheduler import lifespan
from src.core.settings import get_settings
from src.games.games_router import router as games_router

settings = get_settings()
initialize_firebase_app(settings)
# app = FastAPI(title=settings.app_name, version=settings.app_version)
app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan)
app.include_router(achievements_router)
app.include_router(games_router)


@app.get("/hello")
def hello_world():
    return {"message": "Hello, World!"}


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


@app.get("/me")
def me(current_user: AuthenticatedUser = Depends(get_current_user)):
    return {
        "uid": current_user.uid,
        "email": current_user.email,
    }


@app.get("/protected")
def protected(current_user: AuthenticatedUser = Depends(get_current_user)):
    return {
        "message": "Accesso autorizzato",
        "uid": current_user.uid,
    }
