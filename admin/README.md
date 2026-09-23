# Med Route — Admin Operations Console

Institutional command & control operations console for real-time hospital bed capacity telemetry, PMJAY cashless claims, booking workflows, and triage surveillance across India.

---

## Overview

The **Med Route Admin Console** is a specialized, high-density operations interface built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **shadcn/ui**, and **Recharts**. It equips hospital administrators, health authority regulators, and emergency trauma coordinators with tools to manage:

- **Institutional Hospital Directory**: Search, audit, and inspect 1,451 registered facilities across 107 cities, including operational bed inventories, NABH/JCI accreditations, and PMJAY empanelment status.
- **Real-Time Bed Telemetry**: Live occupancy tracking across General, ICU, Ventilator, and Emergency beds with threshold alerts.
- **Triage & Emergency Feed**: Real-time intake surveillance logging patient acuity levels (Emergency, Urgent, Routine), red flags, and dispatch routing.
- **Claims & Financial Audits**: Subsidized package vs private out-of-pocket settlement monitoring and PMJAY golden card status.
- **Booking Management**: Operational workflow oversight across departmental appointments and surgical scheduling.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Tailwind CSS v4 & Lucide React icons
- **Component Library**: shadcn/ui (radix / base-ui primitives)
- **Data Visualization**: Recharts (interactive occupancy trends, claims distribution)
- **Notifications**: Sonner toast feedback
- **Package Manager**: pnpm

---

## Directory Layout

```text
admin/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx               # Overview dashboard & telemetry KPIs
│   │   ├── hospitals/page.tsx     # Hospital registry management & audits
│   │   ├── bookings/page.tsx      # Patient appointment schedules
│   │   ├── claims/page.tsx        # PMJAY cashless claims processing
│   │   ├── emergency/page.tsx     # Live trauma dispatch & red-flag feeds
│   │   ├── users/page.tsx         # System users and clinical staff directory
│   │   └── settings/page.tsx      # Notification thresholds & API configuration
│   ├── globals.css                # Tailwind v4 theme variables
│   └── layout.tsx                 # Root HTML shell & ThemeProvider
├── components/
│   ├── dashboard/                 # MetricCards, BookingsChart, OccupancyChart, ClaimsDonut
│   ├── ui/                        # Reusable shadcn/ui components
│   ├── app-sidebar.tsx            # Navigation sidebar with status badges
│   ├── dashboard-header.tsx       # Search bar, notifications, and profile menu
│   └── hospitals-directory.tsx    # Paginated data table with filters
├── lib/
│   ├── api.ts                     # REST client for backend communication
│   ├── data.ts                    # Benchmark telemetry and operational datasets
│   └── utils.ts                   # Class name merger and formatters
├── public/                        # Application icons and branding assets
├── Dockerfile                     # Standalone container build for production
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript compiler configuration
```

---

## Setup & Local Development

### 1. Prerequisites
- Node.js 20 or higher
- pnpm 9+ or npm 10+

### 2. Install Dependencies
```bash
cd admin
pnpm install
# or: npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Start Development Server
```bash
npm run dev
```
The console will start at [http://localhost:3001](http://localhost:3001).

### 5. Production Build
```bash
npm run build
npm run start
```
