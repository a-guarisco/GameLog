from fastapi.testclient import TestClient

# Assuming your FastAPI app is inside a file named 'main.py'
from src.main import app

client = TestClient(app)


def test_hello_world():
    response = client.get("/hello")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}
