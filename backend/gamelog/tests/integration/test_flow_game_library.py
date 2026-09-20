from datetime import date

from fastapi import status


class TestGameLibraryFlow:
    """Section B2: Game Library, Shelving State Machine, Playtime & Reports."""

    def test_shelving_lifecycle_playtime_and_reports_flow(
        self,
        auth_client_factory,
        seed_helpers,
    ):
        """Test full game lifecycle: Status changes -> Playtime tracking -> Daily report calculations."""
        user = seed_helpers.create_user("game_master", region="IT")
        client = auth_client_factory(user)

        # Seed catalog games with genres
        seed_helpers.create_game("730", genres=[("1", "FPS"), ("2", "Action")])
        seed_helpers.create_game("570", genres=[("3", "MOBA"), ("4", "Strategy")])

        # 1. Check initial game status (404 when not yet in user's shelf)
        res_initial_status = client.get("/games/game_status?steam_app_id=730")
        assert res_initial_status.status_code == status.HTTP_404_NOT_FOUND

        # 2. Shelve game with status 'playing'
        res_update_playing = client.post(
            "/games/update_game_status",
            json={"app_id": "730", "status": "playing"},
        )
        assert res_update_playing.status_code == status.HTTP_200_OK

        # Verify status is now 'playing'
        res_status = client.get("/games/game_status?steam_app_id=730")
        assert res_status.status_code == status.HTTP_200_OK
        assert res_status.json() == "playing"

        # 3. Transition status from 'playing' -> 'platinato'
        res_update_plat = client.post(
            "/games/update_game_status",
            json={"app_id": "730", "status": "platinato"},
        )
        assert res_update_plat.status_code == status.HTTP_200_OK
        assert client.get("/games/game_status?steam_app_id=730").json() == "platinato"

        # 4. Shelve second game as 'to_be_played'
        client.post(
            "/games/update_game_status",
            json={"app_id": "570", "status": "to_be_played"},
        )

        # 5. Batch fetch genres for games
        res_genres = client.post(
            "/games/genres_batch",
            json={"app_ids": ["730", "570"]},
        )
        assert res_genres.status_code == status.HTTP_200_OK
        genre_batch = res_genres.json()
        assert len(genre_batch) == 2

        # 6. Seed consecutive rolling playtime history for user
        # 3 days streak on game 730
        seed_helpers.create_rolling_history(
            user,
            steam_app_id="730",
            days=3,
            daily_minutes=90,
            end_date=date.today(),
        )

        # 7. Query Playtime and Streak endpoints
        res_playtime = client.get("/games/playtime_by_user?days=7")
        assert res_playtime.status_code == status.HTTP_200_OK
        playtime_data = res_playtime.json()
        assert len(playtime_data) >= 1

        res_streak = client.get("/games/streak_by_user")
        assert res_streak.status_code == status.HTTP_200_OK
        assert isinstance(res_streak.json(), int)
        assert res_streak.json() >= 1

        # 8. Query Daily Report
        res_report = client.get(f"/games/report?start_date={date.today().isoformat()}&end_date={date.today().isoformat()}")
        assert res_report.status_code == status.HTTP_200_OK
        report_data = res_report.json()
        assert "game_reports" in report_data
