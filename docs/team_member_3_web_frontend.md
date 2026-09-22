# 🎨 Member 3 — Web Frontend Lead

> **Complexity**: 🟡 Standard  
> **Role**: Build the entire Next.js web application — landing page, search, hospital detail, compare, SOS, and responsive design.  
> **Tech**: Next.js 15 (App Router), TypeScript, Vanilla CSS, Leaflet, Recharts  
> **Est. Duration**: 15 days  

---

## Why This Role Is "Standard" (Not "Easy")

This role has significant scope — 8 pages, 20+ components, a full design system, map integration, and responsive design. It's labeled "standard" because:
- You're NOT dealing with AI/ML algorithms or native mobile code
- You're NOT managing database schemas or deployment infrastructure
- You ARE building well-defined UI features with clear API contracts from M1

That said, **the design quality is YOUR responsibility**. A mediocre-looking app will tank the entire project's impression. Your job is to make Med Route look and feel premium.

---

## Design Philosophy

```
┌─────────────────────────────────────────────────────────┐
│  DESIGN PRINCIPLES                                       │
│                                                          │
│  1. TRUST FIRST — Healthcare is sensitive. The UI must   │
│     feel trustworthy. Clean layouts, verified badges,    │
│     data source transparency.                            │
│                                                          │
│  2. SPEED IS CARE — When someone searches for a hospital │
│     it might be urgent. Fast load times, instant search, │
│     no unnecessary friction.                             │
│                                                          │
│  3. CLARITY OVER CLEVERNESS — Medical data can be        │
│     complex. Present it simply. Use plain language.      │
│     Show the user what matters FIRST.                    │
│                                                          │
│  4. MOBILE FIRST — Most Indian internet users are on     │
│     mobile. Design for 360px first, then scale up.       │
│                                                          │
│  5. ACCESSIBLE — WCAG 2.1 AA minimum. Proper contrast,  │
│     keyboard navigation, screen reader labels.           │
└─────────────────────────────────────────────────────────┘
```

---

## Deliverables & Timeline

### Days 1-2: Project Setup & Design System

#### [NEW] `web/package.json`
Next.js 15 + TypeScript + leaflet + recharts + lucide-react (icons).

#### [NEW] `web/next.config.js`
API proxy to backend (`rewrites`), image domains, compression.

#### [NEW] `web/tsconfig.json`
Strict TypeScript config with path aliases (`@/components`, `@/lib`, `@/hooks`).

#### [NEW] `web/src/styles/globals.css`
```css
/**
 * ──────────────────────────────────────────────
 * Med Route Design System
 * ──────────────────────────────────────────────
 * 
 * This file defines ALL design tokens used across the app.
 * Components should ONLY use these variables, never hardcode
 * colors, spacing, or typography values.
 * 
 * WHY vanilla CSS instead of Tailwind?
 * → Maximum control over the design system. Custom properties
 *   cascade naturally, making theme switching (dark mode) trivial.
 *   No build-time compilation overhead.
 * 
 * COLOR PALETTE:
 * → Primary: Deep medical blue (#1B4D89) — trust, reliability
 * → Accent: Vibrant teal (#0EA5A0) — health, vitality
 * → Emergency: Urgent red (#DC2626) — SOS, critical alerts
 * → Success: Calming green (#16A34A) — verified, available
 * → Warning: Warm amber (#F59E0B) — needs attention
 * → Surface: Clean whites + subtle grays — clinical clarity
 */

:root {
    /* ── Color Tokens ── */
    --color-primary-50: #EFF6FF;
    --color-primary-100: #DBEAFE;
    --color-primary-200: #BFDBFE;
    --color-primary-500: #3B82F6;
    --color-primary-600: #1B4D89;
    --color-primary-700: #1E40AF;
    --color-primary-900: #1E3A5F;
    
    --color-accent-400: #2DD4BF;
    --color-accent-500: #0EA5A0;
    --color-accent-600: #0D9488;
    
    --color-emergency-500: #DC2626;
    --color-emergency-600: #B91C1C;
    
    --color-success-500: #16A34A;
    --color-warning-500: #F59E0B;
    
    --color-surface-0: #FFFFFF;
    --color-surface-50: #F8FAFC;
    --color-surface-100: #F1F5F9;
    --color-surface-200: #E2E8F0;
    --color-surface-700: #334155;
    --color-surface-800: #1E293B;
    --color-surface-900: #0F172A;
    
    --color-text-primary: #0F172A;
    --color-text-secondary: #475569;
    --color-text-tertiary: #94A3B8;
    --color-text-inverse: #FFFFFF;
    
    /* ── Typography ── */
    --font-sans: 'Inter', 'Segoe UI', system-ui, sans-serif;
    --font-display: 'Outfit', 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
    
    --text-xs: 0.75rem;    /* 12px */
    --text-sm: 0.875rem;   /* 14px */
    --text-base: 1rem;     /* 16px */
    --text-lg: 1.125rem;   /* 18px */
    --text-xl: 1.25rem;    /* 20px */
    --text-2xl: 1.5rem;    /* 24px */
    --text-3xl: 1.875rem;  /* 30px */
    --text-4xl: 2.25rem;   /* 36px */
    --text-5xl: 3rem;      /* 48px */
    
    /* ── Spacing ── */
    --space-1: 0.25rem;   --space-2: 0.5rem;
    --space-3: 0.75rem;   --space-4: 1rem;
    --space-5: 1.25rem;   --space-6: 1.5rem;
    --space-8: 2rem;      --space-10: 2.5rem;
    --space-12: 3rem;     --space-16: 4rem;
    --space-20: 5rem;     --space-24: 6rem;
    
    /* ── Shadows (Glassmorphism-ready) ── */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04);
    --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.12);
    
    /* ── Border Radius ── */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-2xl: 1.5rem;
    --radius-full: 9999px;
    
    /* ── Transitions ── */
    --transition-fast: 150ms ease;
    --transition-base: 250ms ease;
    --transition-slow: 350ms ease;
    --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
    
    /* ── Glass Effect ── */
    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(255, 255, 255, 0.3);
    --glass-blur: blur(12px);
    
    /* ── Z-Index Scale ── */
    --z-dropdown: 100;
    --z-sticky: 200;
    --z-modal-backdrop: 300;
    --z-modal: 400;
    --z-toast: 500;
    --z-sos: 600; /* SOS is always on top */
}

/* ── Dark Mode ── */
[data-theme="dark"] {
    --color-surface-0: #0F172A;
    --color-surface-50: #1E293B;
    --color-surface-100: #334155;
    --color-surface-200: #475569;
    --color-text-primary: #F1F5F9;
    --color-text-secondary: #CBD5E1;
    --color-text-tertiary: #64748B;
    --glass-bg: rgba(15, 23, 42, 0.8);
    --glass-border: rgba(51, 65, 85, 0.5);
}

/* ── Global Reset & Base ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; }
body {
    font-family: var(--font-sans);
    color: var(--color-text-primary);
    background: var(--color-surface-50);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}

/* ── Animations ── */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
@keyframes sosPulse { 
    0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); } 
    70% { box-shadow: 0 0 0 15px rgba(220, 38, 38, 0); } 
    100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); } 
}
```

---

### Days 3-5: Landing Page & Search

#### [NEW] `web/src/app/layout.tsx`
Root layout — imports fonts (Inter + Outfit from Google), meta tags, navigation header, footer.

#### [NEW] `web/src/app/page.tsx`
```typescript
/**
 * Landing Page — The first impression
 * 
 * LAYOUT:
 * ┌─────────────────────────────────────────────────┐
 * │  🏥 Med Route                    [Login] [SOS]  │
 * ├─────────────────────────────────────────────────┤
 * │                                                  │
 * │         Find the Right Hospital,                 │
 * │         at the Right Cost,                       │
 * │         Near You.                                │
 * │                                                  │
 * │  ┌──────────────────────────────────────────┐   │
 * │  │ 🔍 "kidney treatment near Chandigarh..." │   │  ← Animated placeholder
 * │  └──────────────────────────────────────────┘   │
 * │                                                  │
 * │  🏷️ Popular Categories                          │
 * │  [❤️ Heart] [🦴 Ortho] [🧠 Neuro] [👁️ Eye]     │
 * │  [🫁 Lung] [🦷 Dental] [🩺 General] [👶 Pediatric]│
 * │                                                  │
 * │  📊 Trust Metrics                                │
 * │  "50+ Hospitals" "200+ Procedures" "Verified"   │
 * │                                                  │
 * │  📍 Featured Hospitals Near You                  │
 * │  ┌──────┐ ┌──────┐ ┌──────┐                     │
 * │  │ Card │ │ Card │ │ Card │                     │
 * │  └──────┘ └──────┘ └──────┘                     │
 * │                                                  │
 * │  ──────────── How It Works ──────────────       │
 * │  1. Search → 2. Compare → 3. Decide             │
 * │                                                  │
 * │  [Footer: About | Contact | Data Sources]        │
 * └─────────────────────────────────────────────────┘
 * 
 * ANIMATIONS:
 * - Hero text slides up on mount (staggered per line)
 * - Search bar has rotating placeholder examples
 * - Category cards fade in with stagger delay
 * - Trust metrics count up from 0
 * - Hospital cards slide in on scroll (IntersectionObserver)
 */
```

#### [NEW] `web/src/app/search/page.tsx`
```typescript
/**
 * Search Results Page
 * 
 * URL: /search?q=kidney+treatment+near+chandigarh+under+2+lakhs
 * 
 * LAYOUT:
 * ┌─────────────────────────────────────────────────┐
 * │ 🔍 "kidney treatment near Chandigarh under..."  │
 * │ AI Extracted: [🏥 Kidney] [📍 Chandigarh] [💰 ≤2L]│  ← Colored chips
 * ├────────┬────────────────────────────────────────┤
 * │FILTERS │  42 hospitals found    [Map] [List]    │
 * │        │                                        │
 * │Distance│  ┌──────────────────────────────────┐ │
 * │[===○──]│  │ PGIMER, Chandigarh       3.2 km  │ │
 * │0-100km │  │ ⭐4.8 | ₹80k-1.5L | Govt | NABH  │ │
 * │        │  │ Ranking: 🟢95 (dist:28 cost:25...)│ │
 * │Budget  │  │ [Compare ☐] [View Details →]      │ │
 * │[===○──]│  └──────────────────────────────────┘ │
 * │0-10L   │                                        │
 * │        │  ┌──────────────────────────────────┐ │
 * │Type    │  │ Fortis Hospital, Mohali   7.1 km  │ │
 * │☑ Govt  │  │ ⭐4.3 | ₹1.2L-3L | Private       │ │
 * │☑ Pvt   │  │ Ranking: 🟡82 (dist:24 cost:18...)│ │
 * │☐ Trust │  │ [Compare ☐] [View Details →]      │ │
 * │        │  └──────────────────────────────────┘ │
 * │Accred. │                                        │
 * │☑ NABH  │  ... more results ...                  │
 * │☐ JCI   │                                        │
 * │        │  [Ranking Weights ⚙️]                   │
 * │Sort By │  Dist: [====○─] 30%                    │
 * │○ Dist  │  Cost: [===○──] 25%                    │
 * │○ Cost  │  Rate: [===○──] 25%                    │
 * │○ Rating│  Accr: [==○───] 20%                    │
 * └────────┴────────────────────────────────────────┘
 * 
 * KEY FEATURES:
 * - AI-parsed query shown as colored chips (user can remove/edit)
 * - Transparent ranking breakdown visible on each card
 * - User can adjust ranking weights via sliders
 * - Map/List toggle — map shows markers with popups
 * - "Compare" checkbox → adds to compare bar (bottom sticky)
 */
```

#### [NEW] `web/src/app/hospital/[slug]/page.tsx`
```typescript
/**
 * Hospital Detail Page (SSR for SEO)
 * 
 * URL: /hospital/pgimer-chandigarh
 * 
 * SECTIONS:
 * 1. Hero: Hospital name, type badge, accreditation, rating, verified status
 * 2. Quick Stats: Beds, ICU, Distance, Cost Range
 * 3. Procedures & Costs: Sortable table with min/max/avg cost, success rate
 * 4. Facilities: Icon grid (MRI ✅, CT ✅, Blood Bank ✅, PET Scan ❌)
 * 5. Departments: Expandable cards with specializations
 * 6. Reviews: Rating distribution chart + review cards
 * 7. Location: Leaflet map with marker + directions link
 * 8. Data Source: Badge showing where this data came from
 * 
 * SEO: SSR with proper meta tags, structured data (schema.org/Hospital)
 * 
 * CTA: "Add to Compare" button (sticky on scroll)
 */
```

---

### Days 6-8: Compare & SOS Pages

#### [NEW] `web/src/app/compare/page.tsx`
```typescript
/**
 * Side-by-Side Comparison Page
 * 
 * URL: /compare?ids=uuid1,uuid2,uuid3
 * 
 * TABLE LAYOUT:
 * ┌──────────────┬──────────┬──────────┬──────────┐
 * │              │ PGIMER   │ Fortis   │ Max      │
 * ├──────────────┼──────────┼──────────┼──────────┤
 * │ Type         │ 🏛 Govt   │ 🏢 Pvt   │ 🏢 Pvt   │
 * │ Distance     │ 3.2 km 🏆│ 7.1 km   │ 12 km    │
 * │ Cost Range   │ ₹80k-1.5L🏆│ ₹1.2-3L │ ₹2-5L   │
 * │ Rating       │ ⭐ 4.8 🏆 │ ⭐ 4.3   │ ⭐ 4.5   │
 * │ Accreditation│ NABH     │ NABH     │ NABH+JCI🏆│
 * │ Total Beds   │ 1800 🏆  │ 350      │ 500      │
 * │ ICU Beds     │ 200 🏆   │ 50       │ 80       │
 * │ Trauma Center│ ✅        │ ❌       │ ✅        │
 * │ PMJAY        │ ✅        │ ✅       │ ❌        │
 * │ Success Rate │ 94% 🏆   │ 91%      │ 93%      │
 * │ Reviews      │ 342 🏆   │ 128      │ 215      │
 * ├──────────────┼──────────┼──────────┼──────────┤
 * │ Data Source   │ 🔵 Sim   │ 🔵 Sim   │ 🔵 Sim   │
 * └──────────────┴──────────┴──────────┴──────────┘
 * 
 * 🏆 = Best in row (highlighted with accent color)
 * 
 * FEATURES:
 * - Max 4 hospitals side by side
 * - Best-in-category highlighted with trophy + color
 * - Sticky hospital headers on scroll
 * - "Remove" button on each hospital
 * - Mobile: horizontal scroll with snap points
 * - Export comparison as PNG (optional)
 */
```

#### [NEW] `web/src/app/sos/page.tsx`
```typescript
/**
 * SOS Emergency Page — Web Version
 * 
 * DESIGN: Full-screen, red-themed, minimal distraction.
 * 
 * STATES:
 * 1. LOCATING: "Getting your location..." with pulsing circle
 * 2. SEARCHING: "Finding nearest trauma center..." 
 * 3. FOUND: Hospital card with phone, distance, map, "Call Now" button
 * 4. ALERTING: "Notifying hospital..." with status updates
 * 5. OFFLINE: "Call 108 for ambulance" (fallback)
 * 
 * ACCESSIBILITY:
 * - All text is high contrast (white on red)
 * - "Call Now" button is very large (min 48x48px touch target)
 * - Screen reader announces each state change
 * - Works without JavaScript (server-rendered 108 fallback)
 */
```

---

### Days 9-11: Components Library

#### [NEW] `web/src/components/ui/Button.tsx` + `Button.module.css`
Variants: primary, secondary, danger, ghost, outline. Sizes: sm, md, lg. States: loading, disabled. Icons support.

#### [NEW] `web/src/components/ui/Input.tsx` + `Input.module.css`
Text input with floating label, search variant with icon, error state, helper text.

#### [NEW] `web/src/components/ui/Card.tsx` + `Card.module.css`
Hospital card, stat card, category card. Hover lift animation. Glass variant.

#### [NEW] `web/src/components/ui/Badge.tsx` + `Badge.module.css`
Accreditation (NABH, JCI), type (Govt, Private), data source (Verified, Simulated), rating stars.

#### [NEW] `web/src/components/ui/Modal.tsx` + `Modal.module.css`
Accessible modal with focus trap, ESC to close, backdrop click, transition animations.

#### [NEW] `web/src/components/ui/Skeleton.tsx` + `Skeleton.module.css`
Loading skeletons for hospital cards, tables, maps. Shimmer animation.

#### [NEW] `web/src/components/ui/StarRating.tsx`
Interactive (for reviews) and display (for listings) star rating with half-star support.

#### [NEW] `web/src/components/ui/Toast.tsx`
Success/error/info notifications with auto-dismiss and slide-in animation.

#### [NEW] `web/src/components/search/SearchBar.tsx`
Full-width NL search input — animated rotating placeholder, search icon, loading indicator, voice input button (future).

#### [NEW] `web/src/components/search/FilterPanel.tsx`
Sidebar filters — range sliders (distance, budget), checkboxes (type, accreditation), mobile: bottom sheet.

#### [NEW] `web/src/components/search/SearchResultCard.tsx`
Hospital result card with ranking badge, distance, cost, rating, compare checkbox.

#### [NEW] `web/src/components/hospital/ProcedureTable.tsx`
Sortable table — procedure name, cost range, success rate, data source badge.

#### [NEW] `web/src/components/hospital/FacilityGrid.tsx`
Icon grid — facility name + availability (✅/❌) with hover tooltips.

#### [NEW] `web/src/components/hospital/ReviewSection.tsx`
Rating distribution bar chart + review cards with helpful button.

#### [NEW] `web/src/components/compare/CompareTable.tsx`
Side-by-side table with highlight-best logic and responsive horizontal scroll.

#### [NEW] `web/src/components/maps/HospitalMap.tsx`
Leaflet map — hospital markers, user location, radius circle, popup cards.

#### [NEW] `web/src/components/maps/RouteMap.tsx`
SOS route display — user to hospital with estimated distance.

---

### Days 12-13: Hooks & API Integration

#### [NEW] `web/src/lib/api.ts`
```typescript
/**
 * API Client — Typed fetch wrapper
 * 
 * Every API call goes through this client, which handles:
 * 1. Base URL resolution (dev vs prod)
 * 2. JWT token injection from cookies
 * 3. Automatic token refresh on 401
 * 4. Error normalization (API errors → typed error objects)
 * 5. Response type validation
 * 
 * PATTERN: Each API function returns Promise<ApiResponse<T>>
 * where T is the expected data type. This keeps type safety
 * end-to-end from backend Pydantic schema → frontend TypeScript.
 */
```

#### [NEW] `web/src/lib/utils.ts`
Format currency (₹ lakhs notation), format distance (km/m), format date, slug generation.

#### [NEW] `web/src/hooks/useSearch.ts`
Manages NL query → API call → results state. Debounced. Syncs with URL params.

#### [NEW] `web/src/hooks/useGeolocation.ts`
Browser Geolocation API — permission, loading, error, coordinates. Fallback to IP geolocation.

#### [NEW] `web/src/hooks/useCompare.ts`
Compare cart — add/remove hospitals, max 4, persist to localStorage, clear all.

#### [NEW] `web/src/types/index.ts`
TypeScript interfaces matching backend Pydantic schemas: Hospital, Procedure, Review, SearchFilters, SOSResponse, etc.

---

### Days 14-15: Responsive Design & Polish

- Test all pages on: 360px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)
- Add CSS media queries for all breakpoints
- Mobile: bottom sheet filters, horizontal scroll comparison, fullscreen SOS
- Dark mode toggle in header
- Lighthouse audit: aim for 90+ on Performance, Accessibility, SEO
- Loading states for every async operation (skeletons, spinners)
- Error states for failed API calls (retry button, helpful message)
- Empty states for no results (illustration + suggestion)

---

## Acceptance Criteria

- [ ] All 8 pages render correctly (landing, search, hospital, compare, SOS, admin ×3)
- [ ] Design system: all CSS variables used consistently, no hardcoded values
- [ ] NL search bar converts user input to API call and displays AI-parsed chips
- [ ] Hospital comparison table highlights best-in-category
- [ ] SOS page gets location and shows nearest hospital in < 3 seconds
- [ ] Leaflet map shows hospital markers with popup cards
- [ ] Responsive: all pages work on 360px–1440px
- [ ] Dark mode toggle works across all pages
- [ ] Lighthouse: Performance ≥ 85, Accessibility ≥ 90, SEO ≥ 90
- [ ] All interactive elements have unique IDs for testing
- [ ] Loading skeletons for every async data fetch

---

## Your Dependencies

| You Need | From Whom | When |
|---|---|---|
| API response schemas (OpenAPI/TypeScript types) | M1 (Backend Lead) | Day 3 |
| Running backend API to integrate against | M1 (Backend Lead) | Day 5 |
| Search API with NLP results | M1 + M2 | Day 7 |
| Admin page requirements | M4 (Admin Lead) | Day 5 |

## Others Need From You

| They Need | Who Needs It | When |
|---|---|---|
| Design system CSS variables | M4 (Admin Lead) | Day 2 |
| Component library (Button, Card, Badge, etc.) | M4 (Admin Lead) | Day 8 |
| Page layouts for admin pages | M4 (Admin Lead) | Day 8 |
