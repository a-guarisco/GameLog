import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint

if TYPE_CHECKING:
    from src.models.user import User

class FriendshipStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    BLOCKED = "BLOCKED"

class FriendshipBase(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    requester_id: uuid.UUID = Field(foreign_key="user.id")
    addressee_id: uuid.UUID = Field(foreign_key="user.id")

class Friendship(FriendshipBase, table=True):
    __table_args__ = (
        UniqueConstraint("requester_id", "addressee_id"),
    )
    status: FriendshipStatus = Field(default=FriendshipStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    requester: "User" = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "Friendship.requester_id==User.id",
            "back_populates": "sent_friendships"
        }
    )
    addressee: "User" = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "Friendship.addressee_id==User.id",
            "back_populates": "received_friendships"
        }
    )