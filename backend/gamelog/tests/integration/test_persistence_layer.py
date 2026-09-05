from datetime import date, timedelta
import pytest
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select, func

from src.models import (
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
    User,
)


class TestPersistenceLayer:
    """Section A: Database & Persistence Layer Integration Tests."""

    def test_user_uniqueness_constraints(self, session: Session, seed_helpers):
        """Verify that duplicate username, steam_id, or firebase_uid cannot be inserted."""
        seed_helpers.create_user(
            username="player1",
            firebase_uid="fb-1",
            steam_id="steam-1",
        )

        # 1. Duplicate firebase_uid
        dup_uid_user = User(
            username="player2",
            firebase_uid="fb-1",
            steam_id="steam-2",
            steam_api_key="KEY",
        )
        session.add(dup_uid_user)
        with pytest.raises(IntegrityError):
            session.commit()
        session.rollback()

        # 2. Duplicate username
        dup_name_user = User(
            username="player1",
            firebase_uid="fb-2",
            steam_id="steam-2",
            steam_api_key="KEY",
        )
        session.add(dup_name_user)
        with pytest.raises(IntegrityError):
            session.commit()
        session.rollback()

        # 3. Duplicate steam_id
        dup_steam_user = User(
            username="player3",
            firebase_uid="fb-3",
            steam_id="steam-1",
            steam_api_key="KEY",
        )
        session.add(dup_steam_user)
        with pytest.raises(IntegrityError):
            session.commit()
        session.rollback()

    def test_game_genre_many_to_many_links(self, session: Session, seed_helpers):
        """Verify M:N relational linking between Game and Genre."""
        game = seed_helpers.create_game(
            "570",
            genres=[("1", "Action"), ("2", "Strategy"), ("3", "MOBA")],
        )

        # Query genres linked to game
        genre_links = session.exec(
            select(Genre)
            .join(GameGenreLink, GameGenreLink.genre_id == Genre.id)
            .where(GameGenreLink.game_id == game.id)
        ).all()

        genre_descriptions = {g.description for g in genre_links}
        assert "Action" in genre_descriptions
        assert "Strategy" in genre_descriptions
        assert "MOBA" in genre_descriptions
        assert len(genre_descriptions) == 3

    def test_shelving_unique_user_game_constraint(self, session: Session, seed_helpers):
        """Verify a user cannot have duplicate shelving records for the same game."""
        user = seed_helpers.create_user("gamer_shelf")
        game = seed_helpers.create_game("730")

        seed_helpers.create_shelving(user, game, GameStatus.PLAYING)

        # Attempting duplicate shelving for same (user, game)
        dup_shelving = Shelving(owner_id=user.id, game_id=game.id, status=GameStatus.SHELVED)
        session.add(dup_shelving)
        with pytest.raises(IntegrityError):
            session.commit()
        session.rollback()

    def test_user_cascade_deletion(self, session: Session, seed_helpers):
        """Verify deleting a User cleans up dependent records."""
        user = seed_helpers.create_user("cascade_user")
        game = seed_helpers.create_game("1091500")

        # Create dependent records
        seed_helpers.create_shelving(user, game, GameStatus.PLAYING)
        seed_helpers.create_rolling_history(user, "1091500", days=3, daily_minutes=60)

        device_token = DeviceToken(user_id=user.id, device_token="token-xyz", device_type="ios")
        notification = Notification(user_id=user.id, title="Test", body="Welcome")
        session.add(device_token)
        session.add(notification)
        session.commit()

        # Delete dependent records and user
        for s in session.exec(select(Shelving).where(Shelving.owner_id == user.id)).all():
            session.delete(s)
        for r in session.exec(select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)).all():
            session.delete(r)
        session.delete(device_token)
        session.delete(notification)
        session.delete(user)
        session.commit()

        # Assert all dependent records are cleaned up
        tokens = session.exec(select(DeviceToken).where(DeviceToken.user_id == user.id)).all()
        notifications = session.exec(select(Notification).where(Notification.user_id == user.id)).all()
        shelvings = session.exec(select(Shelving).where(Shelving.owner_id == user.id)).all()

        assert len(tokens) == 0
        assert len(notifications) == 0
        assert len(shelvings) == 0

    def test_transaction_rollback_safety(self, session: Session, seed_helpers):
        """Verify that an atomic transaction rolling back on failure leaves no partial state."""
        user = seed_helpers.create_user("tx_user")
        game = seed_helpers.create_game("440")

        try:
            # 1. Valid operation
            shelving = Shelving(owner_id=user.id, game_id=game.id, status=GameStatus.PLAYING)
            session.add(shelving)

            # 2. Invalid operation in same transaction (violating non-nullable constraint)
            invalid_notification = Notification(user_id=None, title=None, body=None)
            session.add(invalid_notification)

            session.commit()
        except IntegrityError:
            session.rollback()

        # Assert that the shelving was also rolled back
        saved_shelving = session.exec(select(Shelving).where(Shelving.owner_id == user.id)).first()
        assert saved_shelving is None

    def test_analytical_rolling_time_aggregations(self, session: Session, seed_helpers):
        """Verify SQL aggregation queries for total playtime and daily sums."""
        user = seed_helpers.create_user("stats_user")
        today = date.today()

        # Day 1: 120 mins CS:GO + 60 mins Dota 2 = 180 mins
        seed_helpers.create_rolling_history(user, "730", days=1, daily_minutes=120, end_date=today)
        seed_helpers.create_rolling_history(user, "570", days=1, daily_minutes=60, end_date=today)

        # Day 2: 90 mins CS:GO
        seed_helpers.create_rolling_history(user, "730", days=1, daily_minutes=90, end_date=today - timedelta(days=1))

        # Query total playtime sum for user
        total_playtime = session.exec(
            select(func.sum(SteamRollingTime.last_day_playtime)).where(SteamRollingTime.user_id == user.id)
        ).one()
        assert total_playtime == 270

        # Query playtime grouped by date
        daily_sums = session.exec(
            select(SteamRollingTime.created_at, func.sum(SteamRollingTime.last_day_playtime))
            .where(SteamRollingTime.user_id == user.id)
            .group_by(SteamRollingTime.created_at)
            .order_by(SteamRollingTime.created_at.desc())
        ).all()

        assert len(daily_sums) == 3
        assert daily_sums[0][1] == 180  # Today
        assert daily_sums[1][1] == 90   # Yesterday
        assert daily_sums[2][1] == 0    # Baseline
