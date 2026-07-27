import json
from typing import List
import uuid
import warnings
from urllib.request import urlopen
from datetime import date, timedelta
from collections import defaultdict

from fastapi import HTTPException

from sqlmodel import Session, select

from src.games.schemas import GetOwnedGamesResponse, SteamGame
from src.models import Game, GameStatus, Shelving, SteamRollingTime
from src.users import UserRead


def update_user_shelving_steamrolling(session: Session, user: UserRead) -> None:
    steam_games = _get_owned_games_from_steam(user)
    for steam_game in steam_games.games:
        steam_app_id = str(steam_game.appid)

        game_cached = _get_cached_game(session, steam_app_id)
        if not game_cached:
            game_cached = _cache_game(session, steam_app_id)

        shelve_exists = _get_game_player_shelve(session, game_cached.id, user.id)
        if not shelve_exists:
            status = GameStatus.TO_BE_PLAYED if steam_game.playtime_forever == 0 else GameStatus.PLAYING
            _shelve_game(session, game_cached.id, user.id, status)
            _create_steam_rolling(session, user, steam_game, steam_app_id, is_baseline=True)
        else:
            _create_steam_rolling(session, user, steam_game, steam_app_id, is_baseline=False)


def _get_cached_game(session: Session, steam_app_id: str) -> Game | None:
    return session.exec(select(Game).where(Game.steam_app_id == steam_app_id)).first()


def _get_game_player_shelve(session: Session, game_id: uuid.UUID, user_id: uuid.UUID) -> Shelving | None:
    return session.exec(
        select(Shelving)
        .where(Shelving.game_id == game_id)
        .where(Shelving.owner_id == user_id)
    ).first()


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


def _create_steam_rolling(session: Session, user: UserRead, game: SteamGame, steam_app_id: str, is_baseline: bool) -> None:
    steam_rolling = SteamRollingTime(
        user_id=user.id,
        steam_app_id=steam_app_id,
        last_day_playtime=game.playtime_forever,
        is_baseline=is_baseline,
    )
    session.add(steam_rolling)
    session.commit()


def _get_owned_games_from_steam(user: UserRead) -> GetOwnedGamesResponse:
    if user.steam_api_key is None:
        warnings.warn("Using default steam api key")
        steam_api_key = "724FF154B1D2A357857A257EA28C6415"
    else:
        steam_api_key = user.steam_api_key
    url = (
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
        f"?key={steam_api_key}&steamid={user.steam_id}&format=json"
        "&include_played_free_games=true&include_free_sub=true"
    )

    with urlopen(url, timeout=10) as response:
        payload = json.load(response)

    steam_response = payload.get("response", {})
    return GetOwnedGamesResponse(
        game_count=steam_response.get("game_count", 0),
        games=[SteamGame(**game) for game in steam_response.get("games", [])],
    )


def get_last_two_weeks_playtime_by_user(session: Session, user_id: str) -> list[dict]:
    steam_rolling_times = _get_steam_rolling_by_user(session, user_id)

    records_by_game = defaultdict(list)
    for record in steam_rolling_times:
        records_by_game[record.steam_app_id].append(record)

    daily_totals = defaultdict(int)

    for game_id, records in records_by_game.items():
        records.sort(key=lambda r: r.created_at)
        
        previous_playtime = None
        for record in records:
            if previous_playtime is not None and not record.is_baseline:
                daily_playtime = max(0, record.last_day_playtime - previous_playtime)
            else:
                daily_playtime = 0
                
            daily_totals[record.created_at] += daily_playtime
            previous_playtime = record.last_day_playtime

    today = date.today()
    result = []

    for i in range(13, -1, -1):
        target_date = today - timedelta(days=i)
        result.append({
            "date": target_date.isoformat(),
            "playtime": daily_totals.get(target_date, 0)
        })

    return result
    
def _get_steam_rolling_by_user(session: Session, user_id: str) -> Sequence[SteamRollingTime]:
    user = session.exec(select(UserRead).where(UserRead.uid == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
    
    return session.exec(
        select(SteamRollingTime)
        .where(SteamRollingTime.user_id == user.id)
        .order_by(SteamRollingTime.created_at)
    ).all()
        