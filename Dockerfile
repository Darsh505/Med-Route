# ──────────────────────────────────────────────
# Root Dockerfile — Med Route FastAPI Backend
# Supports Docker deployment on Render / Railway / Cloud
# ──────────────────────────────────────────────

FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# ── Stage 2: Production Image ─────────────────
FROM python:3.12-slim AS production

RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash medroute
USER medroute
WORKDIR /home/medroute/app

COPY --from=builder /root/.local /home/medroute/.local
ENV PATH=/home/medroute/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8

COPY --chown=medroute:medroute backend/ .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen('http://localhost:' + os.environ.get('PORT', '8000') + '/health')"

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
