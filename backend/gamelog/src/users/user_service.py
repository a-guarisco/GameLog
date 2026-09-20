import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlmodel import Session, col, or_, select

from src.auth.schemas import AuthenticatedUser
from src.models import Friendship, FriendshipStatus, User
from src.users import FriendshipInfo, UserSearchResult, notifications_service
from src.users.schemas import (
    FriendshipManageAction,
    FriendshipManageRequest,
    UserMeRead,
    UserRead,
    UserRegisterRequest,
)
from src.users.schemas import FriendshipStatus as APIFriendshipStatus


def get_user_by_firebase_uid(session: Session, firebase_uid: str) -> User:
    """
    Fetch the db in order to return a UserRead from a given firebase uuid
    """
    statement = select(User).where(User.firebase_uid == firebase_uid)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.steam_id:
        raise HTTPException(status_code=500, detail="User Steam ID not found")

    return user


def register_user(
    session: Session,
    auth_user: AuthenticatedUser,
    register_data: UserRegisterRequest,
) -> UserRead:
    if not auth_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email is not verified. Please verify your email address before registering.",
        )

    existing_uid = session.exec(select(User).where(User.firebase_uid == auth_user.uid)).first()
    if existing_uid:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Firebase user is already registered",
        )

    existing_username = session.exec(select(User).where(User.username == register_data.username)).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken",
        )

    existing_steam = session.exec(select(User).where(User.steam_id == register_data.steam_id)).first()
    if existing_steam:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Steam ID is already registered",
        )

    from src.games.steam_fetcher_service import get_steam_player_summary_sync

    player_summary = get_steam_player_summary_sync(register_data.steam_id, register_data.steam_api_key or None)
    if not player_summary:
        detail = "Invalid Steam ID or Steam API Key" if register_data.steam_api_key else "Invalid Steam ID"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    region = player_summary.get("loccountrycode") or None
    new_user = User(
        firebase_uid=auth_user.uid,
        username=register_data.username,
        steam_id=register_data.steam_id,
        steam_api_key=register_data.steam_api_key or "",
        region=region,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return UserRead.model_validate(new_user)


def update_steam_api_key(session: Session, firebase_uid: str, steam_api_key: str) -> UserMeRead:
    statement = select(User).where(User.firebase_uid == firebase_uid)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from src.games.steam_fetcher_service import validate_steam_credentials_sync

    is_valid = validate_steam_credentials_sync(user.steam_id, steam_api_key)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Steam API Key for your Steam ID",
        )

    user.steam_api_key = steam_api_key
    session.add(user)
    session.commit()
    session.refresh(user)
    return UserMeRead.model_validate(user)


def search_users_by_username(session: Session, query: str, current_user_uid: str) -> list[UserSearchResult]:
    """
    Fetch the db in order to return a list of UserSearchResult from a given query (can be a partial username) and the friendship status
    """
    current_user = get_user_by_firebase_uid(session, current_user_uid)
    statement = (
        select(User, Friendship)
        .outerjoin(Friendship, _friendship_between_clause(current_user.id, User.id))
        .where(col(User.username).ilike(f"%{query}%"), col(User.id) != current_user.id)
    )
    results = session.exec(statement).all()

    search_results = []
    for user, friendship in results:
        if friendship and friendship.status == FriendshipStatus.BLOCKED and friendship.requester_id != current_user.id:
            continue

        search_results.append(
            UserSearchResult(
                user=UserRead.model_validate(user),
                friendship=FriendshipInfo(
                    friendship_id=friendship.id if friendship else None,
                    friendship_status=_resolve_friendship_status(friendship, current_user.id) if friendship else None,
                    friendship_requester_id=friendship.requester_id if friendship else None,
                    since=friendship.updated_at.strftime("%d-%m-%Y") if friendship and friendship.updated_at else None,
                ),
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
                (Friendship.status == FriendshipStatus.PENDING) & (Friendship.addressee_id == current_user.id),  # pending_incoming
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
                    since=friendship.updated_at.strftime("%d-%m-%Y") if friendship.updated_at else None,
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
            return APIFriendshipStatus.PENDING_OUTGOING if friendship.requester_id == current_user_id else APIFriendshipStatus.PENDING_INCOMING
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

    existing = session.exec(select(Friendship).where(_friendship_between_clause(requester.id, addressee_id))).first()
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
                    existing.status = FriendshipStatus.PENDING
                    existing.requester_id = requester.id
                    existing.addressee_id = addressee_id
                    existing.updated_at = datetime.now(UTC)
                    session.add(existing)
                    session.commit()
                    session.refresh(existing)
                    notifications_service.send_notification_to_user(
                        session=session,
                        target_user_id=addressee_id,
                        title="New Friend Request",
                        body=f"{requester.username} wants to add you as a friend.",
                        data={"friendship_id": str(existing.id)},
                    )
                    return {"message": "Friend request sent", "friendship_id": str(existing.id)}
                else:
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
    session.refresh(friendship)
    notifications_service.send_notification_to_user(
        session=session,
        target_user_id=addressee_id,
        title="New Friend Request",
        body=f"{requester.username} wants to add you as a friend.",
        data={"friendship_id": str(friendship.id)},
    )
    return {"message": "Friend request sent", "friendship_id": str(friendship.id)}


def manage_friendship(
    session: Session,
    current_user_uid: str,
    payload: FriendshipManageRequest,
) -> dict[str, str]:
    """
    Unified friendship manager handling ACCEPT, REJECT, CANCEL, REMOVE, BLOCK, and UNBLOCK.
    """
    current_user = get_user_by_firebase_uid(session, current_user_uid)

    friendship: Friendship | None = None
    if payload.friendship_id:
        friendship = session.get(Friendship, payload.friendship_id)
        if not friendship and not payload.target_user_id:
            # Check if the provided friendship_id was actually a target_user_id
            target_user = session.get(User, payload.friendship_id)
            if target_user:
                friendship = session.exec(select(Friendship).where(_friendship_between_clause(current_user.id, target_user.id))).first()
                if not friendship and payload.action != FriendshipManageAction.BLOCK:
                    raise HTTPException(status_code=404, detail="Friendship not found")
            else:
                raise HTTPException(status_code=404, detail="Friendship not found")
    elif payload.target_user_id:
        friendship = session.exec(select(Friendship).where(_friendship_between_clause(current_user.id, payload.target_user_id))).first()
    else:
        raise HTTPException(status_code=400, detail="Either friendship_id or target_user_id must be provided")

    action = payload.action

    match action:
        case FriendshipManageAction.ACCEPT:
            if not friendship:
                raise HTTPException(status_code=404, detail="Friendship not found")
            if friendship.status != FriendshipStatus.PENDING:
                raise HTTPException(status_code=400, detail="Friend request is not pending")
            if friendship.addressee_id != current_user.id:
                raise HTTPException(status_code=400, detail="Only the addressee can accept a friend request")

            friendship.status = FriendshipStatus.ACCEPTED
            friendship.updated_at = datetime.now(UTC)
            session.add(friendship)
            session.commit()
            notifications_service.send_notification_to_user(
                session=session,
                target_user_id=friendship.requester_id,
                title="New Friend Added",
                body=f"{current_user.username} accepted your friend request.",
                data={"friendship_id": str(friendship.id)},
            )
            return {"message": "Friend request accepted"}

        case FriendshipManageAction.REJECT:
            if not friendship:
                raise HTTPException(status_code=404, detail="Friendship not found")
            if friendship.status != FriendshipStatus.PENDING:
                raise HTTPException(status_code=400, detail="Friend request is not pending")
            if friendship.addressee_id != current_user.id:
                raise HTTPException(status_code=400, detail="Only the addressee can reject a friend request")

            _delete_friendship(session, friendship.id)
            return {"message": "Friend request rejected"}

        case FriendshipManageAction.CANCEL:
            if not friendship:
                raise HTTPException(status_code=404, detail="Friendship not found")
            if friendship.status != FriendshipStatus.PENDING:
                raise HTTPException(status_code=400, detail="Friend request is not pending")
            if friendship.requester_id != current_user.id:
                raise HTTPException(status_code=400, detail="Only the sender can cancel a friend request")

            _delete_friendship(session, friendship.id)
            return {"message": "Friend request cancelled"}

        case FriendshipManageAction.REMOVE:
            if not friendship:
                raise HTTPException(status_code=404, detail="Friendship not found")
            if friendship.status != FriendshipStatus.ACCEPTED:
                raise HTTPException(status_code=400, detail="Friendship is not accepted")
            if current_user.id not in (friendship.requester_id, friendship.addressee_id):
                raise HTTPException(status_code=400, detail="You are not part of this friendship")

            _delete_friendship(session, friendship.id)
            return {"message": "Friend removed"}

        case FriendshipManageAction.BLOCK:
            if friendship:
                if current_user.id not in (friendship.requester_id, friendship.addressee_id):
                    raise HTTPException(status_code=400, detail="You are not part of this friendship")
                if friendship.status == FriendshipStatus.BLOCKED:
                    if friendship.requester_id == current_user.id:
                        return {"message": "User blocked"}
                    else:
                        raise HTTPException(status_code=403, detail="Cannot interact with this user")

                other_user_id = friendship.addressee_id if friendship.requester_id == current_user.id else friendship.requester_id
                friendship.requester_id = current_user.id
                friendship.addressee_id = other_user_id
                friendship.status = FriendshipStatus.BLOCKED
                friendship.updated_at = datetime.now(UTC)
                session.add(friendship)
                session.commit()
                return {"message": "User blocked", "friendship_id": str(friendship.id)}
            else:
                target_id = payload.target_user_id or payload.friendship_id
                if not target_id:
                    raise HTTPException(status_code=400, detail="Target user ID required to block")
                if target_id == current_user.id:
                    raise HTTPException(status_code=400, detail="Cannot block yourself")
                target_user = session.get(User, target_id)
                if not target_user:
                    raise HTTPException(status_code=404, detail="Target user not found")

                new_block = Friendship(
                    requester_id=current_user.id,
                    addressee_id=target_id,
                    status=FriendshipStatus.BLOCKED,
                )
                session.add(new_block)
                session.commit()
                return {"message": "User blocked", "friendship_id": str(new_block.id)}

        case FriendshipManageAction.UNBLOCK:
            if not friendship:
                raise HTTPException(status_code=404, detail="Friendship not found")
            if friendship.status != FriendshipStatus.BLOCKED:
                raise HTTPException(status_code=400, detail="Friendship is not blocked")
            if friendship.requester_id != current_user.id:
                raise HTTPException(status_code=403, detail="Only the blocker can unblock this user")

            _delete_friendship(session, friendship.id)
            return {"message": "User unblocked"}

        case _:
            raise HTTPException(status_code=400, detail="Invalid action")


def _delete_friendship(session: Session, friendship_id: uuid.UUID):
    friendship = session.get(Friendship, friendship_id)
    if not friendship:
        raise HTTPException(status_code=500, detail="Friendship to be deleted not found")
    session.delete(friendship)
    session.commit()
