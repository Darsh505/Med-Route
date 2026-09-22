"""
──────────────────────────────────────────────
database.py — Async SQLAlchemy Setup
──────────────────────────────────────────────

KEY ARCHITECTURAL DECISIONS:

1. Async Engine (asyncpg driver)
   → Non-blocking I/O. FastAPI is async-native. Using a sync
     PostgreSQL driver would block the event loop on every query,
     destroying concurrency. asyncpg is the fastest PostgreSQL
     driver for Python.

2. expire_on_commit=False
   → In async context, lazy-loading ORM relationships after commit
     causes "greenlet_spawn" errors. expire_on_commit=False keeps
     attribute values accessible after commit without triggering
     additional queries.

3. Connection Pool (pool_size=20, max_overflow=10)
   → 20 persistent connections + 10 overflow for traffic spikes.
     With Railway's PostgreSQL free tier (max 25 connections),
     we stay well within limits.

4. PostGIS via GeoAlchemy2
   → GeoAlchemy2 adds PostGIS-aware column types and query functions
     (ST_DWithin, ST_Distance, etc.) to SQLAlchemy's ORM.
     The Geography(POINT, 4326) type stores WGS84 coordinates and
     calculates distances in METERS on a spherical Earth model.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


# ── Async Engine ──────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,        # Check connection health before using from pool
    echo=(settings.APP_ENV == "development"),  # Log SQL in dev only
)

# ── Session Factory ───────────────────────────────────────────────
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,    # See note above
    autoflush=False,           # We control when to flush
    autocommit=False,
)


# ── Base Class for ORM Models ─────────────────────────────────────
class Base(DeclarativeBase):
    """
    All SQLAlchemy models inherit from this base.
    Provides the metadata registry used by Alembic for migrations.
    """
    pass


# ── Dependency Injection ──────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a fresh DB session per request.

    Usage in route handlers:
        @router.get("/hospitals")
        async def list_hospitals(db: AsyncSession = Depends(get_db)):
            ...

    WHY a generator (yield) instead of returning a session?
    → The generator pattern guarantees the session is ALWAYS closed
      after the request, even if an exception occurs. This prevents
      connection pool exhaustion.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Startup Helper ────────────────────────────────────────────────
async def create_db_and_tables():
    """
    Creates all tables defined in models. Used in development.
    In production, we use Alembic migrations instead.

    Also ensures PostGIS extension is enabled.
    """
    from sqlalchemy import text

    async with engine.begin() as conn:
        # Enable PostGIS if not already enabled
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis_topology"))
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
