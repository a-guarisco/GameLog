import uuid

from sqlmodel import SQLModel

from src.models.game import GameStatus
from src.models.shelving import ShelvingBase


class ShelvingCreate(ShelvingBase):
    owner_id: uuid.UUID
    game_id: uuid.UUID


class ShelvingRead(ShelvingBase):
    owner_id: uuid.UUID
    game_id: uuid.UUID


class ShelvingStatusUpdate(SQLModel):
    status: GameStatus
