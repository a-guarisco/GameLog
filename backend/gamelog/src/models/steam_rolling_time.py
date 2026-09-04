import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.user import User


class SteamRollingTimeBase(SQLModel):
    steam_app_id: str = Field(max_length=32, index=True)
    last_day_playtime: int = 0
    created_at: date = Field(default_factory=date.today, index=True)


from sqlalchemy import Index

class SteamRollingTime(SteamRollingTimeBase, table=True):
    __table_args__ = (
        Index("idx_steam_rolling_time_user_id_created_at", "user_id", "created_at"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    user: "User" = Relationship(back_populates="steam_rolling_time")
