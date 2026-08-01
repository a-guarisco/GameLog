import asyncio
from contextlib import asynccontextmanager
from datetime import UTC, datetime, time, timedelta

from fastapi import FastAPI
from sqlmodel import Session, select

from src.core.database import engine
from src.core.settings import get_settings
from src.games import game_service
from src.models import User
from src.models.config import Config
from src.users import UserRead


def run_daily_job():
    print("Running midnight cronjob", flush=True)
    with Session(engine) as session:
        try:
            statement = select(User).where(User.steam_id is not None)
            users = session.exec(statement).all()
            print(f"Found {len(users)} users with Steam ID to process.", flush=True)
            
            for user_db in users:
                try:
                    user_read = UserRead.model_validate(user_db)
                    game_service.update_user_shelving_steamrolling(session, user_read)
                except Exception as user_err:  # noqa: BLE001
                    print(f"Error processing user {user_db.username}: {user_err}", flush=True)
            

            config = session.get(Config, "last_update")
            if config:
                config.value = datetime.now(UTC).isoformat()
            else:
                config = Config(key="last_update", value=datetime.now(UTC).isoformat())
                session.add(config)
            
            session.commit()
            print("Midnight cronjob completed successfully.", flush=True)
        except Exception as db_err:
            print(f"Database error during midnight job: {db_err}", flush=True)
            session.rollback()


def _should_run_startup_catchup() -> bool:
    with Session(engine) as session:
        try:
            config = session.get(Config, "last_update")
            if not config:
                print("No last_update found in DB. Startup catchup needed.", flush=True)
                return True
            
            last_update = datetime.fromisoformat(config.value)
            now = datetime.now(UTC)
            return last_update.date() < now.date()
        except Exception as e:
            print(f"Error checking startup catchup status: {e}. Defaulting to running catchup.", flush=True)
            return True



async def _scheduler_loop():
    try:
        print("Scheduler loop started...", flush=True)
        if _should_run_startup_catchup():
            run_daily_job()
        
        while True:
            now = datetime.now(UTC)
            
            tomorrow = now + timedelta(days=1)
            next_midnight = datetime.combine(tomorrow.date(), time.min, tzinfo=UTC)
            seconds_to_wait = (next_midnight - now).total_seconds()
            print(f"Scheduler sleeping for {seconds_to_wait} seconds until next midnight...", flush=True)
            
            await asyncio.sleep(seconds_to_wait)
            
            run_daily_job()
    except Exception as e:  # noqa: BLE001
        import traceback
        print(f"ERROR in scheduler loop: {e}", flush=True)
        traceback.print_exc()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Lifespan starting...", flush=True)
    settings = get_settings()
    task = None
    if settings.run_scheduler:
        print("Starting scheduler...", flush=True)
        task = asyncio.create_task(_scheduler_loop())
    else:
        print("Scheduler is disabled.", flush=True)
    
    yield

    if task is not None:
        task.cancel()
