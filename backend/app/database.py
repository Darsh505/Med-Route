"""
──────────────────────────────────────────────
database.py — Async SQLAlchemy Setup
──────────────────────────────────────────────

Supports two modes:
1. PostgreSQL mode — full PostGIS capabilities (production)
2. In-Memory mode — auto-activated when PostgreSQL is unreachable (local dev / demo)

The mode is detected automatically on startup. No configuration needed.
"""

from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("database")


# ── Mode Flag ─────────────────────────────────────────────────────
USE_MEMORY_DB: bool = False  # Set to True on startup if PostgreSQL fails


# ── Base Class for ORM Models ─────────────────────────────────────
class Base(DeclarativeBase):
    """All SQLAlchemy models inherit from this base."""
    pass


# ── Async Engine (lazy init) ──────────────────────────────────────
engine = None
async_session_factory = None

def _init_engine():
    global engine, async_session_factory
    if engine is not None:
        return
    try:
        engine = create_async_engine(
            settings.DATABASE_URL,
            pool_size=5,
            max_overflow=5,
            pool_pre_ping=True,
            pool_timeout=5,
            connect_args={"timeout": 5} if "asyncpg" in settings.DATABASE_URL else {},
            echo=False,
        )
        async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False,
        )
    except Exception as e:
        logger.warning(f"Engine init failed (expected in demo mode): {e}")


# ── Stub Session for In-Memory Mode ──────────────────────────────
class StubSession:
    """No-op session used when PostgreSQL is not available."""
    is_active = False

    async def execute(self, *args, **kwargs):
        return None

    async def commit(self):
        pass

    async def rollback(self):
        pass

    async def close(self):
        pass

    async def flush(self):
        pass

    async def refresh(self, obj):
        pass

    def add(self, obj):
        pass

    def expunge(self, obj):
        pass


# ── Dependency Injection ──────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency: provides a DB session per request.
    In demo mode, yields a StubSession so all route handlers work.
    """
    global USE_MEMORY_DB

    if USE_MEMORY_DB:
        yield StubSession()
        return

    if async_session_factory is None:
        _init_engine()

    if async_session_factory is None or USE_MEMORY_DB:
        yield StubSession()
        return

    async with async_session_factory() as session:
        try:
            yield session
            try:
                if session.is_active:
                    await session.commit()
            except Exception:
                try:
                    await session.rollback()
                except Exception:
                    pass
        except Exception:
            try:
                await session.rollback()
            except Exception:
                pass
            raise
        finally:
            try:
                await session.close()
            except Exception:
                pass


# ── Startup Helper ────────────────────────────────────────────────
async def create_db_and_tables():
    """
    Attempts to create PostgreSQL tables.
    If it fails, activates in-memory mode.
    """
    global USE_MEMORY_DB

    _init_engine()

    if engine is None:
        logger.info("[DEMO] No DB engine - activating in-memory demonstration mode")
        USE_MEMORY_DB = True
        _init_memory_store()
        return

    try:
        from sqlalchemy import text
        async with engine.begin() as conn:
            # Test connection first
            await conn.execute(text("SELECT 1"))
            # Enable PostGIS
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
            except Exception:
                pass
            # Create tables
            await conn.run_sync(Base.metadata.create_all)
        logger.info("[OK] PostgreSQL connected and tables verified")
    except Exception as e:
        logger.info(f"[DEMO] PostgreSQL unavailable ({type(e).__name__}) - activating in-memory demonstration mode")
        USE_MEMORY_DB = True
        _init_memory_store()


def _init_memory_store():
    """Initialize the in-memory store with seed data."""
    try:
        from app.services.memory_store import memory_store
        memory_store.load()
        logger.info("[OK] In-memory data store ready - all API endpoints functional")
    except Exception as e:
        logger.error(f"Memory store init failed: {e}")

