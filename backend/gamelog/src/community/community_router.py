from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.community import community_service
from src.community.schemas import CommunityGenreHour, CommunityScope
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