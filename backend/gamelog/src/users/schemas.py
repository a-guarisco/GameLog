import uuid

from sqlmodel import Field, SQLModel

from src.models.steam_rolling_time import SteamRollingTimeBase
from src.models.user import UserBase


class UserCreate(UserBase):
    steam_api_key: str = Field(max_length=255)


class UserRead(UserBase):
    id: uuid.UUID


class UserUpdate(SQLModel):
    firebase_uid: str | None = Field(default=None, max_length=255)
    username: str | None = Field(default=None, max_length=100)
    steam_id: str | None = Field(default=None, max_length=32)
    steam_api_key: str | None = Field(default=None, max_length=255)


class SteamRollingTimeCreate(SteamRollingTimeBase):
    user_id: uuid.UUID
    is_baseline: bool = True


class SteamRollingTimeRead(SteamRollingTimeBase):
    id: uuid.UUID
    user_id: uuid.UUID
