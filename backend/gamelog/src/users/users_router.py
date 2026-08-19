from datetime import date
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.core.database import get_db
from src.games import game_service
from src.games.schemas import DailyReport
from src.users import FriendshipRequest, FriendshipResponse, UserSearchResult, user_service
from src.users.schemas import UserRead, UserRegisterRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/search",
    response_model=list[UserSearchResult],
    summary="Search users by username (case-insensitive) and return their basic info along with their relationship status with the current authenticated user.",
    status_code=200,
)
def search_users(q: str, auth_user: AuthenticatedUser = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.search_users_by_username(db, q, auth_user.uid)


@router.get("/friend_list", summary="Return a list of pending_incoming and accepted friendship", status_code=200)
def get_friend_list(db: Session = Depends(get_db), auth_user: AuthenticatedUser = Depends(get_current_user)):
    return user_service.get_friend_list(db, auth_user.uid)


@router.post(
    "/add_friend",
    summary="Send a friend request to another user. The addressee_id must be the UUID of the user you want to send a friend request to.",
    status_code=201,
)
def add_friend(payload: FriendshipRequest, db: Session = Depends(get_db), auth_user: AuthenticatedUser = Depends(get_current_user)):
    return user_service.send_friend_request(db, auth_user.uid, payload.addressee_id)


@router.post(
    "/respond_to_friend",
    summary="Respond to a pending friend request. Action can be ACCEPTED, BLOCKED, or REJECTED. A REJECTED friendship request can be resent by the sender, a BLOCKED friendship request blocks further requests.",
    status_code=201,
)
def response_friend(payload: FriendshipResponse, db: Session = Depends(get_db), auth_user: AuthenticatedUser = Depends(get_current_user)):
    return user_service.respond_to_friend_request(db, auth_user.uid, payload.friendship_id, payload.action)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserRead,
    summary="Register a new user in PostgreSQL linked to their Firebase Auth UID",
)
def register_user(
    register_data: UserRegisterRequest,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.register_user(db, auth_user, register_data)


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current registered user profile",
)
def get_current_user_profile(
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.get_user_by_firebase_uid(db, auth_user.uid)
