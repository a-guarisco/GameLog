import calendar
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.community import (
    CommunityGameStatusResponse,
    CommunityGenreHour,
    CommunityMonthlyPlaytimeResponse,
    CommunityMonthlyTopGameResponse,
    CommunityScope,
    CommunityWeeklyPlaytimeResponse,
    CommunityWeeklyTopGameResponse,
    TopGameReference,
    community_service,
)
from src.core.database import get_db

router = APIRouter(prefix="/community", tags=["community"])


@router.get(
    "/genre",
    summary="Return the percentage playtime for each genre for the specified community scope",
    response_model=list[CommunityGenreHour],
)
def get_community_genre(
    scope: CommunityScope = Query(..., description="Community scope: global, region, friends, or user"),
    user_id: uuid.UUID | None = Query(None, description="Target user UUID (required when scope is 'user')"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return community_service.get_community_genre(scope=scope, db=db, user=auth_user, user_id=user_id)


@router.get(
    "/weekly_playtime",
    summary="Return the weekly playtime comparison for the specified period and community scope",
    response_model=CommunityWeeklyPlaytimeResponse,
)
def get_community_weekly_playtime(
    scope: CommunityScope = Query(..., description="Community scope: global, region, friends, or user"),
    start_date: date = Query(..., description="Start date of the week (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date of the week (YYYY-MM-DD)"),
    user_id: uuid.UUID | None = Query(None, description="Target user UUID (required when scope is 'user')"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _check_week_is_correct(start_date, end_date)
    return community_service.get_community_weekly_playtime(
        scope=scope, start_date=start_date, end_date=end_date, user=auth_user, db=db, user_id=user_id
    )


@router.get(
    "/weekly_top_game_playtime",
    summary="Return the average playtime for the most played games in the specified week and community scope",
    response_model=list[CommunityWeeklyTopGameResponse],
)
def get_community_weekly_top_game_playtime(
    scope: CommunityScope = Query(..., description="Community scope: global, region, friends, or user"),
    start_date: date = Query(..., description="Start date of the week (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date of the week (YYYY-MM-DD)"),
    reference: TopGameReference | None = Query(
        None,
        description="Reference point for ranking: 'community' or 'user'",
    ),
    user_id: uuid.UUID | None = Query(None, description="Target user UUID (required when scope is 'user')"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if reference is None:
        raise HTTPException(
            status_code=400,
            detail="reference query parameter is required ('community' or 'user').",
        )
    _check_week_is_correct(start_date, end_date)
    return community_service.get_community_weekly_top_games(
        scope=scope,
        start_date=start_date,
        end_date=end_date,
        user=auth_user,
        db=db,
        reference=reference,
        user_id=user_id,
    )


@router.get(
    "/monthly_playtime",
    summary="Return the month-by-month playtime comparison for the specified period and community scope",
    response_model=CommunityMonthlyPlaytimeResponse,
)
def get_community_monthly_playtime(
    scope: CommunityScope = Query(..., description="Community scope: global, region, friends, or user"),
    start_date: date = Query(..., description="Start date of the period (YYYY-MM-01)"),
    end_date: date = Query(..., description="End date of the period (last day of month)"),
    user_id: uuid.UUID | None = Query(None, description="Target user UUID (required when scope is 'user')"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _check_month_is_correct(start_date, end_date)
    return community_service.get_community_monthly_playtime(
        scope=scope, start_date=start_date, end_date=end_date, user=auth_user, db=db, user_id=user_id
    )


@router.get(
    "/monthly_top_game_playtime",
    summary="Return the average playtime for the most played games in the specified month period and community scope",
    response_model=list[CommunityMonthlyTopGameResponse],
)
def get_community_monthly_top_game_playtime(
    scope: CommunityScope = Query(..., description="Community scope: global, region, friends, or user"),
    start_date: date = Query(..., description="Start date of the period (YYYY-MM-01)"),
    end_date: date = Query(..., description="End date of the period (last day of month)"),
    reference: TopGameReference | None = Query(
        None,
        description="Reference point for ranking: 'community' or 'user'",
    ),
    user_id: uuid.UUID | None = Query(None, description="Target user UUID (required when scope is 'user')"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if reference is None:
        raise HTTPException(
            status_code=400,
            detail="reference query parameter is required ('community' or 'user').",
        )
    _check_month_is_correct(start_date, end_date)
    return community_service.get_community_monthly_top_games(
        scope=scope,
        start_date=start_date,
        end_date=end_date,
        user=auth_user,
        db=db,
        reference=reference,
        user_id=user_id,
    )


@router.get(
    "/game_statuses",
    summary="Return the game status breakdown for user and community scope",
    response_model=CommunityGameStatusResponse,
)
def get_community_game_statuses(
    scope: CommunityScope = Query(..., description="Community scope: global, region, friends, or user"),
    user_id: uuid.UUID | None = Query(None, description="Target user UUID (required when scope is 'user')"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return community_service.get_community_game_statuses(
        scope=scope,
        user=auth_user,
        db=db,
        user_id=user_id,
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
