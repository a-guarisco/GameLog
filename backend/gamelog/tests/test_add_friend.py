"""
Tests for the send_friend_request service function and /users/add_friend endpoint.

Scenarios:
1. Happy path – friend request created successfully
2. Cannot add yourself
3. Addressee does not exist
4. Duplicate pending request (requester -> addressee)
5. Duplicate pending request (addressee -> requester, reverse direction)
6. Already accepted friendship
7. Blocked friendship – requester blocked addressee
8. Blocked friendship – addressee blocked requester
9. Router integration test – POST /users/add_friend
10. Router integration – addressee not found returns 404
"""

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
from src.users.user_service import send_friend_request
from tests.conftest import make_user


class TestSendFriendRequest:
    """Unit tests for user_service.send_friend_request"""

    # ------------------------------------------------------------------
    # Happy path
    # ------------------------------------------------------------------

    @pytest.mark.anyio
    async def test_sends_friend_request_successfully(self, session):
        requester = make_user(session, firebase_uid="uid-req", username="requester", steam_id="100")
        addressee = make_user(session, firebase_uid="uid-addr", username="addressee", steam_id="200")

        result = await send_friend_request(session, "uid-req", addressee.id)

        assert result["message"] == "Friend request sent"
        assert "friendship_id" in result

        # Verify the friendship was persisted
        friendship = session.get(Friendship, uuid.UUID(result["friendship_id"]))
        assert friendship is not None
        assert friendship.requester_id == requester.id
        assert friendship.addressee_id == addressee.id
        assert friendship.status == FriendshipStatus.PENDING

    # ------------------------------------------------------------------
    # Self-add
    # ------------------------------------------------------------------

    @pytest.mark.anyio
    async def test_cannot_add_yourself(self, session):
        user = make_user(session, firebase_uid="uid-self", username="selfuser", steam_id="300")

        with pytest.raises(HTTPException) as exc_info:
            await send_friend_request(session, "uid-self", user.id)

        assert exc_info.value.status_code == 400
        assert "yourself" in exc_info.value.detail.lower()

    # ------------------------------------------------------------------
    # Non-existing addressee
    # ------------------------------------------------------------------

    @pytest.mark.anyio
    async def test_addressee_not_found(self, session):
        make_user(session, firebase_uid="uid-lonely", username="lonely", steam_id="400")
        fake_id = uuid.uuid4()

        with pytest.raises(HTTPException) as exc_info:
            await send_friend_request(session, "uid-lonely", fake_id)

        assert exc_info.value.status_code == 404
        assert "addressee" in exc_info.value.detail.lower()

    # ------------------------------------------------------------------
    # Duplicate pending (same direction)
    # ------------------------------------------------------------------

    @pytest.mark.anyio
    async def test_duplicate_pending_same_direction(self, session):
        make_user(session, firebase_uid="uid-dup-req", username="dupreq", steam_id="500")
        addressee = make_user(session, firebase_uid="uid-dup-addr", username="dupaddr", steam_id="600")

        # First request succeeds
        await send_friend_request(session, "uid-dup-req", addressee.id)

        # Second request should fail
        with pytest.raises(HTTPException) as exc_info:
            await send_friend_request(session, "uid-dup-req", addressee.id)

        assert exc_info.value.status_code == 409
        assert "pending" in exc_info.value.detail.lower()

    # ------------------------------------------------------------------
    # Duplicate pending (reverse direction)
    # ------------------------------------------------------------------

    @pytest.mark.anyio
    async def test_duplicate_pending_reverse_direction(self, session):
        user_a = make_user(session, firebase_uid="uid-rev-a", username="reva", steam_id="700")
        user_b = make_user(session, firebase_uid="uid-rev-b", username="revb", steam_id="800")

        # B sends request to A
        await send_friend_request(session, "uid-rev-b", user_a.id)

        # A tries to send request to B – should fail (pending already exists)
        with pytest.raises(HTTPException) as exc_info:
            await send_friend_request(session, "uid-rev-a", user_b.id)

        assert exc_info.value.status_code == 409
        assert "pending" in exc_info.value.detail.lower()

    # ------------------------------------------------------------------
    # Already accepted
    # ------------------------------------------------------------------

    @pytest.mark.anyio
    async def test_already_accepted_friendship(self, session):
        requester = make_user(session, firebase_uid="uid-acc-req", username="accreq", steam_id="900")
        addressee = make_user(session, firebase_uid="uid-acc-addr", username="accaddr", steam_id="1000")

        # Create an already accepted friendship
        friendship = Friendship(
            requester_id=requester.id,
            addressee_id=addressee.id,
            status=FriendshipStatus.ACCEPTED,
        )
        session.add(friendship)
        session.commit()

        with pytest.raises(HTTPException) as exc_info:
            await send_friend_request(session, "uid-acc-req", addressee.id)

        assert exc_info.value.status_code == 409
        assert "already friends" in exc_info.value.detail.lower()

    # ------------------------------------------------------------------
    # Blocked friendship (blocker can change mind and re-send)
    # ------------------------------------------------------------------

    @pytest.mark.anyio
    async def test_blocked_by_requester(self, session):
        requester = make_user(session, firebase_uid="uid-blk-req", username="blkreq", steam_id="1100")
        addressee = make_user(session, firebase_uid="uid-blk-addr", username="blkaddr", steam_id="1200")

        # Requester is the blocker, addressee is blocked.
        # In our model, requester_id stores the blocked user, and addressee_id stores the blocker.
        friendship = Friendship(
            requester_id=addressee.id,
            addressee_id=requester.id,
            status=FriendshipStatus.BLOCKED,
        )
        session.add(friendship)
        session.commit()

        result = await send_friend_request(session, "uid-blk-req", addressee.id)

        assert result["message"] == "Friend request sent"
        # Verify the old friendship block was deleted
        assert session.get(Friendship, friendship.id) is None
        # Verify a new pending friendship request was created
        new_friendship = session.get(Friendship, uuid.UUID(result["friendship_id"]))
        assert new_friendship is not None
        assert new_friendship.status == FriendshipStatus.PENDING
        assert new_friendship.requester_id == requester.id
        assert new_friendship.addressee_id == addressee.id

    # ------------------------------------------------------------------
    # Blocked friendship (addressee blocked requester)
    # ------------------------------------------------------------------

    @pytest.mark.anyio
    async def test_blocked_by_addressee(self, session):
        user_a = make_user(session, firebase_uid="uid-blk-a", username="blka", steam_id="1300")
        user_b = make_user(session, firebase_uid="uid-blk-b", username="blkb", steam_id="1400")

        # B (user_b) has blocked A (user_a).
        # In our model, requester_id stores the blocked user (user_a), and addressee_id stores the blocker (user_b).
        friendship = Friendship(
            requester_id=user_a.id,
            addressee_id=user_b.id,
            status=FriendshipStatus.BLOCKED,
        )
        session.add(friendship)
        session.commit()

        # A tries to send request to B – should be blocked
        with pytest.raises(HTTPException) as exc_info:
            await send_friend_request(session, "uid-blk-a", user_b.id)

        assert exc_info.value.status_code == 403
        assert "cannot send" in exc_info.value.detail.lower()

    # ------------------------------------------------------------------
    # Requester not found
    # ------------------------------------------------------------------

    @pytest.mark.anyio
    async def test_requester_not_found(self, session):
        addressee = make_user(session, firebase_uid="uid-addr-only", username="addronly", steam_id="1500")

        with pytest.raises(HTTPException) as exc_info:
            await send_friend_request(session, "uid-nonexistent", addressee.id)

        assert exc_info.value.status_code == 404


class TestAddFriendRouter:
    """Integration tests for POST /users/add_friend"""

    def test_add_friend_via_router(self, client, session):
        # The client fixture uses firebase-uid-1 as the auth user
        make_user(session, firebase_uid="firebase-uid-1", username="authed", steam_id="2000")
        addressee = make_user(session, firebase_uid="uid-router-addr", username="routeraddr", steam_id="2100")

        response = client.post("/users/add_friend", json={"addressee_id": str(addressee.id)})

        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "Friend request sent"
        assert "friendship_id" in data

    def test_add_friend_not_found_via_router(self, client, session):
        make_user(session, firebase_uid="firebase-uid-1", username="authed2", steam_id="2200")

        response = client.post("/users/add_friend", json={"addressee_id": str(uuid.uuid4())})

        assert response.status_code == 404

    def test_add_friend_self_via_router(self, client, session):
        user = make_user(session, firebase_uid="firebase-uid-1", username="selfrouter", steam_id="2300")

        response = client.post("/users/add_friend", json={"addressee_id": str(user.id)})

        assert response.status_code == 400

    def test_add_friend_duplicate_via_router(self, client, session):
        make_user(session, firebase_uid="firebase-uid-1", username="duprouter", steam_id="2400")
        addressee = make_user(session, firebase_uid="uid-dup-router", username="duprouteraddr", steam_id="2500")

        # First request succeeds
        response1 = client.post("/users/add_friend", json={"addressee_id": str(addressee.id)})
        assert response1.status_code == 201

        # Second request should return 409
        response2 = client.post("/users/add_friend", json={"addressee_id": str(addressee.id)})
        assert response2.status_code == 409
