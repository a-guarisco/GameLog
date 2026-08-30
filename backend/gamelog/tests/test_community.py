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

