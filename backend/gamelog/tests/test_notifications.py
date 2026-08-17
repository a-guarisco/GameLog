import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from src.models import DeviceToken
from src.users import notifications_service
from tests.conftest import make_user


def test_register_device_token_new(session):
    user = make_user(session, firebase_uid="uid-1")
    token_obj = notifications_service.register_device_token(
        session=session,
        firebase_uid="uid-1",
        token="token-abc",
        device_type="android",
    )
    assert token_obj.device_token == "token-abc"
    assert token_obj.user_id == user.id
    assert token_obj.device_type == "android"


def test_register_device_token_update(session):
    user1 = make_user(session, firebase_uid="uid-1", username="user1", steam_id="s1")
    user2 = make_user(session, firebase_uid="uid-2", username="user2", steam_id="s2")

    token1 = notifications_service.register_device_token(
        session=session,
        firebase_uid="uid-1",
        token="token-shared",
        device_type="android",
    )
    assert token1.user_id == user1.id

    token2 = notifications_service.register_device_token(
        session=session,
        firebase_uid="uid-2",
        token="token-shared",
        device_type="ios",
    )
    assert token2.user_id == user2.id
    assert token2.device_type == "ios"


def test_unregister_device_token_success(session):
    make_user(session, firebase_uid="uid-1")
    notifications_service.register_device_token(
        session=session,
        firebase_uid="uid-1",
        token="token-to-delete",
    )

    notifications_service.unregister_device_token(
        session=session,
        firebase_uid="uid-1",
        token="token-to-delete",
    )

    deleted = session.exec(
        notifications_service.select(DeviceToken).where(
            DeviceToken.device_token == "token-to-delete"
        )
    ).first()
    assert deleted is None


def test_unregister_device_token_not_found(session):
    make_user(session, firebase_uid="uid-1")
    with pytest.raises(HTTPException) as exc_info:
        notifications_service.unregister_device_token(
            session=session,
            firebase_uid="uid-1",
            token="non-existent-token",
        )
    assert exc_info.value.status_code == 404


def test_unregister_device_token_not_owner(session):
    make_user(session, firebase_uid="uid-1", username="u1", steam_id="s1")
    make_user(session, firebase_uid="uid-2", username="u2", steam_id="s2")

    notifications_service.register_device_token(
        session=session,
        firebase_uid="uid-1",
        token="token-owner-1",
    )

    with pytest.raises(HTTPException) as exc_info:
        notifications_service.unregister_device_token(
            session=session,
            firebase_uid="uid-2",
            token="token-owner-1",
        )
    assert exc_info.value.status_code == 403


def test_send_notification_to_user_without_tokens(session):
    user = make_user(session, firebase_uid="uid-1")
    notif = notifications_service.send_notification_to_user(
        session=session,
        target_user_id=user.id,
        title="Test Title",
        body="Test Body",
        data={"type": "test"},
    )
    assert notif.title == "Test Title"
    assert notif.body == "Test Body"
    assert notif.data == {"type": "test"}
    assert notif.is_read is False


@patch("src.users.notifications_service.messaging.send_each_for_multicast")
def test_send_notification_to_user_with_tokens(mock_send, session):
    user = make_user(session, firebase_uid="uid-1")
    notifications_service.register_device_token(
        session=session,
        firebase_uid="uid-1",
        token="device-token-123",
    )

    mock_response = MagicMock()
    mock_response.failure_count = 0
    mock_send.return_value = mock_response

    notif = notifications_service.send_notification_to_user(
        session=session,
        target_user_id=user.id,
        title="Friend Request",
        body="John sent a request",
        data={"friendship_id": "123"},
    )
    assert notif.title == "Friend Request"
    assert mock_send.called


def test_get_user_notifications(session):
    user = make_user(session, firebase_uid="uid-1")
    notif1 = notifications_service.send_notification_to_user(
        session=session,
        target_user_id=user.id,
        title="Notif 1",
        body="Body 1",
    )
    notif2 = notifications_service.send_notification_to_user(
        session=session,
        target_user_id=user.id,
        title="Notif 2",
        body="Body 2",
    )

    notifs = notifications_service.get_user_notifications(
        session=session,
        firebase_uid="uid-1",
        limit=10,
        offset=0,
    )
    assert len(notifs) == 2
    assert notifs[0].id in (notif1.id, notif2.id)


def test_mark_as_read(session):
    user = make_user(session, firebase_uid="uid-1")
    notif = notifications_service.send_notification_to_user(
        session=session,
        target_user_id=user.id,
        title="Unread",
        body="Unread Body",
    )
    assert notif.is_read is False

    updated = notifications_service.mark_as_read(
        session=session,
        firebase_uid="uid-1",
        notification_id=notif.id,
    )
    assert updated.is_read is True


def test_mark_as_read_not_found(session):
    make_user(session, firebase_uid="uid-1")
    with pytest.raises(HTTPException) as exc_info:
        notifications_service.mark_as_read(
            session=session,
            firebase_uid="uid-1",
            notification_id=uuid.uuid4(),
        )
    assert exc_info.value.status_code == 404


def test_mark_all_as_read(session):
    user = make_user(session, firebase_uid="uid-1")
    notifications_service.send_notification_to_user(
        session=session, target_user_id=user.id, title="1", body="1"
    )
    notifications_service.send_notification_to_user(
        session=session, target_user_id=user.id, title="2", body="2"
    )

    res = notifications_service.mark_all_as_read(session=session, firebase_uid="uid-1")
    assert res["message"] == "All notifications marked as read"

    notifs = notifications_service.get_user_notifications(
        session=session, firebase_uid="uid-1"
    )
    assert all(n.is_read for n in notifs)


# Router HTTP Endpoints Tests
def test_router_register_and_unregister_device(client, session):
    make_user(session, firebase_uid="firebase-uid-1")

    # Register
    res = client.post(
        "/notifications/register_device",
        json={"token": "router-token-1", "device_type": "android"},
    )
    assert res.status_code == 201

    # Get notifications (should be empty initially)
    res_get = client.get("/notifications/history")
    assert res_get.status_code == 200
    assert res_get.json() == []

    # Unregister
    res_unreg = client.request(
        "DELETE",
        "/notifications/unregister_device",
        json={"token": "router-token-1"},
    )
    assert res_unreg.status_code == 204


def test_router_read_endpoints(client, session):
    user = make_user(session, firebase_uid="firebase-uid-1")
    notif = notifications_service.send_notification_to_user(
        session=session,
        target_user_id=user.id,
        title="Router Notif",
        body="Router Body",
    )

    # Post read
    res_patch = client.post(f"/notifications/{notif.id}/read")
    assert res_patch.status_code == 200
    assert res_patch.json()["is_read"] is True

    # Post read_all
    res_read_all = client.post("/notifications/read_all")
    assert res_read_all.status_code == 200
    assert res_read_all.json()["message"] == "All notifications marked as read"

