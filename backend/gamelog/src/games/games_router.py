import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.core.database import get_db
from src.games import game_service, recommendations_service
from src.games.schemas import DailyReport, RecommendationResponse

router = APIRouter(prefix="/games", tags=["games"])


@router.get(
    "/playtime_by_user",
    summary="Returns the user's total playtime for each day, summed across all games played on that day. Default on days=-1 to get all history.",
    status_code=200,
)
def get_weekly_playtime(
    days: int = -1,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return game_service.get_playtime_by_user(db, auth_user.uid, days)


@router.get(
    "/playtime_by_game", summary="Returns the user's daily playtime for the specified game. Default on days=-1 to get all history.", status_code=200
)
def get_weekly_playtime_by_game(
    steam_app_id: str,
    days: int = -1,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return game_service.get_playtime_by_game(db, auth_user.uid, steam_app_id, days)


@router.get("/streak_by_user", summary="Returns the user's current streak of consecutive days played, computed across all games", status_code=200)
def get_streak_by_user(
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return game_service.get_streak(db, auth_user.uid, None)


@router.get("/streak_by_game", summary="Returns the user's current streak of consecutive days played for the specified game", status_code=200)
def get_streak_by_game(steam_app_id: str, auth_user: AuthenticatedUser = Depends(get_current_user), db: Session = Depends(get_db)):
    return game_service.get_streak(db, auth_user.uid, steam_app_id)


@router.get(
    "/recommendations",
    summary="Returns a list of recommended games for the user who made the request and the specified userID, sorted by combined play time",
    response_model=RecommendationResponse,
    status_code=200,
)
async def get_recommendations(
    friend: uuid.UUID | None = None,
    steam_friend_id: str | None = None,
    include_top_games: bool = False,
    top_game_length: int = 10,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if friend is None and steam_friend_id is None:
        raise HTTPException(status_code=400, detail="Either friend or steam_friend_id must be provided")
    if friend is not None and steam_friend_id is not None:
        raise HTTPException(status_code=400, detail="Only one of friend or steam_friend_id can be provided")
    if top_game_length < 0:
        raise HTTPException(status_code=400, detail="Top game length must be a positive integer")

    if friend is not None:
        common_games = recommendations_service.get_recommendations_of_friend(friend, db, auth_user.uid)
    else:
        common_games = await recommendations_service.get_recommendations_of_steam(steam_friend_id, db, auth_user.uid)

    if not include_top_games:
        return RecommendationResponse(common_games=common_games, common_genres=[], top_games=[])
    else:
        top_games, common_genres = recommendations_service.include_top_games(common_games, db, top_game_length)
        return RecommendationResponse(common_games=common_games, common_genres=common_genres, top_games=top_games)


@router.get(
    "/report",
    response_model=DailyReport,
    summary="Get the daily report for the current user",
    status_code=200,
)
def get_daily_report(
    start_date: date | None = Query(None, description="Start date for the report (YYYY-MM-DD)"),
    end_date: date | None = Query(None, description="End date for the report (YYYY-MM-DD)"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyReport:
    """
    Generate an on-demand daily report for the user identified by firebase_uid between start_date and end_date (defaults to today).
    """
    return game_service.get_daily_report(session=db, user_id=auth_user.uid, start_date=start_date, end_date=end_date)

