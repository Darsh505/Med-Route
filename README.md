# Med Route

An open-access healthcare discovery, transparent pricing, and emergency trauma routing platform for India.

Med Route addresses one of the most critical challenges in the Indian healthcare ecosystem: information asymmetry during medical decisions and emergencies. Patients and caregivers often struggle to determine which nearby hospital offers required specialties, whether treatments are covered under government schemes like Ayushman Bharat (AB-PMJAY), what out-of-pocket costs to anticipate, and whether ICU beds are actually available.

This platform bridges that gap through semantic natural language search, real-time ICU telemetry, transparent procedure pricing, interactive geospatial mapping, and an emergency SOS dispatch pipeline.

---

## Core Capabilities

### 1. Clinical Natural Language Search and Triage
Patients rarely search using technical medical codes; they search using symptoms or informal language (for example, *"best bypass surgery hospital under 2 lakhs"* or *"gurdey ka ilaj government hospital near Mohali"*). 
- An integrated query parser powered by Google Gemini and a 200+ symptom rule-based fallback extracts clinical intent, target procedure, financial constraints, and geographic preferences.
- Hospitals are scored and ranked using a transparent weighted algorithm: proximity (30%), estimated procedure cost (25%), verified user ratings (25%), and accreditation tier (20%).

### 2. Interactive Geospatial Discovery and Tactical Mapping
- Built on Leaflet and OpenStreetMap CartoDB Voyager tiles.
- The web search interface supports split-view and full-radar map modes with live hospital pins color-coded by real-time ICU capacity:
  - Green: 8 or more ICU beds available
  - Amber: 1 to 7 ICU beds available
  - Red: Emergency capacity / 0 ICU beds available
- Two-way synchronization between the result directory and map markers, supporting GPS auto-centering and radius filtering.

### 3. Transparent Pricing and PMJAY 2.2 Coverage
- Detailed tariff estimates for over 35 major surgical and diagnostic procedures, mapped to national standard packages (PMJAY HBP 2.2).
- Clear breakdown of private package costs versus subsidized government rates, wait times, historical procedure volume, and success rates.
- Covers over 60 verified healthcare institutions across the Tricity (Chandigarh, Mohali, Panchkula), Punjab, Haryana, and the National Capital Region (NCR).

### 4. Side-by-Side Hospital Comparison Matrix
- Direct side-by-side evaluation of multiple facilities across 13 clinical and operational attributes:
  - Ownership type (Government, Trust, Private, Semi-Government)
  - Accreditation status (NABH, NABL, JCI, ISO)
  - Emergency and ICU bed counts
  - PMJAY cashless empanelment status
  - Doctor-to-bed staffing and emergency contact numbers

### 5. Emergency SOS Dispatch Pipeline
- Designed for sub-second emergency response.
- Automatically geolocates the user, identifies the closest Level 1 or Level 2 trauma facility, calculates estimated ambulance arrival time (ETA), and generates an emergency alert beacon.
- Displays the immediate response corridor on an interactive emergency map while presenting one-tap calling to hospital trauma desks and the national 108 emergency service.

### 6. Clinical Chatbot Assistant
- Dual-engine conversational triage assistant accessible across all web and mobile screens.
- Detects red-flag emergencies (acute myocardial infarction, FAST stroke symptoms, polytrauma) and immediately redirects the user to emergency protocols.
- Provides specialized hospital recommendations and actionable clinical prompt categories for elective procedures.

---

## System Architecture

```
                                  Client Layer
                 ┌──────────────────────────────────────────────┐
                 │  Web Application      │  Mobile Application  │
                 │  Next.js 16 / React 19│  React Native / Expo │
                 │  Tailwind CSS         │  TypeScript          │
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

## Technology Stack

### Backend
- Framework: FastAPI (Python 3.12+)
- Database: PostgreSQL with PostGIS spatial extension (via AsyncPG and GeoAlchemy2)
- Caching and Rate Limiting: Redis
- AI and NLP: Google Gemini 2.0 Flash with an offline clinical rule-based ontology engine
- Migrations: Alembic
- Logging: Structured JSON logging via Structlog

### Web Frontend
- Framework: Next.js 16 (App Router) with React 19
- Styling: Vanilla Tailwind CSS configured with a clinical color system
- Maps: Leaflet with CartoDB Voyager tiles and custom SVG markers
- Icons and Typography: Material Symbols Outlined, Plus Jakarta Sans, Inter

### Mobile Application
- Framework: React Native with Expo (SDK 57)
- Navigation: React Navigation 7 (Native Stack and Bottom Tabs)
- State and Storage: AsyncStorage, SafeAreaContext

---

## Repository Structure

```text
med-route/
├── backend/
│   ├── app/
│   │   ├── ai/                 # Gemini parser and clinical triage rule engine
│   │   ├── data_pipeline/      # 60+ regional hospitals and 35+ procedures seed data
│   │   ├── models/             # SQLAlchemy 2.0 relational and spatial models
│   │   ├── routers/            # Search, hospitals, SOS, compare, auth, admin, chat
│   │   ├── schemas/            # Pydantic v2 validation models
│   │   ├── services/           # Ranking, geocoding, SOS dispatch, hospital services
│   │   ├── config.py           # Typed environment configuration
│   │   ├── database.py         # Async database connection and session management
│   │   └── main.py             # FastAPI entry point with resilient lifespan
│   ├── requirements.txt
│   └── Dockerfile
│
├── web/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── page.tsx        # Homepage and clinical intake
│   │   │   ├── search/         # Geospatial search and split-view radar
│   │   │   ├── compare/        # Side-by-side hospital comparison matrix
│   │   │   ├── hospitals/      # Hospital detail profile [slug]
│   │   │   ├── sos/            # Emergency SOS dispatch and beacon map
│   │   │   ├── admin/          # Registry management and tariff audit
│   │   │   └── auth/           # Login and registration
│   │   ├── components/         # Leaflet maps, chatbot widget, navigation, filters
│   │   └── styles/             # Global design tokens and theme rules
│   ├── package.json
│   └── tailwind.config.ts
│
├── mobile/
│   ├── src/
│   │   ├── screens/            # Home, Search, Compare, Profile, Detail, SOS
│   │   ├── navigation/         # Bottom tab and modal stack architecture
│   │   ├── services/           # API integration with offline resilience
│   │   └── theme/              # Color palette and typography
│   ├── app.json                # Expo configuration
│   └── package.json
│
├── docker-compose.yml          # Container orchestration
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 20 or higher
- Python 3.12 or higher
- Git

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables (optional for local mock mode):
   ```bash
   cp .env.example .env
   ```
   *Note: If PostgreSQL is not running locally, the backend automatically activates an in-memory fallback containing all 60+ benchmark hospitals with computed Haversine distances, enabling immediate local development with zero setup.*

5. Start the development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

---

### 2. Web Frontend Setup

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Access the web interface at `http://localhost:3000`.

---

### 3. Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Run the application:
   - On a physical device: Scan the terminal QR code using the **Expo Go** application.
   - In the browser: Press `w` in the terminal to launch the web preview.
   - On an Android emulator: Press `a` in the terminal.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health and environment status |
| `GET` | `/api/hospitals` | Paginated hospital directory with city/state filters |
| `GET` | `/api/hospitals/{slug}` | Comprehensive hospital profile, tariffs, and facilities |
| `GET` | `/api/hospitals/nearby` | Geospatial search with radius and filter parameters |
| `POST` | `/api/search/nl` | Semantic search with transparent ranking breakdown |
| `GET` | `/api/search/structured` | Filter-based query by budget, accreditation, and specialty |
| `GET` | `/api/search/autocomplete` | Type-ahead suggestions for hospital names and cities |
| `POST` | `/api/sos/nearest` | Preview closest trauma center without creating a dispatch |
| `POST` | `/api/sos/alert` | Trigger emergency SOS alert and notify hospital dashboard |
| `GET` | `/api/sos/{alert_id}` | Real-time status tracker for dispatched citizen alerts |
| `POST` | `/api/compare` | Multi-facility comparison across clinical attributes |
| `POST` | `/api/chat` | Conversational clinical triage and hospital routing |
| `GET` | `/api/chat/suggestions` | Curated prompts organized by clinical department |

---

## Data Provenance and Quality Labels

To maintain clinical integrity and user trust, every healthcare record in Med Route carries a transparent data source indicator:

- `MANUAL_VERIFIED`: Verified directly by the clinical audit team with hospital administration.
- `PMJAY_HBP`: Derived from published National Health Authority Ayushman Bharat benefit schedules.
- `HFR_REGISTRY`: Synced with National Digital Health Mission Health Facility Registry records.
- `USER_CONTRIBUTED`: Community-reported data pending administrative verification.
- `SIMULATED`: Benchmark demonstration records used for testing and staging.

---

