"""
Tests for src.games.games_router

Endpoints under test:
  GET /games/weekly_playtime_by_user
  GET /games/weekly_playtime_by_game

Strategy:
- The FastAPI TestClient (from conftest.py) replaces:
    - `get_db`          → in-memory SQLite session
    - `get_current_user` → fake AuthenticatedUser(uid="firebase-uid-1")
- game_service functions are patched at the module level so that router
  tests focus purely on HTTP behaviour: auth guards, parameter passing,
  response shape, and error propagation.
"""

import os
from datetime import date, timedelta
from unittest.mock import patch

from fastapi import HTTPException
from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", "/tmp/dummy_credentials.json")
os.environ.setdefault("USE_FIREBASE_EMULATOR", "true")
os.environ.setdefault("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")

from src.games.schemas import DayByDayPlaytime
from tests.conftest import make_user

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _n_day_payload(n: int = 14, base_minutes: int = 0) -> list[DayByDayPlaytime]:
    today = date.today()
    return [DayByDayPlaytime(date=today - timedelta(days=i), playtime_minutes=base_minutes) for i in range(n - 1, -1, -1)]


# ---------------------------------------------------------------------------
# /games/weekly_playtime_by_user
# ---------------------------------------------------------------------------


class TestWeeklyPlaytimeByUser:
    ENDPOINT = "/games/playtime_by_user"

    def test_requires_auth(self):
        """Without overriding auth dependency the client must send a valid token."""
        # Import a plain client WITHOUT the auth override to verify the guard.
        from src.main import app as _app

        _app.dependency_overrides.clear()

        plain_client = TestClient(_app, raise_server_exceptions=False)
        response = plain_client.get(self.ENDPOINT)
        assert response.status_code == 401

    def test_returns_200_with_default_days(self, client, session):
        make_user(session)  # uid = "firebase-uid-1" matches fake auth
        payload = _n_day_payload(1, 30)
        with patch("src.games.games_router.game_service.get_playtime_by_user", return_value=payload):
            response = client.get(self.ENDPOINT)

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

    def test_days_parameter_is_forwarded(self, client, session):
        make_user(session)
        payload = _n_day_payload(7)
        with patch("src.games.games_router.game_service.get_playtime_by_user", return_value=payload) as mock_svc:
            client.get(self.ENDPOINT, params={"days": 7})
            mock_svc.assert_called_once()
            args, kwargs = mock_svc.call_args
            # days should be the third positional arg or keyword
            assert args[2] == 7 or kwargs.get("days") == 7

    def test_default_days_is_minus_1(self, client, session):
        make_user(session)
        payload = _n_day_payload(1)
        with patch("src.games.games_router.game_service.get_playtime_by_user", return_value=payload) as mock_svc:
            client.get(self.ENDPOINT)
            mock_svc.assert_called_once()
            args, kwargs = mock_svc.call_args
            assert args[2] == -1 or kwargs.get("days") == -1

    def test_service_called_with_correct_uid(self, client, session):
        make_user(session)
        payload = _n_day_payload(1)
        with patch("src.games.games_router.game_service.get_playtime_by_user", return_value=payload) as mock_svc:
            client.get(self.ENDPOINT)
            mock_svc.assert_called_once()
            _, uid_arg, _ = mock_svc.call_args[0]
            assert uid_arg == "firebase-uid-1"

    def test_propagates_service_http_exception(self, client, session):
        make_user(session)
        with patch("src.games.games_router.game_service.get_playtime_by_user", side_effect=HTTPException(status_code=404, detail="User not found")):
            response = client.get(self.ENDPOINT)
        assert response.status_code == 404

    def test_response_schema_has_date_and_playtime_fields(self, client, session):
        make_user(session)
        payload = _n_day_payload(1, 10)
        with patch("src.games.games_router.game_service.get_playtime_by_user", return_value=payload):
            response = client.get(self.ENDPOINT)
        entry = response.json()[0]
        assert "date" in entry
        assert "playtime_minutes" in entry

    def test_all_zero_when_no_data(self, client, session):
        make_user(session)
        payload = _n_day_payload(1, 0)
        with patch("src.games.games_router.game_service.get_playtime_by_user", return_value=payload):
            response = client.get(self.ENDPOINT)
        assert all(e["playtime_minutes"] == 0 for e in response.json())


# ---------------------------------------------------------------------------
# /games/weekly_playtime_by_game
# ---------------------------------------------------------------------------


class TestWeeklyPlaytimeByGame:
    ENDPOINT = "/games/playtime_by_game"

    def test_requires_auth(self):
        from src.main import app as _app

        _app.dependency_overrides.clear()

        plain_client = TestClient(_app, raise_server_exceptions=False)
        response = plain_client.get(self.ENDPOINT, params={"steam_app_id": "570"})
        assert response.status_code == 401

    def test_requires_steam_app_id_param(self, client, session):
        make_user(session)
        response = client.get(self.ENDPOINT)  # missing required query param
        assert response.status_code == 422

    def test_returns_200_with_data(self, client, session):
        make_user(session)
        payload = _n_day_payload(7, 60)
        with patch("src.games.games_router.game_service.get_playtime_by_game", return_value=payload):
            response = client.get(self.ENDPOINT, params={"steam_app_id": "570"})

        assert response.status_code == 200
        assert len(response.json()) == 7

    def test_days_parameter_is_forwarded(self, client, session):
        make_user(session)
        payload = _n_day_payload(5)
        with patch("src.games.games_router.game_service.get_playtime_by_game", return_value=payload) as mock_svc:
            client.get(self.ENDPOINT, params={"steam_app_id": "570", "days": 5})
            mock_svc.assert_called_once()
            args, kwargs = mock_svc.call_args
            assert args[3] == 5 or kwargs.get("days") == 5

    def test_default_days_is_minus_1(self, client, session):
        make_user(session)
        payload = _n_day_payload(1)
        with patch("src.games.games_router.game_service.get_playtime_by_game", return_value=payload) as mock_svc:
            client.get(self.ENDPOINT, params={"steam_app_id": "570"})
            mock_svc.assert_called_once()
            args, kwargs = mock_svc.call_args
            assert args[3] == -1 or kwargs.get("days") == -1

    def test_service_called_with_correct_uid_and_app_id(self, client, session):
        make_user(session)
        payload = _n_day_payload(1)
        with patch("src.games.games_router.game_service.get_playtime_by_game", return_value=payload) as mock_svc:
            client.get(self.ENDPOINT, params={"steam_app_id": "570"})
            mock_svc.assert_called_once()
            _, uid_arg, app_id_arg, _ = mock_svc.call_args[0]
            assert uid_arg == "firebase-uid-1"
            assert app_id_arg == "570"

    def test_propagates_404_from_service(self, client, session):
        make_user(session)
        with patch("src.games.games_router.game_service.get_playtime_by_game", side_effect=HTTPException(status_code=404, detail="User not found")):
            response = client.get(self.ENDPOINT, params={"steam_app_id": "570"})
        assert response.status_code == 404

    def test_different_app_ids_are_forwarded(self, client, session):
        make_user(session)
        payload = _n_day_payload(1, 5)
        for app_id in ("570", "730", "440"):
            with patch("src.games.games_router.game_service.get_playtime_by_game", return_value=payload) as mock_svc:
                client.get(self.ENDPOINT, params={"steam_app_id": app_id})
                _, _, forwarded_id, _ = mock_svc.call_args[0]
                assert forwarded_id == app_id

    def test_response_dates_are_ordered_oldest_first(self, client, session):
        make_user(session)
        payload = _n_day_payload(7)
        with patch("src.games.games_router.game_service.get_playtime_by_game", return_value=payload):
            response = client.get(self.ENDPOINT, params={"steam_app_id": "570"})
        dates = [e["date"] for e in response.json()]
        assert dates == sorted(dates)


# ---------------------------------------------------------------------------
# /games/_streak_by_user
# ---------------------------------------------------------------------------


class TestStreakByUser:
    ENDPOINT = "/games/streak_by_user"

    def test_requires_auth(self):
        from src.main import app as _app

        _app.dependency_overrides.clear()

        plain_client = TestClient(_app, raise_server_exceptions=False)
        response = plain_client.get(self.ENDPOINT)
        assert response.status_code == 401

    def test_returns_streak(self, client, session):
        make_user(session)
        with patch("src.games.games_router.game_service.get_streak", return_value=5) as mock_svc:
            response = client.get(self.ENDPOINT)
            # The order_by or order of args: session, user_id, steam_app_id
            mock_svc.assert_called_once()
            args, _kwargs = mock_svc.call_args
            assert args[1] == "firebase-uid-1"
            assert args[2] is None

        assert response.status_code == 200
        assert response.json() == 5

    def test_propagates_404_from_service(self, client, session):
        make_user(session)
        with patch("src.games.games_router.game_service.get_streak", side_effect=HTTPException(status_code=404, detail="User not found")):
            response = client.get(self.ENDPOINT)
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# /games/_streak_by_game
# ---------------------------------------------------------------------------


class TestStreakByGame:
    ENDPOINT = "/games/streak_by_game"

    def test_requires_auth(self):
        from src.main import app as _app

        _app.dependency_overrides.clear()

        plain_client = TestClient(_app, raise_server_exceptions=False)
        response = plain_client.get(self.ENDPOINT, params={"steam_app_id": "570"})
        assert response.status_code == 401

    def test_requires_steam_app_id_param(self, client, session):
        make_user(session)
        response = client.get(self.ENDPOINT)
        assert response.status_code == 422

    def test_returns_streak_by_game(self, client, session):
        make_user(session)
        with patch("src.games.games_router.game_service.get_streak", return_value=3) as mock_svc:
            response = client.get(self.ENDPOINT, params={"steam_app_id": "570"})
            mock_svc.assert_called_once()
            args, _kwargs = mock_svc.call_args
            assert args[1] == "firebase-uid-1"
            assert args[2] == "570"

        assert response.status_code == 200
        assert response.json() == 3

    def test_propagates_404_from_service(self, client, session):
        make_user(session)
        with patch("src.games.games_router.game_service.get_streak", side_effect=HTTPException(status_code=404, detail="User not found")):
            response = client.get(self.ENDPOINT, params={"steam_app_id": "570"})
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# /games/update_game_status
# ---------------------------------------------------------------------------


class TestUpdateGameStatusEndpoint:
    ENDPOINT = "/games/update_game_status"

    def test_requires_auth(self):
        from src.main import app as _app

        _app.dependency_overrides.clear()

        plain_client = TestClient(_app, raise_server_exceptions=False)
        response = plain_client.post(self.ENDPOINT, json={"app_id": "570", "status": "playing"})
        assert response.status_code == 401

    def test_update_status_success(self, client, session):
        make_user(session)
        with patch("src.games.games_router.game_service.update_game_status") as mock_svc:
            response = client.post(self.ENDPOINT, json={"app_id": "570", "status": "playing"})
            mock_svc.assert_called_once()
            _, kwargs = mock_svc.call_args
            assert kwargs.get("user_id") == "firebase-uid-1"
            assert kwargs.get("steam_app_id") == "570"
            assert kwargs.get("status") == "playing"

        assert response.status_code == 200

    def test_update_status_with_uppercase_status(self, client, session):
        make_user(session)
        with patch("src.games.games_router.game_service.update_game_status") as mock_svc:
            response = client.post(self.ENDPOINT, json={"app_id": "570", "status": "SHELVED"})
            mock_svc.assert_called_once()
            _, kwargs = mock_svc.call_args
            assert kwargs.get("user_id") == "firebase-uid-1"
            assert kwargs.get("steam_app_id") == "570"
            assert kwargs.get("status") == "shelved"

        assert response.status_code == 200

    def test_invalid_status_payload(self, client, session):
        make_user(session)
        response = client.post(self.ENDPOINT, json={"app_id": "570", "status": "invalid_status"})
        assert response.status_code == 422

    def test_missing_payload_fields(self, client, session):
        make_user(session)
        response = client.post(self.ENDPOINT, json={"app_id": "570"})
        assert response.status_code == 422

    def test_propagates_404_from_service(self, client, session):
        make_user(session)
        with patch(
            "src.games.games_router.game_service.update_game_status",
            side_effect=HTTPException(status_code=404, detail="Game not found in cache."),
        ):
            response = client.post(self.ENDPOINT, json={"app_id": "570", "status": "playing"})
        assert response.status_code == 404

