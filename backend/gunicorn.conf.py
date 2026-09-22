"""
gunicorn.conf.py — Production ASGI Server Configuration
Used in Docker production deployment.
"""

import multiprocessing

# ── Worker Config ─────────────────────────────────────────────────
# Use Uvicorn workers for ASGI (async) support
worker_class = "uvicorn.workers.UvicornWorker"

# Number of workers: (2 × CPU cores) + 1 — standard recommendation
# In Docker, default to 4 workers (Railway gives 1-2 CPUs)
workers = int(multiprocessing.cpu_count() * 2 + 1)
workers = min(workers, 4)  # Cap at 4 for Railway free tier

# ── Networking ────────────────────────────────────────────────────
bind = "0.0.0.0:8000"
timeout = 120           # Request timeout (120s for large file uploads)
keepalive = 5           # Keep connections alive for 5s
max_requests = 1000     # Restart worker after 1000 requests (memory leak prevention)
max_requests_jitter = 50

# ── Logging ───────────────────────────────────────────────────────
accesslog = "-"         # Log to stdout (Docker/Railway captures this)
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(r)s %(s)s %(b)s %(D)sµs'

# ── Process Management ────────────────────────────────────────────
preload_app = True      # Load app before forking workers (memory efficient)
graceful_timeout = 30   # Give workers 30s to finish requests on shutdown
