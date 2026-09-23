# Med Route — Backend API & Data Pipeline

FastAPI-powered clinical discovery engine, PostGIS geospatial ranking, and PMJAY 2.2 tariff mapping service for Med Route.

---

## Overview

The Med Route backend provides sub-50ms query processing, intelligent natural language slot extraction, transparent multi-criteria hospital ranking, and emergency trauma routing. It is architected for maximum fault-tolerance: if PostgreSQL/PostGIS is unavailable during a hackathon demo or field deployment, an automated in-memory fallback engine immediately takes over with 60+ verified regional hospitals.

---

## Key Features

- **Clinical NLP Slot Parser**: Extracts clinical intent, procedures (CABG, Angioplasty, Dialysis), budget ceilings, city constraints, and PMJAY cashless flags from unstructured queries using Google Gemini 2.0 with a local rule-based fallback.
- **Explainable Multi-Criteria Ranking**: Scores facilities using a transparent weighted algorithm:
  $$\text{Score} = (0.30 \times \text{Proximity}) + (0.25 \times \text{Cost}) + (0.25 \times \text{Rating}) + (0.20 \times \text{Accreditation})$$
- **Spatial GiST Indexing**: Haversine and PostGIS geospatial radius indexing for sub-second emergency trauma center discovery.
- **PMJAY HBP 2.2 Integration**: Maps national standard health benefit packages across government and private tertiary centers.
- **Resilient Fallback Engine**: Seamless failover to embedded benchmark store if external database or network connections drop.

---

## Architecture & Directory Layout

```text
backend/
├── app/
│   ├── ai/                 # Gemini LLM triage & rule-based clinical ontology engine
│   ├── data_pipeline/      # 60+ Tricity & regional hospital seed datasets
│   ├── models/             # SQLAlchemy 2.0 ORM models (Hospital, Tariff, Review, SOS)
│   ├── routers/            # FastAPI API routers (search, compare, hospitals, sos, admin)
│   ├── schemas/            # Pydantic v2 validation models
│   ├── services/           # Ranking, geocoding, memory store, and SOS dispatch logic
│   ├── config.py           # Pydantic-settings configuration
│   ├── database.py         # Async SQLAlchemy session engine with fallback
│   └── main.py             # FastAPI entrypoint with CORS, healthchecks, and lifespans
├── scripts/
│   └── generate_pan_india_dataset.py  # 1000+ hospital Pan-India dataset generator
├── tests/                  # Pytest unit and integration test suite
├── Dockerfile              # Multi-stage production container build
├── gunicorn.conf.py        # Production Gunicorn worker configuration
└── requirements.txt        # Python 3.12+ pinned dependencies
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Healthcheck and database connectivity status |
| `GET` | `/api/hospitals` | Paginated hospital directory with city/specialty filters |
| `GET` | `/api/hospitals/{slug}` | Hospital profile, ICU bed count, NABH status, tariffs |
| `GET` | `/api/hospitals/nearby` | Spatial proximity search (`lat`, `lng`, `radius_km`) |
| `POST` | `/api/search/nl` | Semantic search with slot mapping and ranking breakdown |
| `POST` | `/api/compare` | Side-by-side comparison across 4 verifiable metrics |
| `POST` | `/api/sos/nearest` | Sub-second nearest trauma center lookup |
| `POST` | `/api/sos/alert` | Trigger citizen emergency dispatch beacon |
| `POST` | `/api/chat` | Clinical triage assistant with red-flag detection |

---

## Setup & Local Development

### 1. Prerequisites
- Python 3.12 or higher
- PostgreSQL 16 with PostGIS (optional — memory fallback activates automatically)

### 2. Environment Setup
```bash
# Create and activate virtual environment
python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Interactive API documentation: `http://localhost:8000/docs`

### 4. Run Test Suite
```bash
pytest -q
```
All 20 unit tests validate authentication, search ranking, and clinical chatbot routing.
