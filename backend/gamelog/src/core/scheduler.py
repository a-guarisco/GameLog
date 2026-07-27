import asyncio
import os
from contextlib import asynccontextmanager
from datetime import UTC, datetime, time, timedelta

from fastapi import FastAPI
from sqlmodel import Session, select

from src.core.database import engine
from src.games import game_service
from src.models import User
from src.users import UserRead

FILE_PATH = "/src/last_cron.txt"


def run_daily_job():
    print("Running midnight cronjob", flush=True)
    
    with Session(engine) as session:
        try:
            statement = select(User).where(User.steam_id != None)
            users = session.exec(statement).all()
            print(f"Found {len(users)} users with Steam ID to process.", flush=True)
            
            for user_db in users:
                try:
                    user_read = UserRead.model_validate(user_db)
                    game_service.update_user_shelving_steamrolling(session, user_read)
                except Exception as user_err:
                    print(f"Error processing user {user_db.username}: {user_err}", flush=True)
            
            session.commit()
            print("Midnight cronjob completed successfully.", flush=True)
        except Exception as db_err:
            print(f"Database error during midnight job: {db_err}", flush=True)
            session.rollback()
            
    # Update timestamp to now
    try:
        with open(FILE_PATH, "w") as f:
            f.write(datetime.now(UTC).isoformat())
    except OSError as e:
        print(f"Error writing timestamp file: {e}", flush=True)



def _should_run_startup_catchup():
    if not os.path.exists(FILE_PATH): 
        return True
    
    try:
        with open(FILE_PATH, "r") as f:
            last_run = datetime.fromisoformat(f.read().strip())
            if last_run.tzinfo is None:
                last_run = last_run.replace(tzinfo=UTC)
    except (OSError, ValueError) as e:
        print(f"Error reading timestamp file: {e}", flush=True)
        return True
    
    # Check if the last run was before today's midnight
    today_midnight = datetime.combine(datetime.now(UTC).date(), time.min, tzinfo=UTC)
    return last_run < today_midnight


async def _scheduler_loop():
    try:
        print("Scheduler loop started...", flush=True)
        # 1. Startup Catch-up: Run immediately if we missed midnight while offline
        if _should_run_startup_catchup():
            run_daily_job()
        
        # 2. Ongoing Schedule: Keep running if the container stays alive
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
    # Start the scheduler in the background
    task = asyncio.create_task(_scheduler_loop())
    
    yield # FastAPI is serving requests
    
    # Clean up the background task when the container shuts down
    task.cancel()
