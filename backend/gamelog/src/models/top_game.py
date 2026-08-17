import uuid
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.game import Genre


class TopGameGenreLink(SQLModel, table=True):
    top_game_id: uuid.UUID = Field(foreign_key="topgame.id", primary_key=True)
    genre_id: str = Field(foreign_key="genre.id", primary_key=True)


class TopGameBase(SQLModel):
    steam_app_id: str = Field(max_length=32, index=True, unique=True)
    rank: int = Field(index=True)


class TopGame(TopGameBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    genres: list["Genre"] = Relationship(back_populates="top_games", link_model=TopGameGenreLink)
