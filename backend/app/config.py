"""
──────────────────────────────────────────────
config.py — Med Route Environment Configuration
──────────────────────────────────────────────

Uses Pydantic BaseSettings for type-safe, validated configuration.

WHY BaseSettings?
→ It auto-reads from .env files AND environment variables,
  which means the SAME code works in:
  - Local dev (reads .env file)
  - Production (reads Railway/Render injected env vars)
  - Docker (reads docker-compose environment section)
  No code changes needed between environments.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyUrl


class Settings(BaseSettings):
    # ── Database — PostGIS-enabled PostgreSQL ──────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://medroute:password@localhost:5432/medroute"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://medroute:password@localhost:5432/medroute"

    # ── Redis — for caching and rate limiting ──────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── JWT Auth ───────────────────────────────────────────────────
    JWT_SECRET: str = "change-me-in-production-please-use-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash-lite"

    # ── Firebase Auth ─────────────────────────────────────────────
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_SERVICE_ACCOUNT_PATH: str = ""

    # ── Geocoding ─────────────────────────────────────────────────
    NOMINATIM_USER_AGENT: str = "medroute-app/1.0"

    # ── Application ───────────────────────────────────────────────
    APP_ENV: str = "development"
    APP_NAME: str = "Med Route API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-powered hospital discovery and routing platform for India"

    # CORS — allow frontend, admin console, and mobile origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",   # Next.js web (dev)
        "http://127.0.0.1:3000",
        "http://localhost:3001",   # Next.js admin console (dev)
        "http://127.0.0.1:3001",
        "http://localhost:8081",   # React Native Metro (dev)
        "https://med-route.vercel.app",  # Production web
    ]

    # ── Data Pipeline ─────────────────────────────────────────────
    SEED_ON_STARTUP: bool = True   # Auto-seed DB with simulated data on first run
    SEED_HOSPITAL_COUNT: int = 55  # Number of hospitals to seed

    # ── Rate Limiting ─────────────────────────────────────────────
    RATE_LIMIT_REQUESTS: int = 100   # Max requests per window
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings loader.
    Using @lru_cache means we only read/parse .env once per process lifecycle,
    not on every request. The function is called via FastAPI's Depends().
    """
    return Settings()


# Global singleton for use outside of FastAPI dependency injection
settings = get_settings()
