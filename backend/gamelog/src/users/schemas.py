import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel
from sqlmodel import Field, SQLModel

from src.models.steam_rolling_time import SteamRollingTimeBase
from src.models.user import UserBase


# region User
class UserCreate(UserBase):
    steam_api_key: str = Field(max_length=255)


class UserRegisterRequest(SQLModel):
    username: str = Field(min_length=3, max_length=100)
    steam_id: str = Field(min_length=1, max_length=32)
    steam_api_key: str | None = Field(default="", max_length=255)


class UserRead(UserBase):
    id: uuid.UUID
    has_steam_api_key: bool = Field(default=False)


class UserMeRead(UserRead):
    steam_api_key: str


class SteamApiKeyUpdateRequest(SQLModel):
    steam_api_key: str = Field(max_length=255)


class UserUpdate(SQLModel):
    firebase_uid: str | None = Field(default=None, max_length=255)
    username: str | None = Field(default=None, max_length=100)
    steam_id: str | None = Field(default=None, max_length=32)
    steam_api_key: str | None = Field(default=None, max_length=255)


# endregion


# region Steam Rolling
class SteamRollingTimeCreate(SteamRollingTimeBase):
    user_id: uuid.UUID
    is_baseline: bool = True


class SteamRollingTimeRead(SteamRollingTimeBase):
    id: uuid.UUID
    user_id: uuid.UUID


# endregion


# region Friendship
class FriendshipStatus(str, Enum):
    PENDING_OUTGOING = "pending_outgoing"
    PENDING_INCOMING = "pending_incoming"
    ACCEPTED = "accepted"
    BLOCKED = "blocked"


class FriendshipInfo(BaseModel):
    friendship_id: uuid.UUID | None = None
    friendship_status: FriendshipStatus | None = None
    friendship_requester_id: uuid.UUID | None = None


class UserSearchResult(BaseModel):
    user: UserRead
    friendship: FriendshipInfo


class FriendshipRequest(BaseModel):
    addressee_id: uuid.UUID




class FriendshipManageAction(str, Enum):
    ACCEPT = "ACCEPT"
    REJECT = "REJECT"
    CANCEL = "CANCEL"
    REMOVE = "REMOVE"
    BLOCK = "BLOCK"
    UNBLOCK = "UNBLOCK"


class FriendshipManageRequest(BaseModel):
    action: FriendshipManageAction
    friendship_id: uuid.UUID | None = None
    target_user_id: uuid.UUID | None = None


# endregion


# region Steam Friends
class SteamFriend(BaseModel):
    steamid: str
    relationship: str
    friend_since: int


class GetFriendListResponse(BaseModel):
    friends: list[SteamFriend]


# endregion


# region Notifications
class RegisterDeviceRequest(BaseModel):
    token: str
    device_type: str = "android"


class UnregisterDeviceRequest(BaseModel):
    token: str


class NotificationRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    body: str
    data: dict | None = None
    is_read: bool
    created_at: datetime


# endregion
