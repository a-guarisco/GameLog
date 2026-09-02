from enum import Enum
from pydantic import BaseModel


class CommunityScope(str, Enum):
    GLOBAL = "global"
    REGION = "region"
    FRIENDS = "friends"

    @classmethod
    def _missing_(cls, value: object):
        if isinstance(value, str):
            val_lower = value.strip().lower()
            for member in cls:
                if member.value == val_lower or member.name.lower() == val_lower:
                    return member
        return None


class TopGameReference(str, Enum):
    COMMUNITY = "community"
    USER = "user"

    @classmethod
    def _missing_(cls, value: object):
        if isinstance(value, str):
            val_lower = value.strip().lower()
            for member in cls:
                if member.value == val_lower or member.name.lower() == val_lower:
                    return member
        return None


class CommunityGenreHour(BaseModel):
    id: str
    description: str
    percentage: float


class CommunityWeeklyPlaytimeResponse(BaseModel):
    user: list[float]
    community: list[float]


class CommunityMonthlyPlaytimeResponse(BaseModel):
    user: list[float]
    community: list[float]


class CommunityWeeklyTopGameResponse(BaseModel):
    id: str
    user_playtime: float
    community_playtime: float


class CommunityMonthlyTopGameResponse(BaseModel):
    id: str
    user_playtime: float
    community_playtime: float
