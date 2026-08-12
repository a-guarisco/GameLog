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
