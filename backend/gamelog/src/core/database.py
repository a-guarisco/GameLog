from collections.abc import Generator

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
