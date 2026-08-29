import os
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_main.db")
os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", "/tmp/dummy_credentials.json")

from src.core.database import get_db
from src.main import app

client = TestClient(app)


def test_hello_world():
    response = client.get("/hello")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}


def test_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert "version" in data
    assert "app" in data


def test_healthcheck_db_failure():
    mock_db = MagicMock()
    mock_db.execute.side_effect = Exception("DB connection timeout")

    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        response = client.get("/health")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert "error" in data["database"]
    finally:
        app.dependency_overrides.clear()
