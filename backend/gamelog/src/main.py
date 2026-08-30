from fastapi import Depends, FastAPI, Response, status
from sqlalchemy import text
from sqlmodel import Session

from src.achievements.router import router as achievements_router
from src.auth.auth import get_current_user
from src.auth.firebase_init import initialize_firebase_app
from src.auth.schemas import AuthenticatedUser
from src.community.community_router import router as community_router
from src.core.database import get_db
from src.core.scheduler import lifespan
from src.core.settings import get_settings
from src.games.games_router import router as games_router
from src.users.notifications_router import router as notifications_router
from src.users.users_router import router as users_router

settings = get_settings()
initialize_firebase_app(settings)
# app = FastAPI(title=settings.app_name, version=settings.app_version)
app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan)
app.include_router(achievements_router)
app.include_router(games_router)
app.include_router(users_router)
app.include_router(notifications_router)
app.include_router(community_router)


@app.get("/hello")
def hello_world():
    return {"message": "Hello, World!"}


@app.get("/health")
def healthcheck(response: Response, db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unhealthy",
            "app": settings.app_name,
            "version": settings.app_version,
            "database": f"error: {str(e)}",
        }
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "database": db_status,
    }


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
