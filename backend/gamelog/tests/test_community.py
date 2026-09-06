from datetime import date
import uuid
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.auth.schemas import AuthenticatedUser
from src.community import community_service
from src.community.schemas import CommunityScope, TopGameReference
from src.models import (
    Friendship,
    FriendshipStatus,
    Game,
    GameGenreLink,
    GameStatus,
    Genre,
)
from tests.conftest import make_game, make_rolling, make_shelving, make_user


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
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="FR")

        g_action = _setup_genre(session, "1", "Action")
        g_rpg = _setup_genre(session, "3", "RPG")
        g_indie = _setup_genre(session, "23", "Indie")

        game1 = make_game(session, steam_app_id="100")
        game2 = make_game(session, steam_app_id="200")
        _link_game_genre(session, game1, g_action)
        _link_game_genre(session, game2, g_rpg)
        # g_indie is not played

        # u1 (caller) plays Indie or Action, but will be excluded
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=999)
        # u2 and u3 form the global community
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=180)
        make_rolling(session, user=u3, steam_app_id="100", last_day_playtime=60)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_genre(CommunityScope.GLOBAL, session, auth_user)

        assert len(result) == 2
        # Total playtime across genres = 60 + 180 = 240 (u1's playtime excluded)
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

        # u1 (caller, IT) plays RPG, but is excluded
        make_rolling(session, user=u1, steam_app_id="200", last_day_playtime=500)
        # u2 (same region IT) plays Action
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=100)
        # u3 (different region US) plays RPG
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
        result = community_service.get_community_weekly_playtime(CommunityScope.GLOBAL, monday, sunday, auth_user, session)

        assert len(result.user) == 7
        assert len(result.community) == 7

        # u1 user array: Tuesday is index 1 (0=Mon, 1=Tue) -> 60/60 = 1.0 hr
        assert result.user == [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0]

        # Community is u2 + u3 (2 users):
        # Tuesday (idx 1): (60 + 180) / 2 = 120 mins = 2.0 hrs
        # Wednesday (idx 2): (60 + 0) / 2 = 30 mins = 0.5 hrs
        assert result.community == [0.0, 1.5, 1.0, 0.0, 0.0, 0.0, 0.0]

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
        result = community_service.get_community_weekly_playtime(CommunityScope.REGION, monday, sunday, auth_user, session)

        assert result.user[0] == 0.5
        assert result.community[1] == 2.0

    def test_weekly_playtime_region_scope_missing_region_raises_400(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region=None)
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_weekly_playtime(CommunityScope.REGION, date(2026, 8, 24), date(2026, 8, 30), auth_user, session)
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
        result = community_service.get_community_weekly_playtime(CommunityScope.FRIENDS, monday, sunday, auth_user, session)

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
        result = community_service.get_community_monthly_playtime(CommunityScope.GLOBAL, start_date, end_date, auth_user, session)

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
        result = community_service.get_community_monthly_playtime(CommunityScope.REGION, start_date, end_date, auth_user, session)

        assert len(result.user) == 2
        assert len(result.community) == 2
        assert result.user == [0.5, 0.0]
        # Community (only u2, same region IT): Jan=120m=2.0 hrs, Feb=0.0
        assert result.community == [2.0, 0.0]

    def test_monthly_playtime_region_scope_missing_region_raises_400(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region=None)
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_monthly_playtime(CommunityScope.REGION, date(2026, 1, 1), date(2026, 12, 31), auth_user, session)
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
        result = community_service.get_community_monthly_playtime(CommunityScope.FRIENDS, start_date, end_date, auth_user, session)

        assert len(result.community) == 2
        # Jan is index 0 -> 60/60 = 1.0 hr for friend u2
        assert result.community == [1.0, 0.0]

    def test_monthly_playtime_friends_scope_no_friends_raises_400(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_monthly_playtime(CommunityScope.FRIENDS, date(2026, 1, 1), date(2026, 12, 31), auth_user, session)
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
        result = community_service.get_community_weekly_top_games(CommunityScope.GLOBAL, monday, sunday, auth_user, session)

        assert len(result) == 5
        # Top 1: Game 500 (comm = 5.0h, user = 1.0h)
        assert result[0].id == "500"
        assert result[0].community_playtime == 5.0
        assert result[0].user_playtime == 1.0

        # Top 2: Game 400 (comm = 4.0h, user = 0.0h)
        assert result[2].id == "300"
        assert result[1].id == "400"
        assert result[1].community_playtime == 4.0
        assert result[1].user_playtime == 0.0

        # Top 3: Game 300 (comm = 3.0h, user = 0.0h)
        assert result[2].community_playtime == 3.0
        assert result[2].user_playtime == 0.0

        # Top 4: Game 200 (comm = 2.0h, user = 0.0h)
        assert result[3].id == "200"
        assert result[3].community_playtime == 2.0
        assert result[3].user_playtime == 0.0

        # Top 5: Game 100 (comm = 1.0h, user = 2.0h)
        assert result[4].id == "100"
        assert result[4].community_playtime == 1.0
        assert result[4].user_playtime == 2.0

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
        result = community_service.get_community_weekly_top_games(CommunityScope.REGION, monday, sunday, auth_user, session)

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
        result = community_service.get_community_weekly_top_games(CommunityScope.FRIENDS, monday, sunday, auth_user, session)

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
        result = community_service.get_community_weekly_top_games(CommunityScope.GLOBAL, monday, sunday, auth_user, session)

        assert len(result) == 2
        assert result[0].id == "200"
        assert result[1].id == "100"

    def test_weekly_top_games_no_games_played(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        monday = date(2026, 8, 24)
        sunday = date(2026, 8, 30)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(CommunityScope.GLOBAL, monday, sunday, auth_user, session)

        assert result == []

    def test_weekly_top_games_sorting_by_community_playtime(self, session: Session):
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
        result = community_service.get_community_weekly_top_games(CommunityScope.GLOBAL, monday, sunday, auth_user, session)

        assert len(result) == 2
        # Game 100 has community playtime 2.0 -> Top 1
        assert result[0].id == "100"
        assert result[0].user_playtime == 0.0
        assert result[0].community_playtime == 2.0

        # Game 999 has community playtime 0.0 -> Top 2
        assert result[1].id == "999"
        assert result[1].user_playtime == 5.0
        assert result[1].community_playtime == 0.0

    def test_monthly_top_games_global_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="FR")

        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 31)

        # Game 200: u2 plays 180m on Jan 10, u3 plays 120m on Jan 15 -> 2 players, 300m total -> avg = 300 / (2 * 60) = 2.5h
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=180, created_at=date(2026, 1, 10))

        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 14))
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=120, created_at=date(2026, 1, 15))

        # Game 100: u2 plays 120m on Jan 20 -> 1 player, 120m total -> avg = 120 / (1 * 60) = 2.0h
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 19))
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120, created_at=date(2026, 1, 20))

        # u1 (current user) plays Game 100 for 180m (3.0h) on Jan 12
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 11))
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=180, created_at=date(2026, 1, 12))

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_monthly_top_games(CommunityScope.GLOBAL, start_date, end_date, auth_user, session)

        assert len(result) == 2
        # Game 200: comm = 2.5h, user = 0.0h -> Top 1
        assert result[0].id == "200"
        assert result[0].user_playtime == 0.0
        assert result[0].community_playtime == 2.5

        # Game 100: comm = 2.0h, user = 3.0h -> Top 2
        assert result[1].id == "100"
        assert result[1].user_playtime == 3.0
        assert result[1].community_playtime == 2.0

    def test_monthly_top_games_region_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="US")

        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 31)

        # u2 (same region IT): 120 mins on game 100
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120, created_at=date(2026, 1, 10))

        # u3 (different region US): 600 mins on game 200 (excluded)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=600, created_at=date(2026, 1, 10))

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_monthly_top_games(CommunityScope.REGION, start_date, end_date, auth_user, session)

        assert len(result) == 1
        assert result[0].id == "100"
        assert result[0].community_playtime == 2.0
        assert result[0].user_playtime == 0.0

    def test_monthly_top_games_friends_scope_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="IT")

        friendship = Friendship(requester_id=u1.id, addressee_id=u2.id, status=FriendshipStatus.ACCEPTED)
        session.add(friendship)
        session.commit()

        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 31)

        # u2 (friend): 180 mins on game 100
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=180, created_at=date(2026, 1, 10))

        # u3 (non-friend): 500 mins on game 200 (excluded)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=500, created_at=date(2026, 1, 10))

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_monthly_top_games(CommunityScope.FRIENDS, start_date, end_date, auth_user, session)

        assert len(result) == 1
        assert result[0].id == "100"
        assert result[0].community_playtime == 3.0

    def test_monthly_top_games_no_games_played(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 31)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_monthly_top_games(CommunityScope.GLOBAL, start_date, end_date, auth_user, session)

        assert result == []

    def test_weekly_top_games_active_players_no_dilution(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="US")
        u4 = make_user(session, firebase_uid="u4", username="user4", steam_id="s4", region="FR")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # Only u2 plays Game 100 for 120m (2.0h). u3 and u4 do not play Game 100 at all.
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120, created_at=tuesday)

        # u3 plays Game 200 for 60m (1.0h)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u3, steam_app_id="200", last_day_playtime=60, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(CommunityScope.GLOBAL, monday, sunday, auth_user, session)

        assert len(result) == 2
        # Game 100 should be 2.0h (120m / 1 player), NOT diluted by u3 or u4 (120m / 3 users = 0.67h)
        assert result[0].id == "100"
        assert result[0].community_playtime == 2.0
        # Game 200 should be 1.0h (60m / 1 player)
        assert result[1].id == "200"
        assert result[1].community_playtime == 1.0

    def test_weekly_top_games_user_reference_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="FR")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # Community plays Game 999 for 600m (10.0h) - highest in community
        make_rolling(session, user=u2, steam_app_id="999", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="999", last_day_playtime=600, created_at=tuesday)

        # User plays 6 games (100, 200, 300, 400, 500, 600)
        # Game 100: user 300m (5.0h), community u2 120m (2.0h)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=300, created_at=tuesday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120, created_at=tuesday)

        # Game 200: user 240m (4.0h), community 0m
        make_rolling(session, user=u1, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="200", last_day_playtime=240, created_at=tuesday)

        # Game 300: user 180m (3.0h), community u2 60m (1.0h), u3 120m (2.0h) -> avg 1.5h
        make_rolling(session, user=u1, steam_app_id="300", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="300", last_day_playtime=180, created_at=tuesday)
        make_rolling(session, user=u2, steam_app_id="300", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="300", last_day_playtime=60, created_at=tuesday)
        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u3, steam_app_id="300", last_day_playtime=120, created_at=tuesday)

        # Game 400: user 120m (2.0h), community 180m (3.0h)
        make_rolling(session, user=u1, steam_app_id="400", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="400", last_day_playtime=120, created_at=tuesday)
        make_rolling(session, user=u2, steam_app_id="400", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="400", last_day_playtime=180, created_at=tuesday)

        # Game 500: user 120m (2.0h), community 60m (1.0h) -> tied with 400 in user playtime, but 400 has higher comm playtime
        make_rolling(session, user=u1, steam_app_id="500", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="500", last_day_playtime=120, created_at=tuesday)
        make_rolling(session, user=u2, steam_app_id="500", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="500", last_day_playtime=60, created_at=tuesday)

        # Game 600: user 60m (1.0h) -> 6th game, should be excluded from top 5
        make_rolling(session, user=u1, steam_app_id="600", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="600", last_day_playtime=60, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(
            CommunityScope.GLOBAL, monday, sunday, auth_user, session, reference=TopGameReference.USER
        )

        assert len(result) == 5

        # Rank 1: Game 100 (user = 5.0h, comm = 2.0h)
        assert result[0].id == "100"
        assert result[0].user_playtime == 5.0
        assert result[0].community_playtime == 2.0

        # Rank 2: Game 200 (user = 4.0h, comm = 0.0h)
        assert result[1].id == "200"
        assert result[1].user_playtime == 4.0
        assert result[1].community_playtime == 0.0

        # Rank 3: Game 300 (user = 3.0h, comm = 1.5h)
        assert result[2].id == "300"
        assert result[2].user_playtime == 3.0
        assert result[2].community_playtime == 1.5

        # Rank 4: Game 400 (user = 2.0h, comm = 3.0h) - wins tiebreak over 500
        assert result[3].id == "400"
        assert result[3].user_playtime == 2.0
        assert result[3].community_playtime == 3.0

        # Rank 5: Game 500 (user = 2.0h, comm = 1.0h)
        assert result[4].id == "500"
        assert result[4].user_playtime == 2.0
        assert result[4].community_playtime == 1.0

    def test_weekly_top_games_user_reference_fewer_than_five_games(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # Community plays games 100, 200, 300
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=60, created_at=tuesday)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=tuesday)
        make_rolling(session, user=u2, steam_app_id="300", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="300", last_day_playtime=180, created_at=tuesday)

        # User only plays 2 games (100 and 999)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=tuesday)
        make_rolling(session, user=u1, steam_app_id="999", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="999", last_day_playtime=180, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(
            CommunityScope.GLOBAL, monday, sunday, auth_user, session, reference=TopGameReference.USER
        )

        assert len(result) == 2
        assert result[0].id == "999"
        assert result[0].user_playtime == 3.0
        assert result[0].community_playtime == 0.0

        assert result[1].id == "100"
        assert result[1].user_playtime == 1.0
        assert result[1].community_playtime == 1.0

    def test_weekly_top_games_user_reference_no_games_played(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # Community plays game 100, user plays 0 games
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=60, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(
            CommunityScope.GLOBAL, monday, sunday, auth_user, session, reference=TopGameReference.USER
        )

        assert result == []

    def test_monthly_top_games_user_reference_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 31)

        # Community plays 200 for 300m (5.0h)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=300, created_at=date(2026, 1, 10))

        # User plays 100 for 120m (2.0h) and 200 for 60m (1.0h)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=120, created_at=date(2026, 1, 10))
        make_rolling(session, user=u1, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u1, steam_app_id="200", last_day_playtime=60, created_at=date(2026, 1, 10))

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_monthly_top_games(
            CommunityScope.GLOBAL, start_date, end_date, auth_user, session, reference=TopGameReference.USER
        )

        assert len(result) == 2
        # Game 100 is top 1 for user (2.0h vs 1.0h)
        assert result[0].id == "100"
        assert result[0].user_playtime == 2.0
        assert result[0].community_playtime == 0.0

        # Game 200 is top 2 for user (1.0h vs 2.0h)
        assert result[1].id == "200"
        assert result[1].user_playtime == 1.0
        assert result[1].community_playtime == 5.0

    def test_get_community_game_statuses_global_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="FR")

        g1 = make_game(session, steam_app_id="10")
        g2 = make_game(session, steam_app_id="20")
        g3 = make_game(session, steam_app_id="30")
        g4 = make_game(session, steam_app_id="40")
        g5 = make_game(session, steam_app_id="50")
        g6 = make_game(session, steam_app_id="60")
        g7 = make_game(session, steam_app_id="70")

        # u1 (caller): 3 games
        make_shelving(session, user=u1, game=g1, status=GameStatus.SHELVED)
        make_shelving(session, user=u1, game=g2, status=GameStatus.PLAYING)
        make_shelving(session, user=u1, game=g3, status=GameStatus.PLATINATO)

        # u2 (target): 2 games
        make_shelving(session, user=u2, game=g1, status=GameStatus.SHELVED)
        make_shelving(session, user=u2, game=g4, status=GameStatus.PLAYING)

        # u3 (target): 4 games
        make_shelving(session, user=u3, game=g2, status=GameStatus.TO_BE_PLAYED)
        make_shelving(session, user=u3, game=g5, status=GameStatus.PLAYING)
        make_shelving(session, user=u3, game=g6, status=GameStatus.PLATINATO)
        make_shelving(session, user=u3, game=g7, status=GameStatus.PLATINATO)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_game_statuses(CommunityScope.GLOBAL, auth_user, session)

        # Verify user totals and items
        assert result.user_num_of_games == 3
        assert len(result.user) == 4
        assert [item.status for item in result.user] == [
            GameStatus.SHELVED,
            GameStatus.TO_BE_PLAYED,
            GameStatus.PLAYING,
            GameStatus.PLATINATO,
        ]
        # u1: shelved=1 (33.33%), to_be_played=0 (0.0%), playing=1 (33.33%), platinato=1 (33.33%)
        assert result.user[0].count == 1.0
        assert result.user[0].percentage == 33.33
        assert result.user[1].count == 0.0
        assert result.user[1].percentage == 0.0
        assert result.user[2].count == 1.0
        assert result.user[2].percentage == 33.33
        assert result.user[3].count == 1.0
        assert result.user[3].percentage == 33.33

        # Verify community totals and items (2 target users, 6 games total)
        assert result.community_num_of_games == 3.0  # 6 games / 2 users
        assert len(result.community) == 4
        # shelved: 1 game total => avg count = 1/2 = 0.5, pct = (1/6)*100 = 16.67
        assert result.community[0].status == GameStatus.SHELVED
        assert result.community[0].count == 0.5
        assert result.community[0].percentage == 16.67

        # to_be_played: 1 game total => avg count = 1/2 = 0.5, pct = (1/6)*100 = 16.67
        assert result.community[1].status == GameStatus.TO_BE_PLAYED
        assert result.community[1].count == 0.5
        assert result.community[1].percentage == 16.67

        # playing: 2 games total => avg count = 2/2 = 1.0, pct = (2/6)*100 = 33.33
        assert result.community[2].status == GameStatus.PLAYING
        assert result.community[2].count == 1.0
        assert result.community[2].percentage == 33.33

        # platinato: 2 games total => avg count = 2/2 = 1.0, pct = (2/6)*100 = 33.33
        assert result.community[3].status == GameStatus.PLATINATO
        assert result.community[3].count == 1.0
        assert result.community[3].percentage == 33.33

    def test_get_community_game_statuses_region_and_friends_scope(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")
        u3 = make_user(session, firebase_uid="u3", username="user3", steam_id="s3", region="US")

        g1 = make_game(session, steam_app_id="10")
        g2 = make_game(session, steam_app_id="20")

        # u2 is IT, u3 is US
        make_shelving(session, user=u2, game=g1, status=GameStatus.PLAYING)
        make_shelving(session, user=u3, game=g2, status=GameStatus.PLATINATO)

        # Region scope (only u2 in IT)
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        region_res = community_service.get_community_game_statuses(CommunityScope.REGION, auth_user, session)
        assert region_res.community_num_of_games == 1.0
        assert region_res.community[2].status == GameStatus.PLAYING
        assert region_res.community[2].count == 1.0
        assert region_res.community[2].percentage == 100.0

        # Friends scope (make u3 friend of u1)
        f = Friendship(requester_id=u1.id, addressee_id=u3.id, status=FriendshipStatus.ACCEPTED)
        session.add(f)
        session.commit()

        friends_res = community_service.get_community_game_statuses(CommunityScope.FRIENDS, auth_user, session)
        assert friends_res.community_num_of_games == 1.0
        assert friends_res.community[3].status == GameStatus.PLATINATO
        assert friends_res.community[3].count == 1.0
        assert friends_res.community[3].percentage == 100.0

    def test_get_community_game_statuses_empty_libraries(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        res = community_service.get_community_game_statuses(CommunityScope.GLOBAL, auth_user, session)

        assert res.user_num_of_games == 0
        for item in res.user:
            assert item.count == 0.0
            assert item.percentage == 0.0

        assert res.community_num_of_games == 0.0
        for item in res.community:
            assert item.count == 0.0
            assert item.percentage == 0.0

    def test_get_community_game_statuses_no_target_users_raises_404(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_game_statuses(CommunityScope.GLOBAL, auth_user, session)
        assert exc.value.status_code == 404

    def test_user_scope_genre_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        g_action = _setup_genre(session, "1", "Action")
        game1 = make_game(session, steam_app_id="100")
        _link_game_genre(session, game1, g_action)

        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_genre(CommunityScope.USER, session, auth_user, user_id=u2.id)

        assert len(result) == 1
        assert result[0].id == "1"
        assert result[0].percentage == 100.0

    def test_user_scope_missing_user_id_raises_400(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_genre(CommunityScope.USER, session, auth_user, user_id=None)
        assert exc.value.status_code == 400
        assert "user_id is required when scope is 'user'" in exc.value.detail

    def test_user_scope_self_comparison_raises_400(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_genre(CommunityScope.USER, session, auth_user, user_id=u1.id)
        assert exc.value.status_code == 400
        assert "Cannot compare with yourself" in exc.value.detail

    def test_user_scope_user_not_found_raises_404(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        random_id = uuid.uuid4()

        with pytest.raises(HTTPException) as exc:
            community_service.get_community_genre(CommunityScope.USER, session, auth_user, user_id=random_id)
        assert exc.value.status_code == 404
        assert "User not found" in exc.value.detail

    def test_user_scope_blocked_relationship_raises_403(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")

        # u2 blocked u1 (u2 is requester, u1 is addressee) -> u1 is blocked
        f = Friendship(requester_id=u2.id, addressee_id=u1.id, status=FriendshipStatus.BLOCKED)
        session.add(f)
        session.commit()

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        with pytest.raises(HTTPException) as exc:
            community_service.get_community_genre(CommunityScope.USER, session, auth_user, user_id=u2.id)
        assert exc.value.status_code == 403
        assert "Access to user profile is blocked" in exc.value.detail

    def test_user_scope_caller_is_blocker_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="IT")

        g_action = _setup_genre(session, "1", "Action")
        game1 = make_game(session, steam_app_id="100")
        _link_game_genre(session, game1, g_action)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=60)

        # u1 blocked u2 (u1 is requester, u2 is addressee) -> u1 is the blocker, endpoint should work
        f = Friendship(requester_id=u1.id, addressee_id=u2.id, status=FriendshipStatus.BLOCKED)
        session.add(f)
        session.commit()

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_genre(CommunityScope.USER, session, auth_user, user_id=u2.id)
        assert len(result) == 1
        assert result[0].id == "1"
        assert result[0].percentage == 100.0

    def test_user_scope_weekly_playtime_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # u1: 60 mins on Tuesday
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=tuesday)

        # u2: 120 mins on Tuesday
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_playtime(CommunityScope.USER, monday, sunday, auth_user, session, user_id=u2.id)

        assert result.user[1] == 1.0
        assert result.community[1] == 2.0

    def test_user_scope_monthly_playtime_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 31)

        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=date(2026, 1, 10))

        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=180, created_at=date(2026, 1, 10))

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_monthly_playtime(CommunityScope.USER, start_date, end_date, auth_user, session, user_id=u2.id)

        assert result.user == [1.0]
        assert result.community == [3.0]

    def test_user_scope_weekly_top_games_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # u2 plays game 500 for 300m
        make_rolling(session, user=u2, steam_app_id="500", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="500", last_day_playtime=300, created_at=tuesday)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_weekly_top_games(CommunityScope.USER, monday, sunday, auth_user, session, user_id=u2.id)

        assert len(result) == 1
        assert result[0].id == "500"
        assert result[0].community_playtime == 5.0

    def test_user_scope_game_statuses_success(self, session: Session):
        u1 = make_user(session, firebase_uid="u1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="u2", username="user2", steam_id="s2", region="US")

        g1 = make_game(session, steam_app_id="10")
        g2 = make_game(session, steam_app_id="20")

        make_shelving(session, user=u1, game=g1, status=GameStatus.PLAYING)
        make_shelving(session, user=u2, game=g2, status=GameStatus.PLATINATO)

        auth_user = AuthenticatedUser(uid="u1", email="u1@test.com")
        result = community_service.get_community_game_statuses(CommunityScope.USER, auth_user, session, user_id=u2.id)

        assert result.user_num_of_games == 1
        assert result.community_num_of_games == 1.0
        assert result.community[3].status == GameStatus.PLATINATO
        assert result.community[3].count == 1.0
        assert result.community[3].percentage == 100.0


class TestCommunityRouter:
    def test_get_community_genre_endpoint(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="IT")
        g_action = _setup_genre(session, "1", "Action")
        game = make_game(session, steam_app_id="100")
        _link_game_genre(session, game, g_action)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=60)

        response = client.get("/community/genre?scope=GLOBAL")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == "1"
        assert data[0]["description"] == "Action"
        assert data[0]["percentage"] == 100.0

    def test_get_community_genre_endpoint_case_insensitive(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="IT")
        g_action = _setup_genre(session, "1", "Action")
        game = make_game(session, steam_app_id="100")
        _link_game_genre(session, game, g_action)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=60)

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

        response = client.get(f"/community/monthly_playtime?scope=GLOBAL&start_date={start_date.isoformat()}&end_date={end_date.isoformat()}")
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
        assert "start_date must be the first day of a month" in response.json()["detail"]

    def test_get_monthly_playtime_endpoint_invalid_end_date_not_last(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/monthly_playtime?scope=GLOBAL&start_date=2026-01-01&end_date=2026-12-30")
        assert response.status_code == 400
        assert "end_date must be the last day of a month" in response.json()["detail"]

    def test_get_monthly_playtime_endpoint_start_after_end(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/monthly_playtime?scope=GLOBAL&start_date=2026-12-01&end_date=2026-01-31")
        assert response.status_code == 400
        assert "start_date must be on or before end_date" in response.json()["detail"]

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
            f"/community/weekly_top_game_playtime?scope=GLOBAL&start_date={monday.isoformat()}&end_date={sunday.isoformat()}&reference=community"
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

    def test_get_weekly_top_game_playtime_endpoint_missing_reference_raises_400(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        monday = date(2026, 8, 24)
        sunday = date(2026, 8, 30)
        response = client.get(f"/community/weekly_top_game_playtime?scope=GLOBAL&start_date={monday.isoformat()}&end_date={sunday.isoformat()}")
        assert response.status_code == 400
        assert "reference query parameter is required" in response.json()["detail"]

    def test_get_weekly_top_game_playtime_endpoint_invalid_dates(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/weekly_top_game_playtime?scope=GLOBAL&start_date=2026-08-23&end_date=2026-08-29&reference=community")
        assert response.status_code == 400
        assert "start_date must be Monday and end_date must be the following Sunday" in response.json()["detail"]

    def test_get_weekly_top_game_playtime_endpoint_missing_params(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/weekly_top_game_playtime?scope=GLOBAL")
        assert response.status_code == 422

    def test_get_monthly_top_game_playtime_endpoint_success(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="IT")

        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 31)

        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=date(2026, 1, 10))

        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=date(2026, 1, 10))

        response = client.get(
            f"/community/monthly_top_game_playtime?scope=GLOBAL&start_date={start_date.isoformat()}&end_date={end_date.isoformat()}&reference=community"
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

    def test_get_monthly_top_game_playtime_endpoint_missing_reference_raises_400(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 31)
        response = client.get(
            f"/community/monthly_top_game_playtime?scope=GLOBAL&start_date={start_date.isoformat()}&end_date={end_date.isoformat()}"
        )
        assert response.status_code == 400
        assert "reference query parameter is required" in response.json()["detail"]

    def test_get_monthly_top_game_playtime_endpoint_invalid_dates_not_first(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/monthly_top_game_playtime?scope=GLOBAL&start_date=2026-01-02&end_date=2026-01-31&reference=community")
        assert response.status_code == 400
        assert "start_date must be the first day of a month" in response.json()["detail"]

    def test_get_monthly_top_game_playtime_endpoint_invalid_dates_not_last(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/monthly_top_game_playtime?scope=GLOBAL&start_date=2026-01-01&end_date=2026-01-30&reference=community")
        assert response.status_code == 400
        assert "end_date must be the last day of a month" in response.json()["detail"]

    def test_get_monthly_top_game_playtime_endpoint_missing_params(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/monthly_top_game_playtime?scope=GLOBAL")
        assert response.status_code == 422

    def test_get_weekly_top_game_playtime_endpoint_user_reference(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="IT")

        monday = date(2026, 8, 24)
        tuesday = date(2026, 8, 25)
        sunday = date(2026, 8, 30)

        # Community plays 200 for 120m (2.0h)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=tuesday)

        # User plays 100 for 60m (1.0h)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=monday)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=tuesday)

        response = client.get(
            f"/community/weekly_top_game_playtime?scope=GLOBAL&start_date={monday.isoformat()}&end_date={sunday.isoformat()}&reference=user"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == "100"
        assert data[0]["user_playtime"] == 1.0
        assert data[0]["community_playtime"] == 0.0

    def test_get_monthly_top_game_playtime_endpoint_user_reference(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="IT")

        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 31)

        # Community plays 200 for 120m (2.0h)
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u2, steam_app_id="200", last_day_playtime=120, created_at=date(2026, 1, 10))

        # User plays 100 for 60m (1.0h)
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=0, created_at=date(2026, 1, 9))
        make_rolling(session, user=u1, steam_app_id="100", last_day_playtime=60, created_at=date(2026, 1, 10))

        response = client.get(
            f"/community/monthly_top_game_playtime?scope=GLOBAL&start_date={start_date.isoformat()}&end_date={end_date.isoformat()}&reference=USER"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == "100"
        assert data[0]["user_playtime"] == 1.0
        assert data[0]["community_playtime"] == 0.0

    def test_get_game_statuses_endpoint_success(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="IT")

        g1 = make_game(session, steam_app_id="10")
        g2 = make_game(session, steam_app_id="20")

        make_shelving(session, user=u1, game=g1, status=GameStatus.PLAYING)
        make_shelving(session, user=u2, game=g2, status=GameStatus.PLATINATO)

        response = client.get("/community/game_statuses?scope=global")
        assert response.status_code == 200
        data = response.json()

        assert data["user_num_of_games"] == 1
        assert data["community_num_of_games"] == 1.0
        assert len(data["user"]) == 4
        assert len(data["community"]) == 4

        # User: playing has 1 game (100%), others 0
        user_playing = next(item for item in data["user"] if item["status"] == "playing")
        assert user_playing["count"] == 1.0
        assert user_playing["percentage"] == 100.0

        # Community: platinato has 1 game (100%), others 0
        comm_platinato = next(item for item in data["community"] if item["status"] == "platinato")
        assert comm_platinato["count"] == 1.0
        assert comm_platinato["percentage"] == 100.0

    def test_get_game_statuses_endpoint_case_insensitive_scope(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="IT")

        response = client.get("/community/game_statuses?scope=GLOBAL")
        assert response.status_code == 200

    def test_get_game_statuses_endpoint_region_not_set(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region=None)
        response = client.get("/community/game_statuses?scope=REGION")
        assert response.status_code == 400
        assert response.json()["detail"] == "User region is not set"

    def test_get_game_statuses_endpoint_no_friends(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/game_statuses?scope=FRIENDS")
        assert response.status_code == 400
        assert response.json()["detail"] == "User has no friends"

    def test_get_game_statuses_endpoint_invalid_scope(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/game_statuses?scope=INVALID_SCOPE")
        assert response.status_code == 422

    def test_user_scope_endpoints_success(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="US")

        g_action = _setup_genre(session, "1", "Action")
        game1 = make_game(session, steam_app_id="100")
        _link_game_genre(session, game1, g_action)

        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120)
        make_shelving(session, user=u1, game=game1, status=GameStatus.PLAYING)
        make_shelving(session, user=u2, game=game1, status=GameStatus.PLATINATO)

        # /genre with scope=USER and user_id
        res_genre = client.get(f"/community/genre?scope=USER&user_id={u2.id}")
        assert res_genre.status_code == 200
        assert len(res_genre.json()) == 1

        # /weekly_playtime with scope=USER and user_id
        res_week = client.get(f"/community/weekly_playtime?scope=USER&start_date=2026-08-24&end_date=2026-08-30&user_id={u2.id}")
        assert res_week.status_code == 200

        # /weekly_top_game_playtime with scope=USER and user_id
        res_top_week = client.get(
            f"/community/weekly_top_game_playtime?scope=USER&start_date=2026-08-24&end_date=2026-08-30&reference=COMMUNITY&user_id={u2.id}"
        )
        assert res_top_week.status_code == 200

        # /monthly_playtime with scope=USER and user_id
        res_month = client.get(f"/community/monthly_playtime?scope=USER&start_date=2026-01-01&end_date=2026-01-31&user_id={u2.id}")
        assert res_month.status_code == 200

        # /monthly_top_game_playtime with scope=USER and user_id
        res_top_month = client.get(
            f"/community/monthly_top_game_playtime?scope=USER&start_date=2026-01-01&end_date=2026-01-31&reference=COMMUNITY&user_id={u2.id}"
        )
        assert res_top_month.status_code == 200

        # /game_statuses with scope=USER and user_id
        res_status = client.get(f"/community/game_statuses?scope=USER&user_id={u2.id}")
        assert res_status.status_code == 200
        assert res_status.json()["user_num_of_games"] == 1
        assert res_status.json()["community_num_of_games"] == 1.0

    def test_user_scope_endpoint_missing_user_id(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        response = client.get("/community/genre?scope=USER")
        assert response.status_code == 400
        assert "user_id is required when scope is 'user'" in response.json()["detail"]

    def test_user_scope_endpoint_blocked(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="US")

        # u2 blocked u1 (u2 is requester, u1 is addressee) -> u1 is blocked from u2
        f = Friendship(requester_id=u2.id, addressee_id=u1.id, status=FriendshipStatus.BLOCKED)
        session.add(f)
        session.commit()

        response = client.get(f"/community/genre?scope=USER&user_id={u2.id}")
        assert response.status_code == 403
        assert "Access to user profile is blocked" in response.json()["detail"]

    def test_user_scope_endpoint_caller_is_blocker_success(self, client: TestClient, session: Session):
        u1 = make_user(session, firebase_uid="firebase-uid-1", username="user1", steam_id="s1", region="IT")
        u2 = make_user(session, firebase_uid="firebase-uid-2", username="user2", steam_id="s2", region="US")

        g_action = _setup_genre(session, "1", "Action")
        game1 = make_game(session, steam_app_id="100")
        _link_game_genre(session, game1, g_action)
        make_rolling(session, user=u2, steam_app_id="100", last_day_playtime=120)

        # u1 blocked u2 (u1 is requester, u2 is addressee) -> u1 is the blocker, endpoint should work
        f = Friendship(requester_id=u1.id, addressee_id=u2.id, status=FriendshipStatus.BLOCKED)
        session.add(f)
        session.commit()

        response = client.get(f"/community/genre?scope=USER&user_id={u2.id}")
        assert response.status_code == 200
        assert len(response.json()) == 1
