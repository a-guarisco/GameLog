import asyncio
from contextlib import asynccontextmanager
from datetime import UTC, datetime, time, timedelta

import httpx
from fastapi import FastAPI
from sqlmodel import Session, select

from src.core.database import engine, wait_for_db_and_migrate
from src.core.settings import get_settings
from src.games import game_service, steam_fetcher_service
from src.models import User, TopGame, Genre
from src.models.config import Config


async def _run_daily_job_async() -> None:
    print("Running midnight cronjob", flush=True)
    with Session(engine) as session:
        try:
            statement = select(User).where(User.steam_id != None)
            users = session.exec(statement).all()
            print(f"Found {len(users)} users with Steam ID to process.", flush=True)

            async with httpx.AsyncClient(timeout=10.0) as client:

                async def _process_user(user_db: User) -> None:
                    try:
                        await game_service.update_user_shelving_steamrolling_async(session, user_db, client=client)
                    except Exception as user_err:
                        print(f"Error processing user {user_db.username}: {user_err}", flush=True)

                await asyncio.gather(*[_process_user(u) for u in users])

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


def _get_last_tuesday_midnight() -> datetime:
    now = datetime.now(UTC)
    days_since_tuesday = (now.weekday() - 1) % 7
    last_tuesday_date = now.date() - timedelta(days=days_since_tuesday)
    return datetime.combine(last_tuesday_date, time.min, tzinfo=UTC)


def _should_run_top_games_catchup() -> bool:
    with Session(engine) as session:
        try:
            config = session.get(Config, "last_top_games_update")
            if not config:
                print("No last_top_games_update found in DB. Startup catchup needed.", flush=True)
                return True

            last_update = datetime.fromisoformat(config.value)
            last_tuesday = _get_last_tuesday_midnight()
            return last_update < last_tuesday
        except Exception as e:
            print(f"Error checking top games catchup status: {e}. Defaulting to running catchup.", flush=True)
            return True


async def _run_weekly_top_games_job_async() -> None:
    print("Running weekly top games job", flush=True)
    with Session(engine) as session:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                top_games = await steam_fetcher_service.get_most_played_games_from_steam_async(client)

                if not top_games:
                    print("No top games retrieved from Steam.", flush=True)
                    return

                new_top_app_ids = {str(game.appid): game for game in top_games if game.appid}
                
                existing_top_games = session.exec(select(TopGame)).all()
                existing_map = {tg.steam_app_id: tg for tg in existing_top_games}
                
                to_delete = [tg for tg_id, tg in existing_map.items() if tg_id not in new_top_app_ids]
                for tg in to_delete:
                    session.delete(tg)
                session.commit()
                
                for steam_app_id, game_data in new_top_app_ids.items():
                    rank = game_data.rank
                    
                    if steam_app_id in existing_map:
                        existing_tg = existing_map[steam_app_id]
                        existing_tg.rank = rank
                        session.add(existing_tg)
                        session.commit()
                    else:
                        genres_data = None
                        while True:
                            try:
                                genres_data = await steam_fetcher_service.get_game_genres_from_steam_async(steam_app_id, client)
                                break
                            except httpx.HTTPStatusError as e:
                                if e.response.status_code == 429:
                                    print(f"429 Too Many Requests hit for {steam_app_id}. Waiting 2 seconds before retrying...", flush=True)
                                    await asyncio.sleep(2.0)
                                    continue
                                print(f"Failed to fetch genres for {steam_app_id}: {e}", flush=True)
                                break
                            except Exception as e:
                                print(f"Failed to fetch genres for {steam_app_id}: {e}", flush=True)
                                break
                        
                        if not genres_data:
                            continue
                            
                        await asyncio.sleep(0.5)

                        new_tg = TopGame(steam_app_id=steam_app_id, rank=rank)
                        session.add(new_tg)
                        
                        for genre_dict in genres_data:
                            genre_id = str(genre_dict.get("id"))
                            description = genre_dict.get("description", "")
                            
                            genre = session.get(Genre, genre_id)
                            if not genre:
                                genre = Genre(id=genre_id, description=description)
                                session.add(genre)
                                
                            new_tg.genres.append(genre)
                        session.commit()

                config = session.get(Config, "last_top_games_update")
                if config:
                    config.value = datetime.now(UTC).isoformat()
                else:
                    config = Config(key="last_top_games_update", value=datetime.now(UTC).isoformat())
                    session.add(config)
                
                session.commit()
                print("Weekly top games job completed successfully.", flush=True)
        except Exception as e:
            print(f"Error during weekly top games job: {e}", flush=True)
            session.rollback()


async def _scheduler_loop():
    try:
        print("Scheduler loop started...", flush=True)
        if _should_run_startup_catchup():
            await _run_daily_job_async()

        while True:
            now = datetime.now(UTC)
            tomorrow = now + timedelta(days=1)
            next_midnight = datetime.combine(tomorrow.date(), time.min, tzinfo=UTC)
            seconds_to_wait = (next_midnight - now).total_seconds()
            print(f"Scheduler sleeping for {seconds_to_wait} seconds until next midnight...", flush=True)
            await asyncio.sleep(seconds_to_wait)
            await _run_daily_job_async()
    except Exception as e:
        import traceback
        print(f"ERROR in scheduler loop: {e}", flush=True)
        traceback.print_exc()


async def _scheduler_weekly_loop():
    try:
        print("Weekly scheduler loop started...", flush=True)
        if _should_run_top_games_catchup():
            await _run_weekly_top_games_job_async()
            
        while True:
            now = datetime.now(UTC)
            days_until_tuesday = (1 - now.weekday()) % 7
            if days_until_tuesday == 0:
                days_until_tuesday = 7
            
            next_tuesday_date = now.date() + timedelta(days=days_until_tuesday)
            next_tuesday_midnight = datetime.combine(next_tuesday_date, time.min, tzinfo=UTC)
            
            seconds_to_wait = (next_tuesday_midnight - now).total_seconds()
            print(f"Weekly scheduler sleeping for {seconds_to_wait} seconds until next Tuesday midnight...", flush=True)
            
            await asyncio.sleep(seconds_to_wait)
            await _run_weekly_top_games_job_async()
    except Exception as e:
        import traceback
        print(f"ERROR in weekly scheduler loop: {e}", flush=True)
        traceback.print_exc()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    If no dev option is set (make up prod), then the scheduler will run on startup to catch up any missed updates since the last update.
    """
    print("Lifespan starting...", flush=True)
    
    wait_for_db_and_migrate()
    
    settings = get_settings()
    task = None
    weekly_task = None
    if settings.run_scheduler:
        print("Starting scheduler...", flush=True)
        task = asyncio.create_task(_scheduler_loop())
        weekly_task = asyncio.create_task(_scheduler_weekly_loop())
    else:
        print("Scheduler is disabled.", flush=True)

    yield

    if task is not None:
        task.cancel()
    if weekly_task is not None:
        weekly_task.cancel()
