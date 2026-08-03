from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.core.database import get_db
from src.games import game_service

router = APIRouter(prefix="/games", tags=["games"])


@router.get(
    "/playtime_by_user",
    summary="Returns the user's total playtime for each day, summed across all games played on that day. Default on days=-1 to get all history.",
)
def get_weekly_playtime(
    days: int = -1,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return game_service.get_playtime_by_user(db, auth_user.uid, days)


@router.get(
    "/playtime_by_game",
    summary="Returns the user's daily playtime for the specified game. Default on days=-1 to get all history.",
)
def get_weekly_playtime_by_game(
    steam_app_id: str,
    days: int = -1,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return game_service.get_playtime_by_game(db, auth_user.uid, steam_app_id, days)
