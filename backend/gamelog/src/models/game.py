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


class GameGenreLink(SQLModel, table=True):
    game_id: uuid.UUID = Field(foreign_key="game.id", primary_key=True)
    genre_id: str = Field(foreign_key="genre.id", primary_key=True)


from src.models.top_game import TopGameGenreLink

class Genre(SQLModel, table=True):
    id: str = Field(primary_key=True)
    description: str

    games: list["Game"] = Relationship(back_populates="genres", link_model=GameGenreLink)
    top_games: list["TopGame"] = Relationship(back_populates="genres", link_model=TopGameGenreLink)


class GameBase(SQLModel):
    steam_app_id: str = Field(max_length=32, index=True)


class Game(GameBase, table=True):
    __table_args__ = (UniqueConstraint("steam_app_id"),)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_shelvings: list["Shelving"] = Relationship(back_populates="game")
    genres: list[Genre] = Relationship(back_populates="games", link_model=GameGenreLink)


