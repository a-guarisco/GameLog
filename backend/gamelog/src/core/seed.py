from __future__ import annotations

from datetime import date
from uuid import UUID, uuid4

from sqlalchemy import delete
from sqlmodel import Session

from src.core.database import engine
from src.models import Game, GameStatus, Shelving, SteamRollingTime, User

DEMO_USER_A_ID = UUID("11111111-1111-1111-1111-111111111111")
DEMO_USER_B_ID = UUID("22222222-2222-2222-2222-222222222222")

DEMO_GAME_CS2_ID = UUID("33333333-3333-3333-3333-333333333333")
DEMO_GAME_DOTA_ID = UUID("44444444-4444-4444-4444-444444444444")
DEMO_GAME_RDR2_ID = UUID("55555555-5555-5555-5555-555555555555")


def _users() -> list[User]:
    return [
        User(
            id=DEMO_USER_A_ID,
            firebase_uid="f4vGO3YdnJDyo8HZ3kfZqW5Ao6fJ",
            username="alice",
            steam_id="76561198077919169",
            steam_api_key="724FF154B1D2A357857A257EA28C6415",
        ),
        User(
            id=DEMO_USER_B_ID,
            firebase_uid="firebase-demo-002",
            username="bob",
            steam_id="76561198000000002",
            steam_api_key="",
        ),
    ]


def _games() -> list[Game]:
    return [
        Game(
            id=DEMO_GAME_CS2_ID,
            steam_app_id="730",
            logo_url="https://cdn.example.com/games/cs2-logo.png",
            banner_url="https://cdn.example.com/games/cs2-banner.png",
        ),
        Game(
            id=DEMO_GAME_DOTA_ID,
            steam_app_id="570",
            logo_url="https://cdn.example.com/games/dota2-logo.png",
            banner_url="https://cdn.example.com/games/dota2-banner.png",
        ),
        Game(
            id=DEMO_GAME_RDR2_ID,
            steam_app_id="1174180",
            logo_url="https://cdn.example.com/games/rdr2-logo.png",
            banner_url="https://cdn.example.com/games/rdr2-banner.png",
        ),
    ]


def _shelvings() -> list[Shelving]:
    return [
        Shelving(owner_id=DEMO_USER_A_ID, game_id=DEMO_GAME_CS2_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=DEMO_USER_A_ID, game_id=DEMO_GAME_RDR2_ID, status=GameStatus.TO_BE_PLAYED),
        Shelving(owner_id=DEMO_USER_B_ID, game_id=DEMO_GAME_DOTA_ID, status=GameStatus.SHELVED),
    ]


def _rolling_times() -> list[SteamRollingTime]:
    return [
        SteamRollingTime(
            id=uuid4(),
            user_id=DEMO_USER_A_ID,
            steam_app_id="730",
            last_day_playtime=120,
            created_at=date(2026, 4, 17),
        ),
        SteamRollingTime(
            id=uuid4(),
            user_id=DEMO_USER_A_ID,
            steam_app_id="1174180",
            last_day_playtime=45,
            created_at=date(2026, 4, 18),
        ),
        SteamRollingTime(
            id=uuid4(),
            user_id=DEMO_USER_B_ID,
            steam_app_id="570",
            last_day_playtime=300,
            created_at=date(2026, 4, 18),
        ),
    ]


def seed_database() -> None:
    """Reset demo data and insert a consistent sample dataset using SQLModel models."""
    with Session(engine) as session:
        session.exec(delete(SteamRollingTime))
        session.exec(delete(Shelving))
        session.exec(delete(Game))
        session.exec(delete(User))
        session.flush()

        for user in _users():
            session.add(user)
        for game in _games():
            session.add(game)
        for shelving in _shelvings():
            session.add(shelving)
        for rolling_time in _rolling_times():
            session.add(rolling_time)

        session.commit()


def main() -> None:
    seed_database()
    print("Demo data inserted successfully.")


if __name__ == "__main__":
    main()
