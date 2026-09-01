from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.core.database import get_db
from src.users import (
    FriendshipManageRequest,
    FriendshipRequest,
    UserSearchResult,
    user_service,
)
from src.users.schemas import UserRead, UserMeRead, UserRegisterRequest, SteamApiKeyUpdateRequest

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
    "/manage_friendship",
    summary="Manage friendship state transitions (ACCEPT, REJECT, CANCEL, REMOVE, BLOCK, UNBLOCK).",
    status_code=200,
)
def manage_friendship(
    payload: FriendshipManageRequest,
    db: Session = Depends(get_db),
    auth_user: AuthenticatedUser = Depends(get_current_user),
):
    return user_service.manage_friendship(db, auth_user.uid, payload)


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
    response_model=UserMeRead,
    summary="Get current registered user profile including steam_api_key",
)
def get_current_user_profile(
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.get_user_by_firebase_uid(db, auth_user.uid)


@router.post(
    "/me/steam-api-key",
    response_model=UserMeRead,
    summary="Update the Steam API Key for the current user",
    status_code=200,
)
def update_steam_api_key(
    payload: SteamApiKeyUpdateRequest,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.update_steam_api_key(db, auth_user.uid, payload.steam_api_key)
