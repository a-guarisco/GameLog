import uuid
import warnings
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from fastapi import HTTPException
from sqlmodel import Session

from src.games import game_service, steam_fetcher_service
from src.games.schemas import DayByDayPlaytime
from src.models import Game, GameStatus, Shelving, SteamRollingTime, User
from src.users import UserRead

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def make_user(
    session: Session,
    firebase_uid: str = "firebase-uid-1",
    username: str = "gamer1",
    steam_id: str = "76561197960287930",
    steam_api_key: str = "KEY123",
) -> User:
    user = User(
        firebase_uid=firebase_uid,
        username=username,
        steam_id=steam_id,
        steam_api_key=steam_api_key,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def make_game(session: Session, steam_app_id: str = "570") -> Game:
    game = Game(steam_app_id=steam_app_id)
    session.add(game)
    session.commit()
    session.refresh(game)
    return game


def make_shelving(
    session: Session,
    user: User,
    game: Game,
    status: GameStatus = GameStatus.SHELVED,
) -> Shelving:
    shelving = Shelving(owner_id=user.id, game_id=game.id, status=status)
    session.add(shelving)
    session.commit()
    session.refresh(shelving)
    return shelving


def make_rolling(
    session: Session,
    user: User,
    steam_app_id: str = "570",
    last_day_playtime: int = 100,
    created_at: date | None = None,
) -> SteamRollingTime:
    rolling = SteamRollingTime(
        user_id=user.id,
        steam_app_id=steam_app_id,
        last_day_playtime=last_day_playtime,
        created_at=created_at or date.today(),
    )
    session.add(rolling)
    session.commit()
    session.refresh(rolling)
    return rolling


def _user_read(user: User) -> UserRead:
    return UserRead.model_validate(user)


def _make_steam_response(games: list[dict]) -> dict:
    return {
        "response": {
            "game_count": len(games),
            "games": games,
        }
    }


def _mock_httpx_get(payload: dict):
    async def side_effect(url, *args, **kwargs):
        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        if "appdetails" in str(url):
            import urllib.parse
            parsed = urllib.parse.urlparse(str(url))
            params = urllib.parse.parse_qs(parsed.query)
            appids = params.get("appids", [""])[0]
            mock_resp.json.return_value = {
                appids: {
                    "success": True,
                    "data": {
                        "genres": [
                            {"id": "1", "description": "Action"},
                            {"id": "37", "description": "Free To Play"}
                        ]
                    }
                }
            }
        else:
            mock_resp.json.return_value = payload
        return mock_resp

    return patch.object(httpx.AsyncClient, "get", AsyncMock(side_effect=side_effect))


# ---------------------------------------------------------------------------
# _compute_daily_playtimes (Unit Tests)
# ---------------------------------------------------------------------------


class TestComputeDailyPlaytimes:
    def test_empty_records_returns_single_day_when_days_minus_1(self):
        result = game_service._compute_daily_playtimes([], days=-1)
        assert len(result) == 1
        assert result[0].date == date.today()
        assert result[0].playtime_minutes == 0

    def test_empty_records_returns_requested_num_days(self):
        result = game_service._compute_daily_playtimes([], days=5)
        assert len(result) == 5
        assert result[-1].date == date.today()
        assert all(r.playtime_minutes == 0 for r in result)

    def test_single_game_two_days(self, session):
        user = make_user(session)
        today = date.today()
        r1 = SteamRollingTime(user_id=user.id, steam_app_id="570", last_day_playtime=100, created_at=today - timedelta(days=1))
        r2 = SteamRollingTime(user_id=user.id, steam_app_id="570", last_day_playtime=160, created_at=today)
        result = game_service._compute_daily_playtimes([r1, r2], days=-1)
        assert len(result) == 2
        assert result[0].playtime_minutes == 0  # first day baseline = 0
        assert result[1].playtime_minutes == 60  # 160 - 100

    def test_multiple_games_aggregated(self, session):
        user = make_user(session)
        today = date.today()
        yesterday = today - timedelta(days=1)

        # Game 1: 100 -> 140 (+40)
        g1_d1 = SteamRollingTime(user_id=user.id, steam_app_id="570", last_day_playtime=100, created_at=yesterday)
        g1_d2 = SteamRollingTime(user_id=user.id, steam_app_id="570", last_day_playtime=140, created_at=today)

        # Game 2: 200 -> 230 (+30)
        g2_d1 = SteamRollingTime(user_id=user.id, steam_app_id="730", last_day_playtime=200, created_at=yesterday)
        g2_d2 = SteamRollingTime(user_id=user.id, steam_app_id="730", last_day_playtime=230, created_at=today)

        result = game_service._compute_daily_playtimes([g1_d1, g1_d2, g2_d1, g2_d2], days=-1)
        assert len(result) == 2
        assert result[0].playtime_minutes == 0
        assert result[1].playtime_minutes == 70  # 40 + 30

    def test_days_filter_truncates_history(self, session):
        user = make_user(session)
        today = date.today()
        records = []
        for i in range(10):
            records.append(
                SteamRollingTime(
                    user_id=user.id,
                    steam_app_id="570",
                    last_day_playtime=i * 10,
                    created_at=today - timedelta(days=9 - i),
                )
            )

        # Ask for 3 days
        result = game_service._compute_daily_playtimes(records, days=3)
        assert len(result) == 3
        assert result[-1].date == today
        assert result[0].date == today - timedelta(days=2)

    def test_days_filter_when_fewer_days_available(self, session):
        user = make_user(session)
        today = date.today()
        records = [
            SteamRollingTime(user_id=user.id, steam_app_id="570", last_day_playtime=10, created_at=today - timedelta(days=1)),
            SteamRollingTime(user_id=user.id, steam_app_id="570", last_day_playtime=20, created_at=today),
        ]
        # Request 14 days, but only 2 exist
        result = game_service._compute_daily_playtimes(records, days=14)
        assert len(result) == 2

    def test_decreasing_playtime_clamped_to_zero(self, session):
        """If steam data glitch causes playtime_forever to drop, delta should be 0 not negative."""
        user = make_user(session)
        today = date.today()
        r1 = SteamRollingTime(user_id=user.id, steam_app_id="570", last_day_playtime=200, created_at=today - timedelta(days=1))
        r2 = SteamRollingTime(user_id=user.id, steam_app_id="570", last_day_playtime=150, created_at=today)

        result = game_service._compute_daily_playtimes([r1, r2], days=-1)
        assert result[1].playtime_minutes == 0


# ---------------------------------------------------------------------------
# Helper CRUD functions
# ---------------------------------------------------------------------------


class TestHelperCrudFunctions:
    def test_get_cached_game_returns_game_or_none(self, session):
        assert game_service._get_cached_game(session, "570") is None
        make_game(session, steam_app_id="570")
        game = game_service._get_cached_game(session, "570")
        assert game is not None
        assert game.steam_app_id == "570"

    def test_get_game_player_shelve_returns_shelve_or_none(self, session):
        user = make_user(session)
        game = make_game(session)
        assert game_service._get_game_player_shelve(session, game.id, user.id) is None
        make_shelving(session, user=user, game=game)
        shelving = game_service._get_game_player_shelve(session, game.id, user.id)
        assert shelving is not None

    def test_cache_game_creates_entry(self, session):
        game = game_service._cache_game(session, "440")
        assert game.id is not None
        assert game.steam_app_id == "440"

    def test_shelve_game_creates_entry(self, session):
        user = make_user(session)
        game = make_game(session)
        game_service._shelve_game(session, game.id, user.id, GameStatus.SHELVED)
        shelving = game_service._get_game_player_shelve(session, game.id, user.id)
        assert shelving is not None
        assert shelving.status == GameStatus.SHELVED

    def test_create_steam_rolling(self, session):
        user = make_user(session)
        from src.games.schemas import SteamGame

        steam_game = SteamGame(
            appid=570,
            playtime_forever=150,
            playtime_windows_forever=0,
            playtime_mac_forever=0,
            playtime_linux_forever=0,
            playtime_deck_forever=0,
            rtime_last_played=0,
            playtime_disconnected=0,
        )
        game_service._create_steam_rolling(session, user, steam_game, "570")
        rolling = game_service._get_latest_steam_rolling(session, user.id, "570")
        assert rolling is not None
        assert rolling.last_day_playtime == 150

    def test_get_latest_steam_rolling_returns_newest(self, session):
        user = make_user(session)
        today = date.today()
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=50, created_at=today - timedelta(days=2))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100, created_at=today)

        latest = game_service._get_latest_steam_rolling(session, user.id, "570")
        assert latest.last_day_playtime == 100


# ---------------------------------------------------------------------------
# update_user_shelving_steamrolling_async
# ---------------------------------------------------------------------------


class TestUpdateUserShelvingSteamRollingAsync:
    """Integration-style tests using patched Steam API calls."""

    @pytest.mark.anyio
    async def test_new_game_is_cached_and_shelved(self, session):
        user = make_user(session)

        games = [
            {
                "appid": 570,
                "playtime_forever": 120,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            }
        ]

        with _mock_httpx_get(_make_steam_response(games)):
            await game_service.update_user_shelving_steamrolling_async(session, user)

        from sqlmodel import select

        game = session.exec(select(Game).where(Game.steam_app_id == "570")).first()
        assert game is not None
        shelving = session.exec(select(Shelving).where(Shelving.game_id == game.id)).first()
        assert shelving is not None
        assert shelving.owner_id == user.id

    @pytest.mark.anyio
    async def test_unplayed_game_gets_shelved_status(self, session):
        user = make_user(session)

        games = [
            {
                "appid": 730,
                "playtime_forever": 0,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            }
        ]

        with _mock_httpx_get(_make_steam_response(games)):
            await game_service.update_user_shelving_steamrolling_async(session, user)

        from sqlmodel import select

        game = session.exec(select(Game).where(Game.steam_app_id == "730")).first()
        shelving = session.exec(select(Shelving).where(Shelving.game_id == game.id)).first()
        assert shelving.status == GameStatus.SHELVED

    @pytest.mark.anyio
    async def test_played_game_gets_shelved_status(self, session):
        user = make_user(session)

        games = [
            {
                "appid": 570,
                "playtime_forever": 300,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            }
        ]

        with _mock_httpx_get(_make_steam_response(games)):
            await game_service.update_user_shelving_steamrolling_async(session, user)

        from sqlmodel import select

        game = session.exec(select(Game).where(Game.steam_app_id == "570")).first()
        shelving = session.exec(select(Shelving).where(Shelving.game_id == game.id)).first()
        assert shelving.status == GameStatus.SHELVED

    @pytest.mark.anyio
    async def test_first_time_zero_playtime_creates_baseline_rolling(self, session):
        """First time seeing a game always creates a baseline rolling, even with 0 playtime."""
        user = make_user(session)

        games = [
            {
                "appid": 730,
                "playtime_forever": 0,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            }
        ]

        with _mock_httpx_get(_make_steam_response(games)):
            await game_service.update_user_shelving_steamrolling_async(session, user)

        from sqlmodel import select

        rolling = session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)).all()
        assert len(rolling) == 1
        assert rolling[0].last_day_playtime == 0

    @pytest.mark.anyio
    async def test_nonzero_playtime_game_creates_rolling(self, session):
        """Games with playtime_forever > 0 should create a steam rolling entry."""
        user = make_user(session)

        games = [
            {
                "appid": 570,
                "playtime_forever": 120,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            }
        ]

        with _mock_httpx_get(_make_steam_response(games)):
            await game_service.update_user_shelving_steamrolling_async(session, user)

        from sqlmodel import select

        rolling = session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)).all()
        assert len(rolling) == 1
        assert rolling[0].last_day_playtime == 120

    @pytest.mark.anyio
    async def test_unchanged_playtime_does_not_create_new_rolling(self, session):
        """If playtime hasn't changed from the latest rolling, no new entry is created."""
        user = make_user(session)
        game = make_game(session, steam_app_id="570")
        make_shelving(session, user=user, game=game)
        # Pre-existing rolling with playtime=100
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100)

        games = [
            {
                "appid": 570,
                "playtime_forever": 100,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            }
        ]

        with _mock_httpx_get(_make_steam_response(games)):
            await game_service.update_user_shelving_steamrolling_async(session, user)

        from sqlmodel import select

        rolling = session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)).all()
        assert len(rolling) == 1  # no new entry created

    @pytest.mark.anyio
    async def test_changed_playtime_creates_new_rolling(self, session):
        """If playtime changed from the latest rolling, a new entry is created."""
        user = make_user(session)
        game = make_game(session, steam_app_id="570")
        make_shelving(session, user=user, game=game)
        # Pre-existing rolling with playtime=100
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100)

        games = [
            {
                "appid": 570,
                "playtime_forever": 150,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            }
        ]

        with _mock_httpx_get(_make_steam_response(games)):
            await game_service.update_user_shelving_steamrolling_async(session, user)

        from sqlmodel import select

        rolling = session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id).order_by(SteamRollingTime.created_at)).all()
        assert len(rolling) == 2
        assert rolling[-1].last_day_playtime == 150

    @pytest.mark.anyio
    async def test_existing_shelving_still_creates_rolling(self, session):
        user = make_user(session)
        game = make_game(session, steam_app_id="570")
        make_shelving(session, user=user, game=game)

        games = [
            {
                "appid": 570,
                "playtime_forever": 200,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            }
        ]

        with _mock_httpx_get(_make_steam_response(games)):
            await game_service.update_user_shelving_steamrolling_async(session, user)

        from sqlmodel import select

        rolling = session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)).first()
        assert rolling is not None
        assert rolling.last_day_playtime == 200

    @pytest.mark.anyio
    async def test_game_not_recached_if_already_exists(self, session):
        user = make_user(session)
        existing_game = make_game(session, steam_app_id="570")

        games = [
            {
                "appid": 570,
                "playtime_forever": 100,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            }
        ]

        with _mock_httpx_get(_make_steam_response(games)):
            await game_service.update_user_shelving_steamrolling_async(session, user)

        from sqlmodel import select

        all_games = session.exec(select(Game).where(Game.steam_app_id == "570")).all()
        assert len(all_games) == 1  # no duplicate
        assert all_games[0].id == existing_game.id

    @pytest.mark.anyio
    async def test_empty_steam_library_does_nothing(self, session):
        user = make_user(session)

        with _mock_httpx_get(_make_steam_response([])):
            await game_service.update_user_shelving_steamrolling_async(session, user)

        from sqlmodel import select

        assert session.exec(select(Game)).all() == []
        assert session.exec(select(Shelving)).all() == []
        assert session.exec(select(SteamRollingTime)).all() == []


# ---------------------------------------------------------------------------
# steam_fetcher_service.get_owned_games_from_steam_async
# ---------------------------------------------------------------------------


class TestGetOwnedGamesFromSteamAsync:
    @pytest.mark.anyio
    async def test_uses_provided_api_key(self, session):
        user = make_user(session, steam_api_key="MY_KEY", steam_id="76561197960287930")

        payload = _make_steam_response([])
        mock_get = AsyncMock()
        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json.return_value = payload
        mock_get.return_value = mock_resp

        with patch.object(httpx.AsyncClient, "get", mock_get):
            await steam_fetcher_service.get_owned_games_from_steam_async(user)
            called_url = mock_get.call_args[0][0]
        assert "MY_KEY" in called_url

    @pytest.mark.anyio
    async def test_warns_and_uses_default_key_when_none(self, session):
        # Build a User directly without DB insertion; the DB column has NOT NULL
        # but the service only reads from the Python object.
        user = User(
            id=uuid.uuid4(),
            firebase_uid="x",
            username="x",
            steam_id="999",
            steam_api_key=None,
        )

        with _mock_httpx_get(_make_steam_response([])), warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            await steam_fetcher_service.get_owned_games_from_steam_async(user)
            assert any("default steam api key" in str(warning.message).lower() for warning in w)

    @pytest.mark.anyio
    async def test_warns_and_uses_default_key_when_empty_string(self, session):
        user = User(
            id=uuid.uuid4(),
            firebase_uid="x",
            username="x",
            steam_id="999",
            steam_api_key="",
        )

        with _mock_httpx_get(_make_steam_response([])), warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            await steam_fetcher_service.get_owned_games_from_steam_async(user)
            assert any("default steam api key" in str(warning.message).lower() for warning in w)

    @pytest.mark.anyio
    async def test_returns_parsed_games(self, session):
        user = make_user(session)
        games_data = [
            {
                "appid": 570,
                "playtime_forever": 100,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            },
            {
                "appid": 730,
                "playtime_forever": 0,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0,
            },
        ]
        payload = _make_steam_response(games_data)
        with _mock_httpx_get(payload):
            response = await steam_fetcher_service.get_owned_games_from_steam_async(user)
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
        assert len(result) == 1
        assert result[0].playtime_minutes == 0

    def test_raises_404_for_unknown_user(self, session):
        with pytest.raises(HTTPException) as exc_info:
            game_service.get_playtime_by_user(session, "no-such-uid")
        assert exc_info.value.status_code == 404

    def test_correct_aggregate_playtime(self, session):
        user = make_user(session)
        today = date.today()
        # Two games each contributing 30 min today
        for app_id in ("570", "730"):
            make_rolling(session, user=user, steam_app_id=app_id, last_day_playtime=100, created_at=today - timedelta(days=1))
            make_rolling(session, user=user, steam_app_id=app_id, last_day_playtime=130, created_at=today)

        result = game_service.get_playtime_by_user(session, user.firebase_uid)
        assert len(result) == 2
        assert result[1].playtime_minutes == 60

    def test_no_data_all_zeros(self, session):
        user = make_user(session)
        result = game_service.get_playtime_by_user(session, user.firebase_uid)
        assert all(entry.playtime_minutes == 0 for entry in result)


# ---------------------------------------------------------------------------
# get_playtime_by_game
# ---------------------------------------------------------------------------


class TestGetPlaytimeByGame:
    def test_returns_entries_when_data_exists(self, session):
        user = make_user(session)
        today = date.today()
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100, created_at=today)
        result = game_service.get_playtime_by_game(session, user.firebase_uid, "570")
        assert len(result) >= 1
        assert isinstance(result[0], DayByDayPlaytime)

    def test_filters_by_game(self, session):
        user = make_user(session)
        today = date.today()
        yesterday = today - timedelta(days=1)
        # game 570: 40 min today
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100, created_at=yesterday)
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=140, created_at=today)
        # game 440: 200 min today — should NOT appear
        make_rolling(session, user=user, steam_app_id="440", last_day_playtime=0, created_at=yesterday)
        make_rolling(session, user=user, steam_app_id="440", last_day_playtime=200, created_at=today)

        result = game_service.get_playtime_by_game(session, user.firebase_uid, "570")
        assert len(result) == 2
        assert result[1].playtime_minutes == 40  # only game 570 contribution

    def test_raises_404_for_unknown_user(self, session):
        with pytest.raises(HTTPException) as exc_info:
            game_service.get_playtime_by_game(session, "ghost-uid", "570")
        assert exc_info.value.status_code == 404

    def test_returns_zeros_for_game_with_no_records(self, session):
        user = make_user(session)
        result = game_service.get_playtime_by_game(session, user.firebase_uid, "99999")
        assert len(result) == 1
        assert result[0].playtime_minutes == 0


# ---------------------------------------------------------------------------
# get_streak
# ---------------------------------------------------------------------------


class TestGetStreak:
    def test_returns_zero_when_no_records(self, session):
        user = make_user(session)
        assert game_service.get_streak(session, user.firebase_uid, None) == 0

    def test_streak_when_played_today(self, session):
        user = make_user(session)
        today = date.today()
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100, created_at=today - timedelta(days=2))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=130, created_at=today - timedelta(days=1))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=180, created_at=today)

        # Streak should be 2 (yesterday and today have playtime > 0)
        assert game_service.get_streak(session, user.firebase_uid, None) == 2

    def test_streak_when_played_yesterday_but_not_today(self, session):
        user = make_user(session)
        today = date.today()
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100, created_at=today - timedelta(days=2))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=130, created_at=today - timedelta(days=1))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=130, created_at=today)

        # Streak should be 1 (yesterday had playtime > 0, today is 0 but streak is not broken yet)
        assert game_service.get_streak(session, user.firebase_uid, None) == 1

    def test_streak_broken_days_ago(self, session):
        user = make_user(session)
        today = date.today()
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100, created_at=today - timedelta(days=3))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=130, created_at=today - timedelta(days=2))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=130, created_at=today - timedelta(days=1))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=130, created_at=today)

        # Streak is 0 because yesterday and today are 0
        assert game_service.get_streak(session, user.firebase_uid, None) == 0

    def test_streak_filtered_by_game(self, session):
        user = make_user(session)
        today = date.today()

        # Game 570 has active streak of 2
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=100, created_at=today - timedelta(days=2))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=130, created_at=today - timedelta(days=1))
        make_rolling(session, user=user, steam_app_id="570", last_day_playtime=180, created_at=today)

        # Game 730 has baseline but no additional playtime
        make_rolling(session, user=user, steam_app_id="730", last_day_playtime=50, created_at=today - timedelta(days=2))
        make_rolling(session, user=user, steam_app_id="730", last_day_playtime=50, created_at=today - timedelta(days=1))
        make_rolling(session, user=user, steam_app_id="730", last_day_playtime=50, created_at=today)

        # Check total streak
        assert game_service.get_streak(session, user.firebase_uid, None) == 2
        # Check streak for game 570
        assert game_service.get_streak(session, user.firebase_uid, "570") == 2
        # Check streak for game 730
        assert game_service.get_streak(session, user.firebase_uid, "730") == 0

    def test_streak_raises_404_for_unknown_user(self, session):
        with pytest.raises(HTTPException) as exc_info:
            game_service.get_streak(session, "ghost-uid", None)
        assert exc_info.value.status_code == 404
