import uuid
from unittest.mock import patch

from sqlmodel import Session
from starlette.testclient import TestClient

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.main import app
from src.models import User


def test_register_user_success(client: TestClient, session: Session):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="new-firebase-uid", email="newuser@test.com", email_verified=True
    )
    payload = {
        "username": "new_user_1",
        "steam_id": "76561198999000001",
        "steam_api_key": "MOCK_KEY_123",
    }

    mock_summary = {
        "steamid": "76561198999000001",
        "personaname": "GamerOne",
        "loccountrycode": "IT",
    }

    with patch("src.games.steam_fetcher_service.get_steam_player_summary_sync", return_value=mock_summary):
        response = client.post("/users/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["firebase_uid"] == "new-firebase-uid"
    assert data["username"] == "new_user_1"
    assert data["steam_id"] == "76561198999000001"
    assert "id" in data

    db_user = session.get(User, uuid.UUID(data["id"]))
    assert db_user is not None
    assert db_user.username == "new_user_1"
    assert db_user.steam_id == "76561198999000001"
    assert db_user.steam_api_key == "MOCK_KEY_123"
    assert db_user.region == "IT"

    app.dependency_overrides.clear()


def test_register_user_without_steam_api_key_success(client: TestClient, session: Session):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="new-firebase-uid-2", email="newuser2@test.com", email_verified=True
    )
    payload = {
        "username": "new_user_2",
        "steam_id": "76561198999000002",
        "steam_api_key": "",
    }

    mock_summary = {
        "steamid": "76561198999000002",
        "personaname": "GamerTwo",
        "loccountrycode": "FR",
    }

    with patch("src.games.steam_fetcher_service.get_steam_player_summary_sync", return_value=mock_summary):
        response = client.post("/users/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    db_user = session.get(User, uuid.UUID(data["id"]))
    assert db_user is not None
    assert db_user.steam_api_key == ""
    assert db_user.region == "FR"

    app.dependency_overrides.clear()


def test_register_user_without_country_in_steam_defaults_to_none(client: TestClient, session: Session):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="new-firebase-uid-3", email="newuser3@test.com", email_verified=True
    )
    payload = {
        "username": "new_user_3",
        "steam_id": "76561198999000003",
        "steam_api_key": "",
    }

    mock_summary = {
        "steamid": "76561198999000003",
        "personaname": "PrivateProfileGamer",
    }

    with patch("src.games.steam_fetcher_service.get_steam_player_summary_sync", return_value=mock_summary):
        response = client.post("/users/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    db_user = session.get(User, uuid.UUID(data["id"]))
    assert db_user is not None
    assert db_user.region is None

    app.dependency_overrides.clear()


def test_register_user_invalid_steam_credentials_with_api_key(client: TestClient):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="new-firebase-uid", email="newuser@test.com", email_verified=True
    )
    payload = {
        "username": "new_user_1",
        "steam_id": "76561198999000001",
        "steam_api_key": "INVALID_KEY",
    }

    with patch("src.games.steam_fetcher_service.get_steam_player_summary_sync", return_value=None):
        response = client.post("/users/register", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Steam ID or Steam API Key"

    app.dependency_overrides.clear()


def test_register_user_invalid_steam_id_without_api_key(client: TestClient):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="new-firebase-uid", email="newuser@test.com", email_verified=True
    )
    payload = {
        "username": "new_user_1",
        "steam_id": "invalid_steam_id",
        "steam_api_key": "",
    }

    with patch("src.games.steam_fetcher_service.get_steam_player_summary_sync", return_value=None):
        response = client.post("/users/register", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Steam ID"

    app.dependency_overrides.clear()


def test_register_user_unverified_email_raises_403(client: TestClient):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="unverified-uid", email="unverified@test.com", email_verified=False
    )
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
        region="IT",
    )
    session.add(existing_user)
    session.commit()

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="brand-new-uid", email="another@test.com", email_verified=True
    )
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
        region="IT",
    )
    session.add(existing_user)
    session.commit()

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="brand-new-uid-2", email="user3@test.com", email_verified=True
    )
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
        region="IT",
    )
    session.add(existing_user)
    session.commit()

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="uid-already-reg", email="reg@test.com", email_verified=True
    )
    payload = {
        "username": "different_username",
        "steam_id": "76561198999000011",
        "steam_api_key": "",
    }

    response = client.post("/users/register", json=payload)

    assert response.status_code == 409
    assert "Firebase user is already registered" in response.json()["detail"]


def test_register_user_missing_required_fields_raises_422(client: TestClient):
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="valid-uid", email="valid@test.com", email_verified=True
    )
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
        region="IT",
    )
    session.add(user)
    session.commit()

    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid="uid-profile-test", email="profile@test.com", email_verified=True
    )
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
