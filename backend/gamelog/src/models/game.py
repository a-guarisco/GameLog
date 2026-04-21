import uuid
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.shelving import Shelving


class GameStatus(str, Enum):
    SHELVED = "shelved"
    TO_BE_PLAYED = "to_be_played"
    PLAYING = "playing"
    PLAYED = "played"
    PLATINATO = "platinato"


class GameBase(SQLModel):
    steam_app_id: str = Field(max_length=32, index=True)
    logo_url: str | None = Field(default=None, max_length=500)
    banner_url: str | None = Field(default=None, max_length=500)


class Game(GameBase, table=True):
    __table_args__ = (UniqueConstraint("steam_app_id"),)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_shelvings: list["Shelving"] = Relationship(back_populates="game")
