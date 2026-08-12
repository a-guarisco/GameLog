import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.core.database import get_db
from src.users import notifications_service
from src.users.schemas import (
    NotificationRead,
    RegisterDeviceRequest,
    UnregisterDeviceRequest,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post(
    "/register_device",
    summary="Register a new device token for the authenticated user",
    status_code=status.HTTP_201_CREATED,
)
def register_device(
    payload: RegisterDeviceRequest,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notifications_service.register_device_token(
        session=db,
        firebase_uid=auth_user.uid,
        token=payload.token,
        device_type=payload.device_type,
    )


@router.delete(
    "/unregister_device",
    summary="Unregister a device token for the authenticated user",
    status_code=status.HTTP_204_NO_CONTENT,
)
def unregister_device(
    payload: UnregisterDeviceRequest,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifications_service.unregister_device_token(
        session=db,
        firebase_uid=auth_user.uid,
        token=payload.token,
    )


@router.get(
    "",
    response_model=list[NotificationRead],
    summary="Get notification history for authenticated user",
)
def get_notifications(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notifications_service.get_user_notifications(
        session=db,
        firebase_uid=auth_user.uid,
        limit=limit,
        offset=offset,
    )


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationRead,
    summary="Mark a specific notification as read",
)
def mark_notification_read(
    notification_id: uuid.UUID,
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notifications_service.mark_as_read(
        session=db,
        firebase_uid=auth_user.uid,
        notification_id=notification_id,
    )


@router.post(
    "/read_all",
    summary="Mark all notifications for authenticated user as read",
)
def mark_all_notifications_read(
    auth_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notifications_service.mark_all_as_read(
        session=db,
        firebase_uid=auth_user.uid,
    )