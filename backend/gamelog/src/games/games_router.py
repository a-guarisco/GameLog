from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.core.database import get_db
from src.games import game_service

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/weekly_playtime_by_user", summary="Returns the user's total playtime for each day over the last two weeks, summed across all games played on that day")
def get_weekly_playtime(auth_user: AuthenticatedUser = Depends(get_current_user), db: Session = Depends(get_db)):
    return game_service.get_last_two_weeks_playtime_by_user(db, auth_user.uid)
    
@router.get("/weekly_playtime_by_game", summary="Returns the user's daily playtime over the last two weeks for the specified game only.")
def get_weekly_playtime_by_game(game_id: int, auth_user: AuthenticatedUser = Depends(get_current_user), db: Session = Depends(get_db)):
    return game_service.get_last_two_weeks_playtime_by_game(db, auth_user.uid, game_id)
