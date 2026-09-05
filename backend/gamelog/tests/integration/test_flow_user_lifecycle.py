from unittest.mock import patch
from fastapi import status
from src.auth.schemas import AuthenticatedUser


class TestUserLifecycleFlow:
    """Section B1: User & Device Token Lifecycle Integration Flow."""

    def test_complete_user_onboarding_and_profile_flow(self, auth_client_factory):
        """Test full journey: Register -> Get Me -> Update Steam Key -> Device Token Registration."""
        new_auth = AuthenticatedUser(uid="fb-new-user-123", email="newuser@example.com", email_verified=True)
        client = auth_client_factory(new_auth)

        # 1. Register new user (mocking Steam player summary validation)
        register_payload = {
            "username": "alex_gamer",
            "steam_id": "76561198000000001",
            "steam_api_key": "ORIGINAL_STEAM_KEY",
        }
        mock_summary = {
            "steamid": "76561198000000001",
            "personaname": "AlexGamer",
            "loccountrycode": "IT",
        }

        with patch("src.games.steam_fetcher_service.get_steam_player_summary_sync", return_value=mock_summary):
            res_register = client.post("/users/register", json=register_payload)

        assert res_register.status_code == status.HTTP_201_CREATED
        user_data = res_register.json()
        assert user_data["username"] == "alex_gamer"
        assert user_data["steam_id"] == "76561198000000001"
        assert user_data["firebase_uid"] == "fb-new-user-123"
        assert user_data["has_steam_api_key"] is True

        # 2. Query /users/me to verify profile persistence
        res_me = client.get("/users/me")
        assert res_me.status_code == status.HTTP_200_OK
        me_data = res_me.json()
        assert me_data["username"] == "alex_gamer"
        assert me_data["steam_api_key"] == "ORIGINAL_STEAM_KEY"

        # 3. Duplicate registration attempt with same Firebase UID -> Conflict/409
        with patch("src.games.steam_fetcher_service.get_steam_player_summary_sync", return_value=mock_summary):
            res_dup = client.post("/users/register", json=register_payload)
        assert res_dup.status_code == status.HTTP_409_CONFLICT

        # 4. Update Steam API Key
        with patch("src.games.steam_fetcher_service.validate_steam_credentials_sync", return_value=True):
            res_update_key = client.post(
                "/users/me/steam-api-key",
                json={"steam_api_key": "UPDATED_SECRET_KEY"},
            )
        assert res_update_key.status_code == status.HTTP_200_OK
        assert res_update_key.json()["steam_api_key"] == "UPDATED_SECRET_KEY"

        # 5. Register Device Push Token
        res_token = client.post(
            "/notifications/register_device",
            json={"token": "ExponentPushToken[abc-123]", "device_type": "ios"},
        )
        assert res_token.status_code == status.HTTP_201_CREATED

        # 6. Unregister Device Push Token
        res_unreg = client.request(
            "DELETE",
            "/notifications/unregister_device",
            json={"token": "ExponentPushToken[abc-123]"},
        )
        assert res_unreg.status_code == status.HTTP_204_NO_CONTENT
