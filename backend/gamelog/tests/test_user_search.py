import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.models import User, Friendship, FriendshipStatus
from src.users.schemas import FrienshipStatus
from tests.conftest import make_user


class TestUserSearch:
    ENDPOINT = "/users/search"

    def test_requires_auth(self):
        from src.main import app as _app
        _app.dependency_overrides.clear()

        plain_client = TestClient(_app, raise_server_exceptions=False)
        response = plain_client.get(self.ENDPOINT, params={"q": "test"})
        assert response.status_code == 401

    def test_search_excludes_self(self, client, session: Session):
        # Current user (fake auth has uid="firebase-uid-1")
        self_user = make_user(session, firebase_uid="firebase-uid-1", username="alice_self", steam_id="111")
        # Other user
        other_user = make_user(session, firebase_uid="firebase-uid-2", username="alice_other", steam_id="222")

        response = client.get(self.ENDPOINT, params={"q": "alice"})
        assert response.status_code == 200
        data = response.json()

        # Should only find the other user, not self
        assert len(data) == 1
        assert data[0]["user"]["username"] == "alice_other"
        assert data[0]["user"]["id"] == str(other_user.id)

    def test_case_insensitive_and_partial_matching(self, client, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="current_user", steam_id="111")
        user1 = make_user(session, firebase_uid="firebase-uid-2", username="JohnDoe", steam_id="222")
        user2 = make_user(session, firebase_uid="firebase-uid-3", username="johnny", steam_id="333")
        user3 = make_user(session, firebase_uid="firebase-uid-4", username="steve", steam_id="444")

        # Search for "jOhn" (case-insensitive and partial match)
        response = client.get(self.ENDPOINT, params={"q": "jOhn"})
        assert response.status_code == 200
        data = response.json()

        usernames = [res["user"]["username"] for res in data]
        assert len(usernames) == 2
        assert "JohnDoe" in usernames
        assert "johnny" in usernames
        assert "steve" not in usernames

    def test_friendship_statuses(self, client, session: Session):
        # Current user
        me = make_user(session, firebase_uid="firebase-uid-1", username="me", steam_id="111")

        # No relationship
        none_user = make_user(session, firebase_uid="uid-none", username="user_none", steam_id="222")

        # Request sent by current user
        sent_user = make_user(session, firebase_uid="uid-sent", username="user_sent", steam_id="333")
        f_sent = Friendship(requester_id=me.id, addressee_id=sent_user.id, status=FriendshipStatus.PENDING)
        session.add(f_sent)

        # Request received by current user
        received_user = make_user(session, firebase_uid="uid-rec", username="user_rec", steam_id="444")
        f_rec = Friendship(requester_id=received_user.id, addressee_id=me.id, status=FriendshipStatus.PENDING)
        session.add(f_rec)

        # Accepted friendship
        friend_user = make_user(session, firebase_uid="uid-friend", username="user_friend", steam_id="555")
        f_friend = Friendship(requester_id=me.id, addressee_id=friend_user.id, status=FriendshipStatus.ACCEPTED)
        session.add(f_friend)

        # Blocked relationship
        blocked_user = make_user(session, firebase_uid="uid-blocked", username="user_blocked", steam_id="666")
        f_blocked = Friendship(requester_id=me.id, addressee_id=blocked_user.id, status=FriendshipStatus.BLOCKED)
        session.add(f_blocked)

        session.commit()

        # Search all users using prefix "user_"
        # (Current user has uid="firebase-uid-1", which maps to "me")
        response = client.get(self.ENDPOINT, params={"q": "user_"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5

        # Check mapping
        results = {res["user"]["username"]: res for res in data}

        # None user
        assert results["user_none"]["friendship"]["friendship_status"] is None
        assert results["user_none"]["friendship"]["friendship_requester_id"] is None

        # Sent request
        assert results["user_sent"]["friendship"]["friendship_status"] == FrienshipStatus.PENDING_OUTGOING.value
        assert results["user_sent"]["friendship"]["friendship_requester_id"] == str(me.id)

        # Received request
        assert results["user_rec"]["friendship"]["friendship_status"] == FrienshipStatus.PENDING_INCOMING.value
        assert results["user_rec"]["friendship"]["friendship_requester_id"] == str(received_user.id)

        # Accepted friend
        assert results["user_friend"]["friendship"]["friendship_status"] == FrienshipStatus.ACCEPTED.value

        # Blocked
        assert results["user_blocked"]["friendship"]["friendship_status"] == FrienshipStatus.BLOCKED.value
