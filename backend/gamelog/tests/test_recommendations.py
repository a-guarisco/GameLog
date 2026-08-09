import uuid
from datetime import date, timedelta
from unittest.mock import AsyncMock, patch
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.games import recommendations_service
from src.models import Game, Friendship, FriendshipStatus, User, TopGame
from src.users.schemas import GetFriendListResponse, SteamFriend
from src.games.schemas import GetOwnedGamesResponse, SteamGame, RecommendationResponse
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

    def test_get_recommendations_endpoint_steam_success(self, client, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-1", username="me", steam_id="steam-me")
        
        mock_friend_list = GetFriendListResponse(friends=[
            SteamFriend(steamid="steam-friend-1", relationship="friend", friend_since=12345)
        ])
        mock_games = GetOwnedGamesResponse(
            game_count=2,
            games=[
                SteamGame(appid=201, playtime_forever=200),
                SteamGame(appid=202, playtime_forever=100),
            ]
        )
        
        make_rolling(session, user=me, steam_app_id="201", last_day_playtime=100)
        make_rolling(session, user=me, steam_app_id="202", last_day_playtime=300)
        
        with patch("src.games.recommendations_service.steam_fetcher_service.get_friend_list_from_steam_async", AsyncMock(return_value=mock_friend_list)), \
             patch("src.games.recommendations_service.steam_fetcher_service.get_owned_games_from_steam_async", AsyncMock(return_value=mock_games)):
             
            response = client.get(self.ENDPOINT, params={"steam_friend_id": "steam-friend-1"})
            assert response.status_code == 200
            
            data = response.json()
            assert len(data) == 2
            assert data[0]["gameSteamId"] == "202"
            assert data[0]["requester_play_time"] == 300
            assert data[0]["friend_play_time"] == 100
            
            assert data[1]["gameSteamId"] == "201"
            assert data[1]["requester_play_time"] == 100
            assert data[1]["friend_play_time"] == 200


class TestRecommendationsSteamService:
    @pytest.mark.anyio
    async def test_get_recommendations_steam_friend_not_found(self, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-1", username="me", steam_id="steam-me")
        
        mock_friend_list = GetFriendListResponse(friends=[])
        
        with patch("src.games.recommendations_service.steam_fetcher_service.get_friend_list_from_steam_async", AsyncMock(return_value=mock_friend_list)):
            with pytest.raises(HTTPException) as exc_info:
                await recommendations_service.get_recommendations_of_steam(
                    steam_friend_id="steam-friend-1",
                    session=session,
                    auth_user_uid=me.firebase_uid,
                )
            assert exc_info.value.status_code == 404
            assert "Friend not found on Steam" in exc_info.value.detail

    @pytest.mark.anyio
    async def test_get_recommendations_steam_success(self, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-1", username="me", steam_id="steam-me")
        
        mock_friend_list = GetFriendListResponse(friends=[
            SteamFriend(steamid="steam-friend-1", relationship="friend", friend_since=12345)
        ])
        mock_games = GetOwnedGamesResponse(
            game_count=2,
            games=[
                SteamGame(appid=101, playtime_forever=150),
                SteamGame(appid=102, playtime_forever=50),
                SteamGame(appid=103, playtime_forever=0),
            ]
        )
        
        make_rolling(session, user=me, steam_app_id="101", last_day_playtime=100)
        make_rolling(session, user=me, steam_app_id="102", last_day_playtime=300)
        make_rolling(session, user=me, steam_app_id="104", last_day_playtime=500)
        
        with patch("src.games.recommendations_service.steam_fetcher_service.get_friend_list_from_steam_async", AsyncMock(return_value=mock_friend_list)), \
             patch("src.games.recommendations_service.steam_fetcher_service.get_owned_games_from_steam_async", AsyncMock(return_value=mock_games)):
             
            recs = await recommendations_service.get_recommendations_of_steam(
                steam_friend_id="steam-friend-1",
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


class TestIncludeTopGames:
    def test_include_top_games_empty_common(self, session: Session):
        # Create some top games
        g1 = TopGame(steam_app_id="10", rank=2)
        g2 = TopGame(steam_app_id="20", rank=1)
        session.add(g1)
        session.add(g2)
        session.commit()

        recs = recommendations_service.include_top_games(
            common_games=[],
            session=session,
            auth_user_uid="some-uid",
        )

        assert len(recs) == 2
        # Assert they are returned in rank order (rank 1 first, then rank 2)
        assert recs[0].gameSteamId == "20"
        assert recs[0].requester_play_time == 0
        assert recs[0].friend_play_time == 0

        assert recs[1].gameSteamId == "10"
        assert recs[1].requester_play_time == 0
        assert recs[1].friend_play_time == 0

    def test_include_top_games_with_matching_genres(self, session: Session):
        from src.models import Genre
        # Create genres
        action = Genre(id="action", description="Action games")
        indie = Genre(id="indie", description="Indie games")
        rpg = Genre(id="rpg", description="Roleplaying games")
        session.add(action)
        session.add(indie)
        session.add(rpg)
        session.commit()

        # Create games in DB
        game1 = Game(steam_app_id="101", genres=[action, indie])
        game2 = Game(steam_app_id="102", genres=[rpg])
        session.add(game1)
        session.add(game2)
        session.commit()

        # Create top games
        # Matches action: should be added
        tg1 = TopGame(steam_app_id="201", rank=2, genres=[action])
        # Already in common: should be skipped
        tg2 = TopGame(steam_app_id="101", rank=1, genres=[action, indie])
        # Matches rpg: should be added
        tg3 = TopGame(steam_app_id="203", rank=3, genres=[rpg])
        # Matches indie: should be added
        tg4 = TopGame(steam_app_id="204", rank=4, genres=[indie])
        # Doesn't match any computed genres: should be skipped
        sports = Genre(id="sports", description="Sports games")
        session.add(sports)
        tg5 = TopGame(steam_app_id="205", rank=5, genres=[sports])
        
        session.add(tg1)
        session.add(tg2)
        session.add(tg3)
        session.add(tg4)
        session.add(tg5)
        session.commit()

        # Common games list (has 101 and 102)
        common = [
            RecommendationResponse(gameSteamId="101", requester_play_time=10, friend_play_time=20),
            RecommendationResponse(gameSteamId="102", requester_play_time=30, friend_play_time=40),
        ]

        recs = recommendations_service.include_top_games(
            common_games=common,
            session=session,
            auth_user_uid="some-uid",
        )

        # Expected: common games first, then matching top games sorted by rank:
        # tg1 (rank 2), tg3 (rank 3), tg4 (rank 4).
        # tg2 is skipped (already in common).
        # tg5 is skipped (sports doesn't match action/indie/rpg).
        assert len(recs) == 5
        assert recs[0].gameSteamId == "101"
        assert recs[1].gameSteamId == "102"
        assert recs[2].gameSteamId == "201" # tg1
        assert recs[3].gameSteamId == "203" # tg3
        assert recs[4].gameSteamId == "204" # tg4

    def test_include_top_games_limit_10(self, session: Session):
        from src.models import Genre
        action = Genre(id="action", description="Action games")
        session.add(action)
        session.commit()

        game1 = Game(steam_app_id="101", genres=[action])
        session.add(game1)
        session.commit()

        # Create 15 matching top games
        for i in range(1, 16):
            tg = TopGame(steam_app_id=f"20{i:02d}", rank=i, genres=[action])
            session.add(tg)
        session.commit()

        common = [
            RecommendationResponse(gameSteamId="101", requester_play_time=10, friend_play_time=20)
        ]

        recs = recommendations_service.include_top_games(
            common_games=common,
            session=session,
            auth_user_uid="some-uid",
        )

        # 1 common game + at most 10 top games = 11 games total
        assert len(recs) == 11
        assert recs[0].gameSteamId == "101"
        for i in range(1, 11):
            assert recs[i].gameSteamId == f"20{i:02d}"
