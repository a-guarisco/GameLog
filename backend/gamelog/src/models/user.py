import uuid
from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.shelving import Shelving
    from src.models.steam_rolling_time import SteamRollingTime
    from src.models.friendship import Friendship


class UserBase(SQLModel):
    firebase_uid: str = Field(max_length=255, index=True)
    username: str = Field(max_length=100, index=True)
    steam_id: str = Field(max_length=32, index=True)


class User(UserBase, table=True):
    __table_args__ = (
        UniqueConstraint("firebase_uid"),
        UniqueConstraint("username"),
        UniqueConstraint("steam_id"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    steam_api_key: str = Field(max_length=255)
    game_shelvings: list["Shelving"] = Relationship(back_populates="user")
    steam_rolling_time: list["SteamRollingTime"] = Relationship(back_populates="user")

    sent_friendships: list["Friendship"] = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "User.id==Friendship.requester_id",
            "back_populates": "requester"
        }
    )
    received_friendships: list["Friendship"] = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "User.id==Friendship.addressee_id",
            "back_populates": "addressee"
        }
    )
