from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.core.database import get_db
from src.users import user_service, UserSearchResult

router = APIRouter(prefix="/users", tags=["Users"])

"""
Search users by username (case-insensitive) and return their basic info 
along with their relationship status with the current authenticated user.
"""
@router.get("/search", response_model=list[UserSearchResult])
def search_users(
    q: str,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return user_service.search_users_by_username(db, q, auth_user.uid)


