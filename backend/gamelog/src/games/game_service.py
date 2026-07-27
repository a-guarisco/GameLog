import json
import uuid
import warnings
from urllib.request import urlopen

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
            _shelve_game(session, game_cached.id, user.id)
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

def _shelve_game(session: Session, game_id: uuid.UUID, user_id: uuid.UUID) -> None:
    shelving = Shelving(
        game_id=game_id,
        owner_id=user_id,
        status=GameStatus.SHELVED,
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
