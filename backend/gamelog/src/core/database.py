from collections.abc import Generator
import time
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy.exc import OperationalError
from sqlmodel import Session, create_engine

from src.core.settings import get_settings

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session and closes it safely."""
    with Session(engine) as session:
        try:
            yield session
        except Exception:
            session.rollback()
            raise


def wait_for_db_and_migrate() -> None:
    """Waits for the database to become available and applies migrations."""
    # Skip migrations for sqlite databases (e.g. testing)
    if "sqlite" in settings.database_url:
        print("SQLite detected. Skipping database migrations on startup.", flush=True)
        return

    print("Checking database connection...", flush=True)
    retries = 30
    while retries > 0:
        try:
            # Attempt to connect to the database
            with engine.connect() as conn:
                print("Database connection successful.", flush=True)
                break
        except OperationalError as e:
            print(f"Database not ready yet ({e}). Retrying in 1 second... ({retries} retries left)", flush=True)
            time.sleep(1)
            retries -= 1
    else:
        raise RuntimeError("Could not connect to the database after 30 seconds.")

    print("Running Alembic migrations on startup...", flush=True)
    try:
        # Find the project root directory (where alembic.ini resides)
        project_root = Path(__file__).resolve().parents[2]
        alembic_ini_path = project_root / "alembic.ini"
        alembic_dir_path = project_root / "alembic"

        alembic_cfg = Config(str(alembic_ini_path))
        alembic_cfg.set_main_option("script_location", str(alembic_dir_path))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)

        command.upgrade(alembic_cfg, "head")
        print("Database migrations applied successfully.", flush=True)
    except Exception as e:
        print(f"Error running database migrations: {e}", flush=True)
        raise

