import uuid
from datetime import UTC, datetime
from fastapi import HTTPException, status
from firebase_admin import messaging
from sqlmodel import Session, select
from sqlalchemy import false
from sqlalchemy.exc import IntegrityError
from src.models.device_token import DeviceToken
from src.models.notification import Notification
from src.users import user_service


def register_device_token(
    session: Session,
    firebase_uid: str,
    token: str,
    device_type: str = "android",
) -> DeviceToken:
    """
    Register a new device token for the authenticated user that made the request.
    """
    user = user_service.get_user_by_firebase_uid(session, firebase_uid)

    existing_token = session.exec(
        select(DeviceToken).where(DeviceToken.device_token == token)
    ).first()

    if existing_token:
        return _update_existing_token(session, existing_token, user.id, device_type)

    new_device_token = DeviceToken(
        device_token=token,
        user_id=user.id,
        device_type=device_type,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    session.add(new_device_token)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        existing_token = session.exec(
            select(DeviceToken).where(DeviceToken.device_token == token)
        ).first()
        if existing_token:
            return _update_existing_token(session, existing_token, user.id, device_type)
        raise session.refresh(new_device_token)
    return new_device_token

def _update_existing_token(session: Session, existing_token: DeviceToken, user_id: uuid.UUID, device_type: str) -> DeviceToken:
    existing_token.user_id = user_id
    existing_token.device_type = device_type
    existing_token.updated_at = datetime.now(UTC)
    session.add(existing_token)
    session.commit()
    session.refresh(existing_token)
    return existing_token


def unregister_device_token(session: Session, firebase_uid: str, token: str) -> None:
    """
    Delete the token from the database if the authenticated user owns it.
    """
    user = user_service.get_user_by_firebase_uid(session, firebase_uid)

    existing_token = session.exec(
        select(DeviceToken).where(DeviceToken.device_token == token)
    ).first()

    if not existing_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device token not found",
        )

    if existing_token.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not owner of this token",
        )

    session.delete(existing_token)
    session.commit()


def send_notification_to_user(
    session: Session,
    target_user_id: uuid.UUID,
    title: str,
    body: str,
    data: dict | None = None,
) -> Notification:
    """
    Save notification record into PostgreSQL DB and send FCM push notification to user's registered device tokens.
    """
    new_notification = Notification(
        user_id=target_user_id,
        title=title,
        body=body,
        data=data,
        is_read=False,
        created_at=datetime.now(UTC),
    )
    session.add(new_notification)
    session.commit()
    session.refresh(new_notification)

    device_tokens = session.exec(
        select(DeviceToken).where(DeviceToken.user_id == target_user_id)
    ).all()

    if device_tokens:
        tokens = [dt.device_token for dt in device_tokens]
        string_data = {str(k): str(v) for k, v in (data or {}).items()}

        try:
            multicast_msg = messaging.MulticastMessage(
                notification=messaging.Notification(title=title, body=body),
                data=string_data,
                tokens=tokens,
            )
            response = messaging.send_each_for_multicast(multicast_msg)

            if response.failure_count > 0:
                stale_tokens: list[str] = []
                for idx, resp in enumerate(response.responses):
                    if not resp.success:
                        err_str = str(resp.exception) if resp.exception else ""
                        print(
                            f"[FCM Error] Failed to send push notification to token {tokens[idx]}: {err_str}",
                            flush=True,
                        )
                        if (
                            isinstance(resp.exception, messaging.UnregisteredError)
                            or "not-registered" in err_str.lower()
                            or "unregistered" in err_str.lower()
                        ):
                            stale_tokens.append(tokens[idx])

                if stale_tokens:
                    for st in stale_tokens:
                        st_obj = session.exec(
                            select(DeviceToken).where(DeviceToken.device_token == st)
                        ).first()
                        if st_obj:
                            print(f"[FCM Info] Deleting unregistered stale token: {st}", flush=True)
                            session.delete(st_obj)
                    session.commit()
        except Exception as e:
            print(f"[FCM Warning] Could not dispatch push notification: {e}", flush=True)

    return new_notification


def get_user_notifications(
    session: Session,
    firebase_uid: str,
    limit: int = 20,
    offset: int = 0,
) -> list[Notification]:
    """
    Fetch paginated notifications for the authenticated user.
    """
    user = user_service.get_user_by_firebase_uid(session, firebase_uid)

    statement = (
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(session.exec(statement).all())


def mark_as_read(
    session: Session,
    firebase_uid: str,
    notification_id: uuid.UUID,
) -> Notification:
    """
    Mark a single notification as read.
    """
    user = user_service.get_user_by_firebase_uid(session, firebase_uid)

    notification = session.get(Notification, notification_id)
    if not notification or notification.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    notification.is_read = True
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


def mark_all_as_read(session: Session, firebase_uid: str) -> dict[str, str]:
    """
    Mark all notifications for the authenticated user as read.
    """
    user = user_service.get_user_by_firebase_uid(session, firebase_uid)

    statement = select(Notification).where(
        Notification.user_id == user.id,
        Notification.is_read == false(),
    )
    notifications = session.exec(statement).all()
    for notif in notifications:
        notif.is_read = True
        session.add(notif)
    session.commit()

    return {"message": "All notifications marked as read"}