from unittest.mock import patch

import pytest

from src.core.scheduler import lifespan
from src.core.settings import Settings, get_settings


def test_settings_scheduler_default():
    # By default, run_scheduler should be True
    # Ensure any environment variables are cleared or mocked
    with patch.dict("os.environ", {}, clear=True):
        # We need to clear the lru cache for get_settings to read new env
        get_settings.cache_clear()
        try:
            settings = Settings(DATABASE_URL="sqlite:///:memory:", GOOGLE_APPLICATION_CREDENTIALS="/tmp/dummy.json")
            assert settings.run_scheduler is True
        finally:
            get_settings.cache_clear()


def test_settings_scheduler_disabled():
    with patch.dict("os.environ", {"RUN_SCHEDULER": "false"}):
        get_settings.cache_clear()
        try:
            settings = Settings(DATABASE_URL="sqlite:///:memory:", GOOGLE_APPLICATION_CREDENTIALS="/tmp/dummy.json")
            assert settings.run_scheduler is False
        finally:
            get_settings.cache_clear()


@pytest.mark.anyio
async def test_lifespan_scheduler_enabled():
    mock_settings = Settings(DATABASE_URL="sqlite:///:memory:", GOOGLE_APPLICATION_CREDENTIALS="/tmp/dummy.json", RUN_SCHEDULER="true")
    with (
        patch("src.core.scheduler.get_settings", return_value=mock_settings),
        patch("src.core.scheduler._scheduler_loop"),
        patch("src.core.scheduler._scheduler_weekly_loop"),
        patch("src.core.scheduler.asyncio.create_task") as mock_create_task,
    ):
        async with lifespan(None):
            pass
        assert mock_create_task.call_count == 2


@pytest.mark.anyio
async def test_lifespan_scheduler_disabled():
    mock_settings = Settings(DATABASE_URL="sqlite:///:memory:", GOOGLE_APPLICATION_CREDENTIALS="/tmp/dummy.json", RUN_SCHEDULER="false")
    with (
        patch("src.core.scheduler.get_settings", return_value=mock_settings),
        patch("src.core.scheduler._scheduler_loop"),
        patch("src.core.scheduler.asyncio.create_task") as mock_create_task,
    ):
        async with lifespan(None):
            pass
        mock_create_task.assert_not_called()


@pytest.mark.anyio
async def test_weekly_top_games_429_backoff(engine):
    from unittest.mock import AsyncMock, MagicMock

    import httpx

    from src.core.scheduler import _run_weekly_top_games_job_async
    from src.games.schemas import SteamTopGame

    mock_top_games = [SteamTopGame(appid=123, rank=1)]
    mock_response_429 = MagicMock()
    mock_response_429.status_code = 429
    err_429 = httpx.HTTPStatusError("429 Too Many Requests", request=MagicMock(), response=mock_response_429)

    genres_side_effects = [
        err_429,
        err_429,
        [{"id": 1, "description": "Action"}],
    ]

    mock_sleep = AsyncMock()

    with (
        patch("src.core.scheduler.engine", engine),
        patch("src.games.steam_fetcher_service.get_most_played_games_from_steam_async", AsyncMock(return_value=mock_top_games)),
        patch("src.games.steam_fetcher_service.get_game_genres_from_steam_async", AsyncMock(side_effect=genres_side_effects)),
        patch("src.core.scheduler.asyncio.sleep", mock_sleep),
    ):
        await _run_weekly_top_games_job_async()

    # Verify that sleep was called with increasing backoff: 2.0 then 4.0 (and 0.5 before saving)
    sleep_calls = [call.args[0] for call in mock_sleep.call_args_list]
    assert 2.0 in sleep_calls
    assert 4.0 in sleep_calls
    idx_2 = sleep_calls.index(2.0)
    idx_4 = sleep_calls.index(4.0)
    assert idx_2 < idx_4
