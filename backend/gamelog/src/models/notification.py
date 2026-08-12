import uuid
from datetime import datetime

from sqlmodel import JSON, Column, Field, SQLModel


class Notification(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    title: str = Field(nullable=False)
    body: str = Field(nullable=False)
    data: dict | None = Field(default=None, sa_column=Column(JSON))
    is_read: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.now)