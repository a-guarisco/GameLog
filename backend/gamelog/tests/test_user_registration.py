from sqlmodel import Session
from starlette.testclient import TestClient

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.main import app
from src.models import User


def test_register_user_success(client: TestClient, session: Session):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="new-firebase-uid", email="newuser@test.com")
    payload = {
        "username": "new_user_1",
        "steam_id": "76561198999000001",
        "steam_api_key": "MOCK_KEY_123",
    }

    response = client.post("/users/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["firebase_uid"] == "new-firebase-uid"
    assert data["username"] == "new_user_1"
    assert data["steam_id"] == "76561198999000001"
    assert "id" in data


def test_register_user_duplicate_username(client: TestClient, session: Session):
    existing_user = User(
        firebase_uid="uid-existing-1",
        username="taken_username",
        steam_id="76561198999000002",
        steam_api_key="",
    )
    session.add(existing_user)
    session.commit()

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="brand-new-uid", email="another@test.com")
    payload = {
        "username": "taken_username",
        "steam_id": "76561198999000003",
        "steam_api_key": "",
    }

    response = client.post("/users/register", json=payload)

    assert response.status_code == 409
    assert "Username is already taken" in response.json()["detail"]


def test_register_user_duplicate_steam_id(client: TestClient, session: Session):
    existing_user = User(
        firebase_uid="uid-existing-2",
        username="user_2",
        steam_id="76561198999000002",
        steam_api_key="",
    )
    session.add(existing_user)
    session.commit()

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="brand-new-uid-2", email="user3@test.com")
    payload = {
        "username": "user_3",
        "steam_id": "76561198999000002",
        "steam_api_key": "",
    }

    response = client.post("/users/register", json=payload)

    assert response.status_code == 409
    assert "Steam ID is already registered" in response.json()["detail"]


def test_register_user_already_registered_firebase_uid(client: TestClient, session: Session):
    existing_user = User(
        firebase_uid="uid-already-reg",
        username="registered_user",
        steam_id="76561198999000010",
        steam_api_key="",
    )
    session.add(existing_user)
    session.commit()

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="uid-already-reg", email="reg@test.com")
    payload = {
        "username": "different_username",
        "steam_id": "76561198999000011",
        "steam_api_key": "",
    }

    response = client.post("/users/register", json=payload)

    assert response.status_code == 409
    assert "Firebase user is already registered" in response.json()["detail"]


def test_register_user_requires_auth(client: TestClient):
    app.dependency_overrides.clear()
    plain_client = TestClient(app, raise_server_exceptions=False)
    response = plain_client.post("/users/register", json={"username": "test", "steam_id": "123"})
    assert response.status_code == 401


def test_get_current_user_profile_success(client: TestClient, session: Session):
    user = User(
        firebase_uid="uid-profile-test",
        username="profile_user",
        steam_id="76561198999000099",
        steam_api_key="",
    )
    session.add(user)
    session.commit()

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="uid-profile-test", email="profile@test.com")
    response = client.get("/users/me")

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "profile_user"
    assert data["firebase_uid"] == "uid-profile-test"
