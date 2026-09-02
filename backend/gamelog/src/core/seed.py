"""
Database Seeding Script for GameLog Backend.

This module populates the PostgreSQL database with initial demo data (users, games,
shelvings, and rolling playtime statistics) aligned with the Firebase Authentication service.

IMPORTANT RELATIONAL NOTES:
---------------------------
1. `firebase_uid`:
    - The primary test user `test-01` uses `firebase_uid="YLRMA6otQ1YDqHlD5j8Wr0u0lpJ2"`.
    - DO NOT MODIFY the `firebase_uid` of `DEMO_USER_1_ID` without updating:
      * `backend/scripts/seed_firebase_users.py` (which seeds the local emulator)
      * Mobile app test credentials (`mobile-app/.env.example`)
      * Production/Staging Firebase Console accounts

2. `steam_id` & Playtime Records:
   - `DEMO_USER_1_ID` uses a valid Steam ID (`76561198077919169`) for testing real Steam API sync.
   - Playtime records (`_rolling_times`) generate a 14-day history for `test-01` across
     CS2 (730) and Red Dead Redemption 2 (1174180) to power frontend analytics endpoints.
"""

from __future__ import annotations

from datetime import date
from uuid import UUID, uuid4
import os

from sqlalchemy import delete
from sqlmodel import Session

from src.core.database import engine
from src.models import (
    Config,
    DeviceToken,
    Friendship,
    FriendshipStatus,
    Game,
    GameGenreLink,
    GameStatus,
    Genre,
    Notification,
    Shelving,
    SteamRollingTime,
    TopGame,
    TopGameGenreLink,
    User,
)

# Fixed UUIDs for predictable database referencing in unit tests and manual API verification.
DEMO_USER_1_ID = UUID("11111111-1111-1111-1111-111111111111")
DEMO_USER_2_ID = UUID("22222222-2222-2222-2222-222222222222")
DEMO_USER_3_ID = UUID("33333333-3333-3333-3333-333333333333")
DEMO_USER_4_ID = UUID("44444444-4444-4444-4444-444444444444")
DEMO_USER_5_ID = UUID("55555555-5555-5555-5555-555555555555")
SLAIT_GRAPH_USER_ID = UUID("b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0")

DEMO_GAME_CS2_ID = UUID("66666666-6666-6666-6666-666666666666")
DEMO_GAME_DOTA_ID = UUID("77777777-7777-7777-7777-777777777777")
DEMO_GAME_RDR2_ID = UUID("88888888-8888-8888-8888-888888888888")
DEMO_GAME_GTAV_ID = UUID("99999999-9999-9999-9999-999999999999")
DEMO_GAME_ELDEN_RING_ID = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")

# SLAIT-GRAPH User Games
GAME_DONT_STARVE_ID = UUID("b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1")
GAME_MOTOGP_ID = UUID("b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2")
GAME_WALLPAPER_ENGINE_ID = UUID("b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3")
GAME_UNTURNED_ID = UUID("b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4")
GAME_METRO_ID = UUID("b5b5b5b5-b5b5-b5b5-b5b5-b5b5b5b5b5b5")
GAME_RIDE6_ID = UUID("b6b6b6b6-b6b6-b6b6-b6b6-b6b6b6b6b6b6")


GENRES_DATA = [
    {"id": "1", "description": "Action"},
    {"id": "37", "description": "Free To Play"},
    {"id": "25", "description": "Adventure"},
    {"id": "29", "description": "Massively Multiplayer"},
    {"id": "2", "description": "Strategy"},
    {"id": "4", "description": "Casual"},
    {"id": "23", "description": "Indie"},
    {"id": "51", "description": "Animation & Modeling"},
    {"id": "53", "description": "Design & Illustration"},
    {"id": "55", "description": "Photo Editing"},
    {"id": "57", "description": "Utilities"},
    {"id": "70", "description": "Early Access"},
    {"id": "28", "description": "Simulation"},
    {"id": "3", "description": "RPG"},
    {"id": "18", "description": "Sports"},
    {"id": "9", "description": "Racing"},
    {"id": "56", "description": "Software Training"},
    {"id": "58", "description": "Video Production"},
    {"id": "52", "description": "Audio Production"},
]

from typing import Any

TOP_GAMES_DATA: list[dict[str, Any]] = [
    {"steam_app_id": "730", "rank": 1, "genres": ["1", "37"]},
    {"steam_app_id": "578080", "rank": 2, "genres": ["1", "37", "25", "29"]},
    {"steam_app_id": "570", "rank": 3, "genres": ["1", "2", "37"]},
    {"steam_app_id": "431960", "rank": 4, "genres": ["4", "23", "51", "53", "55", "57"]},
    {"steam_app_id": "1172470", "rank": 5, "genres": ["1", "25", "37"]},
    {"steam_app_id": "2868840", "rank": 6, "genres": ["23", "2", "70"]},
    {"steam_app_id": "3241660", "rank": 7, "genres": ["1", "70"]},
    {"steam_app_id": "271590", "rank": 8, "genres": ["1", "25"]},
    {"steam_app_id": "322170", "rank": 10, "genres": ["1", "23"]},
    {"steam_app_id": "236390", "rank": 11, "genres": ["1", "37", "29", "28"]},
    {"steam_app_id": "359550", "rank": 12, "genres": ["1", "37"]},
    {"steam_app_id": "1808500", "rank": 13, "genres": ["1"]},
    {"steam_app_id": "2507950", "rank": 14, "genres": ["1", "37", "25", "29"]},
    {"steam_app_id": "2357570", "rank": 15, "genres": ["1", "37"]},
    {"steam_app_id": "2767030", "rank": 16, "genres": ["1", "37"]},
    {"steam_app_id": "252490", "rank": 17, "genres": ["1", "25", "23", "29", "3"]},
    {"steam_app_id": "381210", "rank": 18, "genres": ["1"]},
    {"steam_app_id": "1422450", "rank": 19, "genres": ["1"]},
    {"steam_app_id": "230410", "rank": 20, "genres": ["1", "3", "37"]},
    {"steam_app_id": "3405690", "rank": 21, "genres": ["28", "18"]},
    {"steam_app_id": "413150", "rank": 22, "genres": ["23", "3", "28"]},
    {"steam_app_id": "2807960", "rank": 23, "genres": ["1"]},
    {"steam_app_id": "553850", "rank": 24, "genres": ["1"]},
    {"steam_app_id": "1973530", "rank": 25, "genres": ["37"]},
    {"steam_app_id": "3240220", "rank": 26, "genres": ["1", "25", "9"]},
    {"steam_app_id": "105600", "rank": 27, "genres": ["1", "25", "23", "3"]},
    {"steam_app_id": "440", "rank": 28, "genres": ["1", "37"]},
    {"steam_app_id": "3321460", "rank": 29, "genres": ["1", "25"]},
    {"steam_app_id": "3041230", "rank": 30, "genres": ["1", "25", "70", "3"]},
    {"steam_app_id": "227300", "rank": 31, "genres": ["23", "28"]},
    {"steam_app_id": "1086940", "rank": 32, "genres": ["25", "3", "2"]},
    {"steam_app_id": "438100", "rank": 33, "genres": ["37", "25", "29", "4", "70", "28", "18"]},
    {"steam_app_id": "550", "rank": 34, "genres": ["1"]},
    {"steam_app_id": "394360", "rank": 35, "genres": ["28", "2"]},
    {"steam_app_id": "1203220", "rank": 36, "genres": ["1", "37", "25", "29"]},
    {"steam_app_id": "1938090", "rank": 37, "genres": ["1"]},
    {"steam_app_id": "1245620", "rank": 38, "genres": ["1", "3"]},
    {"steam_app_id": "284160", "rank": 39, "genres": ["9", "28", "70"]},
    {"steam_app_id": "322330", "rank": 40, "genres": ["1", "25", "2", "23", "28", "3"]},
    {"steam_app_id": "252950", "rank": 41, "genres": ["1", "23", "18", "9"]},
    {"steam_app_id": "1091500", "rank": 42, "genres": ["3"]},
    {"steam_app_id": "3892270", "rank": 43, "genres": ["25", "23", "28"]},
    {"steam_app_id": "3513350", "rank": 44, "genres": ["1", "37", "25", "3"]},
    {"steam_app_id": "3472040", "rank": 45, "genres": ["18"]},
    {"steam_app_id": "250900", "rank": 46, "genres": ["1"]},
    {"steam_app_id": "3124540", "rank": 47, "genres": ["1", "25", "23", "70"]},
    {"steam_app_id": "1174180", "rank": 48, "genres": ["1", "25"]},
    {"steam_app_id": "4000", "rank": 49, "genres": ["4", "23", "28"]},
    {"steam_app_id": "3105440", "rank": 50, "genres": ["3", "2", "70"]},
    {"steam_app_id": "1449850", "rank": 51, "genres": ["28", "2", "37"]},
    {"steam_app_id": "1222670", "rank": 52, "genres": ["37", "25", "4", "28"]},
    {"steam_app_id": "2344520", "rank": 53, "genres": ["1", "25", "4", "29", "3"]},
    {"steam_app_id": "739630", "rank": 54, "genres": ["1", "23", "70"]},
    {"steam_app_id": "108600", "rank": 55, "genres": ["23", "70", "28", "3"]},
    {"steam_app_id": "289070", "rank": 56, "genres": ["2"]},
    {"steam_app_id": "1364780", "rank": 57, "genres": ["1", "25"]},
    {"steam_app_id": "1281930", "rank": 58, "genres": ["1", "25", "23", "3", "37"]},
    {"steam_app_id": "221100", "rank": 59, "genres": ["1", "25", "29"]},
    {"steam_app_id": "1366800", "rank": 60, "genres": ["1", "25", "23", "56", "57"]},
    {"steam_app_id": "489830", "rank": 61, "genres": ["3"]},
    {"steam_app_id": "1905180", "rank": 62, "genres": ["57", "58"]},
    {"steam_app_id": "3419430", "rank": 63, "genres": ["4", "23", "29", "28", "37"]},
    {"steam_app_id": "1665460", "rank": 64, "genres": ["28", "18", "37"]},
    {"steam_app_id": "714010", "rank": 65, "genres": ["1", "37", "25", "4", "23", "28"]},
    {"steam_app_id": "440900", "rank": 66, "genres": ["1", "25", "29", "2", "28", "3"]},
    {"steam_app_id": "244210", "rank": 67, "genres": ["23", "28", "18", "9"]},
    {"steam_app_id": "291550", "rank": 68, "genres": ["1", "23", "37"]},
    {"steam_app_id": "4128580", "rank": 69, "genres": ["29", "2", "4", "23", "28", "18"]},
    {"steam_app_id": "2300320", "rank": 70, "genres": ["28"]},
    {"steam_app_id": "3564740", "rank": 71, "genres": ["1", "37", "25", "3"]},
    {"steam_app_id": "646570", "rank": 72, "genres": ["23", "2"]},
    {"steam_app_id": "3764200", "rank": 73, "genres": ["1", "25"]},
    {"steam_app_id": "1551360", "rank": 74, "genres": ["1", "25", "9", "28", "18"]},
    {"steam_app_id": "3527290", "rank": 75, "genres": ["1", "25", "23"]},
    {"steam_app_id": "2622380", "rank": 76, "genres": ["1", "3"]},
    {"steam_app_id": "2073850", "rank": 77, "genres": ["1", "37"]},
    {"steam_app_id": "2073620", "rank": 78, "genres": ["1", "37", "25", "29", "2", "3"]},
    {"steam_app_id": "1142710", "rank": 79, "genres": ["1", "2"]},
    {"steam_app_id": "261550", "rank": 80, "genres": ["1", "23", "3", "28", "2"]},
    {"steam_app_id": "294100", "rank": 81, "genres": ["23", "28", "2"]},
    {"steam_app_id": "2379780", "rank": 82, "genres": ["4", "23", "2"]},
    {"steam_app_id": "813780", "rank": 83, "genres": ["2"]},
    {"steam_app_id": "3551340", "rank": 84, "genres": ["28", "18", "2"]},
    {"steam_app_id": "3526710", "rank": 85, "genres": ["1", "2", "23", "28"]},
    {"steam_app_id": "594650", "rank": 86, "genres": ["1"]},
    {"steam_app_id": "960090", "rank": 87, "genres": ["2"]},
    {"steam_app_id": "251570", "rank": 88, "genres": ["1", "25", "2", "23", "28", "3"]},
    {"steam_app_id": "629520", "rank": 89, "genres": ["52", "57"]},
    {"steam_app_id": "892970", "rank": 90, "genres": ["1", "25", "23", "3", "70"]},
    {"steam_app_id": "1158310", "rank": 91, "genres": ["3", "28", "2"]},
    {"steam_app_id": "1144200", "rank": 92, "genres": ["1", "25", "23"]},
    {"steam_app_id": "4025700", "rank": 93, "genres": ["4", "28", "37"]},
    {"steam_app_id": "3164500", "rank": 94, "genres": ["1", "23", "28", "2", "70"]},
    {"steam_app_id": "3224770", "rank": 96, "genres": ["28", "18", "37"]},
    {"steam_app_id": "264710", "rank": 97, "genres": ["25", "23"]},
    {"steam_app_id": "945360", "rank": 98, "genres": ["4"]},
    {"steam_app_id": "2694490", "rank": 99, "genres": ["1", "25", "29", "3", "70"]},
    {"steam_app_id": "39210", "rank": 100, "genres": ["29", "3"]},
]


def _users() -> list[User]:
    """
    Returns the initial list of test users.

    WARNING: `firebase_uid` values MUST be kept in sync with:
    1. Firebase Auth Emulator script (`backend/scripts/seed_firebase_users.py`)
    2. Firebase Console Cloud accounts for production E2E tests.
    """
    return [
        User(
            id=DEMO_USER_1_ID,
            firebase_uid="YLRMA6otQ1YDqHlD5j8Wr0u0lpJ2",  # Matches test-01@test.com
            username="test-01",
            steam_id="76561198077919169",
            steam_api_key="4C67D2313547027F4ECB151CD10E76EC",
            region="IT",
        ),
        User(
            id=DEMO_USER_2_ID,
            firebase_uid="tcYaHPGYDkVBlnNrcI7jNf2z4MS2",  # Matches test-02@test.com
            username="test-02",
            steam_id="76561198000000002",
            steam_api_key="",
            region="IT",
        ),
        User(
            id=DEMO_USER_3_ID,
            firebase_uid="GRbqhGIYlzb1GHEaBINeJq1ZXld2",  # Matches test-03@test.com
            username="test-03",
            steam_id="76561198000000003",
            steam_api_key="",
            region="DE",
        ),
        User(
            id=DEMO_USER_4_ID,
            firebase_uid="wcMFGsVqaYYNHSAeUXgGiK14WPk2",  # Matches test-04@test.com
            username="test-04",
            steam_id="76561198000000004",
            steam_api_key="",
            region="FR",
        ),
        User(
            id=DEMO_USER_5_ID,
            firebase_uid="a7swvzI0APgq57SMa8B7PsHevG02",  # Matches test-05@test.com
            username="test-05",
            steam_id="76561198000000005",
            steam_api_key="",
            region="GB",
        ),
        User(
            id=SLAIT_GRAPH_USER_ID,
            firebase_uid="slaitgraph1234567890",
            username="slait-graph",
            steam_id=os.getenv("SLAIT_GRAPH_STEAM_ID", "dummy_slait_graph_id"),
            steam_api_key=os.getenv("SLAIT_GRAPH_STEAM_API_KEY", "dummy_slait_graph_key"),
            region="US",
        ),
    ]


def _games() -> list[Game]:
    """Returns initial demo games indexed by Steam App ID."""
    return [
        Game(
            id=DEMO_GAME_CS2_ID,
            steam_app_id="730",  # Counter-Strike 2
        ),
        Game(
            id=DEMO_GAME_DOTA_ID,
            steam_app_id="570",  # Dota 2
        ),
        Game(
            id=DEMO_GAME_RDR2_ID,
            steam_app_id="1174180",  # Red Dead Redemption 2
        ),
        Game(
            id=DEMO_GAME_GTAV_ID,
            steam_app_id="271590",  # Grand Theft Auto V
        ),
        Game(
            id=DEMO_GAME_ELDEN_RING_ID,
            steam_app_id="1245620",  # Elden Ring
        ),
        Game(id=GAME_DONT_STARVE_ID, steam_app_id="322330"),
        Game(id=GAME_MOTOGP_ID, steam_app_id="3875050"),
        Game(id=GAME_WALLPAPER_ENGINE_ID, steam_app_id="431960"),
        Game(id=GAME_UNTURNED_ID, steam_app_id="304930"),
        Game(id=GAME_METRO_ID, steam_app_id="286690"),
        Game(id=GAME_RIDE6_ID, steam_app_id="2815070"),
    ]


def _shelvings() -> list[Shelving]:
    """Returns sample game status assignments (Shelvings) per user."""
    return [
        Shelving(owner_id=DEMO_USER_1_ID, game_id=DEMO_GAME_CS2_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=DEMO_USER_1_ID, game_id=DEMO_GAME_RDR2_ID, status=GameStatus.TO_BE_PLAYED),
        Shelving(owner_id=DEMO_USER_1_ID, game_id=DEMO_GAME_GTAV_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=DEMO_USER_1_ID, game_id=DEMO_GAME_ELDEN_RING_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=DEMO_USER_2_ID, game_id=DEMO_GAME_DOTA_ID, status=GameStatus.SHELVED),
        Shelving(owner_id=DEMO_USER_3_ID, game_id=DEMO_GAME_CS2_ID, status=GameStatus.PLAYED),
        Shelving(owner_id=DEMO_USER_4_ID, game_id=DEMO_GAME_RDR2_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=SLAIT_GRAPH_USER_ID, game_id=GAME_DONT_STARVE_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=SLAIT_GRAPH_USER_ID, game_id=GAME_MOTOGP_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=SLAIT_GRAPH_USER_ID, game_id=GAME_WALLPAPER_ENGINE_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=SLAIT_GRAPH_USER_ID, game_id=GAME_UNTURNED_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=SLAIT_GRAPH_USER_ID, game_id=GAME_METRO_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=SLAIT_GRAPH_USER_ID, game_id=GAME_RIDE6_ID, status=GameStatus.PLAYING),
    ]


def _rolling_times() -> list[SteamRollingTime]:
    """
    Generates 14 days of historical daily playtime snapshots.

    Used to test endpoints:
    - GET /games/_playtime_by_user
    - GET /games/_playtime_by_game
    """
    from datetime import timedelta

    today = date.today()
    records = []

    # Seed CS2 (730) rolling playtime for test-01 (DEMO_USER_1_ID)
    cs2_playtime = 1000
    for day_offset in range(14, -1, -1):
        record_date = today - timedelta(days=day_offset)
        is_baseline = day_offset == 14
        if not is_baseline:
            playtime_increment = [30, 45, 0, 60, 20, 0, 90, 15, 40, 0, 50, 75, 10, 80, 45][14 - day_offset]
            cs2_playtime += playtime_increment

        records.append(
            SteamRollingTime(
                id=uuid4(),
                user_id=DEMO_USER_1_ID,
                steam_app_id="730",
                last_day_playtime=cs2_playtime,
                created_at=record_date,
            )
        )

    # Seed RDR2 (1174180) rolling playtime for test-01 (DEMO_USER_1_ID)
    rdr2_playtime = 500
    for day_offset in range(14, -1, -1):
        record_date = today - timedelta(days=day_offset)
        is_baseline = day_offset == 14
        if not is_baseline:
            playtime_increment = [0, 60, 90, 0, 15, 30, 45, 0, 0, 120, 10, 0, 35, 50, 60][14 - day_offset]
            rdr2_playtime += playtime_increment

        records.append(
            SteamRollingTime(
                id=uuid4(),
                user_id=DEMO_USER_1_ID,
                steam_app_id="1174180",
                last_day_playtime=rdr2_playtime,
                created_at=record_date,
            )
        )

    # Seed GTA V (271590) rolling playtime for test-01 (DEMO_USER_1_ID)
    gtav_playtime = 1500
    for day_offset in range(14, -1, -1):
        record_date = today - timedelta(days=day_offset)
        is_baseline = day_offset == 14
        if not is_baseline:
            playtime_increment = [20, 30, 40, 50, 0, 60, 70, 80, 0, 45, 60, 30, 90, 100, 90][14 - day_offset]
            gtav_playtime += playtime_increment

        records.append(
            SteamRollingTime(
                id=uuid4(),
                user_id=DEMO_USER_1_ID,
                steam_app_id="271590",
                last_day_playtime=gtav_playtime,
                created_at=record_date,
            )
        )

    # Seed Elden Ring (1245620) rolling playtime for test-01 (DEMO_USER_1_ID)
    elden_playtime = 800
    for day_offset in range(14, -1, -1):
        record_date = today - timedelta(days=day_offset)
        is_baseline = day_offset == 14
        if not is_baseline:
            playtime_increment = [45, 60, 0, 30, 90, 120, 0, 40, 50, 60, 80, 100, 110, 90, 120][14 - day_offset]
            elden_playtime += playtime_increment

        records.append(
            SteamRollingTime(
                id=uuid4(),
                user_id=DEMO_USER_1_ID,
                steam_app_id="1245620",
                last_day_playtime=elden_playtime,
                created_at=record_date,
            )
        )

    # Seed Dota 2 (570) rolling playtime for test-02 (DEMO_USER_2_ID)
    dota_playtime = 2000
    for day_offset in range(14, -1, -1):
        record_date = today - timedelta(days=day_offset)
        is_baseline = day_offset == 14
        if not is_baseline:
            playtime_increment = [100, 120, 0, 80, 90, 150, 0, 60, 40, 110, 0, 85, 95, 120, 60][14 - day_offset]
            dota_playtime += playtime_increment

        records.append(
            SteamRollingTime(
                id=uuid4(),
                user_id=DEMO_USER_2_ID,
                steam_app_id="570",
                last_day_playtime=dota_playtime,
                created_at=record_date,
            )
        )

    # Seed Dota 2 (570) rolling playtime for test-01 (DEMO_USER_1_ID)
    test01_dota_playtime = 700
    for day_offset in range(14, -1, -1):
        record_date = today - timedelta(days=day_offset)
        is_baseline = day_offset == 14
        if not is_baseline:
            playtime_increment = [10, 15, 0, 20, 5, 0, 30, 0, 10, 0, 20, 25, 0, 10, 25][14 - day_offset]
            test01_dota_playtime += playtime_increment

        records.append(
            SteamRollingTime(
                id=uuid4(),
                user_id=DEMO_USER_1_ID,
                steam_app_id="570",
                last_day_playtime=test01_dota_playtime,
                created_at=record_date,
            )
        )

    # Seed CS2 (730) rolling playtime for test-02 (DEMO_USER_2_ID)
    test02_cs2_playtime = 1100
    for day_offset in range(14, -1, -1):
        record_date = today - timedelta(days=day_offset)
        is_baseline = day_offset == 14
        if not is_baseline:
            playtime_increment = [15, 20, 0, 30, 10, 0, 45, 5, 20, 0, 25, 35, 5, 40, 20][14 - day_offset]
            test02_cs2_playtime += playtime_increment

        records.append(
            SteamRollingTime(
                id=uuid4(),
                user_id=DEMO_USER_2_ID,
                steam_app_id="730",
                last_day_playtime=test02_cs2_playtime,
                created_at=record_date,
            )
        )

    # SLAIT-GRAPH User Playtime Seeding
    # Real steam playtimes on Day 0: Don't Starve (629), MotoGP (115), Wallpaper Engine (50), Unturned (22), Metro (0), RIDE 6 (0)
    import random
    
    HISTORY_DAYS = 180
    
    games_targets = [
        ("322330", 629),
        ("3875050", 115),
        ("431960", 50),
        ("304930", 22),
        ("286690", 0),
        ("2815070", 0)
    ]
    
    for app_id, final_target in games_targets:
        if final_target == 0:
            current_playtime = 0
            for day_offset in range(HISTORY_DAYS, -1, -1):
                records.append(
                    SteamRollingTime(
                        id=uuid4(),
                        user_id=SLAIT_GRAPH_USER_ID,
                        steam_app_id=app_id,
                        last_day_playtime=current_playtime,
                        created_at=today - timedelta(days=day_offset),
                    )
                )
            continue

        # Use 50% of the playtime as the "baseline" (the playtime they had before joining GameLog)
        baseline = final_target // 2
        remaining = final_target - baseline
        
        increments = [0] * (HISTORY_DAYS + 1)
        
        # Distribute the remaining playtime on a random subset of "active days" for realistic clustering
        active_days_count = random.randint(15, min(90, HISTORY_DAYS)) 
        active_days = set(random.sample(range(0, HISTORY_DAYS), active_days_count))
        
        for _ in range(remaining):
            day_idx = random.choice(list(active_days))
            increments[day_idx] += 1
            
        current_playtime = baseline
        
        for day_offset in range(HISTORY_DAYS, -1, -1):
            record_date = today - timedelta(days=day_offset)
            if day_offset != HISTORY_DAYS:
                current_playtime += increments[day_offset]
                
            records.append(
                SteamRollingTime(
                    id=uuid4(),
                    user_id=SLAIT_GRAPH_USER_ID,
                    steam_app_id=app_id,
                    last_day_playtime=current_playtime,
                    created_at=record_date,
                )
            )

    return records


def _friendships() -> list[Friendship]:
    """Returns sample friendships for manual testing."""
    return [
        # test-01 and test-02 are accepted friends
        Friendship(
            requester_id=DEMO_USER_1_ID,
            addressee_id=DEMO_USER_2_ID,
            status=FriendshipStatus.ACCEPTED,
        ),
        # test-04 requested test-01 (pending incoming request to test-01)
        Friendship(
            requester_id=DEMO_USER_4_ID,
            addressee_id=DEMO_USER_1_ID,
            status=FriendshipStatus.PENDING,
        ),
        # test-01 blocked test-05 (blocked relationship)
        Friendship(
            requester_id=DEMO_USER_1_ID,
            addressee_id=DEMO_USER_5_ID,
            status=FriendshipStatus.BLOCKED,
        ),
    ]


def seed_database() -> None:
    """Reset demo data and insert a consistent sample dataset using SQLModel models."""
    with Session(engine) as session:
        # Wipe existing tables in safe order (dependency first) to avoid ForeignKeyViolation
        session.exec(delete(SteamRollingTime))
        session.exec(delete(Shelving))
        session.exec(delete(Friendship))
        session.exec(delete(GameGenreLink))
        session.exec(delete(TopGameGenreLink))
        session.exec(delete(Game))
        session.exec(delete(TopGame))
        session.exec(delete(Genre))
        session.exec(delete(Notification))
        session.exec(delete(DeviceToken))
        session.exec(delete(User))
        session.exec(delete(Config))
        session.flush()

        # Seed realistic genres
        genre_instances = {}
        for gd in GENRES_DATA:
            g = Genre(id=gd["id"], description=gd["description"])
            session.add(g)
            genre_instances[gd["id"]] = g
        session.flush()

        # Seed users
        for user in _users():
            session.add(user)

        # Seed the 5 demo games using fixed IDs and assigning resolved genres
        game_cs2 = Game(id=DEMO_GAME_CS2_ID, steam_app_id="730", genres=[genre_instances["1"], genre_instances["37"]])
        game_dota = Game(id=DEMO_GAME_DOTA_ID, steam_app_id="570", genres=[genre_instances["1"], genre_instances["37"], genre_instances["2"]])
        game_rdr2 = Game(id=DEMO_GAME_RDR2_ID, steam_app_id="1174180", genres=[genre_instances["1"], genre_instances["25"]])
        game_gtav = Game(id=DEMO_GAME_GTAV_ID, steam_app_id="271590", genres=[genre_instances["1"], genre_instances["25"]])
        game_elden_ring = Game(id=DEMO_GAME_ELDEN_RING_ID, steam_app_id="1245620", genres=[genre_instances["1"], genre_instances["3"]])

        session.add(game_cs2)
        session.add(game_dota)
        session.add(game_rdr2)
        session.add(game_gtav)
        session.add(game_elden_ring)

        # SLAIT-GRAPH User Games
        game_dont_starve = Game(id=GAME_DONT_STARVE_ID, steam_app_id="322330", genres=[genre_instances["23"], genre_instances["25"]])
        game_motogp = Game(id=GAME_MOTOGP_ID, steam_app_id="3875050", genres=[genre_instances["9"], genre_instances["18"]])
        game_wallpaper = Game(id=GAME_WALLPAPER_ENGINE_ID, steam_app_id="431960", genres=[genre_instances["57"]])
        game_unturned = Game(id=GAME_UNTURNED_ID, steam_app_id="304930", genres=[genre_instances["1"], genre_instances["37"]])
        game_metro = Game(id=GAME_METRO_ID, steam_app_id="286690", genres=[genre_instances["1"]])
        game_ride6 = Game(id=GAME_RIDE6_ID, steam_app_id="2815070", genres=[genre_instances["9"]])

        session.add(game_dont_starve)
        session.add(game_motogp)
        session.add(game_wallpaper)
        session.add(game_unturned)
        session.add(game_metro)
        session.add(game_ride6)

        # Seed realistic Top Games
        for tg in TOP_GAMES_DATA:
            tg_genres: list[str] = tg["genres"]
            top_game = TopGame(
                steam_app_id=tg["steam_app_id"],
                rank=tg["rank"],
                genres=[genre_instances[gid] for gid in tg_genres if gid in genre_instances],
            )
            session.add(top_game)

        # Seed demo user interaction data
        for shelving in _shelvings():
            session.add(shelving)
        for rolling_time in _rolling_times():
            session.add(rolling_time)
        for friendship in _friendships():
            session.add(friendship)

        from datetime import UTC, datetime, timedelta

        yesterday_iso = (datetime.now(UTC) - timedelta(days=1)).isoformat()
        session.add(Config(key="last_update", value=yesterday_iso))

        session.commit()


def main() -> None:
    seed_database()
    print("Demo data inserted successfully.")


if __name__ == "__main__":
    main()
