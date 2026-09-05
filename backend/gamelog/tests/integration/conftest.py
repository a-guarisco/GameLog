import os
from collections.abc import Callable
from datetime import date, timedelta
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from src.auth.auth import get_current_user
from src.auth.schemas import AuthenticatedUser
from src.core.database import get_db
from src.main import app
from src.models import (
    Friendship,
    FriendshipStatus,
    Game,
    GameGenreLink,
    GameStatus,
    Genre,
    Shelving,
    SteamRollingTime,
    User,
)


class ScopedUserClient:
    """A TestClient wrapper that automatically sets the authenticated user context for its requests."""

    def __init__(self, client: TestClient, auth_user: AuthenticatedUser):
        self._client = client
        self.auth_user = auth_user

    def _apply_auth(self):
        app.dependency_overrides[get_current_user] = lambda: self.auth_user

    def get(self, url: str, **kwargs) -> Any:
        self._apply_auth()
        return self._client.get(url, **kwargs)

    def post(self, url: str, **kwargs) -> Any:
        self._apply_auth()
        return self._client.post(url, **kwargs)

    def put(self, url: str, **kwargs) -> Any:
        self._apply_auth()
        return self._client.put(url, **kwargs)

    def delete(self, url: str, **kwargs) -> Any:
        self._apply_auth()
        return self._client.delete(url, **kwargs)

    def request(self, method: str, url: str, **kwargs) -> Any:
        self._apply_auth()
        return self._client.request(method, url, **kwargs)


@pytest.fixture
def auth_client_factory(session: Session) -> Callable[[User | AuthenticatedUser], ScopedUserClient]:
    """Factory fixture returning an isolated client for a specific user actor."""

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    raw_client = TestClient(app)

    def _make_client(user_or_auth: User | AuthenticatedUser) -> ScopedUserClient:
        if isinstance(user_or_auth, User):
            auth_user = AuthenticatedUser(
                uid=user_or_auth.firebase_uid,
                email=f"{user_or_auth.username}@example.com",
                email_verified=True,
            )
        else:
            auth_user = user_or_auth

        return ScopedUserClient(raw_client, auth_user)

    return _make_client


@pytest.fixture
def seed_helpers(session: Session):
    """Seed helper utilities for integration tests."""

    class SeedHelpers:
        @staticmethod
        def create_user(
            username: str,
            firebase_uid: str | None = None,
            steam_id: str | None = None,
            region: str = "IT",
            steam_api_key: str = "VALID_STEAM_KEY",
        ) -> User:
            uid = firebase_uid or f"fb-{username}"
            sid = steam_id or f"steam-{username}"
            user = User(
                username=username,
                firebase_uid=uid,
                steam_id=sid,
                region=region,
                steam_api_key=steam_api_key,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            return user

        @staticmethod
        def create_genre(genre_id: str, description: str) -> Genre:
            existing = session.exec(select(Genre).where(Genre.id == genre_id)).first()
            if existing:
                return existing
            genre = Genre(id=genre_id, description=description)
            session.add(genre)
            session.commit()
            session.refresh(genre)
            return genre

        @staticmethod
        def create_game(steam_app_id: str, genres: list[tuple[str, str]] | None = None) -> Game:
            existing = session.exec(select(Game).where(Game.steam_app_id == steam_app_id)).first()
            if existing:
                game = existing
            else:
                game = Game(steam_app_id=steam_app_id)
                session.add(game)
                session.commit()
                session.refresh(game)

            if genres:
                for g_id, g_desc in genres:
                    g = SeedHelpers.create_genre(g_id, g_desc)
                    link_exists = session.exec(
                        select(GameGenreLink).where(
                            GameGenreLink.game_id == game.id,
                            GameGenreLink.genre_id == g.id,
                        )
                    ).first()
                    if not link_exists:
                        link = GameGenreLink(game_id=game.id, genre_id=g.id)
                        session.add(link)
                session.commit()

            return game

        @staticmethod
        def create_shelving(user: User, game: Game, status: GameStatus = GameStatus.PLAYING) -> Shelving:
            shelving = Shelving(owner_id=user.id, game_id=game.id, status=status)
            session.add(shelving)
            session.commit()
            session.refresh(shelving)
            return shelving

        @staticmethod
        def create_friendship(
            requester: User,
            addressee: User,
            status: FriendshipStatus = FriendshipStatus.ACCEPTED,
        ) -> Friendship:
            friendship = Friendship(
                requester_id=requester.id,
                addressee_id=addressee.id,
                status=status,
            )
            session.add(friendship)
            session.commit()
            session.refresh(friendship)
            return friendship

        @staticmethod
        def create_rolling_history(
            user: User,
            steam_app_id: str,
            days: int,
            daily_minutes: int,
            end_date: date | None = None,
        ) -> list[SteamRollingTime]:
            target_end = end_date or date.today()
            records = []
            # Seed day-by-day accumulating total playtime
            start_date = target_end - timedelta(days=days)
            # Baseline entry
            baseline = SteamRollingTime(
                user_id=user.id,
                steam_app_id=steam_app_id,
                last_day_playtime=0,
                created_at=start_date,
            )
            session.add(baseline)
            records.append(baseline)

            for i in range(1, days + 1):
                record_date = start_date + timedelta(days=i)
                rolling = SteamRollingTime(
                    user_id=user.id,
                    steam_app_id=steam_app_id,
                    last_day_playtime=i * daily_minutes,
                    created_at=record_date,
                )
                session.add(rolling)
                records.append(rolling)
            session.commit()
            return records

    return SeedHelpers
