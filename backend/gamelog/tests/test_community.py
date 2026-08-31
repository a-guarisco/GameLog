from datetime import date
import uuid
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.auth.schemas import AuthenticatedUser
from src.community import community_service
from src.community.schemas import CommunityScope
from src.models import Friendship, FriendshipStatus, Game, GameGenreLink, Genre
from tests.conftest import make_game, make_rolling, make_user


def _setup_genre(session: Session, genre_id: str, description: str) -> Genre:
    genre = session.get(Genre, genre_id)
    if not genre:
        genre = Genre(id=genre_id, description=description)
        session.add(genre)
        session.commit()
        session.refresh(genre)
    return genre


def _link_game_genre(session: Session, game: Game, genre: Genre) -> None:
    link = GameGenreLink(game_id=game.id, genre_id=genre.id)
    session.add(link)
    session.commit()


class TestCommunityService:
    def test_global_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        g_action = _setup_genre(session, "1", "Action")
        g_rpg = _setup_genre(session, "3", "RPG")
        g_indie = _setup_genre(session, "23", "Indie")

        game1 = make_game(session, steam_app_id="100")
        game2 = make_game(session, steam_app_id="200")
        _link_game_genre(session, game1, g_action)
        _link_game_genre(session, game2, g_rpg)
        # g_indie is not played

        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=180)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_genre(CommunityScope.GLOBAL, session, auth_user)

        assert len(result) == 2
        # Total playtime across genres = 60 + 180 = 240
        # RPG: 180 / 240 = 75.0%
        # Action: 60 / 240 = 25.0%
        assert result[0].id == "3"
        assert result[0].description == "RPG"
        assert result[0].percentage == 75.0

        assert result[1].id == "1"
        assert result[1].description == "Action"
        assert result[1].percentage == 25.0

    def test_region_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="US")

        g_action = _setup_genre(session, "1", "Action")
        g_rpg = _setup_genre(session, "3", "RPG")

        game1 = make_game(session, steam_app_id="100")
        game2 = make_game(session, steam_app_id="200")
        _link_game_genre(session, game1, g_action)
        _link_game_genre(session, game2, g_rpg)

        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=100)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=100)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=500)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_genre(CommunityScope.REGION, session, auth_user)

        assert len(result) == 1
        assert result[0].id == "1"
        assert result[0].description == "Action"
        assert result[0].percentage == 100.0

    def test_region_scope_missing_region_raises_400(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region=None)
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_genre(CommunityScope.REGION, session, auth_user)
        assert exc.value.status_code == 400
        assert "User region is not set" in exc.value.detail

    def test_friends_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="IT")

        # u1 and u2 are friends, u3 is not
        friendship = Friendship(requester_id=u1.id, addressee_id=u2.id, status=FriendshipStatus.ACCEPTED)
        session.add(friendship)
        session.commit()

        g_action = _setup_genre(session, "1", "Action")
        g_rpg = _setup_genre(session, "3", "RPG")

        game1 = make_game(session, steam_app_id="100")
        game2 = make_game(session, steam_app_id="200")
        _link_game_genre(session, game1, g_action)
        _link_game_genre(session, game2, g_rpg)

        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=500)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_genre(CommunityScope.FRIENDS, session, auth_user)

        assert len(result) == 1
        assert result[0].id == "1"
        assert result[0].percentage == 100.0

    def test_friends_scope_no_friends_raises_400(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_genre(CommunityScope.FRIENDS, session, auth_user)
        assert exc.value.status_code == 400
        assert "User has no friends" in exc.value.detail

    def test_weekly_playtime_global_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="FR")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        wednesday = date(2026, 8, 26)
        sunday = date(2026, 8, 30)

        # u1: 60 mins on Tuesday
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=tuesday)

        # u2: 120 mins over Tuesday + Wednesday (60 mins each)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=wednesday)

        # u3: 180 mins on Tuesday
        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=180, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_playtime(
            CommunityScope.GLOBAL, monday, sunday, auth_user, session
        )

        assert len(result.user) == 7
        assert len(result.community) == 7

        # u1 user array: Tuesday is index 1 (0=Mon, 1=Tue) -> 60/60 = 1.0 hr
        assert result.user == [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0]

        # Community is u2 + u3 (2 users):
        # Tuesday (idx 1): (60 + 180) / 2 = 120 mins = 2.0 hrs
        # Wednesday (idx 2): (60 + 0) / 2 = 30 mins = 0.5 hrs
        assert result.community == [0.0, 2.0, 0.5, 0.0, 0.0, 0.0, 0.0]

    def test_weekly_playtime_region_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="US")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # u1 plays 30 min on Monday (baseline on Sunday 2026-08-23)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 8, 23))
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=30, created_at=monday)

        # u2 (same region): 120 mins on Tuesday
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120, created_at=tuesday)

        # u3 (different region): 300 mins on Tuesday (should be excluded)
        make_rolling(session, user=u3, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u3, steam_app_id="100", last_day_playtime=300, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_playtime(
            CommunityScope.REGION, monday, sunday, auth_user, session
        )

        assert result.user[0] == 0.5
        assert result.community[1] == 2.0

    def test_weekly_playtime_region_scope_missing_region_raises_400(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region=None)
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_weekly_playtime(
                CommunityScope.REGION, date(2026, 8, 24), date(2026, 8, 30), auth_user, session
            )
        assert exc.value.status_code == 400
        assert "User region is not set" in exc.value.detail

    def test_weekly_playtime_friends_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="IT")

        friendship = Friendship(requester_id=u1.id, addressee_id=u2.id, status=FriendshipStatus.ACCEPTED)
        session.add(friendship)
        session.commit()

        monday = date(2026, 8, 24)
        thursday = date(2026, 8, 27)
        sunday = date(2026, 8, 30)

        # u2 (friend) plays 60 mins on Thursday
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 8, 26))
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=60, created_at=thursday)

        # u3 (non-friend) plays 300 mins on Thursday
        make_rolling(session, user=u3, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 8, 26))
        make_rolling(session, user=u3, steam_app_id="100", last_day_playtime=300, created_at=thursday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_playtime(
            CommunityScope.FRIENDS, monday, sunday, auth_user, session
        )

        # Thursday is index 3 (0=Mon, 1=Tue, 2=Wed, 3=Thu)
        assert result.community[3] == 1.0

    def test_monthly_playtime_global_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="FR")

        start_date = date(2026, 1, 1)
        end_date = date(2026, 3, 31)  # Jan, Feb, Mar (3 months)

        # Jan 15: u1 60m, u2 120m, u3 180m
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 14))
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=date(2026, 1, 15))

        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 14))
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=date(2026, 1, 15))

        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=0, created_at=date(2026, 1, 14))
        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=180, created_at=date(2026, 1, 15))

        # Feb 10: u1 120m, u2 60m, u3 180m
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=date(2026, 2, 9))
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=180, created_at=date(2026, 2, 10))

        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=date(2026, 2, 9))
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=180, created_at=date(2026, 2, 10))

        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=180, created_at=date(2026, 2, 9))
        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=360, created_at=date(2026, 2, 10))

        # Mar 2: u3 60m
        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=360, created_at=date(2026, 3, 1))
        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=420, created_at=date(2026, 3, 2))

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_monthly_playtime(
            CommunityScope.GLOBAL, start_date, end_date, auth_user, session
        )

        assert len(result.user) == 3
        assert len(result.community) == 3

        # User: Jan=1.0 hr (60m), Feb=2.0 hrs (120m), Mar=0.0 hr
        assert result.user == [1.0, 2.0, 0.0]

        # Community (u2 + u3):
        # Jan: (120 + 180) / (2 * 60) = 2.5 hrs
        # Feb: (60 + 180) / (2 * 60) = 2.0 hrs
        # Mar: (0 + 60) / (2 * 60) = 0.5 hrs
        assert result.community == [2.5, 2.0, 0.5]

    def test_monthly_playtime_region_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="US")

        start_date = date(2026, 1, 1)
        end_date = date(2026, 2, 28)  # Jan, Feb (2 months)

        # Jan 10: u1 30m, u2 120m, u3 300m
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=30, created_at=date(2026, 1, 10))

        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120, created_at=date(2026, 1, 10))

        make_rolling(session, user=u3, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u3, steam_app_id="100", last_day_playtime=300, created_at=date(2026, 1, 10))

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_monthly_playtime(
            CommunityScope.REGION, start_date, end_date, auth_user, session
        )

        assert len(result.user) == 2
        assert len(result.community) == 2
        assert result.user == [0.5, 0.0]
        # Community (only u2, same region IT): Jan=120m=2.0 hrs, Feb=0.0
        assert result.community == [2.0, 0.0]

    def test_monthly_playtime_region_scope_missing_region_raises_400(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region=None)
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_monthly_playtime(
                CommunityScope.REGION, date(2026, 1, 1), date(2026, 12, 31), auth_user, session
            )
        assert exc.value.status_code == 400
        assert "User region is not set" in exc.value.detail

    def test_monthly_playtime_friends_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="IT")

        friendship = Friendship(requester_id=u1.id, addressee_id=u2.id, status=FriendshipStatus.ACCEPTED)
        session.add(friendship)
        session.commit()

        start_date = date(2026, 1, 1)
        end_date = date(2026, 2, 28)

        # Jan 20: u2 (friend) 60m, u3 (non-friend) 300m
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 19))
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=60, created_at=date(2026, 1, 20))

        make_rolling(session, user=u3, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 19))
        make_rolling(session, user=u3, steam_app_id="100", last_day_playtime=300, created_at=date(2026, 1, 20))

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_monthly_playtime(
            CommunityScope.FRIENDS, start_date, end_date, auth_user, session
        )

        assert len(result.community) == 2
        # Jan is index 0 -> 60/60 = 1.0 hr for friend u2
        assert result.community == [1.0, 0.0]

    def test_monthly_playtime_friends_scope_no_friends_raises_400(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_monthly_playtime(
                CommunityScope.FRIENDS, date(2026, 1, 1), date(2026, 12, 31), auth_user, session
            )
        assert exc.value.status_code == 400
        assert "User has no friends" in exc.value.detail

    def test_weekly_top_games_global_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="FR")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # 6 games played by u2 and u3:
        # Game 500: u2 plays 300m -> total 300m
        make_rolling(session, user=u2, steam_app_id="500", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="500", last_day_playtime=300, created_at=tuesday)

        # Game 400: u2 plays 240m -> total 240m
        make_rolling(session, user=u2, steam_app_id="400", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="400", last_day_playtime=240, created_at=tuesday)

        # Game 300: u3 plays 180m -> total 180m
        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=180, created_at=tuesday)

        # Game 200: u3 plays 120m -> total 120m
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=120, created_at=tuesday)

        # Game 100: u2 plays 60m -> total 60m
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=60, created_at=tuesday)

        # Game 600: u3 plays 30m -> total 30m (6th game, should not be in top 5)
        make_rolling(session, user=u3, steam_app_id="600", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u3, steam_app_id="600", last_day_playtime=30, created_at=tuesday)

        # u1 (current user) plays Game 100 (120m=2.0h) and Game 500 (60m=1.0h)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=120, created_at=tuesday)

        make_rolling(session, user=u1, steam_app_id="500", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="500", last_day_playtime=60, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(
            CommunityScope.GLOBAL, monday, sunday, auth_user, session
        )

        assert len(result) == 5
        # Top 1: Game 500 (comm = 2.5h, user = 1.0h, combined = 3.5h)
        assert result[0].id == "500"
        assert result[0].community_playtime == 2.5
        assert result[0].user_playtime == 1.0

        # Top 2: Game 100 (comm = 0.5h, user = 2.0h, combined = 2.5h)
        assert result[1].id == "100"
        assert result[1].community_playtime == 0.5
        assert result[1].user_playtime == 2.0

        # Top 3: Game 400 (comm = 2.0h, user = 0.0h, combined = 2.0h)
        assert result[2].id == "400"
        assert result[2].community_playtime == 2.0
        assert result[2].user_playtime == 0.0

        # Top 4: Game 300 (comm = 1.5h, user = 0.0h, combined = 1.5h)
        assert result[3].id == "300"
        assert result[3].community_playtime == 1.5
        assert result[3].user_playtime == 0.0

        # Top 5: Game 200 (comm = 1.0h, user = 0.0h, combined = 1.0h)
        assert result[4].id == "200"
        assert result[4].community_playtime == 1.0
        assert result[4].user_playtime == 0.0

    def test_weekly_top_games_region_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="US")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # u2 (same region IT): 120 mins on game 100
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120, created_at=tuesday)

        # u3 (different region US): 600 mins on game 200 (should be excluded)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=600, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(
            CommunityScope.REGION, monday, sunday, auth_user, session
        )

        assert len(result) == 1
        assert result[0].id == "100"
        assert result[0].community_playtime == 2.0
        assert result[0].user_playtime == 0.0

    def test_weekly_top_games_friends_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="IT")

        friendship = Friendship(requester_id=u1.id, addressee_id=u2.id, status=FriendshipStatus.ACCEPTED)
        session.add(friendship)
        session.commit()

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # u2 (friend): 180 mins on game 100
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=180, created_at=tuesday)

        # u3 (non-friend): 500 mins on game 200 (should be excluded)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=500, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(
            CommunityScope.FRIENDS, monday, sunday, auth_user, session
        )

        assert len(result) == 1
        assert result[0].id == "100"
        assert result[0].community_playtime == 3.0

    def test_weekly_top_games_fewer_than_five_games(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=60, created_at=tuesday)

        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(
            CommunityScope.GLOBAL, monday, sunday, auth_user, session
        )

        assert len(result) == 2
        assert result[0].id == "200"
        assert result[1].id == "100"

    def test_weekly_top_games_no_games_played(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        monday = date(2026, 8, 24)
        sunday = date(2026, 8, 30)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(
            CommunityScope.GLOBAL, monday, sunday, auth_user, session
        )

        assert result == []

    def test_weekly_top_games_combined_sorting(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # Community plays Game 100 for 120m (2.0h)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120, created_at=tuesday)

        # User plays Game 999 for 300m (5.0h) which community did not play
        make_rolling(session, user=u1, steam_app_id="999", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="999", last_day_playtime=300, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(
            CommunityScope.GLOBAL, monday, sunday, auth_user, session
        )

        assert len(result) == 2
        # Game 999 has combined 5.0 + 0.0 = 5.0 -> Top 1
        assert result[0].id == "999"
        assert result[0].user_playtime == 5.0
        assert result[0].community_playtime == 0.0

        # Game 100 has combined 0.0 + 2.0 = 2.0 -> Top 2
        assert result[1].id == "100"
        assert result[1].user_playtime == 0.0
        assert result[1].community_playtime == 2.0


class TestCommunityRouter:
    def test_get_community_genre_endpoint(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        g_action = _setup_genre(session, "1", "Action")
        game = make_game(session, steam_app_id="100")
        _link_game_genre(session, game, g_action)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60)

        response = client.get("/community/genre?scope=GLOBAL")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == "1"
        assert data[0]["description"] == "Action"
        assert data[0]["percentage"] == 100.0

    def test_get_community_genre_endpoint_case_insensitive(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/genre?scope=global")
        assert response.status_code == 200

    def test_get_community_genre_endpoint_region_not_set(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region=None)
        response = client.get("/community/genre?scope=REGION")
        assert response.status_code == 400
        assert response.json()["detail"] == "User region is not set"

    def test_get_community_genre_endpoint_no_friends(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/genre?scope=FRIENDS")
        assert response.status_code == 400
        assert response.json()["detail"] == "User has no friends"

    def test_get_community_genre_endpoint_invalid_scope(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/genre?scope=INVALID_SCOPE")
        assert response.status_code == 422

    def test_get_weekly_playtime_endpoint_success(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="IT")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=tuesday)

        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=tuesday)

        response = client.get(f"/community/weekly_playtime?scope=GLOBAL&start_date={monday.isoformat()}&end_date={sunday.isoformat()}")
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert "community" in data
        assert len(data["user"]) == 7
        assert len(data["community"]) == 7
        assert data["user"][1] == 1.0
        assert data["community"][1] == 2.0

    def test_get_weekly_playtime_endpoint_invalid_dates_non_monday(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        # Sunday to Saturday (not Monday to Sunday)
        response = client.get("/community/weekly_playtime?scope=GLOBAL&start_date=2026-08-23&end_date=2026-08-29")
        assert response.status_code == 400
        assert "start_date must be Monday and end_date must be the following Sunday" in response.json()["detail"]

    def test_get_weekly_playtime_endpoint_invalid_duration(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        # Monday to Saturday (6 days, not 7)
        response = client.get("/community/weekly_playtime?scope=GLOBAL&start_date=2026-08-24&end_date=2026-08-29")
        assert response.status_code == 400
        assert "start_date must be Monday and end_date must be the following Sunday" in response.json()["detail"]

    def test_get_weekly_playtime_endpoint_missing_params(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/weekly_playtime?scope=GLOBAL")
        assert response.status_code == 422

    def test_get_monthly_playtime_endpoint_success(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="IT")

        start_date = date(2026, 1, 1)
        end_date = date(2026, 12, 31)  # 12 months

        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=date(2026, 1, 10))

        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=date(2026, 1, 10))

        response = client.get(
            f"/community/monthly_playtime?scope=GLOBAL&start_date={start_date.isoformat()}&end_date={end_date.isoformat()}"
        )
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert "community" in data
        assert len(data["user"]) == 12
        assert len(data["community"]) == 12
        # Jan is index 0
        assert data["user"][0] == 1.0
        assert data["community"][0] == 2.0
        # Feb is index 1
        assert data["user"][1] == 0.0
        assert data["community"][1] == 0.0

    def test_get_monthly_playtime_endpoint_invalid_start_date_not_first(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/monthly_playtime?scope=GLOBAL&start_date=2026-01-02&end_date=2026-12-31")
        assert response.status_code == 400
        assert (
            "start_date must be the first day of a month"
            in response.json()["detail"]
        )

    def test_get_monthly_playtime_endpoint_invalid_end_date_not_last(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/monthly_playtime?scope=GLOBAL&start_date=2026-01-01&end_date=2026-12-30")
        assert response.status_code == 400
        assert (
            "end_date must be the last day of a month"
            in response.json()["detail"]
        )

    def test_get_monthly_playtime_endpoint_start_after_end(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/monthly_playtime?scope=GLOBAL&start_date=2026-12-01&end_date=2026-01-31")
        assert response.status_code == 400
        assert (
            "start_date must be on or before end_date"
            in response.json()["detail"]
        )

    def test_get_monthly_playtime_endpoint_missing_params(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/monthly_playtime?scope=GLOBAL")
        assert response.status_code == 422

    def test_get_weekly_top_game_playtime_endpoint_success(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="IT")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=tuesday)

        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=tuesday)

        response = client.get(
            f"/community/weekly_top_game_playtime?scope=GLOBAL&start_date={monday.isoformat()}&end_date={sunday.isoformat()}"
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["id"] == "200"
        assert data[0]["user_playtime"] == 0.0
        assert data[0]["community_playtime"] == 2.0
        assert data[1]["id"] == "100"
        assert data[1]["user_playtime"] == 1.0
        assert data[1]["community_playtime"] == 0.0

    def test_get_weekly_top_game_playtime_endpoint_invalid_dates(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get(
            "/community/weekly_top_game_playtime?scope=GLOBAL&start_date=2026-08-23&end_date=2026-08-29"
        )
        assert response.status_code == 400
        assert "start_date must be Monday and end_date must be the following Sunday" in response.json()["detail"]

    def test_get_weekly_top_game_playtime_endpoint_missing_params(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/weekly_top_game_playtime?scope=GLOBAL")
        assert response.status_code == 422






