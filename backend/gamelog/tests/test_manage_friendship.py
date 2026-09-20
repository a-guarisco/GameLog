import os

import pytest
from fastapi import HTTPException

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", "/tmp/dummy_credentials.json")
os.environ.setdefault("USE_FIREBASE_EMULATOR", "true")
os.environ.setdefault("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")
os.environ.setdefault("RUN_SCHEDULER", "false")

from sqlmodel import select

from src.models import Friendship, FriendshipStatus
from src.users.schemas import FriendshipManageAction, FriendshipManageRequest
from src.users.user_service import manage_friendship, search_users_by_username, send_friend_request
from tests.conftest import make_user


class TestManageFriendship:
    # ------------------------------------------------------------------
    # 1. Accept Incoming Request
    # ------------------------------------------------------------------
    def test_accept_incoming_request(self, session):
        sender = make_user(session, firebase_uid="uid-sender", username="sender", steam_id="101")
        recipient = make_user(session, firebase_uid="uid-recipient", username="recipient", steam_id="102")

        friendship = Friendship(
            requester_id=sender.id,
            addressee_id=recipient.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        payload = FriendshipManageRequest(action=FriendshipManageAction.ACCEPT, friendship_id=friendship.id)
        result = manage_friendship(session, "uid-recipient", payload)
        assert result["message"] == "Friend request accepted"

        updated = session.get(Friendship, friendship.id)
        assert updated.status == FriendshipStatus.ACCEPTED

    def test_accept_by_sender_fails(self, session):
        sender = make_user(session, firebase_uid="uid-sender-2", username="sender2", steam_id="201")
        recipient = make_user(session, firebase_uid="uid-recipient-2", username="recipient2", steam_id="202")

        friendship = Friendship(
            requester_id=sender.id,
            addressee_id=recipient.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        payload = FriendshipManageRequest(action=FriendshipManageAction.ACCEPT, friendship_id=friendship.id)
        with pytest.raises(HTTPException) as exc:
            manage_friendship(session, "uid-sender-2", payload)
        assert exc.value.status_code == 400
        assert "addressee" in exc.value.detail.lower()

    # ------------------------------------------------------------------
    # 2. Reject Incoming Request
    # ------------------------------------------------------------------
    def test_reject_incoming_request(self, session):
        sender = make_user(session, firebase_uid="uid-sender-3", username="sender3", steam_id="301")
        recipient = make_user(session, firebase_uid="uid-recipient-3", username="recipient3", steam_id="302")

        friendship = Friendship(
            requester_id=sender.id,
            addressee_id=recipient.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        payload = FriendshipManageRequest(action=FriendshipManageAction.REJECT, friendship_id=friendship.id)
        result = manage_friendship(session, "uid-recipient-3", payload)
        assert result["message"] == "Friend request rejected"
        assert session.get(Friendship, friendship.id) is None

    # ------------------------------------------------------------------
    # 3. Cancel Outgoing Request
    # ------------------------------------------------------------------
    def test_cancel_outgoing_request_by_sender(self, session):
        sender = make_user(session, firebase_uid="uid-sender-4", username="sender4", steam_id="401")
        recipient = make_user(session, firebase_uid="uid-recipient-4", username="recipient4", steam_id="402")

        friendship = Friendship(
            requester_id=sender.id,
            addressee_id=recipient.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        payload = FriendshipManageRequest(action=FriendshipManageAction.CANCEL, friendship_id=friendship.id)
        result = manage_friendship(session, "uid-sender-4", payload)
        assert result["message"] == "Friend request cancelled"
        assert session.get(Friendship, friendship.id) is None

    def test_cancel_outgoing_request_by_recipient_fails(self, session):
        sender = make_user(session, firebase_uid="uid-sender-5", username="sender5", steam_id="501")
        recipient = make_user(session, firebase_uid="uid-recipient-5", username="recipient5", steam_id="502")

        friendship = Friendship(
            requester_id=sender.id,
            addressee_id=recipient.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        payload = FriendshipManageRequest(action=FriendshipManageAction.CANCEL, friendship_id=friendship.id)
        with pytest.raises(HTTPException) as exc:
            manage_friendship(session, "uid-recipient-5", payload)
        assert exc.value.status_code == 400
        assert "sender" in exc.value.detail.lower()

    # ------------------------------------------------------------------
    # 4. Remove Established Friend
    # ------------------------------------------------------------------
    def test_remove_friend_by_either_user(self, session):
        user_a = make_user(session, firebase_uid="uid-fa", username="fa", steam_id="601")
        user_b = make_user(session, firebase_uid="uid-fb", username="fb", steam_id="602")

        friendship = Friendship(
            requester_id=user_a.id,
            addressee_id=user_b.id,
            status=FriendshipStatus.ACCEPTED,
        )
        session.add(friendship)
        session.commit()

        payload = FriendshipManageRequest(action=FriendshipManageAction.REMOVE, friendship_id=friendship.id)
        result = manage_friendship(session, "uid-fb", payload)
        assert result["message"] == "Friend removed"
        assert session.get(Friendship, friendship.id) is None

    # ------------------------------------------------------------------
    # 5. Block User (No prior relation, pending, or accepted)
    # ------------------------------------------------------------------
    def test_block_user_without_prior_relationship(self, session):
        blocker = make_user(session, firebase_uid="uid-blk-1", username="blk1", steam_id="701")
        target = make_user(session, firebase_uid="uid-tgt-1", username="tgt1", steam_id="702")

        payload = FriendshipManageRequest(action=FriendshipManageAction.BLOCK, target_user_id=target.id)
        result = manage_friendship(session, "uid-blk-1", payload)
        assert result["message"] == "User blocked"

        # Verify block record
        friendships = session.exec(select(Friendship)).all()
        created = [f for f in friendships if f.requester_id == blocker.id and f.addressee_id == target.id]
        assert len(created) == 1
        assert created[0].status == FriendshipStatus.BLOCKED

    def test_block_pending_incoming_request(self, session):
        sender = make_user(session, firebase_uid="uid-snd-blk", username="sndblk", steam_id="801")
        recipient = make_user(session, firebase_uid="uid-rcp-blk", username="rcpblk", steam_id="802")

        friendship = Friendship(
            requester_id=sender.id,
            addressee_id=recipient.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        # Recipient blocks sender
        payload = FriendshipManageRequest(action=FriendshipManageAction.BLOCK, friendship_id=friendship.id)
        result = manage_friendship(session, "uid-rcp-blk", payload)
        assert result["message"] == "User blocked"

        updated = session.get(Friendship, friendship.id)
        assert updated.status == FriendshipStatus.BLOCKED
        assert updated.requester_id == recipient.id  # Blocker is now requester
        assert updated.addressee_id == sender.id

    def test_block_pending_outgoing_request(self, session):
        sender = make_user(session, firebase_uid="uid-snd-blk2", username="sndblk2", steam_id="901")
        recipient = make_user(session, firebase_uid="uid-rcp-blk2", username="rcpblk2", steam_id="902")

        friendship = Friendship(
            requester_id=sender.id,
            addressee_id=recipient.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        # Sender blocks recipient
        payload = FriendshipManageRequest(action=FriendshipManageAction.BLOCK, friendship_id=friendship.id)
        result = manage_friendship(session, "uid-snd-blk2", payload)
        assert result["message"] == "User blocked"

        updated = session.get(Friendship, friendship.id)
        assert updated.status == FriendshipStatus.BLOCKED
        assert updated.requester_id == sender.id
        assert updated.addressee_id == recipient.id

    def test_block_accepted_friend(self, session):
        user_a = make_user(session, firebase_uid="uid-acc-blk-a", username="accblka", steam_id="1001")
        user_b = make_user(session, firebase_uid="uid-acc-blk-b", username="accblkb", steam_id="1002")

        friendship = Friendship(
            requester_id=user_a.id,
            addressee_id=user_b.id,
            status=FriendshipStatus.ACCEPTED,
        )
        session.add(friendship)
        session.commit()

        # User B blocks User A
        payload = FriendshipManageRequest(action=FriendshipManageAction.BLOCK, friendship_id=friendship.id)
        result = manage_friendship(session, "uid-acc-blk-b", payload)
        assert result["message"] == "User blocked"

        updated = session.get(Friendship, friendship.id)
        assert updated.status == FriendshipStatus.BLOCKED
        assert updated.requester_id == user_b.id  # Blocker is requester
        assert updated.addressee_id == user_a.id

    # ------------------------------------------------------------------
    # 6. Unblock User
    # ------------------------------------------------------------------
    def test_unblock_by_blocker_succeeds(self, session):
        blocker = make_user(session, firebase_uid="uid-ublk-1", username="ublk1", steam_id="1101")
        blocked = make_user(session, firebase_uid="uid-ublk-2", username="ublk2", steam_id="1102")

        friendship = Friendship(
            requester_id=blocker.id,
            addressee_id=blocked.id,
            status=FriendshipStatus.BLOCKED,
        )
        session.add(friendship)
        session.commit()

        payload = FriendshipManageRequest(action=FriendshipManageAction.UNBLOCK, friendship_id=friendship.id)
        result = manage_friendship(session, "uid-ublk-1", payload)
        assert result["message"] == "User unblocked"
        assert session.get(Friendship, friendship.id) is None

    def test_unblock_by_blocked_user_fails(self, session):
        blocker = make_user(session, firebase_uid="uid-ublk-3", username="ublk3", steam_id="1201")
        blocked = make_user(session, firebase_uid="uid-ublk-4", username="ublk4", steam_id="1202")

        friendship = Friendship(
            requester_id=blocker.id,
            addressee_id=blocked.id,
            status=FriendshipStatus.BLOCKED,
        )
        session.add(friendship)
        session.commit()

        payload = FriendshipManageRequest(action=FriendshipManageAction.UNBLOCK, friendship_id=friendship.id)
        with pytest.raises(HTTPException) as exc:
            manage_friendship(session, "uid-ublk-4", payload)
        assert exc.value.status_code == 403
        assert "blocker" in exc.value.detail.lower()

    # ------------------------------------------------------------------
    # 7. Blocker sending friend request to blocked user
    # ------------------------------------------------------------------
    def test_blocker_can_send_friend_request_to_blocked_user(self, session):
        blocker = make_user(session, firebase_uid="uid-readd-1", username="readd1", steam_id="1301")
        blocked = make_user(session, firebase_uid="uid-readd-2", username="readd2", steam_id="1302")

        friendship = Friendship(
            requester_id=blocker.id,
            addressee_id=blocked.id,
            status=FriendshipStatus.BLOCKED,
        )
        session.add(friendship)
        session.commit()

        # Blocker sends friend request to blocked user
        result = send_friend_request(session, "uid-readd-1", blocked.id)
        assert result["message"] == "Friend request sent"

        updated = session.get(Friendship, friendship.id)
        assert updated.status == FriendshipStatus.PENDING
        assert updated.requester_id == blocker.id
        assert updated.addressee_id == blocked.id

    def test_blocked_user_cannot_send_friend_request_to_blocker(self, session):
        blocker = make_user(session, firebase_uid="uid-readd-3", username="readd3", steam_id="1401")
        blocked = make_user(session, firebase_uid="uid-readd-4", username="readd4", steam_id="1402")

        friendship = Friendship(
            requester_id=blocker.id,
            addressee_id=blocked.id,
            status=FriendshipStatus.BLOCKED,
        )
        session.add(friendship)
        session.commit()

        with pytest.raises(HTTPException) as exc:
            send_friend_request(session, "uid-readd-4", blocker.id)
        assert exc.value.status_code == 403

    # ------------------------------------------------------------------
    # 8. User Search Visibility for Blocked Users
    # ------------------------------------------------------------------
    def test_search_hides_blocker_from_blocked_user(self, session):
        blocker = make_user(session, firebase_uid="uid-srch-blk", username="blocker_sam", steam_id="1501")
        blocked = make_user(session, firebase_uid="uid-srch-bld", username="blocked_joe", steam_id="1502")

        friendship = Friendship(
            requester_id=blocker.id,
            addressee_id=blocked.id,
            status=FriendshipStatus.BLOCKED,
        )
        session.add(friendship)
        session.commit()

        # Blocker searches for blocked user: should see them as blocked
        res_blocker = search_users_by_username(session, "joe", "uid-srch-blk")
        assert len(res_blocker) == 1
        assert res_blocker[0].user.username == "blocked_joe"
        assert res_blocker[0].friendship.friendship_status.value == "blocked"
        assert res_blocker[0].friendship.friendship_requester_id == blocker.id

        # Blocked user searches for blocker: should NOT see them
        res_blocked = search_users_by_username(session, "sam", "uid-srch-bld")
        assert len(res_blocked) == 0


class TestManageFriendshipRouter:
    def test_manage_friendship_endpoint(self, client, session):
        user_a = make_user(session, firebase_uid="firebase-uid-1", username="current_api_user", steam_id="1601")
        user_b = make_user(session, firebase_uid="uid-api-other", username="other_api_user", steam_id="1602")

        # 1. Send friend request from B to A
        friendship = Friendship(
            requester_id=user_b.id,
            addressee_id=user_a.id,
            status=FriendshipStatus.PENDING,
        )
        session.add(friendship)
        session.commit()

        # 2. Accept via POST /users/manage_friendship
        res = client.post(
            "/users/manage_friendship",
            json={"action": "ACCEPT", "friendship_id": str(friendship.id)},
        )
        assert res.status_code == 200
        assert res.json()["message"] == "Friend request accepted"

        # 3. Block via POST /users/manage_friendship
        res_block = client.post(
            "/users/manage_friendship",
            json={"action": "BLOCK", "friendship_id": str(friendship.id)},
        )
        assert res_block.status_code == 200
        assert res_block.json()["message"] == "User blocked"

        # 4. Unblock via POST /users/manage_friendship
        res_unblock = client.post(
            "/users/manage_friendship",
            json={"action": "UNBLOCK", "friendship_id": str(friendship.id)},
        )
        assert res_unblock.status_code == 200
        assert res_unblock.json()["message"] == "User unblocked"
