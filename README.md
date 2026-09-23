# 🏥 Med Route — Healthcare Discovery, Transparent Pricing & Emergency Trauma Routing

> **Official Submission for TECHNOVA 2026 Hackathon**  
> *Rayat Bahra Professional University*  
> **Theme / Track:** Government Healthcare Discovery, Transparent Pricing & Emergency Hospital Recommendation

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React Native Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=flat&logo=expo)](https://expo.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL PostGIS](https://img.shields.io/badge/PostGIS-16--3.4-336791?style=flat&logo=postgresql)](https://postgis.net/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Docker Compose](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![Database Catalog](https://img.shields.io/badge/Database-Catalog_%26_ER_Diagram-blue?style=flat&logo=postgresql)](DATABASE.md)

---

> 📖 **Judge Quick-Link**: To view the full Database Schema, ER Diagram, and 1,451 hospital registry metrics, open **[`DATABASE.md`](DATABASE.md)**.


## 📌 Executive Summary

During medical decisions or emergencies in India, patients and caregivers face acute **information asymmetry**:
1. Which nearby hospital actually treats their specific condition or has specialized equipment?
2. Are treatments covered under government schemes like **Ayushman Bharat (AB-PMJAY)**?
3. What will the procedure actually cost, and what is the hospital's clinical success record?
4. Are ICU and emergency beds genuinely available *right now*?

**Med Route** solves this challenge through an open-access citizen platform and institutional telemetry bridge. It combines **AI-driven clinical slot mapping**, **geospatial tactical radar**, a side-by-side comparison matrix based on **4 verifiable clinical metrics**, and a sub-second **emergency SOS trauma corridor**.

---

## 🏆 TECHNOVA 2026 Evaluation Matrix Alignment

| Evaluation Criteria | Hackathon Requirement | Med Route Implementation | Verification Path |
|---|---|---|---|
| **1. Aggregate** | Ingest hospital registries, specialties, and government packages | Normalized dataset covering 60+ regional Tricity facilities and 1,000+ Pan-India benchmark records mapped to National Health Authority (NHA) **PMJAY HBP 2.2**. | [`backend/app/data_pipeline/`](file:///a:/projects/med-route/backend/app/data_pipeline/) |
| **2. Index** | High-performance spatial & procedural indexing | PostGIS Spatial GiST indexing, sub-second Haversine proximity computation, and cached specialty taxonomy. | [`backend/app/services/ranking_service.py`](file:///a:/projects/med-route/backend/app/services/ranking_service.py) |
| **3. Search** | Semantic NL search with slot mapping & explainability | Instant client & server NLP query parser extracting: **Condition**, **City**, **Budget Ceiling**, and **PMJAY Flag**. Transparent mathematical score breakdown widget. | [`web/src/app/search/page.tsx`](file:///a:/projects/med-route/web/src/app/search/page.tsx)<br>[`mobile/src/screens/SearchScreen.tsx`](file:///a:/projects/med-route/mobile/src/screens/SearchScreen.tsx) |
| **4. Compare** | Side-by-side facility comparison with verifiable metrics | Dedicated comparison matrix evaluating hospitals across **4 Mandatory Verifiable Metrics**: Annual Volume, Success Ratio, PMJAY Tariffs, and Certifications. | [`web/src/app/compare/page.tsx`](file:///a:/projects/med-route/web/src/app/compare/page.tsx)<br>[`mobile/src/screens/CompareScreen.tsx`](file:///a:/projects/med-route/mobile/src/screens/CompareScreen.tsx) |
| **5. Trauma Dispatch** | Emergency ambulance / SOS routing | GPS one-touch SOS dispatch, Level 1/2 trauma center identification, ETA estimation, direct 108 link. | [`web/src/app/emergency-cashless/page.tsx`](file:///a:/projects/med-route/web/src/app/emergency-cashless/page.tsx)<br>[`mobile/src/screens/SOSScreen.tsx`](file:///a:/projects/med-route/mobile/src/screens/SOSScreen.tsx) |
| **6. Architecture & Polish** | Production-ready full-stack solution | Next.js 16 Web App, Expo SDK 57 Cross-platform Mobile App, FastAPI Async Backend, Docker orchestration, and 100% offline resilience. | Full Monorepo Architecture |

---

## 🎯 The 4 Solution Pillars

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
  │ • NHA PMJAY  │         │ • PostGIS    │                │ • AI Slot    │         │ • 4 Verifi-  │
  │ • HFR Registry│        │   Spatial    │                │   Extraction │         │   able       │
  │ • Bed Tele-  │         │ • Tariff     │                │ • Proximity  │         │   Metrics    │
  │   metry      │         │   Catalog    │                │ • Explainable│         │ • Dynamic    │
  │ • Verified   │         │ • Dynamic    │                │   Ranking    │         │   Procedure  │
  │   Audits     │         │   Cache      │                │ • Tactical   │         │   Tariffs    │
  │              │         │              │                │   Radar Map  │         │              │
  └──────────────┘         └──────────────┘                └──────────────┘         └──────────────┘
```

### 1. AGGREGATE
- Aggregates verified hospital registries across **Tricity (Chandigarh, Mohali, Panchkula)** and 75+ Indian cities.
- Normalized against National Health Authority (NHA) **Ayushman Bharat PMJAY 2.2** benefit schedules.
- Explicit Data Provenance labels on every record: `MANUAL_VERIFIED`, `PMJAY_HBP`, `HFR_REGISTRY`.

### 2. INDEX
- Sub-second spatial proximity queries via PostGIS and Haversine algorithms.
- Multi-dimensional indexing on clinical specialties, procedural package codes, bed capacities, and accreditation tiers (NABH, JCI, NABL).

### 3. SEARCH (AI Slot Mapping & Explainable Ranking)
When a citizen enters a query like:  
> *"Find kidney treatment hospitals near Chandigarh under ₹2 lakh"*

The integrated clinical NLP engine parses unstructured language into discrete query slots:
- 🩺 **Clinical Specialty / Condition**: `Nephrology & Kidney Care`
- 📍 **City / Geographic Constraint**: `Chandigarh / Tricity`
- 💰 **Budget Ceiling**: `Max ₹2,00,000`
- 🛡️ **Scheme Requirement**: `AB-PMJAY Cashless Preferred`

Every recommended hospital displays an **"Explain Ranking Score"** breakdown:
$$\text{Composite Score} = (0.30 \times \text{Proximity}) + (0.25 \times \text{Cost Match}) + (0.25 \times \text{Patient Rating}) + (0.20 \times \text{Accreditation Tier})$$

### 4. COMPARE (The 4 Mandatory Verifiable Metrics)
Citizens and judges can select institutions (e.g., **PGIMER Chandigarh**, **Max Mohali**, **Fortis Escorts**) and contrast them side-by-side across the four verifiable metrics:
1. 📈 **Annual Procedure Volume**: High-volume clinical indicators (e.g., 2,800+ cardiac surgeries/yr).
2. 🏆 **Clinical Success Ratio**: Statistically verified procedural outcome percentage (e.g., 98.4% success).
3. 💳 **Government vs Private Tariffs**: Transparent comparison between private cash estimates and PMJAY subsidized package ceilings.
4. 🏅 **Verified Certifications**: NABH Digital, NABL certified labs, JCI Gold seals, and Emergency Trauma Levels.

---

## 🎬 3-Minute Live Demo Script (For Presenters & Judges)

Follow this step-by-step walkthrough during the hackathon evaluation:

### Step 1: AI Query Slot Mapping Demonstration (0:00 - 0:45)
1. Open the **Web App** (`/search`) or **Mobile App** (Search tab).
2. Type or tap the preset query chip:  
   👉 `Kidney < ₹2L Chandigarh` or `Heart < ₹3L Mohali`
3. **Point out to judges**:
   - The **"🤖 AI Query Slot Mapping"** banner immediately updates with extracted tokens: *Nephrology*, *Max ₹2,00,000*, *Chandigarh*.
   - Results are automatically filtered without requiring complex SQL or manual drop-downs.
   - Commute travel times (`~14m ETA`) appear next to each hospital card.

### Step 2: Explainable Ranking & Data Provenance (0:45 - 1:30)
1. Click the **"Explain Ranking Score"** badge on the top-ranked hospital.
2. **Point out to judges**:
   - The exact weighted breakdown (Proximity 30%, Budget 25%, Rating 25%, Quality 20%).
   - Click the **"Data Source"** badge (e.g., `PMJAY_HBP / MANUAL_VERIFIED`) to show the institutional audit timestamp and NHA registry linkage.

### Step 3: Regional Tricity Comparison Matrix (1:30 - 2:15)
1. Navigate to `/compare` or tap **Compare** on the mobile bottom bar.
2. Select or view the regional anchors: **PGIMER Chandigarh**, **Max Super Speciality Hospital**, and **Fortis Escorts**.
3. Toggle the **Procedure Package Selector** (e.g., *Coronary Angioplasty MC004* or *Knee Replacement OR002*).
4. **Point out to judges**:
   - The dedicated **"Mandatory Verifiable Metrics"** table.
   - Contrast the ₹2.8L private cost vs the PMJAY subsidized ₹1.1L cashless rate.
   - Contrast the clinical success ratio (98.4%) and annual patient volume (2,800/yr).

### Step 4: Emergency SOS & Tactical Radar (2:15 - 3:00)
1. Click **"SOS Dispatch"** or tap the floating red beacon.
2. **Point out to judges**:
   - Sub-second trauma routing identifies the nearest Level 1 trauma center.
   - Displays real-time ICU availability (color-coded pins: Green/Amber/Red).
   - One-tap dispatch link to national **108 emergency service** and hospital emergency desk.

---

## 🏗️ System Architecture

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

## 🚀 Quickstart & Setup Guide

### Method A: One-Command Launch (Docker Compose)

The entire production stack (PostGIS database, Redis cache, FastAPI backend, and Next.js web application) can be launched with a single command:

```bash
# Clone and launch
git clone https://github.com/keshav-x/Med-Route.git
cd Med-Route

# Launch all microservices
docker compose up --build
```
- **Web Interface**: `http://localhost:3000`
- **FastAPI Backend & Swagger**: `http://localhost:8000/docs`

---

### Method B: Local Development Setup

#### 1. Backend Service (FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows
# source .venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Start backend (auto-activates zero-setup fallback if PostgreSQL is not active)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Web Frontend (Next.js 16)
```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

#### 3. Mobile Application (React Native / Expo)
```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```
- Scan QR code with **Expo Go** on Android/iOS, or press `w` to open web preview.

---

## 🧪 Verification & Test Suite

Verify full monorepo type safety and unit test coverage:

```bash
# 1. Backend Pytest Suite (20 unit tests)
cd backend
.\.venv\Scripts\pytest -q

# 2. Web Frontend Static Compilation
cd web
npx tsc --noEmit
npm run build

# 3. Mobile Application Type Safety
cd mobile
npx tsc --noEmit
```
All tests, builds, and type validations pass with **0 errors**.

---

## 🛡️ Hackathon Defense & Judges FAQ

<details>
<summary><b>Q1: How does Med Route verify live ICU bed availability and tariff accuracy?</b></summary>
Every hospital record carries a data provenance tag (<code>MANUAL_VERIFIED</code>, <code>PMJAY_HBP</code>, <code>HFR_REGISTRY</code>). Hospital administrative staff update bed telemetry and tariff revisions through the authenticated <b>Provider Portal (<code>/portal/admin</code>)</b>, while PMJAY package rates are synchronized with published National Health Authority schedules.
</details>

<details>
<summary><b>Q2: What happens if the network or local database crashes during an emergency?</b></summary>
Med Route has an <b>Offline Zero-Network Architecture</b>. Both Web and Mobile clients have an embedded 60+ facility benchmark store with pre-computed Haversine spatial matrices and client-side NLP regex fallback. The application continues to rank hospitals and calculate trauma routes with zero downtime.
</details>

<details>
<summary><b>Q3: How does the ranking algorithm avoid bias toward expensive private hospitals?</b></summary>
The ranking algorithm explicitly penalizes out-of-budget quotes through a normalized budget satisfaction curve (accounting for 25% of composite weight), while rewarding PMJAY empanelment and government subsidies. A high-quality public hospital like PGIMER Chandigarh often ranks #1 because of high patient volume, proven success ratios, and nominal cost.
</details>

<details>
<summary><b>Q4: How does the clinical chatbot handle medical liability and red flags?</b></summary>
The chatbot runs an emergency-first triage ontology. If a user describes acute symptoms (e.g., crushing chest pain, slurred speech, facial drooping, severe hemorrhage), the LLM immediately halts conversational Q&A and triggers the emergency SOS redirection protocol.
</details>

---

## 👥 Med Route Team — Rayat Bahra Professional University
- **Track**: Healthcare Accessibility, Transparency & Emergency Logistics  
- **Event**: TECHNOVA 2026 Hackathon  
- **License**: MIT
