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
    playtime_windows_forever: int = 0
    playtime_mac_forever: int = 0
    playtime_linux_forever: int = 0
    playtime_deck_forever: int = 0
    rtime_last_played: int = 0
    playtime_disconnected: int = 0


"""
Schema from the Steam API GetOwnedGames complete response
"""


class GetOwnedGamesResponse(BaseModel):
    game_count: int
    games: list[SteamGame]


"""
Schema from the backend response to playtime_by_user or playtime_by_game
"""


class DayByDayPlaytime(BaseModel):
    date: datetime.date
    playtime_minutes: int


"""
Schema from the backend in response to streak_by_user or streak_by_game
"""


class Streak(BaseModel):
    streak: int


class RecommendationResponse(BaseModel):
    gameSteamId: str
    requester_play_time: int
    friend_play_time: int

