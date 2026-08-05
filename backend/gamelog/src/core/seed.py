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

from sqlalchemy import delete
from sqlmodel import Session

from src.core.database import engine
from src.models import Config, Game, GameStatus, Shelving, SteamRollingTime, User, Friendship, FriendshipStatus

# Fixed UUIDs for predictable database referencing in unit tests and manual API verification.
DEMO_USER_1_ID = UUID("11111111-1111-1111-1111-111111111111")
DEMO_USER_2_ID = UUID("22222222-2222-2222-2222-222222222222")
DEMO_USER_3_ID = UUID("33333333-3333-3333-3333-333333333333")
DEMO_USER_4_ID = UUID("44444444-4444-4444-4444-444444444444")
DEMO_USER_5_ID = UUID("55555555-5555-5555-5555-555555555555")

DEMO_GAME_CS2_ID = UUID("66666666-6666-6666-6666-666666666666")
DEMO_GAME_DOTA_ID = UUID("77777777-7777-7777-7777-777777777777")
DEMO_GAME_RDR2_ID = UUID("88888888-8888-8888-8888-888888888888")


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
            steam_api_key="724FF154B1D2A357857A257EA28C6415",
        ),
        User(
            id=DEMO_USER_2_ID,
            firebase_uid="tcYaHPGYDkVBlnNrcI7jNf2z4MS2",  # Matches test-02@test.com
            username="test-02",
            steam_id="76561198000000002",
            steam_api_key="",
        ),
        User(
            id=DEMO_USER_3_ID,
            firebase_uid="GRbqhGIYlzb1GHEaBINeJq1ZXld2",  # Matches test-03@test.com
            username="test-03",
            steam_id="76561198000000003",
            steam_api_key="",
        ),
        User(
            id=DEMO_USER_4_ID,
            firebase_uid="wcMFGsVqaYYNHSAeUXgGiK14WPk2",  # Matches test-04@test.com
            username="test-04",
            steam_id="76561198000000004",
            steam_api_key="",
        ),
        User(
            id=DEMO_USER_5_ID,
            firebase_uid="a7swvzI0APgq57SMa8B7PsHevG02",  # Matches test-05@test.com
            username="test-05",
            steam_id="76561198000000005",
            steam_api_key="",
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
    ]


def _shelvings() -> list[Shelving]:
    """Returns sample game status assignments (Shelvings) per user."""
    return [
        Shelving(owner_id=DEMO_USER_1_ID, game_id=DEMO_GAME_CS2_ID, status=GameStatus.PLAYING),
        Shelving(owner_id=DEMO_USER_1_ID, game_id=DEMO_GAME_RDR2_ID, status=GameStatus.TO_BE_PLAYED),
        Shelving(owner_id=DEMO_USER_2_ID, game_id=DEMO_GAME_DOTA_ID, status=GameStatus.SHELVED),
        Shelving(owner_id=DEMO_USER_3_ID, game_id=DEMO_GAME_CS2_ID, status=GameStatus.PLAYED),
        Shelving(owner_id=DEMO_USER_4_ID, game_id=DEMO_GAME_RDR2_ID, status=GameStatus.PLAYING),
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
            playtime_increment = [0, 60, 90, 0, 15, 30, 45, 0, 0, 120, 10, 0, 35, 50, 0][14 - day_offset]
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
        session.exec(delete(SteamRollingTime))
        session.exec(delete(Shelving))
        session.exec(delete(Friendship))
        session.exec(delete(Game))
        session.exec(delete(User))
        session.exec(delete(Config))
        session.flush()

        for user in _users():
            session.add(user)
        for game in _games():
            session.add(game)
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
