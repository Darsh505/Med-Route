# Med Route — Healthcare Discovery, Transparent Pricing & Emergency Trauma Routing

> An open-access healthcare discovery, transparent surgical pricing, and emergency trauma routing platform for India.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React Native Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=flat&logo=expo)](https://expo.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL PostGIS](https://img.shields.io/badge/PostGIS-16--3.4-336791?style=flat&logo=postgresql)](https://postgis.net/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Docker Compose](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![Database Catalog](https://img.shields.io/badge/Database-Schema_%26_Catalog-blue?style=flat&logo=postgresql)](DATABASE.md)

---

## Executive Summary

During critical medical decisions and emergency trauma events in India, patients and caregivers face acute information asymmetry:
1. Identifying which nearby facilities possess active clinical capacity and specialized surgical departments for a given condition.
2. Determining whether required treatments are eligible for coverage under government benefit schemes such as **Ayushman Bharat (AB-PMJAY)**.
3. Estimating actual out-of-pocket procedure costs alongside verified institutional clinical success rates.
4. Verifying real-time ICU and emergency bed availability prior to patient transfer.

**Med Route** addresses this infrastructure gap through an open citizen discovery platform and institutional telemetry bridge. The system integrates **natural language clinical slot extraction**, **geospatial tactical radar**, a side-by-side facility comparison matrix based on **verifiable clinical outcome metrics**, and a sub-second **emergency SOS trauma corridor**.

---

## System Capabilities and Architecture Alignment

| Architectural Phase | Technical Requirement | Med Route Implementation | Reference Path |
|---|---|---|---|
| **1. Aggregate** | Ingest hospital registries, specialties, and government packages | Normalized dataset covering 1,451 facilities across 107 cities mapped to National Health Authority (NHA) **PMJAY HBP 2.2** schedules. | [`DATABASE.md`](DATABASE.md)<br>[`backend/app/data_pipeline/`](backend/app/data_pipeline/) |
| **2. Index** | High-performance spatial and procedural indexing | PostGIS Spatial GiST indexing, sub-second Haversine proximity computation, and cached specialty taxonomy. | [`backend/app/services/ranking_service.py`](backend/app/services/ranking_service.py) |
| **3. Search** | Semantic natural language search with slot mapping and explainability | Dual-tier client and server NLP query parser extracting: **Condition**, **City**, **Budget Ceiling**, and **PMJAY Status**. Explainable ranking breakdown. | [`web/src/app/search/page.tsx`](web/src/app/search/page.tsx)<br>[`mobile/src/screens/SearchScreen.tsx`](mobile/src/screens/SearchScreen.tsx) |
| **4. Compare** | Side-by-side facility comparison with verifiable metrics | Dedicated comparison matrix evaluating institutions across **4 Verifiable Metrics**: Annual Volume, Clinical Success Ratio, PMJAY Tariffs, and Certifications. | [`web/src/app/compare/page.tsx`](web/src/app/compare/page.tsx)<br>[`mobile/src/screens/CompareScreen.tsx`](mobile/src/screens/CompareScreen.tsx) |
| **5. Trauma Dispatch** | Emergency ambulance and SOS routing | GPS one-touch SOS dispatch, Level 1/2 trauma center identification, ETA calculation, and direct 108 emergency service integration. | [`web/src/app/emergency-cashless/page.tsx`](web/src/app/emergency-cashless/page.tsx)<br>[`mobile/src/screens/SOSScreen.tsx`](mobile/src/screens/SOSScreen.tsx) |
| **6. Resilience** | Production-grade full-stack solution | Next.js 16 Web App, Expo SDK 57 Cross-platform Mobile App, FastAPI Async Backend, Docker orchestration, and 100% offline failover. | Full Monorepo Architecture |

---

## Core Architectural Pillars

```
                     ┌─────────────────────────────────────────────────────────┐
                     │                       MED ROUTE                         │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
         ┌────────────────────────┬───────────────┴───────────────┬────────────────────────┐
         ▼                        ▼                               ▼                        ▼
  ┌──────────────┐         ┌──────────────┐                ┌──────────────┐         ┌──────────────┐
  │ 1. AGGREGATE │         │   2. INDEX   │                │  3. SEARCH   │         │  4. COMPARE  │
  ├──────────────┤         ├──────────────┤                ├──────────────┤         ├──────────────┤
  │ • NHA PMJAY  │         │ • PostGIS    │                │ • NLP Slot   │         │ • 4 Verifi-  │
  │ • HFR Registry│        │   Spatial    │                │   Extraction │         │   able       │
  │ • Bed Tele-  │         │ • Tariff     │                │ • Proximity  │         │   Metrics    │
  │   metry      │         │   Catalog    │                │ • Explainable│         │ • Dynamic    │
  │ • Verified   │         │ • Dynamic    │                │   Ranking    │         │   Procedure  │
  │   Audits     │         │   Cache      │                │ • Tactical   │         │   Tariffs    │
  │              │         │              │                │   Radar Map  │         │              │
  └──────────────┘         └──────────────┘                └──────────────┘         └──────────────┘
```

### 1. Aggregate
- Ingests and normalizes clinical registries across **Tricity (Chandigarh, Mohali, Panchkula)** and 107 Indian cities.
- Normalized against National Health Authority (NHA) **Ayushman Bharat PMJAY 2.2** benefit schedules.
- Explicit data provenance labels on every record: `MANUAL_VERIFIED`, `PMJAY_HBP`, and `HFR_REGISTRY`. See [**`DATABASE.md`**](DATABASE.md) for full schema definitions.

### 2. Index
- Sub-second spatial proximity queries via PostGIS and Haversine algorithms.
- Multi-dimensional indexing on clinical specialties, procedural package codes, bed capacities, and accreditation tiers (NABH, JCI, NABL).

### 3. Search: Clinical NLP Slot Mapping & Explainable Ranking
When a user submits an unstructured query such as:  
> *"Find kidney treatment hospitals near Chandigarh under ₹2 lakh"*

The integrated clinical NLP engine parses the input into structured parameters:
- **Clinical Specialty / Condition**: `Nephrology & Kidney Care`
- **City / Geographic Constraint**: `Chandigarh / Tricity`
- **Budget Ceiling**: `Max ₹2,00,000`
- **Scheme Requirement**: `AB-PMJAY Cashless Preferred`

Every recommended hospital provides an **"Explain Ranking Score"** breakdown:
$$\text{Composite Score} = (0.30 \times \text{Proximity}) + (0.25 \times \text{Cost Match}) + (0.25 \times \text{Patient Rating}) + (0.20 \times \text{Accreditation Tier})$$

### 4. Compare: Verifiable Clinical Metrics
Users can select institutions (e.g., **PGIMER Chandigarh**, **Max Super Speciality Hospital**, **Fortis Escorts**) and evaluate them side-by-side across four standardized criteria:
1. **Annual Procedure Volume**: Validated high-volume clinical indicators (e.g., 2,800+ cardiac procedures/yr).
2. **Clinical Success Ratio**: Statistically verified procedural outcome percentage (e.g., 98.4% success).
3. **Government vs Private Tariffs**: Transparent comparison between private cash estimates and PMJAY subsidized package ceilings.
4. **Verified Certifications**: NABH Digital, NABL certified clinical labs, JCI accreditation, and Emergency Trauma Levels.

---

## Demonstration Walkthrough

### Step 1: Clinical Query Slot Mapping
1. Navigate to the **Web Application** (`/search`) or **Mobile Application** (Search tab).
2. Enter or select a clinical query:  
   `Kidney < ₹2L Chandigarh` or `Heart < ₹3L Mohali`
3. Verification points:
   - The query slot mapping banner displays extracted parameters: specialty, budget ceiling, and geographic constraints.
   - Results filter dynamically without requiring manual form configuration.
   - Commute travel times (`~14m ETA`) display alongside each hospital card based on user coordinates.

### Step 2: Explainable Ranking and Data Provenance
1. Expand the **"Explain Ranking Score"** element on any recommended facility.
2. Verification points:
   - View the mathematical weight distribution (Proximity 30%, Budget 25%, Rating 25%, Accreditation 20%).
   - Inspect the **Data Provenance** badge (e.g., `PMJAY_HBP / MANUAL_VERIFIED`) to review audit timestamps and source registry references.

### Step 3: Regional Comparative Analysis
1. Navigate to `/compare` or select the **Compare** tab on mobile.
2. Review the pre-loaded regional institutions: **PGIMER Chandigarh**, **Max Super Speciality Hospital Mohali**, and **Fortis Escorts**.
3. Toggle the **Procedure Package Selector** (e.g., *Coronary Angioplasty MC004* or *Knee Replacement OR002*).
4. Verification points:
   - Inspect the **Verifiable Metrics** section displaying annual caseloads, success ratios, and government benefit tariffs.
   - Contrast private procedure estimates against the capped PMJAY cashless package rates.

### Step 4: Emergency SOS Trauma Corridor
1. Select **Emergency SOS** or trigger the emergency beacon.
2. Verification points:
   - Sub-second trauma routing identifies the nearest Level 1/2 trauma center.
   - Real-time ICU telemetry indicates available critical care bed capacity.
   - One-touch dispatch routing connects to national **108 emergency services** and the hospital emergency department.

---

## System Architecture

```
                                  Client Layer
                 ┌──────────────────────────────────────────────┐
                 │  Web Application      │  Mobile Application  │
                 │  Next.js 16 / React 19│  React Native / Expo │
                 │  Tailwind CSS         │  TypeScript (SDK 57) │
                 └───────────────┬───────┴──────────────┬───────┘
                                 │                      │
                                 │ REST / WebSockets    │
                                 ▼                      ▼
                 ┌──────────────────────────────────────────────┐
                 │               FastAPI Backend                │
                 │         Python 3.12+ / Async SQLAlchemy      │
                 └───────────────┬──────────────────────┬───────┘
                                 │                      │
        ┌────────────────────────┼──────────────────────┼────────────────────────┐
        ▼                        ▼                      ▼                        ▼
┌───────────────┐        ┌───────────────┐      ┌───────────────┐        ┌───────────────┐
│  PostgreSQL   │        │     Redis     │      │ Google Gemini │        │ In-Memory DB  │
│  + PostGIS    │        │ Cache & Rate  │      │ Structured    │        │ Resilience    │
│  Spatial GiST │        │ Limiting      │      │ JSON Triage   │        │ Fallback      │
└───────────────┘        └───────────────┘      └───────────────┘        └───────────────┘
```

---

## Quickstart and Setup Guide

### Method A: Docker Compose Deployment

The complete service architecture (PostGIS database, Redis cache, FastAPI backend, and Next.js web application) can be initialized via Docker Compose:

```bash
# Clone repository
git clone https://github.com/keshav-x/Med-Route.git
cd Med-Route

# Launch all microservices
docker compose up --build
```
- **Web Interface**: `http://localhost:3000`
- **FastAPI Documentation**: `http://localhost:8000/docs`

---

### Method B: Local Development Environment

#### 1. Backend Service (FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
# source .venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Start backend service (activates in-memory fallback if PostgreSQL is not running)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API Documentation: `http://localhost:8000/docs`

#### 2. Web Frontend (Next.js 16)
```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```
Application interface: `http://localhost:3000`

#### 3. Mobile Application (React Native / Expo)
```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```
Scan the QR code with **Expo Go** on Android/iOS, or press `w` to open the web preview.

---

## Verification and Test Suite

Validate monorepo type safety and unit test coverage:

```bash
# 1. Backend Pytest Suite (20 unit tests)
cd backend
.\.venv\Scripts\pytest -q

# 2. Web Frontend Compilation & Typecheck
cd web
npx tsc --noEmit
npm run build

# 3. Mobile Application Type Safety
cd mobile
npx tsc --noEmit
```
All tests, builds, and type validations pass with **0 errors**.

---

## Technical Architecture & FAQ

<details>
<summary><b>How are real-time ICU bed availability and tariff accuracy maintained?</b></summary>
Every hospital entity includes provenance metadata (<code>MANUAL_VERIFIED</code>, <code>PMJAY_HBP</code>, <code>HFR_REGISTRY</code>). Institutional administrators update operational bed counts and tariff revisions via the authenticated Provider Portal (<code>/portal/admin</code>), while PMJAY package reimbursement rates are synchronized directly with published National Health Authority benefit schedules.
</details>

<details>
<summary><b>How does the system ensure resilience if network connectivity drops during an emergency?</b></summary>
Med Route employs an offline-first architecture. Both Web and Mobile clients embed local benchmark stores with client-side NLP regex parsers and pre-computed Haversine spatial calculations, enabling core facility discovery and trauma routing to operate without active network connectivity.
</details>

<details>
<summary><b>How does the ranking algorithm prevent bias toward expensive private institutions?</b></summary>
The ranking formulation incorporates a budget satisfaction curve accounting for 25% of composite weight, penalizing procedures exceeding specified budget ceilings while weighting PMJAY empanelment and government subsidies favorably. High-volume public institutions like PGIMER Chandigarh regularly achieve top ranking due to extensive clinical volume, high verified outcomes, and nominal treatment costs.
</details>

<details>
<summary><b>How does the clinical assistant mitigate medical liability during acute events?</b></summary>
The triage engine enforces a deterministic emergency-first ruleset. If user input contains red-flag indicators (e.g., severe chest pressure, sudden numbness, acute dyspnea, uncontrolled hemorrhage), standard conversational triage is immediately suspended in favor of emergency SOS routing and direct 108 dispatch.
</details>

---

## License & Attribution
- **License**: MIT Open Source License
- **Maintainers**: Med Route Engineering Team
