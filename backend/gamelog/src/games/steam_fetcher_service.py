import logging
import warnings

import httpx

logger = logging.getLogger(__name__)

from src.games.schemas import GetOwnedGamesResponse, SteamGame, SteamTopGame
from src.models import User
from src.users.schemas import GetFriendListResponse, SteamFriend

DEFAULT_STEAM_API_KEY = "4C67D2313547027F4ECB151CD10E76EC"


async def get_owned_games_from_steam_async(
    user: User,
    client: httpx.AsyncClient | None = None,
) -> GetOwnedGamesResponse:
    steam_api_key = _retrieve_steam_key(user)
    url = (
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
        f"?key={steam_api_key}&steamid={user.steam_id}&format=json"
        "&include_played_free_games=true&include_free_sub=true"
    )

    payload = await _get_steam_api_response(url, client)
    steam_response = payload.get("response", {})
    return GetOwnedGamesResponse(
        game_count=steam_response.get("game_count", 0),
        games=[SteamGame(**game) for game in steam_response.get("games", [])],
    )


async def get_friend_list_from_steam_async(
    user: User,
    client: httpx.AsyncClient | None = None,
) -> GetFriendListResponse:
    steam_api_key = _retrieve_steam_key(user)
    url = f"https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key={steam_api_key}&steamid={user.steam_id}&relationship=friend"

    payload = await _get_steam_api_response(url, client)
    friends_list = payload.get("friendslist", {})
    return GetFriendListResponse(
        friends=[SteamFriend(**friend) for friend in friends_list.get("friends", [])],
    )


async def get_user_region(steam_id: str, steam_api_key: str | None) -> str | None:
    if not steam_api_key:
        warnings.warn("Using default steam api key")
        steam_api_key = DEFAULT_STEAM_API_KEY

    url = f"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={steam_api_key}&steamids={steam_id}"

    payload = await _get_steam_api_response(url)
    player_summaries = payload.get("response", {}).get("players", [])
    if player_summaries:
        return player_summaries[0].get("loccountrycode", "Unknown")
    else:
        return None


async def _get_steam_api_response(
    url: str,
    client: httpx.AsyncClient | None = None,
) -> dict:
    should_close = False
    if client is None:
        client = httpx.AsyncClient(timeout=10.0)
        should_close = True

    try:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
    finally:
        if should_close:
            await client.aclose()


def _retrieve_steam_key(user: User) -> str:
    steam_api_key = getattr(user, "steam_api_key", None)
    if not steam_api_key and hasattr(user, "__dict__"):
        steam_api_key = user.__dict__.get("steam_api_key")

    if not steam_api_key:
        warnings.warn("Using default steam api key")
        steam_api_key = DEFAULT_STEAM_API_KEY
    return steam_api_key


async def get_game_genres_from_steam_async(
    steam_app_id: str,
    client: httpx.AsyncClient | None = None,
) -> list[dict]:
    url = f"https://store.steampowered.com/api/appdetails?appids={steam_app_id}&filter=genres"
    payload = await _get_steam_api_response(url, client)
    app_data = payload.get(str(steam_app_id), {})
    if app_data.get("success"):
        return app_data.get("data", {}).get("genres", [])
    return []


async def get_most_played_games_from_steam_async(
    client: httpx.AsyncClient | None = None,
) -> list[SteamTopGame]:
    """
    Returns the top 100 most played games on Steam.
    Each item is a dictionary containing at least 'appid' and 'rank'.
    """
    url = "https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/"
    payload = await _get_steam_api_response(url, client)
    return [SteamTopGame(**game) for game in payload.get("response", {}).get("ranks", [])]


def get_steam_player_summary_sync(steam_id: str, api_key: str | None = None) -> dict | None:
    """
    Fetches the player summary from Steam using the provided API key (or DEFAULT_STEAM_API_KEY).
    Returns the player dictionary if valid, or None if invalid/not found.
    """
    if not steam_id:
        return None
    key = api_key or DEFAULT_STEAM_API_KEY
    url = f"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={key}&steamids={steam_id}"
    try:
        response = httpx.get(url, timeout=5.0)
        if response.status_code == 200:
            players = response.json().get("response", {}).get("players", [])
            if players and players[0].get("steamid") == steam_id:
                return players[0]
    except Exception as e:
        logger.warning(f"Error fetching Steam player summary: {e}")
    return None


def validate_steam_credentials_sync(steam_id: str, api_key: str) -> bool:
    if not api_key:
        return False
    return get_steam_player_summary_sync(steam_id, api_key) is not None
