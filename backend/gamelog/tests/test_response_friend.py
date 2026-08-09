import os
import uuid

import pytest
from fastapi import HTTPException

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", "/tmp/dummy_credentials.json")
os.environ.setdefault("USE_FIREBASE_EMULATOR", "true")
os.environ.setdefault("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")
os.environ.setdefault("RUN_SCHEDULER", "false")

from src.models import Friendship, FriendshipStatus
from src.users.schemas import FriendshipResponseStatus
from src.users.user_service import respond_to_friend_request
from tests.conftest import make_user


class TestRespondToFriendRequest:
    """Unit tests for user_service.respond_to_friend_request"""

    def test_accept_friend_request_successfully(self, session):
        requester = make_user(session, firebase_uid="uid-req-1", username="req1", steam_id="101")
        addressee = make_user(session, firebase_uid="uid-addr-1", username="addr1", steam_id="102")

        friendship = Friendship(
            requester_id=requester.id,
            addressee_id=addressee.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        result = respond_to_friend_request(session, "uid-addr-1", friendship.id, FriendshipResponseStatus.ACCEPTED)

        assert result["message"] == "Friend request accepted"
        updated = session.get(Friendship, friendship.id)
        assert updated.status == FriendshipStatus.ACCEPTED

    def test_reject_friend_request_successfully(self, session):
        requester = make_user(session, firebase_uid="uid-req-2", username="req2", steam_id="201")
        addressee = make_user(session, firebase_uid="uid-addr-2", username="addr2", steam_id="202")

        friendship = Friendship(
            requester_id=requester.id,
            addressee_id=addressee.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        result = respond_to_friend_request(session, "uid-addr-2", friendship.id, FriendshipResponseStatus.REJECTED)

        assert result["message"] == "Friend request rejected"
        assert session.get(Friendship, friendship.id) is None

    def test_block_user(self, session):
        requester = make_user(session, firebase_uid="uid-req-3", username="req3", steam_id="301")
        addressee = make_user(session, firebase_uid="uid-addr-3", username="addr3", steam_id="302")

        friendship = Friendship(
            requester_id=requester.id,
            addressee_id=addressee.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        result = respond_to_friend_request(session, "uid-addr-3", friendship.id, FriendshipResponseStatus.BLOCKED)

        assert result["message"] == "User blocked"
        updated = session.get(Friendship, friendship.id)
        assert updated.status == FriendshipStatus.BLOCKED

    def test_not_part_of_friendship(self, session):
        user_a = make_user(session, firebase_uid="uid-a", username="userA", steam_id="401")
        user_b = make_user(session, firebase_uid="uid-b", username="userB", steam_id="402")
        make_user(session, firebase_uid="uid-outsider", username="outsider", steam_id="403")

        friendship = Friendship(
            requester_id=user_a.id,
            addressee_id=user_b.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        with pytest.raises(HTTPException) as exc_info:
            respond_to_friend_request(session, "uid-outsider", friendship.id, FriendshipResponseStatus.ACCEPTED)

        assert exc_info.value.status_code == 400

    def test_friend_request_not_found(self, session):
        make_user(session, firebase_uid="uid-addr-4", username="addr4", steam_id="501")
        fake_friendship_id = uuid.uuid4()

        with pytest.raises(HTTPException) as exc_info:
            respond_to_friend_request(session, "uid-addr-4", fake_friendship_id, FriendshipResponseStatus.ACCEPTED)

        assert exc_info.value.status_code == 404


class TestResponseFriendRouter:
    """Integration tests for POST /users/response_friend"""

    def test_response_friend_accept_via_router(self, client, session):
        addressee = make_user(session, firebase_uid="firebase-uid-1", username="authed_resp", steam_id="601")
        requester = make_user(session, firebase_uid="uid-req-router", username="reqrouter", steam_id="602")

        friendship = Friendship(
            requester_id=requester.id,
            addressee_id=addressee.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        response = client.post(
            "/users/respond_to_friend",
            json={"friendship_id": str(friendship.id), "action": "ACCEPTED"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "Friend request accepted"
