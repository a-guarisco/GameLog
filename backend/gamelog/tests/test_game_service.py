"""
Comprehensive tests for src.games.game_service

Covers:
- _compute_daily_playtimes: implicit baseline (first entry), delta computation,
  negative delta prevention, multi-game aggregation, days parameter, gap-filling
- update_user_shelving_steamrolling: new game, existing shelving, existing game,
  zero-playtime games not saved
- get_playtime_by_user / by_game: delegation, correct aggregation, 404 for unknown user
- _get_owned_games_from_steam: patching urlopen, missing steam key warning
"""

import json
import uuid
import warnings
from datetime import date, timedelta
from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from src.games import game_service
from src.games.schemas import SteamGame
from src.models import Game, GameStatus, Shelving, SteamRollingTime, User
from src.users import UserRead
from tests.conftest import make_game, make_rolling, make_shelving, make_user

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _steam_game(appid: int, playtime_forever: int = 0) -> SteamGame:
    return SteamGame(
        appid=appid,
        playtime_forever=playtime_forever,
        playtime_windows_forever=0,
        playtime_mac_forever=0,
        playtime_linux_forever=0,
        playtime_deck_forever=0,
        rtime_last_played=0,
        playtime_disconnected=0,
    )


def _user_read(user: User) -> UserRead:
    return UserRead.model_validate(user)


def _make_steam_response(games: list[dict]) -> bytes:
    return json.dumps({"response": {"game_count": len(games), "games": games}}).encode()


# ---------------------------------------------------------------------------
# _compute_daily_playtimes
# ---------------------------------------------------------------------------

class TestComputeDailyPlaytimes:
    def test_empty_records_with_days_minus_1_returns_single_zero_day(self):
        """No records with days=-1 returns just today with 0."""
        result = game_service._compute_daily_playtimes([], days=-1)
        assert len(result) == 1
        assert result[0].date == date.today()
        assert result[0].playtime_minutes == 0

    def test_empty_records_with_specific_days(self):
        """No records with days=7 returns 7 zero-filled days."""
        result = game_service._compute_daily_playtimes([], days=7)
        assert len(result) == 7
        assert all(r.playtime_minutes == 0 for r in result)

    def test_first_entry_is_implicit_baseline(self, session):
        """The first entry per game contributes 0 (it's the baseline)."""
        user = make_user(session)
        today = date.today()
        r = make_rolling(session, user=user, last_day_playtime=500,
                         created_at=today)
        result = game_service._compute_daily_playtimes([r], days=-1)
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 0

    def test_single_delta_record(self, session):
        """Second record yields delta vs the first (implicit baseline)."""
        user = make_user(session)
        today = date.today()
        r1 = make_rolling(session, user=user, last_day_playtime=100,
                          created_at=today - timedelta(days=1))
        r2 = make_rolling(session, user=user, last_day_playtime=160,
                          created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2], days=-1)
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 60

    def test_negative_delta_clamped_to_zero(self, session):
        """If cumulative playtime goes backwards, clamp to 0."""
        user = make_user(session)
        today = date.today()
        r1 = make_rolling(session, user=user, last_day_playtime=500,
                          created_at=today - timedelta(days=1))
        r2 = make_rolling(session, user=user, last_day_playtime=100,
                          created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2], days=-1)
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 0

    def test_multi_game_aggregation(self, session):
        """Playtimes from multiple games on the same day are summed."""
        user = make_user(session)
        today = date.today()
        yesterday = today - timedelta(days=1)
        # Game 570
        r1 = make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100,
                          created_at=yesterday)
        r2 = make_rolling(session, user=user, steam_app_id="570", last_day_playtime=130,
                          created_at=today)
        # Game 440
        r3 = make_rolling(session, user=user, steam_app_id="440", last_day_playtime=50,
                          created_at=yesterday)
        r4 = make_rolling(session, user=user, steam_app_id="440", last_day_playtime=70,
                          created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2, r3, r4], days=-1)
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 30 + 20  # 50

    def test_gap_days_filled_with_zero(self, session):
        """Days with no records between entries are filled with 0."""
        user = make_user(session)
        today = date.today()
        r1 = make_rolling(session, user=user, last_day_playtime=100,
                          created_at=today - timedelta(days=3))
        r2 = make_rolling(session, user=user, last_day_playtime=150,
                          created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2], days=-1)
        # Should span 4 days: today-3, today-2, today-1, today
        assert len(result) == 4
        gap_days = [d for d in result if d.date in (today - timedelta(days=2), today - timedelta(days=1))]
        assert all(d.playtime_minutes == 0 for d in gap_days)

    def test_days_minus_1_returns_everything(self, session):
        """days=-1 returns from earliest record to today."""
        user = make_user(session)
        today = date.today()
        start = today - timedelta(days=5)
        r1 = make_rolling(session, user=user, last_day_playtime=100,
                          created_at=start)
        r2 = make_rolling(session, user=user, last_day_playtime=200,
                          created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2], days=-1)
        assert len(result) == 6  # 5 days ago to today inclusive
        assert result[0].date == start
        assert result[-1].date == today

    def test_specific_days_returns_correct_window(self, session):
        """days=3 returns the last 3 days."""
        user = make_user(session)
        today = date.today()
        r1 = make_rolling(session, user=user, last_day_playtime=100,
                          created_at=today - timedelta(days=10))
        r2 = make_rolling(session, user=user, last_day_playtime=200,
                          created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2], days=3)
        assert len(result) == 3
        assert result[0].date == today - timedelta(days=2)
        assert result[-1].date == today

    def test_fewer_days_than_requested_returns_everything(self, session):
        """If fewer days exist than requested, return everything."""
        user = make_user(session)
        today = date.today()
        r1 = make_rolling(session, user=user, last_day_playtime=100,
                          created_at=today - timedelta(days=2))
        r2 = make_rolling(session, user=user, last_day_playtime=200,
                          created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2], days=30)
        # Only 3 days of data (today-2 to today), should return 3
        assert len(result) == 3
        assert result[0].date == today - timedelta(days=2)

    def test_result_dates_are_sorted_oldest_first(self, session):
        """Results should always be sorted oldest first."""
        user = make_user(session)
        today = date.today()
        for i in range(5):
            make_rolling(session, user=user, last_day_playtime=100 + i * 10,
                         created_at=today - timedelta(days=4 - i))
        result = game_service._compute_daily_playtimes(
            list(session.exec(
                __import__('sqlmodel', fromlist=['select']).select(SteamRollingTime)
            ).all()),
            days=-1
        )
        dates = [r.date for r in result]
        assert dates == sorted(dates)

    def test_old_records_contribute_to_history(self, session):
        """Records from 30 days ago should appear when days=-1."""
        user = make_user(session)
        today = date.today()
        old_date = today - timedelta(days=30)
        r1 = make_rolling(session, user=user, last_day_playtime=0,
                          created_at=old_date)
        r2 = make_rolling(session, user=user, last_day_playtime=999,
                          created_at=old_date + timedelta(days=1))
        result = game_service._compute_daily_playtimes([r1, r2], days=-1)
        day_entry = next(d for d in result if d.date == old_date + timedelta(days=1))
        assert day_entry.playtime_minutes == 999


# ---------------------------------------------------------------------------
# update_user_shelving_steamrolling
# ---------------------------------------------------------------------------

class TestUpdateUserShelvingSteamRolling:
    """Integration-style tests using patched Steam API calls."""

    def test_new_game_is_cached_and_shelved(self, session):
        user = make_user(session)
        user_read = _user_read(user)

        games = [{"appid": 570, "playtime_forever": 120, "playtime_windows_forever": 0,
                  "playtime_mac_forever": 0, "playtime_linux_forever": 0,
                  "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0}]

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response(games))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        game = session.exec(select(Game).where(Game.steam_app_id == "570")).first()
        assert game is not None
        shelving = session.exec(
            select(Shelving).where(Shelving.game_id == game.id)
        ).first()
        assert shelving is not None
        assert shelving.owner_id == user.id

    def test_unplayed_game_gets_shelved_status(self, session):
        user = make_user(session)
        user_read = _user_read(user)

        games = [{"appid": 730, "playtime_forever": 0, "playtime_windows_forever": 0,
                  "playtime_mac_forever": 0, "playtime_linux_forever": 0,
                  "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0}]

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response(games))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        game = session.exec(select(Game).where(Game.steam_app_id == "730")).first()
        shelving = session.exec(select(Shelving).where(Shelving.game_id == game.id)).first()
        assert shelving.status == GameStatus.SHELVED

    def test_played_game_gets_shelved_status(self, session):
        user = make_user(session)
        user_read = _user_read(user)

        games = [{"appid": 570, "playtime_forever": 300, "playtime_windows_forever": 0,
                  "playtime_mac_forever": 0, "playtime_linux_forever": 0,
                  "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0}]

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response(games))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        game = session.exec(select(Game).where(Game.steam_app_id == "570")).first()
        shelving = session.exec(select(Shelving).where(Shelving.game_id == game.id)).first()
        assert shelving.status == GameStatus.SHELVED

    def test_first_time_zero_playtime_creates_baseline_rolling(self, session):
        """First time seeing a game always creates a baseline rolling, even with 0 playtime."""
        user = make_user(session)
        user_read = _user_read(user)

        games = [{"appid": 730, "playtime_forever": 0, "playtime_windows_forever": 0,
                  "playtime_mac_forever": 0, "playtime_linux_forever": 0,
                  "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0}]

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response(games))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        rolling = session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)).all()
        assert len(rolling) == 1
        assert rolling[0].last_day_playtime == 0

    def test_nonzero_playtime_game_creates_rolling(self, session):
        """Games with playtime_forever > 0 should create a steam rolling entry."""
        user = make_user(session)
        user_read = _user_read(user)

        games = [{"appid": 570, "playtime_forever": 120, "playtime_windows_forever": 0,
                  "playtime_mac_forever": 0, "playtime_linux_forever": 0,
                  "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0}]

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response(games))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        rolling = session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)).all()
        assert len(rolling) == 1
        assert rolling[0].last_day_playtime == 120

    def test_unchanged_playtime_does_not_create_new_rolling(self, session):
        """If playtime hasn't changed from the latest rolling, no new entry is created."""
        user = make_user(session)
        user_read = _user_read(user)
        # Pre-existing rolling with playtime=100
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100)

        games = [{"appid": 570, "playtime_forever": 100, "playtime_windows_forever": 0,
                  "playtime_mac_forever": 0, "playtime_linux_forever": 0,
                  "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0}]

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response(games))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        rolling = session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)).all()
        assert len(rolling) == 1  # no new entry created

    def test_changed_playtime_creates_new_rolling(self, session):
        """If playtime changed from the latest rolling, a new entry is created."""
        user = make_user(session)
        user_read = _user_read(user)
        # Pre-existing rolling with playtime=100
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100)

        games = [{"appid": 570, "playtime_forever": 150, "playtime_windows_forever": 0,
                  "playtime_mac_forever": 0, "playtime_linux_forever": 0,
                  "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0}]

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response(games))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        rolling = session.exec(
            select(SteamRollingTime)
            .where(SteamRollingTime.user_id == user.id)
            .order_by(SteamRollingTime.created_at)
        ).all()
        assert len(rolling) == 2
        assert rolling[-1].last_day_playtime == 150

    def test_existing_shelving_still_creates_rolling(self, session):
        user = make_user(session)
        user_read = _user_read(user)
        game = make_game(session, steam_app_id="570")
        make_shelving(session, user=user, game=game)

        games = [{"appid": 570, "playtime_forever": 200, "playtime_windows_forever": 0,
                  "playtime_mac_forever": 0, "playtime_linux_forever": 0,
                  "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0}]

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response(games))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        rolling = session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)).first()
        assert rolling is not None
        assert rolling.last_day_playtime == 200

    def test_game_not_recached_if_already_exists(self, session):
        user = make_user(session)
        user_read = _user_read(user)
        existing_game = make_game(session, steam_app_id="570")

        games = [{"appid": 570, "playtime_forever": 100, "playtime_windows_forever": 0,
                  "playtime_mac_forever": 0, "playtime_linux_forever": 0,
                  "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0}]

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response(games))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        all_games = session.exec(select(Game).where(Game.steam_app_id == "570")).all()
        assert len(all_games) == 1  # no duplicate
        assert all_games[0].id == existing_game.id

    def test_empty_steam_library_does_nothing(self, session):
        user = make_user(session)
        user_read = _user_read(user)

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response([]))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        assert session.exec(select(Game)).all() == []
        assert session.exec(select(Shelving)).all() == []
        assert session.exec(select(SteamRollingTime)).all() == []


# ---------------------------------------------------------------------------
# _get_owned_games_from_steam
# ---------------------------------------------------------------------------

class TestGetOwnedGamesFromSteam:
    def test_uses_provided_api_key(self, session):
        user = make_user(session, steam_api_key="MY_KEY", steam_id="76561197960287930")
        user_read = _user_read(user)

        payload = _make_steam_response([])
        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(payload)
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service._get_owned_games_from_steam(user_read)
            called_url = mock_urlopen.call_args[0][0]
        assert "MY_KEY" in called_url

    def test_warns_and_uses_default_key_when_none(self, session):
        # Build a UserRead directly without DB insertion; the DB column has NOT NULL
        # but the service only reads from the Python object.
        user_read = UserRead.model_construct(
            id=uuid.uuid4(),
            firebase_uid="x",
            username="x",
            steam_id="999",
            steam_api_key=None,
        )

        payload = _make_steam_response([])
        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(payload)
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            with warnings.catch_warnings(record=True) as w:
                warnings.simplefilter("always")
                game_service._get_owned_games_from_steam(user_read)
                assert any("default steam api key" in str(warning.message).lower() for warning in w)

    def test_warns_and_uses_default_key_when_empty_string(self, session):
        user_read = UserRead.model_construct(
            id=uuid.uuid4(),
            firebase_uid="x",
            username="x",
            steam_id="999",
            steam_api_key="",
        )

        payload = _make_steam_response([])
        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(payload)
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            with warnings.catch_warnings(record=True) as w:
                warnings.simplefilter("always")
                game_service._get_owned_games_from_steam(user_read)
                assert any("default steam api key" in str(warning.message).lower() for warning in w)

    def test_returns_parsed_games(self, session):
        user = make_user(session)
        user_read = _user_read(user)
        games_data = [
            {"appid": 570, "playtime_forever": 100, "playtime_windows_forever": 0,
             "playtime_mac_forever": 0, "playtime_linux_forever": 0,
             "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0},
            {"appid": 730, "playtime_forever": 0, "playtime_windows_forever": 0,
             "playtime_mac_forever": 0, "playtime_linux_forever": 0,
             "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0},
        ]
        payload = _make_steam_response(games_data)
        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(payload)
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            response = game_service._get_owned_games_from_steam(user_read)
        assert response.game_count == 2
        assert len(response.games) == 2
        assert response.games[0].appid == 570


# ---------------------------------------------------------------------------
# get_playtime_by_user
# ---------------------------------------------------------------------------

class TestGetPlaytimeByUser:
    def test_returns_single_day_when_no_data(self, session):
        user = make_user(session)
        result = game_service.get_playtime_by_user(session, user.firebase_uid)
        assert len(result) >= 1
        assert all(d.playtime_minutes == 0 for d in result)

    def test_raises_404_for_unknown_user(self, session):
        with pytest.raises(HTTPException) as exc_info:
            game_service.get_playtime_by_user(session, "no-such-uid")
        assert exc_info.value.status_code == 404

    def test_correct_aggregate_playtime(self, session):
        user = make_user(session)
        today = date.today()
        # Two games each contributing 30 min today
        for app_id in ("570", "730"):
            make_rolling(session, user=user, steam_app_id=app_id, last_day_playtime=100,
                         created_at=today - timedelta(days=1))
            make_rolling(session, user=user, steam_app_id=app_id, last_day_playtime=130,
                         created_at=today)

        result = game_service.get_playtime_by_user(session, user.firebase_uid)
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 60  # 30 + 30

    def test_no_data_all_zeros(self, session):
        user = make_user(session)
        result = game_service.get_playtime_by_user(session, user.firebase_uid)
        assert all(d.playtime_minutes == 0 for d in result)

    def test_specific_days_parameter(self, session):
        user = make_user(session)
        today = date.today()
        make_rolling(session, user=user, last_day_playtime=100,
                     created_at=today - timedelta(days=10))
        make_rolling(session, user=user, last_day_playtime=200,
                     created_at=today)
        result = game_service.get_playtime_by_user(session, user.firebase_uid, days=5)
        assert len(result) == 5


# ---------------------------------------------------------------------------
# get_playtime_by_game
# ---------------------------------------------------------------------------

class TestGetPlaytimeByGame:
    def test_returns_entries_when_data_exists(self, session):
        user = make_user(session)
        today = date.today()
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100,
                     created_at=today)
        result = game_service.get_playtime_by_game(session, user.firebase_uid, "570")
        assert len(result) >= 1

    def test_filters_by_game(self, session):
        user = make_user(session)
        today = date.today()
        yesterday = today - timedelta(days=1)
        # game 570: 40 min today
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100,
                     created_at=yesterday)
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=140,
                     created_at=today)
        # game 440: 200 min today — should NOT appear
        make_rolling(session, user=user, steam_app_id="440", last_day_playtime=0,
                     created_at=yesterday)
        make_rolling(session, user=user, steam_app_id="440", last_day_playtime=200,
                     created_at=today)

        result = game_service.get_playtime_by_game(session, user.firebase_uid, "570")
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 40

    def test_raises_404_for_unknown_user(self, session):
        with pytest.raises(HTTPException) as exc_info:
            game_service.get_playtime_by_game(session, "ghost-uid", "570")
        assert exc_info.value.status_code == 404

    def test_returns_zeros_for_game_with_no_records(self, session):
        user = make_user(session)
        result = game_service.get_playtime_by_game(session, user.firebase_uid, "99999")
        assert all(d.playtime_minutes == 0 for d in result)

    def test_specific_days_parameter(self, session):
        user = make_user(session)
        today = date.today()
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100,
                     created_at=today - timedelta(days=10))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=200,
                     created_at=today)
        result = game_service.get_playtime_by_game(session, user.firebase_uid, "570", days=5)
        assert len(result) == 5
