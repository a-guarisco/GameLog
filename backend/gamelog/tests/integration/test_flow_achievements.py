from fastapi import status


class TestAchievementsFlow:
    """Section B6: Achievements & Steam Boundary Integration Flow."""

    def test_achievements_endpoint_flow(self, auth_client_factory, seed_helpers):
        """Test achievements routes with authenticated user."""
        user = seed_helpers.create_user("achievement_hunter")
        client = auth_client_factory(user)

        res = client.get("/achievements/helloAchievements")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert "message" in data
