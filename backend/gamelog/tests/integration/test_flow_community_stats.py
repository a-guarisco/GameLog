from fastapi import status

from src.models import FriendshipStatus, GameStatus


class TestCommunityStatsFlow:
    """Section B5: Community Scoped Aggregations (Global vs Region vs Friends)."""

    def test_community_metrics_across_scopes_flow(
        self,
        auth_client_factory,
        seed_helpers,
    ):
        """Test community endpoints across global, regional, and friendship scopes."""
        # 1. Seed users across regions
        user_it = seed_helpers.create_user("mario", region="IT")
        user_it_friend = seed_helpers.create_user("luigi", region="IT")
        user_us = seed_helpers.create_user("john", region="US")

        # 2. Establish friendship between Mario & Luigi
        seed_helpers.create_friendship(user_it, user_it_friend, status=FriendshipStatus.ACCEPTED)

        # 3. Seed games and shelvings
        game1 = seed_helpers.create_game("730", genres=[("1", "FPS")])
        game2 = seed_helpers.create_game("570", genres=[("2", "MOBA")])

        seed_helpers.create_shelving(user_it, game1, GameStatus.PLAYING)
        seed_helpers.create_shelving(user_it_friend, game1, GameStatus.PLATINATO)
        seed_helpers.create_shelving(user_us, game2, GameStatus.SHELVED)

        # 4. Seed playtime
        seed_helpers.create_rolling_history(user_it, "730", days=5, daily_minutes=60)
        seed_helpers.create_rolling_history(user_it_friend, "730", days=5, daily_minutes=40)
        seed_helpers.create_rolling_history(user_us, "570", days=5, daily_minutes=120)

        client = auth_client_factory(user_it)

        # 5. Query /community/game_statuses with global scope
        res_global = client.get("/community/game_statuses?scope=global")
        assert res_global.status_code == status.HTTP_200_OK
        data_global = res_global.json()
        assert "user" in data_global
        assert "community" in data_global
        assert data_global["user_num_of_games"] == 1
        assert data_global["community_num_of_games"] == 1.0  # 3 games / 3 users = 1.0 avg

        # 6. Query /community/game_statuses with region scope (IT only)
        res_region = client.get("/community/game_statuses?scope=region")
        assert res_region.status_code == status.HTTP_200_OK
        data_region = res_region.json()
        assert data_region["community_num_of_games"] == 1.0  # 2 games / 2 IT users = 1.0 avg

        # 7. Query /community/game_statuses with friends scope
        res_friends = client.get("/community/game_statuses?scope=friends")
        assert res_friends.status_code == status.HTTP_200_OK
        data_friends = res_friends.json()
        assert data_friends["community_num_of_games"] == 1.0

        # 8. Query /community/genre
        res_genre = client.get("/community/genre?scope=global")
        assert res_genre.status_code == status.HTTP_200_OK
        genres_data = res_genre.json()
        assert len(genres_data) >= 1

        # 9. Query /community/monthly_playtime
        res_monthly = client.get("/community/monthly_playtime?scope=global&start_date=2026-09-01&end_date=2026-09-30")
        assert res_monthly.status_code == status.HTTP_200_OK
        monthly_data = res_monthly.json()
        assert "user" in monthly_data
        assert "community" in monthly_data
