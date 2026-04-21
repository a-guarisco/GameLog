import uuid

from src.models.game import GameBase


class GameCreate(GameBase):
    pass


class GameRead(GameBase):
    id: uuid.UUID
