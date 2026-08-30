from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.community import community_service
from src.community.schemas import (
    CommunityGenreHour,
    CommunityScope,
    CommunityWeeklyPlaytimeResponse,
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
    summary="Return the weekly playtime comparison for the specified period",
    response_model=CommunityWeeklyPlaytimeResponse,
)
def get_community_weekly_playtime(
    scope: CommunityScope = Query(..., description="Community scope: global, region, or friends"),
    start_date: date = Query(..., description="Start date of the week (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date of the week (YYYY-MM-DD)"),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if start_date.weekday() != 0 or (end_date - start_date).days != 6:
        raise HTTPException(
            status_code=400,
            detail="start_date must be Monday and end_date must be the following Sunday (7 days).",
        )
    return community_service.get_community_weekly_playtime(
        scope=scope, start_date=start_date, end_date=end_date, user=auth_user, db=db
    )

