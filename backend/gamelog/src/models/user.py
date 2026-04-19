import uuid

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    firebase_uid: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    steam_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    steam_api_key: Mapped[str] = mapped_column(
        String(255)
    )  # simple encryption + hash in production

    # Relationships
    shelving = relationship(
        "Shelving", back_populates="owner", cascade="all, delete-orphan"
    )
    steam_rolling_time = relationship(
        "SteamRollingTime", back_populates="user", cascade="all, delete-orphan"
    )
