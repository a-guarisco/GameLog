import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Column
from sqlalchemy import Enum as SAEnum
from sqlmodel import Field, Relationship, SQLModel

from src.models.game import GameStatus

if TYPE_CHECKING:
    from src.models.game import Game
    from src.models.user import User


class ShelvingBase(SQLModel):
    status: GameStatus = Field(
        sa_column=Column(
            SAEnum(
                GameStatus,
                name="game_status",
                values_callable=lambda values: [item.value for item in values],
            ),
            nullable=False,
        )
    )


class Shelving(ShelvingBase, table=True):
    owner_id: uuid.UUID = Field(primary_key=True, foreign_key="user.id")
    game_id: uuid.UUID = Field(primary_key=True, foreign_key="game.id")

    user: "User" = Relationship(back_populates="game_shelvings")
    game: "Game" = Relationship(back_populates="user_shelvings")
