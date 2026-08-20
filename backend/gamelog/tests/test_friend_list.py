from fastapi.testclient import TestClient
from sqlmodel import Session

from src.models import Friendship, FriendshipStatus
from src.users import user_service
from src.users.schemas import FriendshipStatus as APIFriendshipStatus
from tests.conftest import make_user


class TestFriendList:
    ENDPOINT = "/users/friend_list"

    def test_requires_auth(self):
        from src.main import app as _app

        _app.dependency_overrides.clear()

        plain_client = TestClient(_app, raise_server_exceptions=False)
        response = plain_client.get(self.ENDPOINT)
        assert response.status_code == 401

    def test_get_friend_list_returns_accepted_and_pending_incoming(self, client, session: Session):
        # Current user (fake auth has uid="firebase-uid-1")
        me = make_user(session, firebase_uid="firebase-uid-1", username="me", steam_id="111")

        # 1. Accepted friend where current user is requester
        friend_acc_req = make_user(session, firebase_uid="uid-acc-req", username="acc_req_user", steam_id="222")
        f_acc_req = Friendship(requester_id=me.id, addressee_id=friend_acc_req.id, status=FriendshipStatus.ACCEPTED)
        session.add(f_acc_req)

        # 2. Accepted friend where current user is addressee
        friend_acc_add = make_user(session, firebase_uid="uid-acc-add", username="acc_add_user", steam_id="333")
        f_acc_add = Friendship(requester_id=friend_acc_add.id, addressee_id=me.id, status=FriendshipStatus.ACCEPTED)
        session.add(f_acc_add)

        # 3. Pending incoming friend request (addressee_id == me.id)
        friend_pend_inc = make_user(session, firebase_uid="uid-pend-inc", username="pend_inc_user", steam_id="444")
        f_pend_inc = Friendship(requester_id=friend_pend_inc.id, addressee_id=me.id, status=FriendshipStatus.PENDING)
        session.add(f_pend_inc)

        # 4. Pending outgoing friend request (requester_id == me.id) - SHOULD BE EXCLUDED
        friend_pend_out = make_user(session, firebase_uid="uid-pend-out", username="pend_out_user", steam_id="555")
        f_pend_out = Friendship(requester_id=me.id, addressee_id=friend_pend_out.id, status=FriendshipStatus.PENDING)
        session.add(f_pend_out)

        # 5. Blocked relationship - SHOULD BE EXCLUDED
        friend_blocked = make_user(session, firebase_uid="uid-blocked", username="blocked_user", steam_id="666")
        f_blocked = Friendship(requester_id=me.id, addressee_id=friend_blocked.id, status=FriendshipStatus.BLOCKED)
        session.add(f_blocked)

        # 6. Unrelated user - SHOULD BE EXCLUDED
        make_user(session, firebase_uid="uid-unrelated", username="unrelated_user", steam_id="777")

        session.commit()

        # Call endpoint via API client
        response = client.get(self.ENDPOINT)
        assert response.status_code == 200
        data = response.json()

        # Check total count
        assert len(data) == 3

        results_by_name = {item["user"]["username"]: item for item in data}

        assert "acc_req_user" in results_by_name
        assert results_by_name["acc_req_user"]["friendship"]["friendship_status"] == APIFriendshipStatus.ACCEPTED.value
        assert results_by_name["acc_req_user"]["friendship"]["friendship_requester_id"] == str(me.id)

        assert "acc_add_user" in results_by_name
        assert results_by_name["acc_add_user"]["friendship"]["friendship_status"] == APIFriendshipStatus.ACCEPTED.value
        assert results_by_name["acc_add_user"]["friendship"]["friendship_requester_id"] == str(friend_acc_add.id)

        assert "pend_inc_user" in results_by_name
        assert results_by_name["pend_inc_user"]["friendship"]["friendship_status"] == APIFriendshipStatus.PENDING_INCOMING.value
        assert results_by_name["pend_inc_user"]["friendship"]["friendship_requester_id"] == str(friend_pend_inc.id)

        # Ensure excluded users are not present
        assert "pend_out_user" not in results_by_name
        assert "blocked_user" not in results_by_name
        assert "unrelated_user" not in results_by_name

    def test_direct_service_call(self, session: Session):
        me = make_user(session, firebase_uid="direct-uid-1", username="direct_me", steam_id="888")
        other = make_user(session, firebase_uid="direct-uid-2", username="direct_other", steam_id="999")

        # Create incoming pending request
        f = Friendship(requester_id=other.id, addressee_id=me.id, status=FriendshipStatus.PENDING)
        session.add(f)
        session.commit()

        results = user_service.get_friend_list(session, "direct-uid-1")
        assert len(results) == 1
        assert results[0].user.id == other.id
        assert results[0].friendship.friendship_status == APIFriendshipStatus.PENDING_INCOMING
