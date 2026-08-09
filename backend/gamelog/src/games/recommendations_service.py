from src.users import user_service
import uuid
from sqlmodel import Session, select
from src.games.schemas import RecommendationResponse
from src.models import SteamRollingTime, User, Friendship, FriendshipStatus

def get_recommendations_of_friend(
    friend_id: uuid.UUID,
    session: Session,
    auth_user_uid: str,
) -> list[RecommendationResponse]:
    """
    Returns a list of common games played by both auth_user and friend_id,
    sorted by combined playtime (descending).
    """
    auth_user = user_service.get_user_by_firebase_uid(session, auth_user_uid)

    if auth_user.id == friend_id:
        raise HTTPException(status_code=400, detail="Cannot request recommendations with yourself")

    friend = session.exec(select(User).where(User.id == friend_id)).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")

    friendship = session.exec(
        select(Friendship).where(
            (
                (Friendship.requester_id == auth_user.id) & (Friendship.addressee_id == friend_id)
            ) | (
                (Friendship.requester_id == friend_id) & (Friendship.addressee_id == auth_user.id)
            )
        )
    ).first()

    if not friendship or friendship.status != FriendshipStatus.ACCEPTED:
        raise HTTPException(
            status_code=403,
            detail="Users are not friends or friendship request not accepted",
        )

    auth_rolling = session.exec(
        select(SteamRollingTime)
        .where(SteamRollingTime.user_id == auth_user.id)
        .order_by(SteamRollingTime.created_at.desc())
    ).all()

    friend_rolling = session.exec(
        select(SteamRollingTime)
        .where(SteamRollingTime.user_id == friend_id)
        .order_by(SteamRollingTime.created_at.desc())
    ).all()

    auth_latest = {}
    for rolling in auth_rolling:
        if rolling.steam_app_id not in auth_latest:
            auth_latest[rolling.steam_app_id] = rolling

    friend_latest = {}
    for rolling in friend_rolling:
        if rolling.steam_app_id not in friend_latest:
            friend_latest[rolling.steam_app_id] = rolling

    common_games_playtime = {}
    for app_id, auth_rec in auth_latest.items():
        if app_id in friend_latest:
            friend_rec = friend_latest[app_id]
            if auth_rec.last_day_playtime > 0 and friend_rec.last_day_playtime > 0:
                common_games_playtime[app_id] = auth_rec.last_day_playtime + friend_rec.last_day_playtime

    if not common_games_playtime:
        return []

    sorted_app_ids = sorted(common_games_playtime.keys(), key=lambda app_id: common_games_playtime[app_id], reverse=True)

    return [
        RecommendationResponse(
            gameSteamId=app_id,
            requester_play_time=auth_latest[app_id].last_day_playtime,
            friend_play_time=friend_latest[app_id].last_day_playtime,
        )
        for app_id in sorted_app_ids
    ]