from datetime import date, timedelta

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.games import game_service
from src.games.schemas import DailyReport
from src.models import SteamRollingTime
from tests.conftest import make_user


class TestDailyReportService:
    def test_get_daily_report_no_rolling_times(self, session: Session):
        me = make_user(session, firebase_uid="uid-no-rolling", username="norolling", steam_id="100")
        report = game_service.get_daily_report(session, me.firebase_uid)
        assert isinstance(report, DailyReport)
        assert report.date == date.today()
        assert report.game_reports == []

    def test_get_daily_report_default_today(self, session: Session):
        today = date.today()
        me = make_user(session, firebase_uid="uid-report-today", username="reporttoday", steam_id="101")

        # Game 730: played 3 consecutive days ending today
        r1 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=1000, created_at=today - timedelta(days=2))
        r2 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=1030, created_at=today - timedelta(days=1))
        r3 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=1075, created_at=today)

        # Game 570: baseline 2 days ago, no play today
        r4 = SteamRollingTime(user_id=me.id, steam_app_id="570", last_day_playtime=500, created_at=today - timedelta(days=2))
        r5 = SteamRollingTime(user_id=me.id, steam_app_id="570", last_day_playtime=550, created_at=today - timedelta(days=1))

        session.add_all([r1, r2, r3, r4, r5])
        session.commit()

        report = game_service.get_daily_report(session, me.firebase_uid)
        assert report.date == today
        assert len(report.game_reports) == 1  # Only game 730 played today (today_play_time > 0)

        reports_by_app = {g.app_id: g for g in report.game_reports}
        assert "730" in reports_by_app
        assert reports_by_app["730"].today_play_time == 45
        assert reports_by_app["730"].streak == 2  # delta on day -1 (30) and day 0 (45)
        assert "570" not in reports_by_app  # Not played today (today_play_time == 0)

    def test_get_daily_report_specific_date(self, session: Session):
        today = date.today()
        target = today - timedelta(days=1)
        me = make_user(session, firebase_uid="uid-report-past", username="reportpast", steam_id="102")

        r1 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=1000, created_at=today - timedelta(days=3))
        r2 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=1040, created_at=today - timedelta(days=2))
        r3 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=1100, created_at=target)
        r4 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=1200, created_at=today)

        session.add_all([r1, r2, r3, r4])
        session.commit()

        report = game_service.get_daily_report(session, me.firebase_uid, start_date=target, end_date=target)
        assert report.date == target
        assert len(report.game_reports) == 1

        game_rep = report.game_reports[0]
        assert game_rep.app_id == "730"
        assert game_rep.today_play_time == 60  # 1100 - 1040
        assert game_rep.streak == 2  # deltas on target-1 (40) and target (60)

    def test_get_daily_report_consecutive_historical_dates(self, session: Session):
        me = make_user(session, firebase_uid="uid-report-consecutive", username="reportconsecutive", steam_id="105")
        d3 = date(2026, 8, 3)
        d4 = date(2026, 8, 4)
        d5 = date(2026, 8, 5)
        d6 = date(2026, 8, 6)

        r3 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=100, created_at=d3)
        r4 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=130, created_at=d4)
        r5 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=175, created_at=d5)
        r6 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=200, created_at=d6)

        session.add_all([r3, r4, r5, r6])
        session.commit()

        # Query on 2026-08-04: played on 08-04 (delta 30) -> streak = 1 (since 08-03 was baseline delta 0)
        rep4 = game_service.get_daily_report(session, me.firebase_uid, start_date=d4, end_date=d4)
        assert rep4.date == d4
        assert len(rep4.game_reports) == 1
        assert rep4.game_reports[0].today_play_time == 30
        assert rep4.game_reports[0].streak == 1

        # Query on 2026-08-05: played on 08-04 (delta 30) and 08-05 (delta 45) -> streak = 2
        rep5 = game_service.get_daily_report(session, me.firebase_uid, start_date=d5, end_date=d5)
        assert rep5.date == d5
        assert len(rep5.game_reports) == 1
        assert rep5.game_reports[0].today_play_time == 45
        assert rep5.game_reports[0].streak == 2

    def test_get_daily_report_date_range(self, session: Session):
        me = make_user(session, firebase_uid="uid-report-range", username="reportrange", steam_id="106")
        d1 = date(2026, 8, 1)
        d2 = date(2026, 8, 2)
        d3 = date(2026, 8, 3)
        d4 = date(2026, 8, 4)

        # Game 730: baseline d1 (100), d2 (130 -> 30m), d3 (180 -> 50m), d4 (210 -> 30m)
        r1 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=100, created_at=d1)
        r2 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=130, created_at=d2)
        r3 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=180, created_at=d3)
        r4 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=210, created_at=d4)

        # Game 570: baseline d1 (50), d2 (50 -> 0m), d3 (90 -> 40m), d4 (90 -> 0m)
        r5 = SteamRollingTime(user_id=me.id, steam_app_id="570", last_day_playtime=50, created_at=d1)
        r6 = SteamRollingTime(user_id=me.id, steam_app_id="570", last_day_playtime=50, created_at=d2)
        r7 = SteamRollingTime(user_id=me.id, steam_app_id="570", last_day_playtime=90, created_at=d3)
        r8 = SteamRollingTime(user_id=me.id, steam_app_id="570", last_day_playtime=90, created_at=d4)

        session.add_all([r1, r2, r3, r4, r5, r6, r7, r8])
        session.commit()

        # Game 730: d2(30) + d3(50) + d4(30) = 110m, streak at d4 = 3
        # Game 570: d2(0) + d3(40) + d4(0) = 40m, streak at d4 = 1 (active streak from d3 since d4 was 0)
        report = game_service.get_daily_report(session, me.firebase_uid, start_date=d2, end_date=d4)
        assert report.date == d4
        assert len(report.game_reports) == 2

        reports_by_app = {g.app_id: g for g in report.game_reports}
        assert reports_by_app["730"].today_play_time == 110
        assert reports_by_app["730"].streak == 3

        assert reports_by_app["570"].today_play_time == 40
        assert reports_by_app["570"].streak == 1

    def test_get_daily_report_invalid_range_raises_400(self, session: Session):
        me = make_user(session, firebase_uid="uid-report-invalid", username="reportinvalid", steam_id="107")
        d_start = date(2026, 8, 10)
        d_end = date(2026, 8, 5)

        with pytest.raises(HTTPException) as exc_info:
            game_service.get_daily_report(session, me.firebase_uid, start_date=d_start, end_date=d_end)
        assert exc_info.value.status_code == 400


class TestDailyReportRouter:
    ENDPOINT = "/games/report"

    def test_requires_auth(self):
        from src.main import app as _app

        _app.dependency_overrides.clear()
        plain_client = TestClient(_app, raise_server_exceptions=False)
        response = plain_client.get(self.ENDPOINT)
        assert response.status_code == 401

    def test_get_daily_report_via_router(self, client: TestClient, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-1", username="routeruser", steam_id="103")
        today = date.today()

        r1 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=100, created_at=today - timedelta(days=1))
        r2 = SteamRollingTime(user_id=me.id, steam_app_id="730", last_day_playtime=150, created_at=today)
        session.add_all([r1, r2])
        session.commit()

        response = client.get(self.ENDPOINT)
        assert response.status_code == 200
        data = response.json()

        assert data["date"] == str(today)
        assert len(data["game_reports"]) == 1
        assert data["game_reports"][0]["app_id"] == "730"
        assert data["game_reports"][0]["today_play_time"] == 50
        assert data["game_reports"][0]["streak"] == 1

    def test_get_daily_report_with_date_range_query_params(self, client: TestClient, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-1", username="routeruser2", steam_id="104")
        d_start = "2026-08-01"
        d_end = "2026-08-02"

        response = client.get(f"{self.ENDPOINT}?start_date={d_start}&end_date={d_end}")
        assert response.status_code == 200
        data = response.json()

        assert data["date"] == d_end
        assert data["game_reports"] == []

    def test_get_daily_report_router_invalid_range(self, client: TestClient, session: Session):
        make_user(session, firebase_uid="firebase-uid-1", username="routeruser3", steam_id="108")
        d_start = "2026-08-10"
        d_end = "2026-08-05"

        response = client.get(f"{self.ENDPOINT}?start_date={d_start}&end_date={d_end}")
        assert response.status_code == 400
