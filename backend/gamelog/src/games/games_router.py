from fastapi import APIRouter, Depends
from sqlmodel import Session
from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.users import user_service
from src.core.database import get_db

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/weekly_playtime")
def get_weekly_playtime(current_user: AuthenticatedUser = Depends(get_current_user), db: Session = Depends(get_db)):
    #todo to be implemented yet
    pass