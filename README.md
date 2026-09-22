# 🏥 Med Route

> **Find the Right Hospital. At the Right Cost. Near You.**

Med Route is an AI-powered hospital discovery and routing platform for Indian citizens. It helps patients find the right hospital for their medical condition — with real-time ICU telemetry, PMJAY/Ayushman Bharat coverage data, transparent cost estimates, and one-tap SOS emergency dispatch.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2052-61DAFB?logo=react)](https://expo.dev/)

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔍 **AI-Powered Natural Language Search** | Type *"Find kidney treatment near Chandigarh under ₹2 lakhs"* and get ranked results |
| 🗺️ **Geospatial Hospital Discovery** | PostGIS-powered radius search with real-time distance calculation |
| 📊 **Transparent Cost Comparison** | Side-by-side comparison of hospitals with procedure cost ranges |
| 🏥 **Live ICU Telemetry** | Real-time bed availability (ICU, general, emergency) |
| 🆘 **One-Tap SOS Dispatch** | Find nearest trauma center + ambulance dispatch in seconds |
| 🏛️ **PMJAY Integration** | Ayushman Bharat empanelment status and covered procedures |
| ✅ **NABH Verification** | Government-verified accreditation badges |
| 📱 **Mobile + Web** | React Native app (Android/iOS) + Next.js web platform |
| 🔐 **Data Transparency** | Every record labeled with data provenance (SIMULATED / PMJAY_HBP / MANUAL_VERIFIED) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Med Route Stack                       │
├─────────────┬───────────────────────┬────────────────────────┤
│  Web (M3)   │     Mobile (M2)       │    Admin (M4)          │
│  Next.js 15 │  React Native Expo 52 │  Next.js /admin/*      │
│  Vercel     │  EAS Build (APK/IPA)  │  Same deployment       │
└──────┬──────┴──────────┬────────────┴──────────┬─────────────┘
       │                 │                        │
       └─────────────────▼────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   FastAPI Backend   │
              │   (M1 — Core API)   │
              │  Gunicorn + Uvicorn │
              │   Railway / Render  │
              └──────────┬──────────┘
                         │
       ┌─────────────────┼──────────────────────┐
       │                 │                       │
┌──────▼──────┐  ┌───────▼────────┐   ┌─────────▼──────────┐
│ PostgreSQL  │  │     Redis      │   │   Gemini API (M2)  │
│  + PostGIS  │  │  (Cache+Rate)  │   │  NLP Query Parser  │
│  (Railway)  │  │  (Upstash)     │   │                    │
└─────────────┘  └────────────────┘   └────────────────────┘
```

---

## 📁 Project Structure

```
Med-Route/
├── backend/                    # FastAPI Python API
│   ├── app/
│   │   ├── ai/                 # Gemini NLP engine + fallback parser
│   │   ├── data_pipeline/      # ETL scripts, seed data, PMJAY scraper
│   │   ├── models/             # SQLAlchemy 2.0 ORM models
│   │   ├── routers/            # API route handlers
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Business logic layer
│   │   ├── config.py           # Pydantic BaseSettings
│   │   ├── database.py         # Async SQLAlchemy engine
│   │   └── main.py             # FastAPI app entry point
│   ├── tests/                  # pytest test suite
│   ├── alembic/                # Database migrations
│   ├── Dockerfile              # Multi-stage production build
│   ├── gunicorn.conf.py        # Production ASGI server config
│   └── requirements.txt
│
├── web/                        # Next.js 15 web application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── search/         # Search results
│   │   │   ├── hospitals/      # Hospital detail [slug]
│   │   │   ├── compare/        # Side-by-side comparison
│   │   │   ├── sos/            # Emergency SOS
│   │   │   └── admin/          # Admin dashboard
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # API client, utilities
│   │   └── styles/             # Global CSS design system
│   └── package.json
│
├── mobile/                     # React Native Expo app
│   ├── src/
│   │   ├── screens/            # App screens
│   │   ├── components/         # Mobile-specific components
│   │   └── services/           # API + SOS services
│   └── package.json
│
├── docs/                       # Implementation plans + team docs
├── UI/                         # Stitch HTML prototypes
├── docker-compose.yml          # Full stack orchestration
├── .env.example                # Environment variable template
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker + Docker Compose
- PostgreSQL with PostGIS extension *(handled by Docker)*

### 1. Clone & Setup
```bash
git clone https://github.com/keshav-x/Med-Route.git
cd Med-Route
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your:
# - GEMINI_API_KEY (from Google AI Studio)
# - JWT_SECRET (generate with: openssl rand -hex 32)
```

### 3. Start with Docker Compose
```bash
docker-compose up -d
```

This starts:
- 🐘 **PostgreSQL + PostGIS** on port 5432
- ⚡ **Redis** on port 6379
- 🔌 **FastAPI backend** on http://localhost:8000
- 🌐 **Next.js web app** on http://localhost:3000

### 4. Database Setup
```bash
cd backend
python -m alembic upgrade head
python -m app.data_pipeline.seed_data  # Seeds 50+ hospitals
```

### 5. API Documentation
Visit http://localhost:8000/docs for interactive Swagger UI.

---

## 🌐 API Overview

### Search
```http
POST /api/search/nl
Content-Type: application/json

{
  "query": "Find kidney treatment near Chandigarh under 2 lakhs",
  "latitude": 30.7333,
  "longitude": 76.7794
}
```

Response includes AI-extracted filters, ranked hospital list with transparent scoring.

### Hospitals
```http
GET /api/hospitals/nearby?lat=30.73&lng=76.77&radius_km=50
GET /api/hospitals/{slug}
GET /api/hospitals/{id}/procedures
```

### SOS Emergency
```http
POST /api/sos/nearest
{
  "latitude": 30.7333,
  "longitude": 76.7794
}
```

---

## 📊 Data Transparency

Every hospital record includes a `data_source_label`:

| Badge | Label | Meaning |
|---|---|---|
| 🟢 Verified | `MANUAL_VERIFIED` | Manually verified by Med Route team |
| 🟢 Verified | `PMJAY_HBP` | From official PMJAY health data |
| 🟡 Government | `HFR_REGISTRY` | From Health Facility Registry |
| 🔵 Community | `USER_CONTRIBUTED` | User-submitted, awaiting verification |
| ⚪ Demo | `SIMULATED` | Simulated data for demonstration |

---

## 👥 Team & Roles

| Member | Role | Responsibility |
|---|---|---|
| **M1** | Backend & Data Lead | FastAPI, PostgreSQL+PostGIS, data pipeline, Docker, deployment |
| **M2** | AI & Mobile Lead | Gemini NLP engine, React Native app, SOS widget |
| **M3** | Web Frontend Lead | Next.js web app, design system, all pages, maps |
| **M4** | Admin & Docs Lead | Admin dashboard, reviews, documentation, testing |

---

## 🗓️ Sprint Timeline

**3-week sprint** starting September 22, 2026.

- **Week 1**: Backend foundation + AI NLP engine
- **Week 2**: Web frontend + mobile app + search live
- **Week 3**: Admin, polish, Docker deployment, testing

---

## 🚢 Deployment

| Service | Platform | Cost |
|---|---|---|
| Web Frontend | Vercel | Free |
| Backend API | Railway | ~$5/mo |
| PostgreSQL + PostGIS | Railway | ~$5/mo |
| Redis | Upstash | Free |
| Mobile Build | Expo EAS | Free |
| AI (Gemini) | Google AI Studio | Pay-per-use |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- **PMJAY** — Pradhan Mantri Jan Arogya Yojana health benefit package data structure
- **Health Facility Registry (HFR)** — Government of India health facility data
- **PostGIS** — Geospatial database extension for PostgreSQL
- **Google Gemini** — AI-powered natural language understanding
