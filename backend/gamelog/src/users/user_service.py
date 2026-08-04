import uuid
from datetime import datetime

from fastapi import HTTPException
from sqlmodel import Session, select, or_

from src.models import User, Friendship, FriendshipStatus
from src.users import UserRead, UserSearchResult, FriendshipInfo
from src.users.schemas import FrienshipStatus, FriendshipResponseStatus

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
                    friendship_id=friendship.id if friendship else None,
                    friendship_status=friendship_status,
                    friendship_requester_id=friendship.requester_id if friendship else None,
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
                if existing.requester_id == requester.id:
                    raise HTTPException(
                        status_code=403,
                        detail="Cannot send a friend request to this user",
                    )
                blocked_user_id = friendship.requester_id
                friendship.requester_id = addressee.id
                friendship.addressee_id = blocked_user_id
                existing.status = FriendshipStatus.PENDING
                existing.updated_at = datetime.now()
                session.add(existing)
                session.commit()
                session.refresh(existing)
                return {"message": "Friend request sent", "friendship_id": str(existing.id)}


    friendship = Friendship(
        requester_id=requester.id,
        addressee_id=addressee_id,
        status=FriendshipStatus.PENDING,
    )
    session.add(friendship)
    session.commit()
    session.refresh(friendship)
    return {"message": "Friend request sent", "friendship_id": str(friendship.id)}


"""
Respond to a friend request (accepted, rejected, or blocked).
"""
def respond_to_friend_request(
    session: Session,
    addressee_uid: str,
    friendship_id: uuid.UUID,
    action: FriendshipResponseStatus,
) -> dict[str, str]:
    addressee = get_user_by_firebase_uid(session, addressee_uid)

    friendship = session.get(Friendship, friendship_id)
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")

    if friendship.requester_id != addressee.id and friendship.addressee_id != addressee.id:
        raise HTTPException(status_code=403, detail="You are not part of this friendship")

    if friendship.status != FriendshipStatus.PENDING:
        raise HTTPException(
            status_code=400, detail="Friend request is not pending"
        )

    match action:
        case FriendshipResponseStatus.ACCEPTED:

            if friendship.addressee_id != addressee.id:
                raise HTTPException(
                    status_code=400,
                    detail="Only the addressee can accept a friend request",
                )
            friendship.status = FriendshipStatus.ACCEPTED
            friendship.updated_at = datetime.now()
            session.add(friendship)
            session.commit()
            return {"message": "Friend request accepted"}

        case FriendshipResponseStatus.REJECTED:
            if friendship.addressee_id != addressee.id:
                raise HTTPException(
                    status_code=400,
                    detail="Only the addressee can reject a friend request",
                )
            session.delete(friendship)
            session.commit()
            return {"message": "Friend request rejected"}

        case FriendshipResponseStatus.BLOCKED:
            if friendship.addressee_id != addressee.id:
                raise HTTPException(
                    status_code=400,
                    detail="Only the addressee can block a friend request",
                )
            friendship.status = FriendshipStatus.BLOCKED
            friendship.updated_at = datetime.now()
            session.add(friendship)
            session.commit()
            return {"message": "User blocked"}

        case _:
            raise HTTPException(status_code=400, detail="Invalid action")
