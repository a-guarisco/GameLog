import uuid
from datetime import datetime

from sqlmodel import Field, SQLModel


class DeviceToken(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    device_token: str = Field(unique=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    device_type: str = Field(default="android")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)