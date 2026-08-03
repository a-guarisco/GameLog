import uuid
import warnings
from collections import defaultdict
from collections.abc import Sequence
from datetime import date, timedelta

import httpx
from fastapi import HTTPException
from sqlmodel import Session, select

from src.games.schemas import DayByDayPlaytime, GetOwnedGamesResponse, SteamGame
from src.models import Game, GameStatus, Shelving, SteamRollingTime, User

"""
For the specified user, fetch GetOwnedGames from steam, update DB catalog, User Shelving and create
a new steamRolling object if the today "playtime_forever" is different than the last one saved (yesterday)
"""


async def update_user_shelving_steamrolling_async(
    session: Session,
    user: User,
    client: httpx.AsyncClient | None = None,
) -> None:
    steam_games = await _get_owned_games_from_steam_async(user, client=client)
    for steam_game in steam_games.games:
        steam_app_id = str(steam_game.appid)

        game_cached = _get_cached_game(session, steam_app_id)
        if not game_cached:
            game_cached = _cache_game(session, steam_app_id)

        shelve_exists = _get_game_player_shelve(session, game_cached.id, user.id)
        if not shelve_exists:
            _shelve_game(session, game_cached.id, user.id, GameStatus.SHELVED)
            _create_steam_rolling(session, user, steam_game, steam_app_id)

        latest_rolling = _get_latest_steam_rolling(session, user.id, steam_app_id)
        if latest_rolling is None or steam_game.playtime_forever != latest_rolling.last_day_playtime:
            _create_steam_rolling(session, user, steam_game, steam_app_id)


def _get_cached_game(session: Session, steam_app_id: str) -> Game | None:
    return session.exec(select(Game).where(Game.steam_app_id == steam_app_id)).first()


def _get_game_player_shelve(session: Session, game_id: uuid.UUID, user_id: uuid.UUID) -> Shelving | None:
    return session.exec(select(Shelving).where(Shelving.game_id == game_id).where(Shelving.owner_id == user_id)).first()


def _cache_game(session: Session, steam_app_id: str) -> Game:
    game_cached = Game(
        steam_app_id=steam_app_id,
    )
    session.add(game_cached)
    session.commit()
    return game_cached


def _shelve_game(session: Session, game_id: uuid.UUID, user_id: uuid.UUID, status: GameStatus) -> None:
    shelving = Shelving(
        game_id=game_id,
        owner_id=user_id,
        status=status,
    )
    session.add(shelving)
    session.commit()


def _create_steam_rolling(session: Session, user: User, game: SteamGame, steam_app_id: str) -> None:
    steam_rolling = SteamRollingTime(
        user_id=user.id,
        steam_app_id=steam_app_id,
        last_day_playtime=game.playtime_forever,
        created_at=date.today(),
    )
    session.add(steam_rolling)
    session.commit()


def _get_latest_steam_rolling(session: Session, user_id: uuid.UUID, steam_app_id: str) -> SteamRollingTime | None:
    return session.exec(
        select(SteamRollingTime)
        .where(SteamRollingTime.user_id == user_id)
        .where(SteamRollingTime.steam_app_id == steam_app_id)
        .order_by(SteamRollingTime.created_at.desc())
    ).first()


async def _get_owned_games_from_steam_async(
    user: User,
    client: httpx.AsyncClient | None = None,
) -> GetOwnedGamesResponse:
    steam_api_key = getattr(user, "steam_api_key", None)
    if not steam_api_key and hasattr(user, "__dict__"):
        steam_api_key = user.__dict__.get("steam_api_key")

    if not steam_api_key:
        warnings.warn("Using default steam api key")
        steam_api_key = "724FF154B1D2A357857A257EA28C6415"

    url = (
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
        f"?key={steam_api_key}&steamid={user.steam_id}&format=json"
        "&include_played_free_games=true&include_free_sub=true"
    )

    should_close = False
    if client is None:
        client = httpx.AsyncClient(timeout=10.0)
        should_close = True

    try:
        response = await client.get(url)
        response.raise_for_status()
        payload = response.json()
    finally:
        if should_close:
            await client.aclose()

    steam_response = payload.get("response", {})
    return GetOwnedGamesResponse(
        game_count=steam_response.get("game_count", 0),
        games=[SteamGame(**game) for game in steam_response.get("games", [])],
    )


"""
Return a list of DayByDayPlaytime (date, playtime) of length days (if days=-1, return all possible entry)
telling how much the specified user has played in the last days
"""


def get_playtime_by_user(session: Session, user_id: str, days: int = -1) -> list[DayByDayPlaytime]:
    steam_rolling_times = _get_steam_rolling_by_user(session, user_id)
    return _compute_daily_playtimes(steam_rolling_times, days)


"""
Return a list of DayByDayPlaytime (date, playtime) of length days (if days=-1, return all possible entry)
telling how much the specified user has played the specified game (by steam_app_id) in the last days
"""


def get_playtime_by_game(session: Session, user_id: str, steam_app_id: str, days: int = -1) -> list[DayByDayPlaytime]:
    steam_rolling_times = _get_steam_rolling_by_user(session, user_id, steam_app_id)
    return _compute_daily_playtimes(steam_rolling_times, days)


def _compute_daily_playtimes(steam_rolling_times: Sequence[SteamRollingTime], days: int) -> list[DayByDayPlaytime]:
    records_by_game = defaultdict(list)
    for record in steam_rolling_times:
        records_by_game[record.steam_app_id].append(record)

    daily_totals = defaultdict(int)
    earliest_date = None

    for game_id, records in records_by_game.items():
        records.sort(key=lambda r: r.created_at)

        for i, record in enumerate(records):
            if i == 0:
                daily_playtime = 0
            else:
                daily_playtime = max(0, record.last_day_playtime - records[i - 1].last_day_playtime)

            daily_totals[record.created_at] += daily_playtime

            if earliest_date is None or record.created_at < earliest_date:
                earliest_date = record.created_at

    today = date.today()

    if earliest_date is None:
        # No records at all for the specified user. If days is -1 return a single day (today),
        # otherwise return the requested number of days
        if days == -1:
            return [DayByDayPlaytime(date=today, playtime_minutes=0)]
        num_days = days
        start_date = today - timedelta(days=num_days - 1)
    elif days == -1:
        # Return everything from earliest record to today
        start_date = earliest_date
        num_days = (today - start_date).days + 1
    else:
        # Return the last N days; if fewer days exist, return everything
        candidate_start = today - timedelta(days=days - 1)
        if candidate_start > earliest_date:
            start_date = candidate_start
        else:
            start_date = earliest_date
        num_days = (today - start_date).days + 1

    result = []
    for i in range(num_days):
        target_date = start_date + timedelta(days=i)
        result.append(DayByDayPlaytime(date=target_date, playtime_minutes=daily_totals.get(target_date, 0)))

    return result


def _get_steam_rolling_by_user(session: Session, user_id: str, steam_app_id: str | None = None) -> Sequence[SteamRollingTime]:
    from src.models import User as UserModel

    user = session.exec(select(UserModel).where(UserModel.firebase_uid == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")

    query = select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)
    if steam_app_id is not None:
        query = query.where(SteamRollingTime.steam_app_id == steam_app_id)

    return session.exec(query.order_by(SteamRollingTime.created_at)).all()
