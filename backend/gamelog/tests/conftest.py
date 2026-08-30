"""
Shared test fixtures for the GameLog test suite.

Provides:
- An in-memory SQLite engine (one per test function via `session` fixture)
- Factory helpers for User, Game, Shelving, SteamRollingTime
- A FastAPI TestClient with the DB and auth dependencies overridden
"""

import os
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

# ---------------------------------------------------------------------------
# Environment must be set BEFORE any app imports touch pydantic-settings
# ---------------------------------------------------------------------------
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", "/tmp/dummy_credentials.json")
os.environ.setdefault("USE_FIREBASE_EMULATOR", "true")
os.environ.setdefault("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")
os.environ.setdefault("RUN_SCHEDULER", "false")

# ---------------------------------------------------------------------------
# SQLite engine / session
# ---------------------------------------------------------------------------
from sqlalchemy.pool import StaticPool

from src.auth.schemas import AuthenticatedUser
from src.core.database import get_db
from src.main import app
from src.models import Game, GameStatus, Shelving, SteamRollingTime, User


@pytest.fixture(scope="function")
def engine():
    """Fresh in-memory SQLite engine for each test."""

    _engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(_engine)
    yield _engine
    SQLModel.metadata.drop_all(_engine)
    _engine.dispose()


@pytest.fixture(scope="function")
def session(engine):
    """SQLModel session wired to the in-memory engine."""
    with Session(engine) as sess:
        yield sess


# ---------------------------------------------------------------------------
# Data factories
# ---------------------------------------------------------------------------


def make_user(
    session: Session,
    *,
    firebase_uid: str = "firebase-uid-1",
    username: str = "testuser",
    steam_id: str = "76561197960287930",
    steam_api_key: str = "FAKE_KEY",
    region: str = "IT",
) -> User:
    user = User(
        firebase_uid=firebase_uid,
        username=username,
        steam_id=steam_id,
        steam_api_key=steam_api_key,
        region=region,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def make_game(session: Session, *, steam_app_id: str = "570") -> Game:
    game = Game(steam_app_id=steam_app_id)
    session.add(game)
    session.commit()
    session.refresh(game)
    return game


def make_shelving(
    session: Session,
    *,
    user: User,
    game: Game,
    status: GameStatus = GameStatus.PLAYING,
) -> Shelving:
    shelving = Shelving(owner_id=user.id, game_id=game.id, status=status)
    session.add(shelving)
    session.commit()
    return shelving


def make_rolling(
    session: Session,
    *,
    user: User,
    steam_app_id: str = "570",
    last_day_playtime: int = 100,
    created_at: date | None = None,
) -> SteamRollingTime:
    rolling = SteamRollingTime(
        user_id=user.id,
        steam_app_id=steam_app_id,
        last_day_playtime=last_day_playtime,
        created_at=created_at or date.today(),
    )
    session.add(rolling)
    session.commit()
    session.refresh(rolling)
    return rolling


# ---------------------------------------------------------------------------
# FastAPI TestClient with overridden dependencies
# ---------------------------------------------------------------------------


@pytest.fixture(scope="function")
def client(session):
    """
    TestClient with:
    - DB dependency replaced by the in-memory `session`
    - Auth dependency replaced by a fake authenticated user
    """
    fake_auth = AuthenticatedUser(uid="firebase-uid-1", email="test@example.com")

    def override_get_db():
        yield session

    from src.auth.auth import get_current_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: fake_auth

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
