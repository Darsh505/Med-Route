"""
──────────────────────────────────────────────
main.py — FastAPI Application Entry Point
──────────────────────────────────────────────

Med Route API v1.0
AI-powered hospital discovery platform for India.

Startup sequence:
1. Load configuration from .env
2. Attempt PostgreSQL connection → fall back to in-memory demo mode
3. Load hospital seed data into memory store (always)
4. Initialize NLP parser (Gemini or rule-based fallback)
5. Register all API routers
6. Start serving requests
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
    """Application lifespan — setup on startup, cleanup on shutdown."""
    # ── STARTUP ───────────────────────────────────────────────────
    logger.info("[START] Med Route API starting up", env=settings.APP_ENV)

    # Try PostgreSQL, auto-fallback to in-memory mode
    await create_db_and_tables()

    # Always load in-memory store (used in demo mode or as search cache)
    try:
        from app.services.memory_store import memory_store
        if not memory_store._loaded:
            memory_store.load()
    except Exception as e:
        logger.warning("Memory store pre-load failed", error=str(e))

    # Seed database (only if PostgreSQL is connected)
    from app.database import USE_MEMORY_DB
    if settings.SEED_ON_STARTUP and not USE_MEMORY_DB:
        try:
            from app.data_pipeline.seed_data import seed_hospitals
            await seed_hospitals()
            logger.info("[OK] Hospital seed data loaded into PostgreSQL")
        except Exception as e:
            logger.warning("Seed data skipped (may already be seeded)", error=str(e))

    # Initialize NLP Parser
    try:
        from app.ai.nlp_parser import get_nlp_parser
        get_nlp_parser()
        logger.info("[OK] NLP parser initialized")
    except Exception as e:
        logger.warning("NLP parser init failed, using rule-based fallback", error=str(e))

    mode = "In-Memory Demo Mode" if USE_MEMORY_DB else "PostgreSQL Mode"
    logger.info(f"[READY] Med Route API ready - {mode}", version=settings.APP_VERSION)

    yield  # Application runs here

    # ── SHUTDOWN ──────────────────────────────────────────────────
    logger.info("[STOP] Med Route API shutting down gracefully")
    try:
        from app.database import engine
        if engine:
            await engine.dispose()
    except Exception as e:
        logger.warning("Error disposing database engine on shutdown", error=str(e))


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
from app.routers import auth, hospitals, search, compare, reviews, sos, admin, chatbot

app.include_router(auth.router)
app.include_router(hospitals.router)
app.include_router(search.router)
app.include_router(compare.router)
app.include_router(reviews.router)
app.include_router(sos.router)
app.include_router(admin.router)
app.include_router(chatbot.router)


# ── Health Check ──────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    from app.database import USE_MEMORY_DB
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "mode": "in-memory-demo" if USE_MEMORY_DB else "postgresql",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
    }


@app.get("/", tags=["System"])
async def root():
    """API root."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "description": settings.APP_DESCRIPTION,
    }
