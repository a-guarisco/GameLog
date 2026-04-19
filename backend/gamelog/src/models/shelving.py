import uuid
from enum import Enum

from sqlalchemy import Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class GameStatus(str, Enum):
    """Game status enumeration (like MyAnimeList)"""

    SHELVED = "shelved"
    TO_BE_PLAYED = "to_be_played"
    PLAYING = "playing"
    PLAYED = "played"
    PLATINATO = "platinato"


class Shelving(Base):
    __tablename__ = "shelving"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True
    )
    game_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("games.id"), primary_key=True
    )
    status: Mapped[GameStatus] = mapped_column(
        SQLEnum(GameStatus, values_callable=lambda x: [e.value for e in x]),
        default=GameStatus.SHELVED,
    )

    # Relationships
    owner = relationship("User", back_populates="shelving")
    game = relationship("Game", back_populates="shelving")
