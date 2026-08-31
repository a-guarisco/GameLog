import uuid
from datetime import date

from pydantic import BaseModel
from sqlmodel import Field

from src.models import Genre
from src.models.game import GameBase


class GameCreate(GameBase):
    pass


class GameRead(GameBase):
    id: uuid.UUID
    genres: list[Genre] = Field(default_factory=list)


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


class GamePlaytime(BaseModel):
    app_id: str
    playtime_minutes: int


class DayByDayPlaytime(BaseModel):
    date: date
    playtime_minutes: int
    games: list[GamePlaytime] = Field(default_factory=list)


"""
Schema from the backend in response to streak_by_user or streak_by_game
"""


class Streak(BaseModel):
    streak: int


class CommonGames(BaseModel):
    gameSteamId: str
    requester_play_time: int
    friend_play_time: int


class RecommendedTopGame(BaseModel):
    gameSteamId: str
    keys: list[Genre]


class RecommendationResponse(BaseModel):
    common_games: list[CommonGames]
    common_genres: list[Genre]
    top_games: list[RecommendedTopGame]


class SteamTopGame(BaseModel):
    rank: int
    appid: int


class DailyGameReport(BaseModel):
    app_id: str
    today_play_time: int
    streak: int


class DailyReport(BaseModel):
    date: date
    game_reports: list[DailyGameReport]
