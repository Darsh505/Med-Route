# Med Route — Master Implementation Plan

> **Status**: APPROVED — Ready for Execution  
> **Team Size**: 4 members  
> **Deployment**: Production-ready (Docker + Vercel + Railway/Render)  
> **AI**: Google Gemini API (key available) + offline rule-based fallback

---

## Team Distribution Overview

| Role | Codename | Complexity | Primary Responsibility |
|---|---|---|---|
| **Member 1** | 🏗️ **Backend & Data Lead** | 🔴 Complex | FastAPI backend, PostgreSQL+PostGIS, data pipeline, auth, Docker, deployment |
| **Member 2** | 🤖 **AI & Mobile Lead** | 🔴 Complex | Gemini NLP engine, intent/entity extraction, React Native app, SOS widget |
| **Member 3** | 🎨 **Web Frontend Lead** | 🟡 Standard | Next.js web app, design system, all pages, maps, responsive UI |
| **Member 4** | 📋 **Admin & Docs Lead** | 🟡 Standard | Admin dashboard, reviews system, compare UI, README, docs, testing |

> [!IMPORTANT]
> Each member has their own detailed implementation plan. See:
> - [Member 1 — Backend Lead](file:///C:/Users/Legion/.gemini/antigravity-ide/brain/f0d12fc1-5851-43bb-a36f-82bdd9c084dc/team_member_1_backend_lead.md)
> - [Member 2 — AI & Mobile Lead](file:///C:/Users/Legion/.gemini/antigravity-ide/brain/f0d12fc1-5851-43bb-a36f-82bdd9c084dc/team_member_2_ai_mobile_lead.md)
> - [Member 3 — Web Frontend Lead](file:///C:/Users/Legion/.gemini/antigravity-ide/brain/f0d12fc1-5851-43bb-a36f-82bdd9c084dc/team_member_3_web_frontend.md)
> - [Member 4 — Admin & Docs Lead](file:///C:/Users/Legion/.gemini/antigravity-ide/brain/f0d12fc1-5851-43bb-a36f-82bdd9c084dc/team_member_4_admin_docs.md)
> - [UI Design Stitch Prompt](file:///C:/Users/Legion/.gemini/antigravity-ide/brain/f0d12fc1-5851-43bb-a36f-82bdd9c084dc/ui_stitch_prompt.md)

---

## Architecture (Deployment-Ready)

```mermaid
graph TB
    subgraph "Production Frontend"
        VCL["☁️ Vercel<br/>Next.js Web App"]
        EAS["📱 EAS Build<br/>iOS + Android"]
    end

    subgraph "Production Backend — Railway / Render"
        NGX["🔀 Nginx<br/>(Reverse Proxy + SSL)"]
        API["⚡ FastAPI<br/>(Gunicorn + Uvicorn workers)"]
    end

    subgraph "Managed Services"
        PG["🐘 PostgreSQL + PostGIS<br/>(Railway Postgres / Supabase)"]
        RD["⚡ Redis<br/>(Railway Redis / Upstash)"]
    end

    subgraph "External APIs"
        GEM["🧠 Google Gemini API"]
        NOM["🗺️ Nominatim / OSM"]
        GOV["🏛️ PMJAY / HFR Data"]
    end

    VCL & EAS --> NGX --> API
    API --> PG & RD
    API --> GEM & NOM
    API -.->|"Scheduled ETL"| GOV
```

---

## Sprint Timeline

```mermaid
gantt
    title Med Route — 3-Week Sprint Plan
    dateFormat  YYYY-MM-DD
    
    section Member 1 (Backend)
    DB Models + Auth + Config        :m1a, 2026-09-22, 3d
    Services + Routers (CRUD)        :m1b, after m1a, 3d
    PostGIS Geo Queries + Ranking    :m1c, after m1b, 2d
    Data Pipeline + Seed Data        :m1d, after m1c, 3d
    Docker + Deployment Config       :m1e, after m1d, 2d
    Integration Testing              :m1f, after m1e, 2d

    section Member 2 (AI + Mobile)
    Gemini NLP Parser + Mappings     :m2a, 2026-09-22, 3d
    Intent Classifier + Extractor    :m2b, after m2a, 2d
    React Native Setup + Nav         :m2c, after m2b, 2d
    Mobile Screens (Search+Detail)   :m2d, after m2c, 3d
    SOS Widget + Background Location :m2e, after m2d, 3d
    NER Training + Polish            :m2f, after m2e, 2d

    section Member 3 (Web Frontend)
    Next.js Setup + Design System    :m3a, 2026-09-22, 2d
    Landing Page + Search Page       :m3b, after m3a, 3d
    Hospital Detail + Maps           :m3c, after m3b, 3d
    Compare Page + SOS Page          :m3d, after m3c, 3d
    API Integration + Polish         :m3e, after m3d, 3d
    Responsive + Accessibility       :m3f, after m3e, 1d

    section Member 4 (Admin + Docs)
    Reviews System (API + UI)        :m4a, 2026-09-25, 3d
    Admin Dashboard Layout           :m4b, after m4a, 3d
    Upload + Verify Workflow         :m4c, after m4b, 3d
    README + Architecture Docs       :m4d, after m4c, 3d
    API Docs + Data Dictionary       :m4e, after m4d, 2d
    E2E Testing + Final Polish       :m4f, after m4e, 1d
```

---

## Integration Handoff Points

These are the critical moments where team members must sync:

| Day | Handoff | From → To | What's Exchanged |
|---|---|---|---|
| **Day 3** | Backend API contracts ready | M1 → M3, M4 | OpenAPI schema + Pydantic schemas (TypeScript types generated) |
| **Day 3** | AI search endpoint spec | M2 → M1 | NLP parser interface, SearchFilters schema |
| **Day 5** | Auth + Hospital CRUD live | M1 → M3, M4 | Working endpoints for frontend integration |
| **Day 7** | Search API live | M1 + M2 → M3 | `/api/search/nl` endpoint with Gemini integration |
| **Day 8** | Design system finalized | M3 → M4 | CSS variables, component library, page layouts |
| **Day 10** | SOS API live | M1 + M2 → M3 | `/api/sos/nearest` + WebSocket alert channel |
| **Day 12** | Reviews API live | M4 → M1 | Review model + routes merged into backend |
| **Day 15** | All APIs frozen | ALL | No more API changes — frontend polish only |
| **Day 18** | Docker Compose works | M1 → ALL | Full stack runs with `docker-compose up` |
| **Day 20** | Deployment live | M1 → ALL | Production URLs, env vars distributed |

---

## Shared Contracts (All Members Must Follow)

### API Response Format
```json
{
  "success": true,
  "data": { },
  "message": "Hospitals retrieved successfully",
  "meta": {
    "total": 42,
    "page": 1,
    "per_page": 20,
    "data_source": "SIMULATED | PMJAY_HBP | MANUAL"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "HOSPITAL_NOT_FOUND",
    "message": "No hospital found with slug 'xyz'",
    "details": {}
  }
}
```

### Environment Variables (Shared `.env`)
```env
# Database
DATABASE_URL=postgresql+asyncpg://medroute:password@localhost:5432/medroute
REDIS_URL=redis://localhost:6379/0

# Auth
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash

# Geo
NOMINATIM_USER_AGENT=medroute-app

# App
APP_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

### Git Branch Strategy
```
main                    ← production (protected)
├── develop             ← integration branch
│   ├── feat/backend-models         (M1)
│   ├── feat/backend-services       (M1)
│   ├── feat/data-pipeline          (M1)
│   ├── feat/ai-nlp-engine          (M2)
│   ├── feat/mobile-app             (M2)
│   ├── feat/sos-widget             (M2)
│   ├── feat/web-design-system      (M3)
│   ├── feat/web-pages              (M3)
│   ├── feat/web-maps               (M3)
│   ├── feat/admin-dashboard        (M4)
│   ├── feat/reviews-system         (M4)
│   └── feat/documentation          (M4)
```

### Comment Style (All Code)
```python
# ──────────────────────────────────────────────
# hospital_service.py — Hospital Business Logic
# ──────────────────────────────────────────────
# This service handles all hospital-related operations:
# 1. CRUD operations for hospital records
# 2. Geospatial "nearby" queries using PostGIS
# 3. Transparent ranking algorithm
#
# WHY PostGIS instead of Python-side distance calc?
# → PostGIS uses spatial indexes (GiST) which makes
#   radius queries O(log n) instead of O(n). With 50k+
#   hospitals, this matters a lot.
# ──────────────────────────────────────────────
```

---

## Deployment Architecture

```mermaid
graph LR
    subgraph "Vercel (Free Tier)"
        WEB["Next.js Web App<br/>+ Admin Dashboard"]
    end

    subgraph "Railway ($5/mo)"
        API_R["FastAPI Backend<br/>(Docker)"]
        PG_R["PostgreSQL + PostGIS"]
        RD_R["Redis"]
    end

    subgraph "Expo EAS"
        APK["Android APK/AAB"]
        IPA["iOS IPA"]
    end

    subgraph "External"
        GEM_R["Gemini API"]
        CDN["Vercel CDN<br/>(Static Assets)"]
    end

    WEB -->|"API calls"| API_R
    APK & IPA -->|"API calls"| API_R
    API_R --> PG_R & RD_R & GEM_R
    WEB --> CDN
```

| Service | Platform | Est. Cost |
|---|---|---|
| Web Frontend | Vercel (Free/Pro) | $0 – $20/mo |
| Backend API | Railway | ~$5/mo |
| PostgreSQL | Railway (or Supabase free) | $0 – $5/mo |
| Redis | Upstash (free tier) | $0 |
| Mobile Build | Expo EAS (free tier) | $0 |
| Gemini API | Google AI Studio | Pay-per-use |
| **Total** | | **$5 – $30/mo** |

---

## Data Provenance System

Every record in the database carries provenance metadata:

```python
class DataSourceLabel(str, Enum):
    """
    CRITICAL: Every hospital record MUST have a data_source_label.
    This is how we maintain trust and transparency.
    
    - SIMULATED: Generated for demo purposes, based on real structures
    - PMJAY_HBP: Extracted from PMJAY Health Benefit Package data
    - HFR_REGISTRY: From Health Facility Registry
    - MANUAL_VERIFIED: Manually entered and verified by admin
    - USER_CONTRIBUTED: Submitted by users (requires verification)
    """
    SIMULATED = "SIMULATED"
    PMJAY_HBP = "PMJAY_HBP"
    HFR_REGISTRY = "HFR_REGISTRY"
    MANUAL_VERIFIED = "MANUAL_VERIFIED"
    USER_CONTRIBUTED = "USER_CONTRIBUTED"
```

Every API response includes `data_source` in the meta field. The UI shows a badge:
- 🟢 **Verified** — MANUAL_VERIFIED or PMJAY_HBP
- 🟡 **Government Source** — HFR_REGISTRY
- 🔵 **Community** — USER_CONTRIBUTED
- ⚪ **Demo Data** — SIMULATED

---

## What Happens Next

Once you approve this master plan:

1. I will create the **4 individual team member plans** (already drafted below)
2. I will create the **UI stitch prompt** for generating mockups
3. Then I begin **executing the code** — starting with Member 1 (Backend) since it's the foundation

All 4 plans + the stitch prompt are linked at the top of this document.
