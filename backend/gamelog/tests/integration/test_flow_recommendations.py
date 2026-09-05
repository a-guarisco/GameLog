from fastapi import status
from src.models import FriendshipStatus, TopGame, TopGameGenreLink


class TestRecommendationsFlow:
    """Section B4: Game Recommendations Engine Integration Flow."""

    def test_shared_games_and_genre_recommendation_flow(
        self,
        session,
        auth_client_factory,
        seed_helpers,
    ):
        """Test friend recommendations flow based on shared playtime and genre interests."""
        user_a = seed_helpers.create_user("rec_user_a")
        user_b = seed_helpers.create_user("rec_user_b")

        # Create mutual friendship
        seed_helpers.create_friendship(user_a, user_b, status=FriendshipStatus.ACCEPTED)

        # Seed games with genres
        game_csgo = seed_helpers.create_game("730", genres=[("1", "Action"), ("2", "Shooter")])
        game_dota = seed_helpers.create_game("570", genres=[("1", "Action"), ("3", "Strategy")])

        # Seed rolling playtime:
        # Both play CS:GO (common game)
        seed_helpers.create_rolling_history(user_a, "730", days=2, daily_minutes=100)
        seed_helpers.create_rolling_history(user_b, "730", days=2, daily_minutes=80)

        # User B plays Dota (Shared Action genre)
        seed_helpers.create_rolling_history(user_b, "570", days=2, daily_minutes=50)

        # Seed TopGame in catalog with valid steam_app_id and rank
        top_game = TopGame(steam_app_id="1091500", rank=1)
        session.add(top_game)
        session.commit()
        session.refresh(top_game)

        action_genre = seed_helpers.create_genre("1", "Action")
        link = TopGameGenreLink(top_game_id=top_game.id, genre_id=action_genre.id)
        session.add(link)
        session.commit()

        # Query recommendations
        client_a = auth_client_factory(user_a)
        res = client_a.get(f"/games/recommendations?friend={user_b.id}&include_top_games=true")
        assert res.status_code == status.HTTP_200_OK

        data = res.json()
        assert "common_games" in data
        assert "common_genres" in data
        assert "top_games" in data

        # Verify common game CS:GO is present
        common_game_ids = [cg["gameSteamId"] for cg in data["common_games"]]
        assert "730" in common_game_ids

        # Verify common genre Action is detected
        common_genre_descriptions = [cg["description"] for cg in data["common_genres"]]
        assert "Action" in common_genre_descriptions
