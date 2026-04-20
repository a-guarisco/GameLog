from __future__ import annotations

from datetime import date
from uuid import UUID

from sqlalchemy import delete

from src.database import SessionLocal
from src.models import Game, GameStatus, Shelving, SteamRollingTime, User

SEED_USERS = [
    {
        "id": UUID("11111111-1111-1111-1111-111111111111"),
        "firebase_uid": "firebase-demo-001",
        "username": "alice",
        "steam_id": "76561198000000001",
        "steam_api_key": "demo-key-alice",
    },
    {
        "id": UUID("22222222-2222-2222-2222-222222222222"),
        "firebase_uid": "firebase-demo-002",
        "username": "bob",
        "steam_id": "76561198000000002",
        "steam_api_key": "demo-key-bob",
    },
]

SEED_GAMES = [
    {
        "id": UUID("33333333-3333-3333-3333-333333333333"),
        "steam_app_id": "730",
        "logo_url": "https://cdn.example.com/games/cs2-logo.png",
        "banner_url": "https://cdn.example.com/games/cs2-banner.png",
    },
    {
        "id": UUID("44444444-4444-4444-4444-444444444444"),
        "steam_app_id": "570",
        "logo_url": "https://cdn.example.com/games/dota2-logo.png",
        "banner_url": "https://cdn.example.com/games/dota2-banner.png",
    },
    {
        "id": UUID("55555555-5555-5555-5555-555555555555"),
        "steam_app_id": "1174180",
        "logo_url": "https://cdn.example.com/games/rdr2-logo.png",
        "banner_url": "https://cdn.example.com/games/rdr2-banner.png",
    },
]

SEED_SHELVING = [
    {
        "owner_id": UUID("11111111-1111-1111-1111-111111111111"),
        "game_id": UUID("33333333-3333-3333-3333-333333333333"),
        "status": GameStatus.PLAYING,
    },
    {
        "owner_id": UUID("11111111-1111-1111-1111-111111111111"),
        "game_id": UUID("55555555-5555-5555-5555-555555555555"),
        "status": GameStatus.TO_BE_PLAYED,
    },
    {
        "owner_id": UUID("22222222-2222-2222-2222-222222222222"),
        "game_id": UUID("44444444-4444-4444-4444-444444444444"),
        "status": GameStatus.SHELVED,
    },
]

SEED_STEAM_ROLLING_TIME = [
    {
        "id": UUID("66666666-6666-6666-6666-666666666666"),
        "user_id": UUID("11111111-1111-1111-1111-111111111111"),
        "steam_app_id": "730",
        "last_day_playtime": 120,
        "created_at": date(2026, 4, 17),
    },
    {
        "id": UUID("77777777-7777-7777-7777-777777777777"),
        "user_id": UUID("11111111-1111-1111-1111-111111111111"),
        "steam_app_id": "1174180",
        "last_day_playtime": 45,
        "created_at": date(2026, 4, 18),
    },
    {
        "id": UUID("88888888-8888-8888-8888-888888888888"),
        "user_id": UUID("22222222-2222-2222-2222-222222222222"),
        "steam_app_id": "570",
        "last_day_playtime": 300,
        "created_at": date(2026, 4, 18),
    },
]

def seed_database() -> None:
    """Reset demo data and insert a small, consistent sample dataset."""
    session = SessionLocal()
    try:
        session.execute(delete(SteamRollingTime))
        session.execute(delete(Shelving))
        session.execute(delete(Game))
        session.execute(delete(User))
        session.flush()

        for payload in SEED_USERS:
            session.add(User(**payload))

        for payload in SEED_GAMES:
            session.add(Game(**payload))

        session.flush()

        for payload in SEED_SHELVING:
            session.add(Shelving(**payload))

        for payload in SEED_STEAM_ROLLING_TIME:
            session.add(SteamRollingTime(**payload))

        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def main() -> None:
    seed_database()
    print("Demo data inserted successfully.")


if __name__ == "__main__":
    main()
