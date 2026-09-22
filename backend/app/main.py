"""
──────────────────────────────────────────────
main.py — FastAPI Application Entry Point
──────────────────────────────────────────────

Med Route API v1.0
AI-powered hospital discovery platform for India.

Startup sequence:
1. Load configuration from .env
2. Connect to PostgreSQL + enable PostGIS extension
3. Run Alembic migrations (in development)
4. Seed database with simulated hospital data (if SEED_ON_STARTUP=true)
5. Initialize NLP parser (Gemini or rule-based fallback)
6. Register all API routers
7. Start serving requests
"""

import structlog
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import create_db_and_tables

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan — runs setup on startup, cleanup on shutdown.
    Using the modern lifespan approach instead of deprecated @app.on_event.
    """
    # ── STARTUP ───────────────────────────────────────────────────
    logger.info("🚀 Med Route API starting up", env=settings.APP_ENV)

    # Create tables (in production, use Alembic instead)
    if settings.APP_ENV == "development":
        await create_db_and_tables()
        logger.info("✅ Database tables created/verified")

    # Seed database with simulated hospital data
    if settings.SEED_ON_STARTUP:
        try:
            from app.data_pipeline.seed_data import seed_hospitals
            await seed_hospitals()
            logger.info("✅ Hospital seed data loaded")
        except Exception as e:
            logger.warning("Seed data failed (may already be seeded)", error=str(e))

    logger.info("✅ Med Route API ready", version=settings.APP_VERSION)

    yield  # Application runs here

    # ── SHUTDOWN ──────────────────────────────────────────────────
    logger.info("👋 Med Route API shutting down gracefully")
    from app.database import engine
    await engine.dispose()


# ── FastAPI Application ────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# ── CORS Middleware ────────────────────────────────────────────────
# Allows cross-origin requests from web frontend and mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handler ──────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler — returns standardized error format.
    In production, logs to structured log aggregator (Datadog/Sentry).
    """
    logger.error("Unhandled exception", path=request.url.path, error=str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred. Our team has been notified.",
            },
        },
    )


# ── Register Routers ──────────────────────────────────────────────
from app.routers import auth, hospitals, search, compare, reviews, sos, admin

app.include_router(auth.router)
app.include_router(hospitals.router)
app.include_router(search.router)
app.include_router(compare.router)
app.include_router(reviews.router)
app.include_router(sos.router)
app.include_router(admin.router)


# ── Health Check ──────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    """
    Liveness probe — used by Docker health checks and Railway monitoring.
    Returns 200 OK when the API is running.
    """
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }


@app.get("/", tags=["System"])
async def root():
    """API root — redirect users to docs."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "description": settings.APP_DESCRIPTION,
    }
