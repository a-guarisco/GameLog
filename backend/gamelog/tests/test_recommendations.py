import uuid
from datetime import date, timedelta
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.games import recommendations_service
from src.models import Game, Friendship, FriendshipStatus, User
from tests.conftest import make_user, make_game, make_rolling


class TestRecommendationsService:
    def test_get_recommendations_auth_user_not_exist(self, session: Session):
        with pytest.raises(HTTPException) as exc_info:
            recommendations_service.get_recommendations_of_friend(
                friend_id=uuid.uuid4(),
                session=session,
                auth_user_uid="non-existent",
            )
        assert exc_info.value.status_code == 404
        assert "User not found" in exc_info.value.detail

    def test_get_recommendations_self(self, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-1", username="me", steam_id="steam-me")
        with pytest.raises(HTTPException) as exc_info:
            recommendations_service.get_recommendations_of_friend(
                friend_id=me.id,
                session=session,
                auth_user_uid=me.firebase_uid,
            )
        assert exc_info.value.status_code == 400
        assert "Cannot request recommendations with yourself" in exc_info.value.detail

    def test_get_recommendations_friend_not_exist(self, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-1", username="me", steam_id="steam-me")
        with pytest.raises(HTTPException) as exc_info:
            recommendations_service.get_recommendations_of_friend(
                friend_id=uuid.uuid4(),
                session=session,
                auth_user_uid=me.firebase_uid,
            )
        assert exc_info.value.status_code == 404
        assert "Friend not found" in exc_info.value.detail

    def test_get_recommendations_not_friends(self, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-me", username="me", steam_id="steam-me")
        other = make_user(session, firebase_uid="firebase-uid-other", username="other", steam_id="steam-other")
        
        with pytest.raises(HTTPException) as exc_info:
            recommendations_service.get_recommendations_of_friend(
                friend_id=other.id,
                session=session,
                auth_user_uid=me.firebase_uid,
            )
        assert exc_info.value.status_code == 403
        assert "Users are not friends" in exc_info.value.detail

    def test_get_recommendations_pending_friendship(self, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-me", username="me", steam_id="steam-me")
        other = make_user(session, firebase_uid="firebase-uid-other", username="other", steam_id="steam-other")
        
        # Pending friendship
        f = Friendship(requester_id=me.id, addressee_id=other.id, status=FriendshipStatus.PENDING)
        session.add(f)
        session.commit()

        with pytest.raises(HTTPException) as exc_info:
            recommendations_service.get_recommendations_of_friend(
                friend_id=other.id,
                session=session,
                auth_user_uid=me.firebase_uid,
            )
        assert exc_info.value.status_code == 403
        assert "Users are not friends" in exc_info.value.detail

    def test_get_recommendations_success_and_sorting(self, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-me", username="me", steam_id="steam-me")
        friend = make_user(session, firebase_uid="firebase-uid-friend", username="friend", steam_id="steam-friend")
        
        # Accepted friendship
        f = Friendship(requester_id=me.id, addressee_id=friend.id, status=FriendshipStatus.ACCEPTED)
        session.add(f)
        session.commit()

        # Create games
        game1 = make_game(session, steam_app_id="101")
        game2 = make_game(session, steam_app_id="102")
        game3 = make_game(session, steam_app_id="103")
        game4 = make_game(session, steam_app_id="104") # Unplayed by friend

        today = date.today()
        yesterday = today - timedelta(days=1)

        # Me rolling times
        make_rolling(session, user=me, steam_app_id="101", last_day_playtime=100, created_at=today)
        # Game 102 has multiple entries, ensure we pick the latest
        make_rolling(session, user=me, steam_app_id="102", last_day_playtime=120, created_at=yesterday)
        make_rolling(session, user=me, steam_app_id="102", last_day_playtime=300, created_at=today)
        make_rolling(session, user=me, steam_app_id="103", last_day_playtime=50, created_at=today)
        make_rolling(session, user=me, steam_app_id="104", last_day_playtime=500, created_at=today)

        # Friend rolling times
        make_rolling(session, user=friend, steam_app_id="101", last_day_playtime=150, created_at=today)
        make_rolling(session, user=friend, steam_app_id="102", last_day_playtime=50, created_at=today)
        # Game 103 has 0 playtime for friend (played=False)
        make_rolling(session, user=friend, steam_app_id="103", last_day_playtime=0, created_at=today)
        # Game 104 is not rolling at all for friend

        # Combined playtime:
        # Game 101: 100 + 150 = 250
        # Game 102: 300 + 50 = 350 (since 300 is the latest for me)
        # Game 103: Friend has 0, so excluded
        # Game 104: Friend has None, so excluded
        # Expected order: Game 102 (350), Game 101 (250)
        
        recs = recommendations_service.get_recommendations_of_friend(
            friend_id=friend.id,
            session=session,
            auth_user_uid=me.firebase_uid,
        )

        assert len(recs) == 2
        assert recs[0].gameSteamId == "102"
        assert recs[0].requester_play_time == 300
        assert recs[0].friend_play_time == 50
        
        assert recs[1].gameSteamId == "101"
        assert recs[1].requester_play_time == 100
        assert recs[1].friend_play_time == 150


class TestRecommendationsRouter:
    ENDPOINT = "/games/recommendations"

    def test_requires_auth(self):
        from src.main import app as _app
        _app.dependency_overrides.clear()

        plain_client = TestClient(_app, raise_server_exceptions=False)
        response = plain_client.get(self.ENDPOINT, params={"friend": str(uuid.uuid4())})
        assert response.status_code == 401

    def test_get_recommendations_endpoint_success(self, client, session: Session):
        # Default fake auth is firebase-uid-1
        me = make_user(session, firebase_uid="firebase-uid-1", username="me", steam_id="steam-me")
        friend = make_user(session, firebase_uid="firebase-uid-2", username="friend", steam_id="steam-friend")
        
        f = Friendship(requester_id=me.id, addressee_id=friend.id, status=FriendshipStatus.ACCEPTED)
        session.add(f)
        
        game1 = make_game(session, steam_app_id="201")
        game2 = make_game(session, steam_app_id="202")
        
        session.commit()

        # Rolling times
        make_rolling(session, user=me, steam_app_id="201", last_day_playtime=100)
        make_rolling(session, user=me, steam_app_id="202", last_day_playtime=300)
        make_rolling(session, user=friend, steam_app_id="201", last_day_playtime=200)
        make_rolling(session, user=friend, steam_app_id="202", last_day_playtime=100)

        response = client.get(self.ENDPOINT, params={"friend": str(friend.id)})
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 2
        
        # Game 202 has total 400 playtime, Game 201 has total 300 playtime
        assert data[0]["gameSteamId"] == "202"
        assert data[0]["requester_play_time"] == 300
        assert data[0]["friend_play_time"] == 100

        assert data[1]["gameSteamId"] == "201"
        assert data[1]["requester_play_time"] == 100
        assert data[1]["friend_play_time"] == 200
