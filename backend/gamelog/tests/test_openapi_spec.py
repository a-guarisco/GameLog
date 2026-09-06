import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_openapi.db")
os.environ.setdefault("USE_FIREBASE_EMULATOR", "true")

from src.main import app  # noqa: E402


def test_openapi_schema_generation():
    """Verify that OpenAPI schema generates without error and contains registered routes."""
    schema = app.openapi()
    assert schema is not None
    assert "openapi" in schema
    assert "paths" in schema
    assert "info" in schema
    assert schema["info"]["title"] is not None

    paths = schema["paths"]
    # Check core endpoints exist in schema
    assert "/hello" in paths
    assert "/health" in paths
    assert "/community/monthly_playtime" in paths
    assert "/community/game_statuses" in paths
    assert "/community/genre" in paths
    assert "/games/recommendations" in paths
    assert "/games/report" in paths
