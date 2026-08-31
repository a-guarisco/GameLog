import calendar
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.community import community_service
from src.community.schemas import (
    CommunityGenreHour,
    CommunityMonthlyPlaytimeResponse,
    CommunityScope,
    CommunityWeeklyPlaytimeResponse,
    CommunityWeeklyTopGameResponse,
)
from src.core.database import get_db

router = APIRouter(prefix="/community", tags=["community"])


@router.get(
    "/genre",
    summary="Return the percentage playtime for each genre for the specified community scope",
    response_model=list[CommunityGenreHour],
)
def get_community_genre(
    scope: CommunityScope = Query(..., description="Community scope: global, region, or friends"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return community_service.get_community_genre(scope=scope, db=db, user=auth_user)


@router.get(
    "/weekly_playtime",
    summary="Return the weekly playtime comparison for the specified period and community scope",
    response_model=CommunityWeeklyPlaytimeResponse,
)
def get_community_weekly_playtime(
    scope: CommunityScope = Query(..., description="Community scope: global, region, or friends"),
    start_date: date = Query(..., description="Start date of the week (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date of the week (YYYY-MM-DD)"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _check_week_is_correct(start_date, end_date)
    return community_service.get_community_weekly_playtime(
        scope=scope, start_date=start_date, end_date=end_date, user=auth_user, db=db
    )


@router.get(
    "/weekly_top_game_playtime",
    summary="Return the average playtime for the most played games in the specified week and community scope",
    response_model=list[CommunityWeeklyTopGameResponse],
)
def get_community_weekly_top_game_playtime(
    scope: CommunityScope = Query(..., description="Community scope: global, region, or friends"),
    start_date: date = Query(..., description="Start date of the week (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date of the week (YYYY-MM-DD)"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _check_week_is_correct(start_date, end_date)
    return community_service.get_community_weekly_top_games(
        scope=scope, start_date=start_date, end_date=end_date, user=auth_user, db=db
    )


@router.get(
    "/monthly_playtime",
    summary="Return the month-by-month playtime comparison for the specified period and community scope",
    response_model=CommunityMonthlyPlaytimeResponse,
)
def get_community_monthly_playtime(
    scope: CommunityScope = Query(..., description="Community scope: global, region, or friends"),
    start_date: date = Query(..., description="Start date of the period (YYYY-MM-01)"),
    end_date: date = Query(..., description="End date of the period (last day of month)"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _check_month_is_correct(start_date, end_date)
    return community_service.get_community_monthly_playtime(
        scope=scope, start_date=start_date, end_date=end_date, user=auth_user, db=db
    )


def _check_week_is_correct(start_date: date, end_date: date) -> bool:
    if start_date.weekday() != 0 or (end_date - start_date).days != 6:
        raise HTTPException(
            status_code=400,
            detail="start_date must be Monday and end_date must be the following Sunday (7 days).",
        )
    return True


def _check_month_is_correct(start_date: date, end_date: date) -> bool:
    _, end_month_last_day = calendar.monthrange(end_date.year, end_date.month)
    if start_date.day != 1 or end_date.day != end_month_last_day or start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be the first day of a month, end_date must be the last day of a month, and start_date must be on or before end_date.",
        )
    return True




