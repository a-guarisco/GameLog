from fastapi import HTTPException
from sqlmodel import Session, select, or_

from src.models import User, Friendship, FriendshipStatus
from src.users import UserRead, UserSearchResult
from src.users.schemas import FriendshipSearchResultStatus

"""
Fetch the db in order to return a UserRead from a given firebase uuid
"""
def get_user_by_firebase_uid(session: Session, firebase_uid: str) -> UserRead:
    statement = select(User).where(User.firebase_uid == firebase_uid)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.steam_id:
        raise HTTPException(status_code=500, detail="User Steam ID not found")

    return UserRead.model_validate(user)

"""
Fetch the db in order to return a list of UserSearchResult from a given query (can be a partial username) and the friendship status
"""
def search_users_by_username(session: Session, query: str, current_user_uid: str) -> list[UserSearchResult]:
    current_user = get_user_by_firebase_uid(session, current_user_uid)

    statement = (
        select(User, Friendship)
        .outerjoin(
            Friendship,
            or_(
                (Friendship.requester_id == current_user.id) & (Friendship.addressee_id == User.id),
                (Friendship.addressee_id == current_user.id) & (Friendship.requester_id == User.id)
            )
        )
        .where(
            User.username.ilike(f"%{query}%"),
            User.id != current_user.id
        )
    )
    results = session.exec(statement).all()

    search_results = []
    for user, friendship in results:
        friendship_status = None

        if friendship:
            match friendship.status:
                case FriendshipStatus.ACCEPTED:
                    friendship_status = FriendshipSearchResultStatus.ACCEPTED

                case FriendshipStatus.BLOCKED:
                    friendship_status = FriendshipSearchResultStatus.BLOCKED

                case FriendshipStatus.PENDING:
                    friendship_status = (
                        FriendshipSearchResultStatus.PENDING_OUTGOING
                        if friendship.requester_id == current_user.id
                        else FriendshipSearchResultStatus.PENDING_INCOMING
                    )
                case _:
                    friendship_status = None

        search_results.append(
            UserSearchResult(
                id=user.id,
                firebase_uid=user.firebase_uid,
                username=user.username,
                steam_id=user.steam_id,
                friendship_status=friendship_status,
                friendship_requester_id=friendship.requester_id if friendship else None
            )
        )
    return search_results
