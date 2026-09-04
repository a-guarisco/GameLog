"""
Database Seeding Script for GameLog Backend.

This module populates the PostgreSQL database with initial demo data (users, games,
shelvings, and rolling playtime statistics) aligned with the Firebase Authentication service.
"""

from __future__ import annotations

import argparse
import json
import os
import random
from datetime import UTC, date, datetime, timedelta
from uuid import UUID, uuid4

from sqlalchemy import delete
from sqlmodel import Session
from rich.progress import track

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
NEW_DEMO_USER_ID = UUID("c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0")

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

TOP_GAMES_DATA = [
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


def load_crawled_users() -> list[dict]:
    try:
        with open("src/core/seed_data_users.json", "r") as f:
            return json.load(f)
    except Exception:
        return []

def _users(crawled_users: list[dict], mock_users: int = 50) -> list[User]:
    users = [
        User(
            id=DEMO_USER_1_ID,
            firebase_uid="YLRMA6otQ1YDqHlD5j8Wr0u0lpJ2",
            username="test-01",
            steam_id="76561198077919169",
            steam_api_key="4C67D2313547027F4ECB151CD10E76EC",
            region="IT",
        ),
        User(
            id=DEMO_USER_2_ID,
            firebase_uid="tcYaHPGYDkVBlnNrcI7jNf2z4MS2",
            username="test-02",
            steam_id="76561198000000002",
            steam_api_key="",
            region="IT",
        ),
        User(
            id=DEMO_USER_3_ID,
            firebase_uid="GRbqhGIYlzb1GHEaBINeJq1ZXld2",
            username="test-03",
            steam_id="76561198000000003",
            steam_api_key="",
            region="DE",
        ),
        User(
            id=DEMO_USER_4_ID,
            firebase_uid="wcMFGsVqaYYNHSAeUXgGiK14WPk2",
            username="test-04",
            steam_id="76561198000000004",
            steam_api_key="",
            region="FR",
        ),
        User(
            id=DEMO_USER_5_ID,
            firebase_uid="a7swvzI0APgq57SMa8B7PsHevG02",
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
        User(
            id=NEW_DEMO_USER_ID,
            firebase_uid="newuser_76561198159652025",
            username="xrayman",
            steam_id="76561198159652025",
            steam_api_key="",
            region="IT",
        )
    ]
    
    # Exclude IDs we already hardcoded to prevent unique constraint failures
    exclude_ids = {"76561198077919169", "76561198159652025", "76561198000000002", "76561198000000003", "76561198000000004", "76561198000000005"}
    
    # Add crawled users (up to mock_users)
    for c_user in crawled_users[:mock_users]:
        s_id = c_user["steam_id"]
        if s_id in exclude_ids:
            continue
        exclude_ids.add(s_id)
        
        users.append(
            User(
                id=uuid4(),
                firebase_uid=f"mock_{s_id}",
                username=c_user["personaname"][:30], # Limit length
                steam_id=s_id,
                steam_api_key="",
                region=c_user["region"]
            )
        )
    return users


def generate_user_playtime(user_id: UUID, games_targets: list[tuple[str, int]], history_days: int = 365) -> list[SteamRollingTime]:
    """
    Generates realistic historical playtime curves for a user's games.
    Uses realistic gaps (sparsity) and random distributions.
    Low total playtime implies adopting GameLog recently and generating playtime sporadically from 0 baseline.
    """
    records = []
    today = date.today()
    for app_id, final_target in games_targets:
        if final_target == 0:
            current_playtime = 0
            for day_offset in range(history_days, -1, -1):
                records.append(
                    SteamRollingTime(
                        id=uuid4(),
                        user_id=user_id,
                        steam_app_id=app_id,
                        last_day_playtime=current_playtime,
                        created_at=today - timedelta(days=day_offset),
                    )
                )
            continue

        # If total playtime is very low (< 30 hours / 1800 mins), assume they didn't have a baseline before GameLog.
        # So we distribute 100% of the playtime over time. Otherwise, we assume 50% baseline.
        if final_target < 1800:
            baseline = 0
        else:
            baseline = final_target // 2
            
        remaining = final_target - baseline
        increments = [0] * (history_days + 1)
        
        if remaining > 0:
            # We don't pre-pick active days. We just keep adding "gaming sessions" 
            # (e.g. 30 mins to 5 hours) to random days until the remaining time is depleted.
            while remaining > 0:
                day_idx = random.randint(0, history_days - 1)
                
                # A realistic gaming session is between 30 minutes and 4 hours (240 mins)
                # Or whatever is left if it's smaller.
                session_len = random.randint(30, 240)
                if session_len > remaining:
                    session_len = remaining
                    
                increments[day_idx] += session_len
                remaining -= session_len
                
        current_playtime = baseline
        for day_offset in range(history_days, -1, -1):
            if day_offset != history_days:
                current_playtime += increments[day_offset]
                
            records.append(
                SteamRollingTime(
                    id=uuid4(),
                    user_id=user_id,
                    steam_app_id=app_id,
                    last_day_playtime=current_playtime,
                    created_at=today - timedelta(days=day_offset),
                )
            )
            
    return records


def generate_shelvings(rolling_times: list[SteamRollingTime], users: list[User]) -> list[Shelving]:
    """
    Infers GameStatus (Shelving) from the generated playtime.
    """
    shelvings = []
    
    # Aggregate data by (user_id, app_id)
    # We need to know:
    # 1. Total Playtime
    # 2. Playtime in the last 14 days
    
    stats = {}
    today = date.today()
    for rt in rolling_times:
        key = (rt.user_id, rt.steam_app_id)
        if key not in stats:
            stats[key] = {"total": 0, "recent": 0}
            
        # The rolling time records represent the cumulative playtime up to that day.
        # We can just look at the delta between today and 14 days ago.
        # But iterating all records is fine, we just update total to the latest day's playtime.
        days_ago = (today - rt.created_at).days
        stats[key]["total"] = max(stats[key]["total"], rt.last_day_playtime)
        
        if days_ago == 14:
            stats[key]["14_days_ago"] = rt.last_day_playtime
            
    # Resolve Games map
    # Some games in top games don't have UUIDs generated manually.
    # But Shelving requires `game_id` as UUID. We will map steam_app_id to game_id.
    app_id_to_game_id = {}
    
    for (user_id, app_id), data in stats.items():
        total = data["total"]
        playtime_14_days_ago = data.get("14_days_ago", 0)
        recent_playtime = total - playtime_14_days_ago
        
        status = GameStatus.TO_BE_PLAYED
        if total == 0:
            status = GameStatus.TO_BE_PLAYED
        elif recent_playtime > 0:
            status = GameStatus.PLAYING
        else:
            # Played in the past but not recently
            if total > 600: # > 10 hours
                status = random.choice([GameStatus.PLATINATO, GameStatus.SHELVED])
            else:
                status = GameStatus.SHELVED
                
        # Resolve a deterministic UUID for the game based on steam_app_id
        game_id = UUID(int=int(app_id)*1000)
        
        shelvings.append(
            Shelving(
                owner_id=user_id,
                game_id=game_id,
                status=status
            )
        )
        
    return shelvings

def seed_database(mock_users: int = 50) -> None:
    """Reset demo data and insert a consistent sample dataset using SQLModel models."""
    with Session(engine) as session:
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

        genre_instances = {}
        for gd in GENRES_DATA:
            g = Genre(id=gd["id"], description=gd["description"])
            session.add(g)
            genre_instances[gd["id"]] = g
        session.flush()

        # Seed realistic Top Games (used for both TopGame and standard Games)
        for tg in TOP_GAMES_DATA:
            tg_genres: list[str] = tg["genres"]
            top_game = TopGame(
                steam_app_id=tg["steam_app_id"],
                rank=tg["rank"],
                genres=[genre_instances[gid] for gid in tg_genres if gid in genre_instances],
            )
            session.add(top_game)
            
            # Add to Game table to support Shelvings
            game_id = UUID(int=int(tg["steam_app_id"])*1000)
            game = Game(
                id=game_id,
                steam_app_id=tg["steam_app_id"],
                genres=[genre_instances[gid] for gid in tg_genres if gid in genre_instances],
            )
            session.add(game)
        session.flush()

        crawled_users_data = load_crawled_users()
        users = _users(crawled_users_data, mock_users)
        for user in users:
            session.add(user)
        session.flush()

        rolling_times = []
        
        # Hardcoded specific logic for SLAIT_GRAPH
        slait_games_targets = [
            ("322330", 629),
            ("3875050", 115),
            ("431960", 50),
            ("304930", 22),
            ("286690", 0),
            ("2815070", 0)
        ]
        # Make sure these specific games are in the Game table if not already
        for app_id, _ in slait_games_targets:
            game_id = UUID(int=int(app_id)*1000)
            if not session.get(Game, game_id):
                session.add(Game(id=game_id, steam_app_id=app_id))
                
        rolling_times.extend(generate_user_playtime(SLAIT_GRAPH_USER_ID, slait_games_targets, 730))

        # Test-01 Specific logic
        test01_targets = [("730", 25000), ("1174180", 5500), ("271590", 12000), ("1245620", 4000), ("570", 800)]
        rolling_times.extend(generate_user_playtime(DEMO_USER_1_ID, test01_targets, 730))

        # New Demo User Specific logic
        new_demo_targets = [("730", 15000), ("570", 5000), ("431960", 200)]
        rolling_times.extend(generate_user_playtime(NEW_DEMO_USER_ID, new_demo_targets, 730))

        # Mock targets for all other users
        top_app_ids = [tg["steam_app_id"] for tg in TOP_GAMES_DATA]
        
        for user in track(users, description="Generating mock playtimes..."):
            if user.id in [SLAIT_GRAPH_USER_ID, DEMO_USER_1_ID, NEW_DEMO_USER_ID]:
                continue
            
            # Pick 3 to 8 random games for this user
            num_games = random.randint(3, 8)
            user_games = random.sample(top_app_ids, num_games)
            
            targets = []
            for app_id in user_games:
                # Randomize playtime, skewed towards lower playtimes
                playtime = int(random.expovariate(1/5000)) 
                targets.append((app_id, playtime))
                
            rolling_times.extend(generate_user_playtime(user.id, targets, 730))

        for rt in track(rolling_times, description="Inserting RollingTimes into DB..."):
            session.add(rt)
            
        # Dynamically generate shelvings based on the 730-day playtime history
        shelvings = generate_shelvings(rolling_times, users)
        for s in track(shelvings, description="Inserting Shelvings into DB..."):
            session.add(s)
        # Commit all the massive data first to avoid autoflush hanging later
        session.commit()

        # Generate some random friendships among users
        # 1. Hardcoded friendships
        session.add(Friendship(requester_id=DEMO_USER_1_ID, addressee_id=DEMO_USER_2_ID, status=FriendshipStatus.ACCEPTED))
        session.add(Friendship(requester_id=DEMO_USER_4_ID, addressee_id=DEMO_USER_1_ID, status=FriendshipStatus.PENDING))
        session.add(Friendship(requester_id=DEMO_USER_1_ID, addressee_id=DEMO_USER_5_ID, status=FriendshipStatus.BLOCKED))
        session.add(Friendship(requester_id=DEMO_USER_1_ID, addressee_id=NEW_DEMO_USER_ID, status=FriendshipStatus.ACCEPTED))

        # 2. Random friendships for the mock users (small world)
        mock_user_ids = [u.id for u in users if u.id not in [DEMO_USER_1_ID, DEMO_USER_2_ID, DEMO_USER_3_ID, DEMO_USER_4_ID, DEMO_USER_5_ID, SLAIT_GRAPH_USER_ID, NEW_DEMO_USER_ID]]
        for user_id in mock_user_ids:
            # Each mock user has 1 to 5 friends
            friends_count = random.randint(1, 5)
            friends = random.sample(mock_user_ids, min(friends_count, len(mock_user_ids)))
            for friend_id in friends:
                if friend_id != user_id:
                    # Avoid duplicates
                    if not session.query(Friendship).filter_by(requester_id=user_id, addressee_id=friend_id).first() and not session.query(Friendship).filter_by(requester_id=friend_id, addressee_id=user_id).first():
                        session.add(Friendship(requester_id=user_id, addressee_id=friend_id, status=random.choice([FriendshipStatus.ACCEPTED, FriendshipStatus.PENDING])))

        yesterday_iso = (datetime.now(UTC) - timedelta(days=1)).isoformat()
        session.merge(Config(key="last_update", value=yesterday_iso))

        session.commit()

def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the GameLog database.")
    parser.add_argument("--mock-users", type=int, default=50, help="Number of random crawled users to inject")
    args = parser.parse_args()
    
    seed_database(mock_users=args.mock_users)
    print("Demo data inserted successfully.")

if __name__ == "__main__":
    main()
