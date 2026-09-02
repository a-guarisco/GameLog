import os
import uuid
import warnings
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from sqlmodel import Session

# Setup environment variables before loading any configurations
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", "/tmp/dummy_credentials.json")
os.environ.setdefault("USE_FIREBASE_EMULATOR", "true")
os.environ.setdefault("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")
os.environ.setdefault("RUN_SCHEDULER", "false")

from src.games import steam_fetcher_service
from src.games.schemas import GetOwnedGamesResponse
from src.models import User
from src.users.schemas import GetFriendListResponse
from tests.conftest import make_user


def _mock_httpx_get(payload: dict):
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = payload
    return patch.object(httpx.AsyncClient, "get", AsyncMock(return_value=mock_resp))


class TestSteamFetcherGetOwnedGames:
    @pytest.mark.anyio
    async def test_get_owned_games_success(self, session: Session):
        user = make_user(session, steam_api_key="TEST_KEY", steam_id="76561197960265730")
        payload = {
            "response": {
                "game_count": 2,
                "games": [
                    {
                        "appid": 570,
                        "playtime_forever": 100,
                        "playtime_windows_forever": 10,
                        "playtime_mac_forever": 0,
                        "playtime_linux_forever": 0,
                        "playtime_deck_forever": 0,
                        "rtime_last_played": 12345,
                        "playtime_disconnected": 0,
                    },
                    {
                        "appid": 730,
                        "playtime_forever": 200,
                        "playtime_windows_forever": 0,
                        "playtime_mac_forever": 0,
                        "playtime_linux_forever": 0,
                        "playtime_deck_forever": 0,
                        "rtime_last_played": 12346,
                        "playtime_disconnected": 0,
                    },
                ],
            }
        }

        mock_get = AsyncMock()
        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json.return_value = payload
        mock_get.return_value = mock_resp

        with patch.object(httpx.AsyncClient, "get", mock_get):
            response = await steam_fetcher_service.get_owned_games_from_steam_async(user)
            called_url = mock_get.call_args[0][0]

        assert isinstance(response, GetOwnedGamesResponse)
        assert response.game_count == 2
        assert len(response.games) == 2
        assert response.games[0].appid == 570
        assert response.games[0].playtime_forever == 100
        assert response.games[1].appid == 730
        assert response.games[1].playtime_forever == 200
        assert "TEST_KEY" in called_url
        assert "76561197960265730" in called_url

    @pytest.mark.anyio
    async def test_get_owned_games_warns_when_default_key_none(self, session: Session):
        user = User(
            id=uuid.uuid4(),
            firebase_uid="x",
            username="x",
            steam_id="999",
            steam_api_key=None,
        )
        payload = {"response": {"game_count": 0, "games": []}}

        with _mock_httpx_get(payload), warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            await steam_fetcher_service.get_owned_games_from_steam_async(user)
            assert any("default steam api key" in str(warning.message).lower() for warning in w)


class TestSteamFetcherGetFriendList:
    @pytest.mark.anyio
    async def test_get_friend_list_success(self, session: Session):
        user = make_user(session, steam_api_key="FRIEND_KEY", steam_id="76561197960265730")
        payload = {
            "friendslist": {
                "friends": [
                    {"steamid": "76561197960265731", "relationship": "friend", "friend_since": 1400000000},
                    {"steamid": "76561197960265738", "relationship": "friend", "friend_since": 1500000000},
                ]
            }
        }

        mock_get = AsyncMock()
        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json.return_value = payload
        mock_get.return_value = mock_resp

        with patch.object(httpx.AsyncClient, "get", mock_get):
            response = await steam_fetcher_service.get_friend_list_from_steam_async(user)
            called_url = mock_get.call_args[0][0]

        assert isinstance(response, GetFriendListResponse)
        assert len(response.friends) == 2
        assert response.friends[0].steamid == "76561197960265731"
        assert response.friends[0].relationship == "friend"
        assert response.friends[0].friend_since == 1400000000
        assert response.friends[1].steamid == "76561197960265738"
        assert "FRIEND_KEY" in called_url
        assert "76561197960265730" in called_url
        assert "relationship=friend" in called_url

    @pytest.mark.anyio
    async def test_get_friend_list_empty_friends(self, session: Session):
        user = make_user(session, steam_api_key="FRIEND_KEY", steam_id="76561197960265730")
        payload = {"friendslist": {}}

        with _mock_httpx_get(payload):
            response = await steam_fetcher_service.get_friend_list_from_steam_async(user)

        assert isinstance(response, GetFriendListResponse)
        assert len(response.friends) == 0


class TestSteamPlayerSummaryAndValidation:
    def test_get_steam_player_summary_sync_success_with_region(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "response": {
                "players": [
                    {
                        "steamid": "76561197960265730",
                        "personaname": "Gamer123",
                        "loccountrycode": "IT",
                    }
                ]
            }
        }

        with patch("httpx.get", return_value=mock_resp) as mock_get:
            summary = steam_fetcher_service.get_steam_player_summary_sync("76561197960265730", "CUSTOM_KEY")
            mock_get.assert_called_once()
            called_url = mock_get.call_args[0][0]
            assert "CUSTOM_KEY" in called_url
            assert "76561197960265730" in called_url

        assert summary is not None
        assert summary["loccountrycode"] == "IT"
        assert summary["steamid"] == "76561197960265730"

    def test_get_steam_player_summary_sync_uses_default_key_when_omitted(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "response": {
                "players": [
                    {
                        "steamid": "76561197960265730",
                        "personaname": "Gamer123",
                    }
                ]
            }
        }

        with patch("httpx.get", return_value=mock_resp) as mock_get:
            summary = steam_fetcher_service.get_steam_player_summary_sync("76561197960265730", None)
            called_url = mock_get.call_args[0][0]
            assert steam_fetcher_service.DEFAULT_STEAM_API_KEY in called_url

        assert summary is not None
        assert "loccountrycode" not in summary

    def test_get_steam_player_summary_sync_returns_none_on_empty_steam_id(self):
        assert steam_fetcher_service.get_steam_player_summary_sync("") is None

    def test_get_steam_player_summary_sync_returns_none_when_player_not_found(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"response": {"players": []}}

        with patch("httpx.get", return_value=mock_resp):
            summary = steam_fetcher_service.get_steam_player_summary_sync("invalid_steam_id")

        assert summary is None

    def test_validate_steam_credentials_sync_true(self):
        with patch.object(
            steam_fetcher_service,
            "get_steam_player_summary_sync",
            return_value={"steamid": "76561197960265730"},
        ):
            assert steam_fetcher_service.validate_steam_credentials_sync("76561197960265730", "VALID_KEY") is True

    def test_validate_steam_credentials_sync_false_when_missing_key(self):
        assert steam_fetcher_service.validate_steam_credentials_sync("76561197960265730", "") is False
