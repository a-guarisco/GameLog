from fastapi import HTTPException
from src.users import user_service
import uuid
import httpx
from sqlmodel import Session, select
from src.games.schemas import RecommendationResponse
from src.games import steam_fetcher_service
from src.models import SteamRollingTime, User, Friendship, FriendshipStatus, TopGame, Game

def _get_latest_rolling_times(user_id: uuid.UUID, session: Session) -> dict[str, SteamRollingTime]:
    """
    Retrieves the latest SteamRollingTime entries for a user from the DB.
    """
    rolling_records = session.exec(
        select(SteamRollingTime)
        .where(SteamRollingTime.user_id == user_id)
        .order_by(SteamRollingTime.created_at.desc())
    ).all()

    latest = {}
    for rolling in rolling_records:
        if rolling.steam_app_id not in latest:
            latest[rolling.steam_app_id] = rolling
    return latest


def _build_recommendation_responses(
    auth_latest: dict[str, SteamRollingTime],
    friend_playtimes: dict[str, int],
) -> list[RecommendationResponse]:
    common_games_playtime = {}
    for app_id, auth_rec in auth_latest.items():
        if app_id in friend_playtimes:
            friend_time = friend_playtimes[app_id]
            if auth_rec.last_day_playtime > 0 and friend_time > 0:
                common_games_playtime[app_id] = auth_rec.last_day_playtime + friend_time

    if not common_games_playtime:
        return []

    sorted_app_ids = sorted(common_games_playtime.keys(), key=lambda app_id: common_games_playtime[app_id], reverse=True)

    return [
        RecommendationResponse(
            gameSteamId=app_id,
            requester_play_time=auth_latest[app_id].last_day_playtime,
            friend_play_time=friend_playtimes[app_id],
        )
        for app_id in sorted_app_ids
    ]


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

    auth_latest = _get_latest_rolling_times(auth_user.id, session)
    friend_latest = _get_latest_rolling_times(friend_id, session)

    friend_playtimes = {app_id: rec.last_day_playtime for app_id, rec in friend_latest.items()}
    return _build_recommendation_responses(auth_latest, friend_playtimes)


async def get_recommendations_of_steam(
    steam_friend_id: str,
    session: Session,
    auth_user_uid: str,
) -> list[RecommendationResponse]:
    """
    Returns a list of common games played by both auth_user and steam_friend_id,
    sorted by combined playtime (descending).
    """
    user = session.exec(select(User).where(User.firebase_uid == auth_user_uid)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.steam_id:
        raise HTTPException(status_code=500, detail="User Steam ID not found")

    async with httpx.AsyncClient(timeout=10.0) as client:
        steam_friend_list = await steam_fetcher_service.get_friend_list_from_steam_async(user, client)

        friend_found = None
        for steam_friend in steam_friend_list.friends:
            if steam_friend.steamid == steam_friend_id:
                friend_found = steam_friend
                break
        if not friend_found:
            raise HTTPException(status_code=404, detail="Friend not found on Steam")

        friend_fake_user = User(
            firebase_uid="dummy",
            username="dummy",
            steam_id=steam_friend_id,
            steam_api_key=user.steam_api_key or "",
        )
        steam_friend_games_list = await steam_fetcher_service.get_owned_games_from_steam_async(friend_fake_user, client)

    auth_latest = _get_latest_rolling_times(user.id, session)
    friend_playtimes = {str(game.appid): game.playtime_forever for game in steam_friend_games_list.games}
    return _build_recommendation_responses(auth_latest, friend_playtimes)

def include_top_games(
        common_games: list[RecommendationResponse],
        session: Session,
) -> list[RecommendationResponse]:
    if not common_games:
        top_games = session.exec(select(TopGame).order_by(TopGame.rank.asc()).limit(10)).all()
        return [
            RecommendationResponse(
                gameSteamId=tg.steam_app_id,
                requester_play_time=0,
                friend_play_time=0,
            )
            for tg in top_games
        ]

    common_app_ids = {g.gameSteamId for g in common_games}
    games = session.exec(select(Game).where(Game.steam_app_id.in_(list(common_app_ids)))).all()
    computed_genre_ids = set()
    for g in games:
        for genre in g.genres:
            computed_genre_ids.add(genre.id)

    if not computed_genre_ids:
        return common_games

    top_games = session.exec(select(TopGame).order_by(TopGame.rank.asc())).all()
    
    candidates = []
    for tg in top_games:
        if tg.steam_app_id in common_app_ids:
            continue
        tg_genre_ids = {genre.id for genre in tg.genres}
        intersection = tg_genre_ids & computed_genre_ids
        if intersection:
            candidates.append((len(intersection), tg))

    candidates.sort(key=lambda item: (-item[0], item[1].rank))

    result_games = list(common_games)
    for _, tg in candidates[:10]:
        result_games.append(
            RecommendationResponse(
                gameSteamId=tg.steam_app_id,
                requester_play_time=0,
                friend_play_time=0,
            )
        )

    return result_games

