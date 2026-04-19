import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class SteamRollingTime(Base):
    __tablename__ = "steam_rolling_time"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), index=True
    )
    steam_app_id: Mapped[str] = mapped_column(String(32), index=True)
    last_day_playtime: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[date] = mapped_column(Date, default=date.today, index=True)

    # Relationships
    user = relationship("User", back_populates="steam_rolling_time")
