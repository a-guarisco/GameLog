import uuid

from pydantic import BaseModel

from src.models.game import GameBase


class GameCreate(GameBase):
    pass


class GameRead(GameBase):
    id: uuid.UUID


class SteamGame(BaseModel):
    appid: int
    playtime_forever: int
    playtime_windows_forever: int
    playtime_mac_forever: int
    playtime_linux_forever: int
    playtime_deck_forever: int
    rtime_last_played: int
    playtime_disconnected: int

class GetOwnedGamesResponse(BaseModel):
    game_count: int
    games: list[SteamGame]