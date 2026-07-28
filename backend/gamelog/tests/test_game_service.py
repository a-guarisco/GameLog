"""
Comprehensive tests for src.games.game_service

Covers:
- _compute_daily_playtimes: baseline handling, delta computation, spike clamping, multi-game,
  missing days, date windowing, negative delta prevention
- _prune_old_steam_rolling: keeps anchor, promotes anchor to baseline, deletes surplus records
- update_user_shelving_steamrolling: new game, existing shelving, existing game (no re-cache),
  correct status assignment (TO_BE_PLAYED vs PLAYING), baseline flag
- get_last_two_weeks_playtime_by_user / by_game: delegation, correct aggregation, 404 for unknown user
- _get_owned_games_from_steam: patching urlopen, missing steam key warning
"""

import json
import uuid
import warnings
from collections.abc import Sequence
from datetime import date, timedelta
from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException
from sqlmodel import Session

from tests.conftest import make_game, make_rolling, make_shelving, make_user

from src.games import game_service
from src.games.schemas import DayByDayPlaytime, GetOwnedGamesResponse, SteamGame
from src.models import Game, GameStatus, Shelving, SteamRollingTime, User
from src.users import UserRead


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
    def test_empty_records_returns_14_zero_days(self):
        result = game_service._compute_daily_playtimes([])
        assert len(result) == 14
        assert all(r.playtime_minutes == 0 for r in result)

    def test_baseline_only_contributes_zero(self, session):
        user = make_user(session)
        r = make_rolling(session, user=user, last_day_playtime=500, is_baseline=True)
        result = game_service._compute_daily_playtimes([r])
        assert all(day.playtime_minutes == 0 for day in result)

    def test_single_delta_record(self, session):
        """Second record (non-baseline) should yield delta vs first."""
        user = make_user(session)
        today = date.today()
        r1 = make_rolling(session, user=user, last_day_playtime=100, is_baseline=True,
                          created_at=today - timedelta(days=1))
        r2 = make_rolling(session, user=user, last_day_playtime=160, is_baseline=False,
                          created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2])
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 60

    def test_baseline_in_middle_resets_delta(self, session):
        """A baseline record mid-sequence should not propagate a delta."""
        user = make_user(session)
        today = date.today()
        r1 = make_rolling(session, user=user, last_day_playtime=100, is_baseline=True,
                          created_at=today - timedelta(days=2))
        r2 = make_rolling(session, user=user, last_day_playtime=200, is_baseline=True,
                          created_at=today - timedelta(days=1))  # new baseline
        r3 = make_rolling(session, user=user, last_day_playtime=250, is_baseline=False,
                          created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2, r3])
        yesterday_entry = next(d for d in result if d.date == today - timedelta(days=1))
        assert yesterday_entry.playtime_minutes == 0  # baseline never contributes
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 50  # 250 - 200

    def test_negative_delta_clamped_to_zero(self, session):
        """If cumulative playtime goes backwards (e.g. spike removal), clamp to 0."""
        user = make_user(session)
        today = date.today()
        r1 = make_rolling(session, user=user, last_day_playtime=500, is_baseline=True,
                          created_at=today - timedelta(days=1))
        r2 = make_rolling(session, user=user, last_day_playtime=100, is_baseline=False,
                          created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2])
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 0

    def test_multi_game_aggregation(self, session):
        """Playtimes from multiple games on the same day are summed."""
        user = make_user(session)
        today = date.today()
        yesterday = today - timedelta(days=1)
        # Game 570
        r1 = make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100,
                          is_baseline=True, created_at=yesterday)
        r2 = make_rolling(session, user=user, steam_app_id="570", last_day_playtime=130,
                          is_baseline=False, created_at=today)
        # Game 440
        r3 = make_rolling(session, user=user, steam_app_id="440", last_day_playtime=50,
                          is_baseline=True, created_at=yesterday)
        r4 = make_rolling(session, user=user, steam_app_id="440", last_day_playtime=70,
                          is_baseline=False, created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2, r3, r4])
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 30 + 20  # 50

    def test_result_covers_exactly_14_days_from_today(self, session):
        result = game_service._compute_daily_playtimes([])
        today = date.today()
        expected_dates = [today - timedelta(days=i) for i in range(13, -1, -1)]
        assert [r.date for r in result] == expected_dates

    def test_out_of_window_records_do_not_appear(self, session):
        """Records from 30 days ago should not contribute to the 14-day window."""
        user = make_user(session)
        old_date = date.today() - timedelta(days=30)
        r1 = make_rolling(session, user=user, last_day_playtime=0, is_baseline=True,
                          created_at=old_date - timedelta(days=1))
        r2 = make_rolling(session, user=user, last_day_playtime=999, is_baseline=False,
                          created_at=old_date)
        result = game_service._compute_daily_playtimes([r1, r2])
        assert all(day.playtime_minutes == 0 for day in result)


# ---------------------------------------------------------------------------
# _prune_old_steam_rolling
# ---------------------------------------------------------------------------

class TestPruneOldSteamRolling:
    def _cutoff(self):
        return date.today() - timedelta(days=13)

    def test_no_records_does_nothing(self, session):
        user = make_user(session)
        game_service._prune_old_steam_rolling(session, user.id)  # should not raise

    def test_single_old_record_is_kept(self, session):
        """A lone old record is kept regardless (len <= 1 guard)."""
        user = make_user(session)
        cutoff = self._cutoff()
        r = make_rolling(session, user=user, created_at=cutoff - timedelta(days=1), is_baseline=False)
        game_service._prune_old_steam_rolling(session, user.id)
        from sqlmodel import select
        remaining = session.exec(select(SteamRollingTime)).all()
        assert len(remaining) == 1

    def test_multiple_old_records_pruned_to_one_anchor(self, session):
        """Multiple old records collapse to one anchor (the latest one)."""
        user = make_user(session)
        cutoff = self._cutoff()
        r1 = make_rolling(session, user=user, created_at=cutoff - timedelta(days=5), is_baseline=True)
        r2 = make_rolling(session, user=user, created_at=cutoff - timedelta(days=3), is_baseline=False)
        r3 = make_rolling(session, user=user, created_at=cutoff - timedelta(days=1), is_baseline=False)

        game_service._prune_old_steam_rolling(session, user.id)

        from sqlmodel import select
        remaining = session.exec(select(SteamRollingTime)).all()
        assert len(remaining) == 1
        assert remaining[0].id == r3.id

    def test_anchor_promoted_to_baseline(self, session):
        """The surviving anchor is promoted to is_baseline=True if it wasn't."""
        user = make_user(session)
        cutoff = self._cutoff()
        r1 = make_rolling(session, user=user, created_at=cutoff - timedelta(days=5), is_baseline=False)
        r2 = make_rolling(session, user=user, created_at=cutoff - timedelta(days=2), is_baseline=False)

        game_service._prune_old_steam_rolling(session, user.id)

        from sqlmodel import select
        anchor = session.exec(select(SteamRollingTime)).first()
        assert anchor.is_baseline is True

    def test_recent_records_are_not_pruned(self, session):
        """Records within the 13-day window should be left alone."""
        user = make_user(session)
        cutoff = self._cutoff()
        r_recent = make_rolling(session, user=user, created_at=date.today(), is_baseline=False)
        r_recent2 = make_rolling(session, user=user, created_at=cutoff, is_baseline=False)

        game_service._prune_old_steam_rolling(session, user.id)

        from sqlmodel import select
        remaining = session.exec(select(SteamRollingTime)).all()
        assert len(remaining) == 2

    def test_prune_per_game_independently(self, session):
        """Old records are pruned per game app_id independently."""
        user = make_user(session)
        cutoff = self._cutoff()
        # Game 570 – 3 old records → should collapse to 1
        for i in range(3):
            make_rolling(session, user=user, steam_app_id="570",
                         created_at=cutoff - timedelta(days=i + 1))
        # Game 440 – 1 old record → should be kept
        make_rolling(session, user=user, steam_app_id="440",
                     created_at=cutoff - timedelta(days=1))

        game_service._prune_old_steam_rolling(session, user.id)

        from sqlmodel import select
        remaining = session.exec(select(SteamRollingTime)).all()
        ids_570 = [r for r in remaining if r.steam_app_id == "570"]
        ids_440 = [r for r in remaining if r.steam_app_id == "440"]
        assert len(ids_570) == 1
        assert len(ids_440) == 1

    def test_only_prunes_records_for_given_user(self, session):
        """Records belonging to a different user are never touched."""
        user_a = make_user(session, firebase_uid="uid-a", username="userA", steam_id="111")
        user_b = make_user(session, firebase_uid="uid-b", username="userB", steam_id="222")
        cutoff = self._cutoff()
        # 3 old records for user_a
        for i in range(3):
            make_rolling(session, user=user_a, created_at=cutoff - timedelta(days=i + 1))
        # 1 record for user_b
        r_b = make_rolling(session, user=user_b, created_at=cutoff - timedelta(days=1))

        game_service._prune_old_steam_rolling(session, user_a.id)

        from sqlmodel import select
        b_remaining = session.exec(
            select(SteamRollingTime).where(SteamRollingTime.user_id == user_b.id)
        ).all()
        assert len(b_remaining) == 1
        assert b_remaining[0].id == r_b.id


# ---------------------------------------------------------------------------
# update_user_shelving_steamrolling
# ---------------------------------------------------------------------------

class TestUpdateUserShelvingSteamRolling:
    """Integration-style tests using patched Steam API calls."""

    def _mock_steam(self, games: list[dict]):
        raw = _make_steam_response(games)
        mock_response = MagicMock()
        mock_response.read.return_value = raw
        mock_response.__enter__ = lambda s: s
        mock_response.__exit__ = MagicMock(return_value=False)

        class _FakeFile:
            def read(self):
                return raw

        mock_cm = MagicMock()
        mock_cm.__enter__ = lambda s: BytesIO(raw)
        mock_cm.__exit__ = MagicMock(return_value=False)
        return mock_cm

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

    def test_unplayed_game_gets_to_be_played_status(self, session):
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
        assert shelving.status == GameStatus.TO_BE_PLAYED

    def test_played_game_gets_playing_status(self, session):
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
        assert shelving.status == GameStatus.PLAYING

    def test_existing_shelving_creates_non_baseline_rolling(self, session):
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
        assert rolling.is_baseline is False  # not a new entry

    def test_new_game_creates_baseline_rolling(self, session):
        user = make_user(session)
        user_read = _user_read(user)

        games = [{"appid": 570, "playtime_forever": 50, "playtime_windows_forever": 0,
                  "playtime_mac_forever": 0, "playtime_linux_forever": 0,
                  "playtime_deck_forever": 0, "rtime_last_played": 0, "playtime_disconnected": 0}]

        with patch("src.games.game_service.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__ = lambda s: BytesIO(_make_steam_response(games))
            mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
            game_service.update_user_shelving_steamrolling(session, user_read)

        from sqlmodel import select
        rolling = session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)).first()
        assert rolling.is_baseline is True

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
# get_last_two_weeks_playtime_by_user
# ---------------------------------------------------------------------------

class TestGetLastTwoWeeksPlaytimeByUser:
    def test_returns_14_entries(self, session):
        user = make_user(session)
        result = game_service.get_last_two_weeks_playtime_by_user(session, user.firebase_uid)
        assert len(result) == 14

    def test_raises_404_for_unknown_user(self, session):
        with pytest.raises(HTTPException) as exc_info:
            game_service.get_last_two_weeks_playtime_by_user(session, "no-such-uid")
        assert exc_info.value.status_code == 404

    def test_correct_aggregate_playtime(self, session):
        user = make_user(session)
        today = date.today()
        # Two games each contributing 30 min today
        for app_id in ("570", "730"):
            make_rolling(session, user=user, steam_app_id=app_id, last_day_playtime=100,
                         is_baseline=True, created_at=today - timedelta(days=1))
            make_rolling(session, user=user, steam_app_id=app_id, last_day_playtime=130,
                         is_baseline=False, created_at=today)

        result = game_service.get_last_two_weeks_playtime_by_user(session, user.firebase_uid)
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 60  # 30 + 30

    def test_no_data_all_zeros(self, session):
        user = make_user(session)
        result = game_service.get_last_two_weeks_playtime_by_user(session, user.firebase_uid)
        assert all(d.playtime_minutes == 0 for d in result)


# ---------------------------------------------------------------------------
# get_last_two_weeks_playtime_by_game
# ---------------------------------------------------------------------------

class TestGetLastTwoWeeksPlaytimeByGame:
    def test_returns_14_entries(self, session):
        user = make_user(session)
        result = game_service.get_last_two_weeks_playtime_by_game(session, user.firebase_uid, "570")
        assert len(result) == 14

    def test_filters_by_game(self, session):
        user = make_user(session)
        today = date.today()
        yesterday = today - timedelta(days=1)
        # game 570: 40 min today
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100,
                     is_baseline=True, created_at=yesterday)
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=140,
                     is_baseline=False, created_at=today)
        # game 440: 200 min today — should NOT appear
        make_rolling(session, user=user, steam_app_id="440", last_day_playtime=0,
                     is_baseline=True, created_at=yesterday)
        make_rolling(session, user=user, steam_app_id="440", last_day_playtime=200,
                     is_baseline=False, created_at=today)

        result = game_service.get_last_two_weeks_playtime_by_game(session, user.firebase_uid, "570")
        today_entry = next(d for d in result if d.date == today)
        assert today_entry.playtime_minutes == 40

    def test_raises_404_for_unknown_user(self, session):
        with pytest.raises(HTTPException) as exc_info:
            game_service.get_last_two_weeks_playtime_by_game(session, "ghost-uid", "570")
        assert exc_info.value.status_code == 404

    def test_returns_zeros_for_game_with_no_records(self, session):
        user = make_user(session)
        result = game_service.get_last_two_weeks_playtime_by_game(session, user.firebase_uid, "99999")
        assert all(d.playtime_minutes == 0 for d in result)
