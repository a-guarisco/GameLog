from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.models import SteamRollingTime
from src.users import user_service
from src.users.schemas import DailyReport
from tests.conftest import make_user


class TestDailyReportService:
    def test_get_daily_report_no_rolling_times(self, session: Session):
        me = make_user(session, firebase_uid="uid-no-rolling", username="norolling", steam_id="100")
        report = user_service.get_daily_report(session, me.firebase_uid)
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

        report = user_service.get_daily_report(session, me.firebase_uid)
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

        report = user_service.get_daily_report(session, me.firebase_uid, target_date=target)
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
        rep4 = user_service.get_daily_report(session, me.firebase_uid, target_date=d4)
        assert rep4.date == d4
        assert len(rep4.game_reports) == 1
        assert rep4.game_reports[0].today_play_time == 30
        assert rep4.game_reports[0].streak == 1

        # Query on 2026-08-05: played on 08-04 (delta 30) and 08-05 (delta 45) -> streak = 2
        rep5 = user_service.get_daily_report(session, me.firebase_uid, target_date=d5)
        assert rep5.date == d5
        assert len(rep5.game_reports) == 1
        assert rep5.game_reports[0].today_play_time == 45
        assert rep5.game_reports[0].streak == 2



class TestDailyReportRouter:
    ENDPOINT = "/users/report"

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

    def test_get_daily_report_with_date_query_param(self, client: TestClient, session: Session):
        me = make_user(session, firebase_uid="firebase-uid-1", username="routeruser2", steam_id="104")
        target_str = "2026-08-01"

        response = client.get(f"{self.ENDPOINT}?date={target_str}")
        assert response.status_code == 200
        data = response.json()

        assert data["date"] == target_str
        assert data["game_reports"] == []
