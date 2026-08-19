from sqlmodel import Session
from starlette.testclient import TestClient

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.main import app
from src.models import User


def test_register_user_success(client: TestClient, session: Session):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="new-firebase-uid", email="newuser@test.com", email_verified=True)
    payload = {
        "username": "new_user_1",
        "steam_id": "76561198999000001",
        "steam_api_key": "MOCK_KEY_123",
    }

    from unittest.mock import patch

    with patch("src.games.steam_fetcher_service.validate_steam_credentials_sync", return_value=True):
        response = client.post("/users/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["firebase_uid"] == "new-firebase-uid"
    assert data["username"] == "new_user_1"
    assert data["steam_id"] == "76561198999000001"
    assert "id" in data
    import uuid
    db_user = session.get(User, uuid.UUID(data["id"]))
    assert db_user is not None
    assert db_user.username == "new_user_1"
    assert db_user.steam_id == "76561198999000001"
    assert db_user.steam_api_key == "MOCK_KEY_123"

    app.dependency_overrides.clear()


def test_register_user_invalid_steam_credentials(client: TestClient, session: Session):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="new-firebase-uid", email="newuser@test.com", email_verified=True)
    payload = {
        "username": "new_user_1",
        "steam_id": "76561198999000001",
        "steam_api_key": "MOCK_KEY_123",
    }

    from unittest.mock import patch

    with patch("src.games.steam_fetcher_service.validate_steam_credentials_sync", return_value=False):
        response = client.post("/users/register", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Steam ID or Steam API Key"

    app.dependency_overrides.clear()


def test_register_user_unverified_email_raises_403(client: TestClient, session: Session):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="unverified-uid", email="unverified@test.com", email_verified=False)
    payload = {
        "username": "unverified_user",
        "steam_id": "76561198999000099",
        "steam_api_key": "",
    }

    response = client.post("/users/register", json=payload)

    assert response.status_code == 403
    assert "Email is not verified" in response.json()["detail"]


def test_register_user_duplicate_username(client: TestClient, session: Session):
    existing_user = User(
        firebase_uid="uid-existing-1",
        username="taken_username",
        steam_id="76561198999000002",
        steam_api_key="",
    )
    session.add(existing_user)
    session.commit()

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="brand-new-uid", email="another@test.com", email_verified=True)
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

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="brand-new-uid-2", email="user3@test.com", email_verified=True)
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

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="uid-already-reg", email="reg@test.com", email_verified=True)
    payload = {
        "username": "different_username",
        "steam_id": "76561198999000011",
        "steam_api_key": "",
    }

    response = client.post("/users/register", json=payload)

    assert response.status_code == 409
    assert "Firebase user is already registered" in response.json()["detail"]


def test_register_user_missing_required_fields_raises_422(client: TestClient):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="valid-uid", email="valid@test.com", email_verified=True)
    # Missing steam_id
    payload = {"username": "incomplete_user"}

    response = client.post("/users/register", json=payload)

    assert response.status_code == 422


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

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(uid="uid-profile-test", email="profile@test.com", email_verified=True)
    response = client.get("/users/me")

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "profile_user"
    assert data["firebase_uid"] == "uid-profile-test"


def test_get_current_user_profile_not_registered_raises_404(client: TestClient):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="unregistered-firebase-uid", email="unregistered@test.com", email_verified=True
    )
    response = client.get("/users/me")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
