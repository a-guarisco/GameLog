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
from pathlib import Path
from uuid import UUID, uuid4

from rich.progress import track
from sqlalchemy import delete, insert
from sqlmodel import Session, select

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
DEMO_USER_6_ID = UUID("66666666-6666-6666-6666-666666666666")
DEMO_USER_7_ID = UUID("77777777-7777-7777-7777-777777777777")
DEMO_USER_8_ID = UUID("88888888-8888-8888-8888-888888888888")

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


def load_crawled_users(target_count: int = 50) -> list[dict]:
    seed_path = Path("src/core/seed_data_users.json")
    if seed_path.exists():
        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data:
                    return data[:target_count]
        except (OSError, json.JSONDecodeError):
            pass

    raise FileNotFoundError(
        f"❌ '{seed_path}' non trovato.\n"
        "💡 Il crawler deve essere eseguito sull'host prima del seeding nel container.\n"
        "👉 Esegui sull'host: make crawl-steam"
    )


def _users(crawled_users: list[dict], mock_users: int = 50) -> list[User]:
    users = []

    # Retrieve Steam Web API credentials from environment variables
    default_api_key = os.getenv("DEFAULT_STEAM_API_KEY") or ""
    if not default_api_key:
        print("WARNING: DEFAULT_STEAM_API_KEY is not set. API calls to Steam may fail if user-specific keys are also missing.")

    dede_api_key = os.getenv("DEDEPIVOT_STEAM_API_KEY") or default_api_key
    xrayman_api_key = os.getenv("XRAYMAN_STEAM_API_KEY") or default_api_key
    slaitroc_api_key = os.getenv("SLAITROC_STEAM_API_KEY") or default_api_key

    # Deterministic mapping of primary development accounts to known 64-bit Steam IDs
    fixed_steam_ids = {
        DEMO_USER_1_ID: "76561198077919169",  # dedepivot
        DEMO_USER_2_ID: "76561198159652025",  # xrayman
        DEMO_USER_6_ID: "76561198248779666",  # slaitroc
    }

    # Instantiate primary development accounts
    users.append(
        User(
            id=DEMO_USER_1_ID,
            firebase_uid="dede1234567890abcdefghijklmn",
            username="dedepivot",
            steam_id=fixed_steam_ids[DEMO_USER_1_ID],
            steam_api_key=dede_api_key,
            region="IT",
        )
    )
    users.append(
        User(
            id=DEMO_USER_2_ID,
            firebase_uid="xrayman1234567890abcdefghijk",
            username="xrayman",
            steam_id=fixed_steam_ids[DEMO_USER_2_ID],
            steam_api_key=xrayman_api_key,
            region="IT",
        )
    )
    users.append(
        User(
            id=DEMO_USER_6_ID,
            firebase_uid="slaitroc1234567890abcdefghij",
            username="slaitroc",
            steam_id=fixed_steam_ids[DEMO_USER_6_ID],
            steam_api_key=slaitroc_api_key,
            region="IT",
        )
    )

    exclude_ids = set(fixed_steam_ids.values())

    # Map deterministic secondary test accounts to available crawled profiles
    test_uids = [
        ("test-01", "test011234567890abcdefghijkl", DEMO_USER_3_ID),
        ("test-02", "test021234567890abcdefghijkl", DEMO_USER_4_ID),
        ("test-03", "test031234567890abcdefghijkl", DEMO_USER_5_ID),
        ("test-04", "test041234567890abcdefghijkl", DEMO_USER_7_ID),
        ("test-05", "test051234567890abcdefghijkl", DEMO_USER_8_ID),
    ]

    test_idx = 0
    crawled_idx = 0

    while test_idx < 5 and crawled_idx < len(crawled_users):
        c_user = crawled_users[crawled_idx]
        s_id = c_user["steam_id"]
        if s_id not in exclude_ids:
            exclude_ids.add(s_id)
            t_name, t_fbid, t_uuid = test_uids[test_idx]
            users.append(
                User(
                    id=t_uuid,
                    firebase_uid=t_fbid,
                    username=f"{t_name}_{c_user['personaname'][:15]}",
                    steam_id=s_id,
                    steam_api_key=default_api_key,
                    region=c_user["region"],
                )
            )
            test_idx += 1
        crawled_idx += 1

    # Populate the remaining user quota with crawled profiles
    added_mock = len(users)
    while added_mock < mock_users and crawled_idx < len(crawled_users):
        c_user = crawled_users[crawled_idx]
        s_id = c_user["steam_id"]
        if s_id not in exclude_ids:
            exclude_ids.add(s_id)
            users.append(
                User(
                    id=uuid4(),
                    firebase_uid=f"mock_{s_id}",
                    username=c_user["personaname"][:30],
                    steam_id=s_id,
                    steam_api_key=default_api_key,
                    region=c_user["region"],
                )
            )
            added_mock += 1
        crawled_idx += 1

    return users


def generate_user_playtime(user_id: UUID, games_targets: list[tuple[str, int]], history_days: int = 365) -> list[SteamRollingTime]:
    """
    Simulates historical daily playtime curves leading up to cumulative playtime targets.

    Generates realistic playtime progression over a given observation window, accounting for
    baseline playtime prior to tracking and stochastic daily gaming sessions.
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

        # For small playtime totals (< 30 hours), assume all playtime accrued within the tracking window.
        # Otherwise, assume 50% accrued prior to the start of the window.
        if final_target < 1800:
            baseline = 0
        else:
            baseline = final_target // 2

        remaining = final_target - baseline
        increments = [0] * (history_days + 1)

        if remaining > 0:
            # Distribute discrete gaming sessions (30 to 240 minutes) across the tracking period
            # until the remaining playtime quota is exhausted.
            while remaining > 0:
                day_idx = random.randint(0, history_days - 1)

                # Bound session length between 30 and 240 minutes, clamped to remaining quota
                session_len = random.randint(30, 240)
                session_len = min(session_len, remaining)

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
    Derives game shelving statuses from cumulative and recent playtime metrics.
    """
    shelvings = []

    # Aggregate cumulative and recent (14-day window) playtime metrics per (user_id, app_id)
    stats = {}
    today = date.today()
    for rt in rolling_times:
        key = (rt.user_id, rt.steam_app_id)
        if key not in stats:
            stats[key] = {"total": 0, "recent": 0}

        # Track total playtime and baseline playtime recorded exactly 14 days ago
        days_ago = (today - rt.created_at).days
        stats[key]["total"] = max(stats[key]["total"], rt.last_day_playtime)

        if days_ago == 14:
            stats[key]["14_days_ago"] = rt.last_day_playtime

    # Evaluate shelving status based on engagement thresholds
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
            # Titles with historical engagement but no recent activity
            if total > 600:  # Cumulative playtime exceeds 10 hours
                status = random.choice([GameStatus.PLATINATO, GameStatus.SHELVED])
            else:
                status = GameStatus.SHELVED

        # Derive a deterministic UUID for the game entity from steam_app_id
        # NOTE this deterministic approach is adopted here only (not exploited in the backend)
        game_id = UUID(int=int(app_id) * 1000)

        shelvings.append(Shelving(owner_id=user_id, game_id=game_id, status=status))

    return shelvings


def seed_database(mock_users: int = 50) -> None:
    """Purges existing database records and seeds a comprehensive demonstration dataset."""
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

        session.execute(insert(Genre), GENRES_DATA)
        session.flush()
        genre_instances = {g.id: g for g in session.exec(select(Genre)).all()}

        # Seed catalog with top Steam games and associate them with existing genres
        for tg in TOP_GAMES_DATA:
            tg_genres: list[str] = tg["genres"]
            top_game = TopGame(
                steam_app_id=tg["steam_app_id"],
                rank=tg["rank"],
                genres=[genre_instances[gid] for gid in tg_genres if gid in genre_instances],
            )
            session.add(top_game)

            # Synchronize Game entities to satisfy foreign key constraints for Shelvings
            game_id = UUID(int=int(tg["steam_app_id"]) * 1000)
            game = Game(
                id=game_id,
                steam_app_id=tg["steam_app_id"],
                genres=[genre_instances[gid] for gid in tg_genres if gid in genre_instances],
            )
            session.add(game)
        session.flush()

        crawled_users_data = load_crawled_users(mock_users)
        users = _users(crawled_users_data, mock_users)
        for user in users:
            session.add(user)
        session.flush()

        rolling_times = []

        # Map user Steam IDs to their respective owned game collections
        owned_games_map = {cu["steam_id"]: cu.get("owned_games", []) for cu in crawled_users_data}

        for user in track(users, description="Generating mock playtimes..."):
            targets = []

            # Extract verified library records for the current user
            real_games = owned_games_map.get(user.steam_id, [])

            if real_games:
                for g in real_games:
                    app_id = str(g["appid"])
                    playtime = g["playtime_forever"]
                    targets.append((app_id, playtime))

                    # Ensure referenced Game record is persisted in the database
                    game_id = UUID(int=int(app_id) * 1000)
                    if not session.get(Game, game_id):
                        session.add(Game(id=game_id, steam_app_id=app_id))

            rolling_times.extend(generate_user_playtime(user.id, targets, 365))

        # Bulk insert rolling times in chunks to eliminate ORM identity map tracking overhead
        chunk_size = 10_000
        if rolling_times:
            rolling_dicts = [
                {
                    "id": rt.id,
                    "user_id": rt.user_id,
                    "steam_app_id": rt.steam_app_id,
                    "last_day_playtime": rt.last_day_playtime,
                    "created_at": rt.created_at,
                }
                for rt in rolling_times
            ]
            for i in track(range(0, len(rolling_dicts), chunk_size), description="Bulk inserting RollingTimes..."):
                session.execute(insert(SteamRollingTime), rolling_dicts[i : i + chunk_size])

        # Generate shelving entries inferred from the rolling playtime records
        shelvings = generate_shelvings(rolling_times, users)
        if shelvings:
            shelving_dicts = [
                {
                    "owner_id": s.owner_id,
                    "game_id": s.game_id,
                    "status": s.status,
                }
                for s in shelvings
            ]
            for i in track(range(0, len(shelving_dicts), chunk_size), description="Bulk inserting Shelvings..."):
                session.execute(insert(Shelving), shelving_dicts[i : i + chunk_size])
        # Commit core entities and historical times in batch to reduce autoflush overhead
        print("💾 Persisting seeded records to the database...")
        session.commit()

        # Synthesize friendship relations across users (accepted, pending, and blocked)
        all_user_ids = [u.id for u in users]

        for user in track(users, description="Generating friendships..."):
            possible_friends = [uid for uid in all_user_ids if uid != user.id]

            if len(possible_friends) >= 17:  # Standard distribution threshold (10 accepted, 5 pending, 2 blocked)
                chosen = random.sample(possible_friends, 17)
                accepted = chosen[:10]
                pending = chosen[10:15]
                blocked = chosen[15:]

                for f_id in accepted:
                    if (
                        not session.exec(select(Friendship).where(Friendship.requester_id == user.id, Friendship.addressee_id == f_id)).first()
                        and not session.exec(select(Friendship).where(Friendship.requester_id == f_id, Friendship.addressee_id == user.id)).first()
                    ):
                        session.add(Friendship(requester_id=user.id, addressee_id=f_id, status=FriendshipStatus.ACCEPTED))
                for f_id in pending:
                    if (
                        not session.exec(select(Friendship).where(Friendship.requester_id == user.id, Friendship.addressee_id == f_id)).first()
                        and not session.exec(select(Friendship).where(Friendship.requester_id == f_id, Friendship.addressee_id == user.id)).first()
                    ):
                        session.add(Friendship(requester_id=user.id, addressee_id=f_id, status=FriendshipStatus.PENDING))
                for f_id in blocked:
                    if (
                        not session.exec(select(Friendship).where(Friendship.requester_id == user.id, Friendship.addressee_id == f_id)).first()
                        and not session.exec(select(Friendship).where(Friendship.requester_id == f_id, Friendship.addressee_id == user.id)).first()
                    ):
                        session.add(Friendship(requester_id=user.id, addressee_id=f_id, status=FriendshipStatus.BLOCKED))
            else:
                # Handle smaller cohorts with scaled friendship allocations
                num_to_pick = min(len(possible_friends), 5)
                if num_to_pick > 0:
                    for f_id in random.sample(possible_friends, num_to_pick):
                        if (
                            not session.exec(select(Friendship).where(Friendship.requester_id == user.id, Friendship.addressee_id == f_id)).first()
                            and not session.exec(
                                select(Friendship).where(Friendship.requester_id == f_id, Friendship.addressee_id == user.id)
                            ).first()
                        ):
                            session.add(
                                Friendship(
                                    requester_id=user.id,
                                    addressee_id=f_id,
                                    status=random.choice([FriendshipStatus.ACCEPTED, FriendshipStatus.PENDING]),
                                )
                            )

        # Record seed timestamp in system configuration table
        yesterday_iso = (datetime.now(UTC) - timedelta(days=1)).isoformat()
        session.merge(Config(key="last_update", value=yesterday_iso))

        session.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the GameLog database.")
    parser.add_argument("--mock-users", type=int, default=50, help="Number of random crawled users to inject")
    args = parser.parse_args()

    seed_database(mock_users=args.mock_users)
    print("\n✅ Database seeding completed successfully!")
    print("🚀 You can now log into the application with the demo accounts.\n")


if __name__ == "__main__":
    main()
