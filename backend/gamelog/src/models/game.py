import uuid

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class Game(Base):
    __tablename__ = "games"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    steam_app_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    logo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    banner_url: Mapped[str] = mapped_column(String(500), nullable=True)

    # Relationships
    shelving = relationship("Shelving", back_populates="game", cascade="all, delete-orphan")
