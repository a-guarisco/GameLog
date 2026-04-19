import os

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_main.db")

# Assuming your FastAPI app is inside a file named 'main.py'
from backend.gamelog.src.main import app

client = TestClient(app)


def test_hello_world():
    response = client.get("/hello")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}


def test_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
