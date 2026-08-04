import uuid
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlmodel import Session, select, or_
from src.models import User, Friendship, FriendshipStatus
from src.users import UserRead, UserSearchResult, FriendshipInfo
from src.users.schemas import FriendshipStatus as APIFriendshipStatus, FriendshipResponseStatus


def get_user_by_firebase_uid(session: Session, firebase_uid: str) -> UserRead:
    """
    Fetch the db in order to return a UserRead from a given firebase uuid
    """
    statement = select(User).where(User.firebase_uid == firebase_uid)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.steam_id:
        raise HTTPException(status_code=500, detail="User Steam ID not found")

    return UserRead.model_validate(user)


def search_users_by_username(session: Session, query: str, current_user_uid: str) -> list[UserSearchResult]:
    """
    Fetch the db in order to return a list of UserSearchResult from a given query (can be a partial username) and the friendship status
    """
    current_user = get_user_by_firebase_uid(session, current_user_uid)
    statement = (
        select(User, Friendship)
        .outerjoin(Friendship, _friendship_between_clause(current_user.id, User.id))
        .where(
            User.username.ilike(f"%{query}%"),
            User.id != current_user.id
        )
    )
    results = session.exec(statement).all()

    search_results = []
    for user, friendship in results:

        search_results.append(
            UserSearchResult(
                user=UserRead.model_validate(user),
                friendship=FriendshipInfo(
                    friendship_id=friendship.id if friendship else None,
                    friendship_status=_resolve_friendship_status(friendship, current_user.id) if friendship else None,
                    friendship_requester_id=friendship.requester_id if friendship else None,
                )
            )
        )
    return search_results



def get_friend_list(session: Session, user_uid: str) -> list[UserSearchResult]:
    """
    Return a list of Accepted and pending_incoming (friendship.addressee_id == current_user.id and friendship.status==PENDING) friendships for the current user
    """
    current_user = get_user_by_firebase_uid(session, user_uid)
    statement = (
        select(User, Friendship)
        .join(Friendship, _friendship_between_clause(current_user.id, User.id))
        .where(
            User.id != current_user.id,
            or_(
                Friendship.status == FriendshipStatus.ACCEPTED,
                (Friendship.status == FriendshipStatus.PENDING) & (Friendship.addressee_id == current_user.id), #pending_incoming
            ),
        )
    )
    results = session.exec(statement).all()

    friend_list = []
    for user, friendship in results:
        friend_list.append(
            UserSearchResult(
                user=UserRead.model_validate(user),
                friendship=FriendshipInfo(
                    friendship_id=friendship.id,
                    friendship_status=_resolve_friendship_status(friendship, current_user.id),
                    friendship_requester_id=friendship.requester_id,
                ),
            )
        )
    return friend_list


def _resolve_friendship_status(friendship: Friendship | None, current_user_id: uuid.UUID) -> APIFriendshipStatus | None:
    if not friendship:
        return None
    match friendship.status:
        case FriendshipStatus.ACCEPTED:
            return APIFriendshipStatus.ACCEPTED
        case FriendshipStatus.BLOCKED:
            return APIFriendshipStatus.BLOCKED
        case FriendshipStatus.PENDING:
            return (
                APIFriendshipStatus.PENDING_OUTGOING
                if friendship.requester_id == current_user_id
                else APIFriendshipStatus.PENDING_INCOMING
            )
        case _:
            return None


def _friendship_between_clause(user_a_id, user_b_id):
    return or_(
        (Friendship.requester_id == user_a_id) & (Friendship.addressee_id == user_b_id),
        (Friendship.addressee_id == user_a_id) & (Friendship.requester_id == user_b_id),
    )


def send_friend_request(session: Session, requester_uid: str, addressee_id: uuid.UUID):
    """
    Send a friend request from the authenticated user to the addressee.
    """
    requester = get_user_by_firebase_uid(session, requester_uid)
    if requester.id == addressee_id:
        raise HTTPException(status_code=400, detail="You cannot send a friend request to yourself")

    addressee = session.get(User, addressee_id)
    if not addressee:
        raise HTTPException(status_code=404, detail="Addressee user not found")

    existing = session.exec(
        select(Friendship).where(_friendship_between_clause(requester.id, addressee_id))
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
                else:
                    _delete_friendship(session, existing.id)

    friendship = Friendship(
        requester_id=requester.id,
        addressee_id=addressee_id,
        status=FriendshipStatus.PENDING,
    )
    session.add(friendship)
    session.commit()
    session.refresh(friendship)
    return {"message": "Friend request sent", "friendship_id": str(friendship.id)}


def respond_to_friend_request(
    session: Session,
    addressee_uid: str,
    friendship_id: uuid.UUID,
    action: FriendshipResponseStatus,
) -> dict[str, str]:
    """
    Respond to a friend request (ACCEPTED, BLOCKED, or REJECTED).
    """
    addressee = get_user_by_firebase_uid(session, addressee_uid)

    friendship = session.get(Friendship, friendship_id)
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")

    if friendship.status != FriendshipStatus.PENDING:
        raise HTTPException(status_code=400, detail="Friend request is not pending")

    if friendship.addressee_id != addressee.id:
        raise HTTPException(status_code=400, detail="Only the addressee can respond to a friend request")

    match action:
        case FriendshipResponseStatus.ACCEPTED:
            friendship.status = FriendshipStatus.ACCEPTED
            friendship.updated_at = datetime.now(timezone.utc)
            session.add(friendship)
            session.commit()
            return {"message": "Friend request accepted"}

        case FriendshipResponseStatus.REJECTED:
            _delete_friendship(session, friendship.id)
            return {"message": "Friend request rejected"}

        case FriendshipResponseStatus.BLOCKED:
            friendship.status = FriendshipStatus.BLOCKED
            friendship.updated_at = datetime.now(timezone.utc)
            session.add(friendship)
            session.commit()
            return {"message": "User blocked"}

        case _:
            raise HTTPException(status_code=400, detail="Invalid action")


def _delete_friendship(session: Session, friendship_id: uuid.UUID):
    friendship = session.get(Friendship, friendship_id)
    if not friendship:
        raise HTTPException(status_code=500, detail="Friendship to be deleted not found")
    session.delete(friendship)
    session.commit()