# ──────────────────────────────────────────────
# Dockerfile — Med Route FastAPI Backend
# Multi-stage build for minimal production image
# ──────────────────────────────────────────────

# ── Stage 1: Builder ──────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt


# ── Stage 2: Production Image ─────────────────
FROM python:3.12-slim AS production

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash medroute
USER medroute
WORKDIR /home/medroute/app

# Copy installed packages from builder
COPY --from=builder /root/.local /home/medroute/.local
ENV PATH=/home/medroute/.local/bin:$PATH

# Copy application code
COPY --chown=medroute:medroute . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health').raise_for_status()"

# Production command: Gunicorn with 4 Uvicorn workers
CMD ["gunicorn", "app.main:app", "--config", "gunicorn.conf.py"]
