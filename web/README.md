# Med Route — Web Application (Next.js 16 / React 19)

Production-grade citizen healthcare discovery, transparent surgical pricing, and tactical geospatial hospital routing portal.

---

## Overview

The Med Route web application is built on **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and **Leaflet / OpenStreetMap**. It delivers a high-performance clinical dashboard with client-side NLP query parsing, interactive map synchronization, side-by-side facility comparison across 4 verifiable metrics, and an emergency SOS dispatch corridor.

---

## Key Features

- **AI Query Slot Mapping**: As users enter natural language queries (*"Find kidney transplant hospitals near Chandigarh under 2 lakh"*), the interface instantly breaks down:
  - Extracted Condition / Specialty (e.g., `Nephrology & Kidney Care`)
  - Target City / Region (e.g., `Chandigarh / Tricity`)
  - Budget Ceiling (e.g., `Max ₹2,00,000`)
  - Scheme Empanelment (e.g., `AB-PMJAY Cashless`)
- **Tactical Geospatial Radar**: Interactive Leaflet split-view map color-coded by real-time ICU capacity (Green: 8+ beds, Amber: 1-7 beds, Red: Critical/0 beds) with commute travel times (`~14m ETA`).
- **Explainable Ranking Score Modal**: Transparency widget breaking down every hospital's composite score into Proximity (30%), Budget (25%), Ratings (25%), and Quality Accreditations (20%).
- **Tricity Comparison Matrix**: Direct side-by-side evaluation of hospitals (PGIMER, Max Mohali, Fortis Escorts, GMC Chandigarh) against the **4 Mandatory Verifiable Metrics**:
  1. *Annual Procedure Volume*
  2. *Clinical Success Ratio*
  3. *Government PMJAY Tariffs*
  4. *Accreditations (NABH / JCI / NABL)*
- **Emergency Cashless & SOS Corridor**: Fast-lane trauma center routing with sub-second ETA calculation and 108 direct dispatch integration.
- **Provider Admin Portal (`/portal/admin`)**: Institutional telemetry management for bed availability, tariff audits, and hospital onboarding.

---

## Architecture & Directory Layout

```text
web/
├── public/                 # Favicons, vector logos, and static assets
├── src/
│   ├── app/                # Next.js 16 App Router pages
│   │   ├── page.tsx        # Homepage hero & clinical triage intake
│   │   ├── search/         # AI Slot Mapping & interactive geospatial radar
│   │   ├── compare/        # 4 Verifiable Metrics comparison matrix
│   │   ├── hospitals/      # Hospital detail profile [slug]
│   │   ├── emergency-cashless/ # Emergency trauma & SOS dispatch corridor
│   │   ├── portal/admin/   # Hospital provider registry & telemetry portal
│   │   └── auth/           # Login and registration
│   ├── components/         # Leaflet maps, ChatbotWidget, Navbar, Footer
│   ├── context/            # AuthContext, LocationContext
│   ├── data/               # Static benchmark datasets (allHospitals.json)
│   └── styles/             # Global CSS design tokens
├── Dockerfile              # Minimal multi-stage container build
├── next.config.ts          # Standalone build & image proxy configuration
├── tailwind.config.ts      # Clinical color palette & responsive typography
└── tsconfig.json           # Strict TypeScript configuration
```

---

## Setup & Local Development

### 1. Prerequisites
- Node.js 20 or higher
- npm 10 or higher

### 2. Install Dependencies
```bash
cd web
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Static Validation
```bash
npm run build
```
Generates an optimized production build with standalone container output.
