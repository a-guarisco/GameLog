"""
Comprehensive tests for src.users.user_service

Function under test:
    get_user_by_firebase_uid(session, firebase_uid) -> UserRead

Scenarios:
1. Happy path – user exists and has a steam_id
2. User not found → HTTPException 404
3. User exists but steam_id is empty string → HTTPException 500
4. User exists but steam_id is None → HTTPException 500
5. Return type is UserRead (not the raw ORM User)
6. Multiple users – correct one is returned
7. UserRead values match the stored User attributes
"""

import os
import uuid

import pytest
from fastapi import HTTPException

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", "/tmp/dummy_credentials.json")
os.environ.setdefault("USE_FIREBASE_EMULATOR", "true")
os.environ.setdefault("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")

from src.models import User
from src.users import UserRead
from src.users.user_service import get_user_by_firebase_uid
from tests.conftest import make_user


class TestGetUserByFirebaseUid:
    # ------------------------------------------------------------------
    # Happy path
    # ------------------------------------------------------------------

    def test_returns_user_read_for_existing_user(self, session):
        user = make_user(session, firebase_uid="uid-1", username="alice", steam_id="111")
        result = get_user_by_firebase_uid(session, "uid-1")
        assert isinstance(result, UserRead)
        assert result.firebase_uid == "uid-1"

    def test_returned_values_match_stored_user(self, session):
        user = make_user(
            session,
            firebase_uid="uid-match",
            username="bob",
            steam_id="999",
            steam_api_key="MYKEY",
        )
        result = get_user_by_firebase_uid(session, "uid-match")
        assert result.id == user.id
        assert result.username == "bob"
        assert result.steam_id == "999"

    # ------------------------------------------------------------------
    # Not found
    # ------------------------------------------------------------------

    def test_raises_404_when_user_not_found(self, session):
        with pytest.raises(HTTPException) as exc_info:
            get_user_by_firebase_uid(session, "nonexistent-uid")
        assert exc_info.value.status_code == 404
        assert "not found" in exc_info.value.detail.lower()

    def test_raises_404_for_empty_uid_string(self, session):
        with pytest.raises(HTTPException) as exc_info:
            get_user_by_firebase_uid(session, "")
        assert exc_info.value.status_code == 404

    # ------------------------------------------------------------------
    # Missing steam_id
    # ------------------------------------------------------------------

    def test_raises_500_when_steam_id_is_empty_string(self, session):
        user = User(firebase_uid="uid-no-steam", username="nosTeam", steam_id="", steam_api_key="K")
        session.add(user)
        session.commit()

        with pytest.raises(HTTPException) as exc_info:
            get_user_by_firebase_uid(session, "uid-no-steam")
        assert exc_info.value.status_code == 500
        assert "steam" in exc_info.value.detail.lower()

    def test_raises_500_when_steam_id_is_none(self, session):
        # The DB schema has NOT NULL on steam_id so we can't INSERT NULL directly.
        # Instead, mock session.exec() to return a fake user with steam_id=None
        # to test the service's falsy guard independently of the DB constraint.
        from unittest.mock import MagicMock, patch

        fake_user = MagicMock()
        fake_user.firebase_uid = "uid-none-steam"
        fake_user.steam_id = None
        fake_user.steam_api_key = "K"
        fake_user.username = "noneTeam"
        fake_user.id = uuid.uuid4()

        mock_result = MagicMock()
        mock_result.first.return_value = fake_user

        with patch.object(session, "exec", return_value=mock_result), pytest.raises(HTTPException) as exc_info:
            get_user_by_firebase_uid(session, "uid-none-steam")
        assert exc_info.value.status_code == 500

    # ------------------------------------------------------------------
    # Multiple users – correct one returned
    # ------------------------------------------------------------------

    def test_returns_correct_user_among_many(self, session):
        make_user(session, firebase_uid="uid-a", username="alpha", steam_id="111")
        make_user(session, firebase_uid="uid-b", username="beta", steam_id="222")
        make_user(session, firebase_uid="uid-c", username="gamma", steam_id="333")

        result = get_user_by_firebase_uid(session, "uid-b")
        assert result.firebase_uid == "uid-b"
        assert result.username == "beta"
        assert result.steam_id == "222"

    # ------------------------------------------------------------------
    # Return type guarantee
    # ------------------------------------------------------------------

    def test_result_is_userread_not_orm_user(self, session):
        make_user(session, firebase_uid="uid-type", username="typetest", steam_id="555")
        result = get_user_by_firebase_uid(session, "uid-type")
        # UserRead is a pydantic model; User is the SQLModel ORM table class
        assert not isinstance(result, User)
        assert isinstance(result, UserRead)

    def test_id_field_is_uuid(self, session):
        make_user(session, firebase_uid="uid-uuid", username="uuidtest", steam_id="777")
        result = get_user_by_firebase_uid(session, "uid-uuid")
        assert isinstance(result.id, uuid.UUID)
