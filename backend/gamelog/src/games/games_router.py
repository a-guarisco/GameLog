from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.core.database import get_db
from src.games import game_service
from src.users import user_service

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/weekly_playtime")
def get_weekly_playtime(auth_user: AuthenticatedUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = user_service.get_user_by_firebase_uid(db, auth_user.uid)
    game_service.update_user_shelving_steamrolling(db, user)
