from collections.abc import Generator

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from src.core.settings import get_settings

settings = get_settings()

engine: Engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal: sessionmaker[Session] = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session and closes it safely."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
