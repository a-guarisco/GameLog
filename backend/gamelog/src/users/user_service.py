import uuid

from fastapi import HTTPException
from sqlmodel import Session, select, or_

from src.models import User, Friendship, FriendshipStatus
from src.users import UserRead, UserSearchResult, FriendshipInfo
from src.users.schemas import FrienshipStatus

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
                    friendship_status = FrienshipStatus.ACCEPTED

                case FriendshipStatus.BLOCKED:
                    friendship_status = FrienshipStatus.BLOCKED

                case FriendshipStatus.PENDING:
                    friendship_status = (
                        FrienshipStatus.PENDING_OUTGOING
                        if friendship.requester_id == current_user.id
                        else FrienshipStatus.PENDING_INCOMING
                    )
                case _:
                    friendship_status = None

        search_results.append(
            UserSearchResult(
                user=UserRead.model_validate(user),
                friendship=FriendshipInfo(
                    friendship_status=friendship_status,
                    friendship_requester_id=friendship.requester_id if friendship else None
                )
            )
        )
    return search_results


"""
    Send a friend request from the authenticated user to the addressee.
"""
def send_friend_request(session: Session, requester_uid: str, addressee_id: uuid.UUID):
    requester = get_user_by_firebase_uid(session, requester_uid)

    if requester.id == addressee_id:
        raise HTTPException(status_code=400, detail="You cannot send a friend request to yourself")
    addressee = session.get(User, addressee_id)
    if not addressee:
        raise HTTPException(status_code=404, detail="Addressee user not found")

    existing = session.exec(
        select(Friendship).where(
            or_(
                (Friendship.requester_id == requester.id) & (Friendship.addressee_id == addressee_id),
                (Friendship.requester_id == addressee_id) & (Friendship.addressee_id == requester.id),
            )
        )
    ).first()
    if existing:
        match existing.status:
            case FriendshipStatus.PENDING:
                raise HTTPException(
                    status_code=409,
                    detail="A friend request is already pending between you and this user",
                )
            case FriendshipStatus.ACCEPTED:
                raise HTTPException(
                    status_code=409,
                    detail="You are already friends with this user",
                )
            case FriendshipStatus.BLOCKED:
                raise HTTPException(
                    status_code=403,
                    detail="Cannot send a friend request to this user",
                )

    friendship = Friendship(
        requester_id=requester.id,
        addressee_id=addressee_id,
        status=FriendshipStatus.PENDING,
    )
    session.add(friendship)
    session.commit()
    return
