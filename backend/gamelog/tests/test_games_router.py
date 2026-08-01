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

def _14_day_payload(base_minutes: int = 0) -> list[DayByDayPlaytime]:
    today = date.today()
    return [
        DayByDayPlaytime(date=today - timedelta(days=i), playtime_minutes=base_minutes)
        for i in range(13, -1, -1)
    ]


# ---------------------------------------------------------------------------
# /games/weekly_playtime_by_user
# ---------------------------------------------------------------------------

class TestWeeklyPlaytimeByUser:
    ENDPOINT = "/games/weekly_playtime_by_user"

    def test_requires_auth(self):
        """Without overriding auth dependency the client must send a valid token."""
        # Import a plain client WITHOUT the auth override to verify the guard.
        from src.main import app as _app
        _app.dependency_overrides.clear()

        plain_client = TestClient(_app, raise_server_exceptions=False)
        response = plain_client.get(self.ENDPOINT)
        assert response.status_code == 401

    def test_returns_200_and_14_days(self, client, session):
        user = make_user(session)  # uid = "firebase-uid-1" matches fake auth
        payload = _14_day_payload(30)
        with patch("src.games.games_router.game_service.get_last_two_weeks_playtime_by_user",
                   return_value=payload):
            response = client.get(self.ENDPOINT)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 14
        assert all(entry["playtime_minutes"] == 30 for entry in data)

    def test_service_called_with_correct_uid(self, client, session):
        make_user(session)
        payload = _14_day_payload()
        with patch("src.games.games_router.game_service.get_last_two_weeks_playtime_by_user",
                   return_value=payload) as mock_svc:
            client.get(self.ENDPOINT)
            mock_svc.assert_called_once()
            _, uid_arg = mock_svc.call_args[0]
            assert uid_arg == "firebase-uid-1"

    def test_propagates_service_http_exception(self, client, session):
        make_user(session)
        with patch("src.games.games_router.game_service.get_last_two_weeks_playtime_by_user",
                   side_effect=HTTPException(status_code=404, detail="User not found")):
            response = client.get(self.ENDPOINT)
        assert response.status_code == 404

    def test_response_schema_has_date_and_playtime_fields(self, client, session):
        make_user(session)
        payload = _14_day_payload(10)
        with patch("src.games.games_router.game_service.get_last_two_weeks_playtime_by_user",
                   return_value=payload):
            response = client.get(self.ENDPOINT)
        entry = response.json()[0]
        assert "date" in entry
        assert "playtime_minutes" in entry

    def test_all_zero_when_no_data(self, client, session):
        make_user(session)
        payload = _14_day_payload(0)
        with patch("src.games.games_router.game_service.get_last_two_weeks_playtime_by_user",
                   return_value=payload):
            response = client.get(self.ENDPOINT)
        assert all(e["playtime_minutes"] == 0 for e in response.json())


# ---------------------------------------------------------------------------
# /games/weekly_playtime_by_game
# ---------------------------------------------------------------------------

class TestWeeklyPlaytimeByGame:
    ENDPOINT = "/games/weekly_playtime_by_game"

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

    def test_returns_200_and_14_days(self, client, session):
        make_user(session)
        payload = _14_day_payload(60)
        with patch("src.games.games_router.game_service.get_last_two_weeks_playtime_by_game",
                   return_value=payload):
            response = client.get(self.ENDPOINT, params={"steam_app_id": "570"})

        assert response.status_code == 200
        assert len(response.json()) == 14

    def test_service_called_with_correct_uid_and_app_id(self, client, session):
        make_user(session)
        payload = _14_day_payload()
        with patch("src.games.games_router.game_service.get_last_two_weeks_playtime_by_game",
                   return_value=payload) as mock_svc:
            client.get(self.ENDPOINT, params={"steam_app_id": "570"})
            mock_svc.assert_called_once()
            _, uid_arg, app_id_arg = mock_svc.call_args[0]
            assert uid_arg == "firebase-uid-1"
            assert app_id_arg == "570"

    def test_propagates_404_from_service(self, client, session):
        make_user(session)
        with patch("src.games.games_router.game_service.get_last_two_weeks_playtime_by_game",
                   side_effect=HTTPException(status_code=404, detail="User not found")):
            response = client.get(self.ENDPOINT, params={"steam_app_id": "570"})
        assert response.status_code == 404

    def test_different_app_ids_are_forwarded(self, client, session):
        make_user(session)
        payload = _14_day_payload(5)
        for app_id in ("570", "730", "440"):
            with patch("src.games.games_router.game_service.get_last_two_weeks_playtime_by_game",
                       return_value=payload) as mock_svc:
                client.get(self.ENDPOINT, params={"steam_app_id": app_id})
                _, _, forwarded_id = mock_svc.call_args[0]
                assert forwarded_id == app_id

    def test_response_dates_are_ordered_oldest_first(self, client, session):
        make_user(session)
        payload = _14_day_payload()
        with patch("src.games.games_router.game_service.get_last_two_weeks_playtime_by_game",
                   return_value=payload):
            response = client.get(self.ENDPOINT, params={"steam_app_id": "570"})
        dates = [e["date"] for e in response.json()]
        assert dates == sorted(dates)
