import datetime
import uuid

from pydantic import BaseModel

from src.models.game import GameBase


class GameCreate(GameBase):
    pass


class GameRead(GameBase):
    id: uuid.UUID


"""
Schemas from the Steam API GetOwnedGames response item
"""


class SteamGame(BaseModel):
    appid: int
    playtime_forever: int
    playtime_windows_forever: int
    playtime_mac_forever: int
    playtime_linux_forever: int
    playtime_deck_forever: int
    rtime_last_played: int
    playtime_disconnected: int


"""
Schema from the Steam API GetOwnedGames complete response
"""


class GetOwnedGamesResponse(BaseModel):
    game_count: int
    games: list[SteamGame]


"""
Schema from the backend response to _playtime_by_user or _playtime_by_game
"""


class DayByDayPlaytime(BaseModel):
    date: datetime.date
    playtime_minutes: int
