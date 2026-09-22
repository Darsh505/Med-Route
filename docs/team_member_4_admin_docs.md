# 📋 Member 4 — Admin Dashboard & Documentation Lead

> **Complexity**: 🟡 Standard  
> **Role**: Build the admin dashboard, user reviews system, comparison UI polish, all project documentation, and testing.  
> **Tech**: Next.js (reusing M3's components), TypeScript, Playwright (testing), Markdown  
> **Est. Duration**: 15 days  

---

## Why This Role Matters

Documentation and admin tooling are what separate a "student project" from a "production-ready platform." Your work directly impacts:
1. **Code evaluation** — The README is the FIRST thing evaluators read. It must be exceptional.
2. **Data trust** — The admin dashboard is how hospitals get verified. Without it, all data is unverified.
3. **User engagement** — Reviews are what keep users coming back and contribute to rankings.
4. **Quality assurance** — Your E2E tests catch integration bugs between all 3 other members' work.

---

## Deliverables & Timeline

### Days 1-3: Reviews System

> [!NOTE]
> You start 3 days after M1 and M3 because you need the backend API and design system to be ready. Use these first 3 days to build the reviews system (API routes + frontend components).

---

#### Backend Routes (coordinate with M1)

You'll write the review-related code and M1 will review/merge it into the backend:

#### [MODIFY] `backend/app/routers/reviews.py` (work with M1)
```python
"""
Reviews Router — /api/hospitals/:id/reviews

YOU ARE RESPONSIBLE FOR:
- Writing the route handlers
- Defining validation rules
- Anti-spam logic (1 review per hospital per user)

M1 IS RESPONSIBLE FOR:
- Integrating into the main app
- Database model (already done by Day 3)
- Auth middleware (already done by Day 3)

ENDPOINTS:
  GET  /api/hospitals/:id/reviews
    → Returns paginated reviews for a hospital
    → Includes rating distribution (5-star: 42%, 4-star: 28%, etc.)
    → Sorted by: most helpful, most recent, highest/lowest rating
    
  POST /api/hospitals/:id/reviews
    → Creates a new review (auth required)
    → Validates: rating (1-5), title (5-200 chars), content (20-2000 chars)
    → Anti-spam: max 1 review per hospital per user
    → Recalculates hospital's overall_rating
    
  POST /api/reviews/:id/helpful
    → Marks a review as helpful (auth required)
    → Prevents self-voting
    → Increments helpful_count
    
  DELETE /api/reviews/:id
    → Admin only: removes inappropriate reviews
    → Soft delete (keeps record for audit)
"""
```

#### Frontend Components

#### [NEW] `web/src/components/reviews/WriteReviewForm.tsx`
```typescript
/**
 * Write Review Form — Authenticated users only
 * 
 * FIELDS:
 * 1. Star Rating (1-5, interactive clickable stars)
 * 2. Title (short summary, 5-200 chars)
 * 3. Treatment Received (dropdown: procedure categories)
 * 4. Review Content (text area, 20-2000 chars with char counter)
 * 5. Cost Transparency Rating (1-5, "How transparent was pricing?")
 * 6. Would Recommend (Yes/No toggle)
 * 
 * UX DECISIONS:
 * - Star rating uses hover preview (shows what each star means)
 *   ★ = Terrible, ★★ = Poor, ★★★ = Average, ★★★★ = Good, ★★★★★ = Excellent
 * - Form validates in real-time (shows remaining chars, required field indicators)
 * - Submit button disabled until all required fields filled
 * - Success: toast notification + review appears at top of list
 * - Already reviewed: shows "Edit your review" instead
 */
```

#### [NEW] `web/src/components/reviews/ReviewCard.tsx`
```typescript
/**
 * Individual Review Card
 * 
 * LAYOUT:
 * ┌─────────────────────────────────────────┐
 * │ ⭐⭐⭐⭐☆  "Great cardiac care"          │
 * │ by Rajesh K. • 3 months ago             │
 * │ Treatment: Angioplasty                   │
 * │                                          │
 * │ "The doctors at PGIMER were excellent... │
 * │  The total cost was clearly explained    │
 * │  upfront with no hidden charges..."      │
 * │                                          │
 * │ 💰 Cost Transparency: ⭐⭐⭐⭐⭐           │
 * │ 👍 Would Recommend: Yes                  │
 * │                                          │
 * │ [👍 Helpful (12)] [🚩 Report]            │
 * └─────────────────────────────────────────┘
 */
```

#### [NEW] `web/src/components/reviews/RatingDistribution.tsx`
```typescript
/**
 * Rating Distribution Bar Chart
 * 
 * Shows breakdown of all reviews:
 * ★★★★★ ████████████████████ 42%
 * ★★★★☆ ████████████░░░░░░░ 28%
 * ★★★☆☆ ██████░░░░░░░░░░░░ 15%
 * ★★☆☆☆ ███░░░░░░░░░░░░░░░  8%
 * ★☆☆☆☆ ██░░░░░░░░░░░░░░░░  7%
 * 
 * Clickable: clicking a bar filters reviews to that rating
 */
```

---

### Days 4-6: Admin Dashboard Layout

#### [NEW] `web/src/app/admin/layout.tsx`
```typescript
/**
 * Admin Layout — Sidebar navigation + content area
 * 
 * LAYOUT:
 * ┌──────────┬──────────────────────────────────┐
 * │ SIDEBAR  │  CONTENT AREA                    │
 * │          │                                   │
 * │ 📊 Dash  │  (renders child pages)            │
 * │ 🏥 Hosp  │                                   │
 * │ 📤 Upload│                                   │
 * │ ⭐ Reviews│                                   │
 * │ 📁 Data  │                                   │
 * │          │                                   │
 * │ [Logout] │                                   │
 * └──────────┴──────────────────────────────────┘
 * 
 * PROTECTION:
 * - Checks user role on server side (getServerSession)
 * - Non-admin users redirected to /login with "Unauthorized" toast
 * - Mobile: sidebar collapses to hamburger menu
 */
```

#### [NEW] `web/src/app/admin/page.tsx`
```typescript
/**
 * Admin Dashboard — Overview Analytics
 * 
 * LAYOUT:
 * ┌────────────────────────────────────────────────┐
 * │  📊 Dashboard Overview                         │
 * │                                                │
 * │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
 * │  │ 52   │ │ 214  │ │ 1.2k │ │ 8    │         │
 * │  │Hosps │ │Procs │ │Reviews│ │Alerts│         │
 * │  └──────┘ └──────┘ └──────┘ └──────┘         │
 * │                                                │
 * │  ┌─────────────────────┐ ┌──────────────────┐ │
 * │  │ Reviews Over Time   │ │ Hospitals by     │ │
 * │  │ [Line Chart]        │ │ Type [Pie Chart] │ │
 * │  └─────────────────────┘ └──────────────────┘ │
 * │                                                │
 * │  ┌─────────────────────────────────────────┐  │
 * │  │ Recent Activity Feed                     │  │
 * │  │ • New hospital added: Fortis Mohali      │  │
 * │  │ • Review flagged: Inappropriate content  │  │
 * │  │ • SOS alert: User near PGIMER            │  │
 * │  │ • Data upload: 15 hospitals from CSV     │  │
 * │  └─────────────────────────────────────────┘  │
 * │                                                │
 * │  ┌─────────────────────────────────────────┐  │
 * │  │ Pending Verification Queue         [3]   │  │
 * │  │ • Healing Touch Hospital - Chandigarh    │  │
 * │  │ • City Heart Center - Ludhiana           │  │
 * │  │ • Apollo Clinic - Mohali                 │  │
 * │  └─────────────────────────────────────────┘  │
 * └────────────────────────────────────────────────┘
 */
```

#### [NEW] `web/src/app/admin/hospitals/page.tsx`
```typescript
/**
 * Admin Hospital Management — CRUD Table
 * 
 * Features:
 * - Sortable columns: name, city, type, rating, verified, last updated
 * - Search/filter bar
 * - Inline edit (click cell to edit, Tab to move, Enter to save)
 * - Bulk actions: verify selected, delete selected, export CSV
 * - Verification toggle with reason field
 * - Data source badge on each row
 * - Pagination with configurable page size
 * - "Add Hospital" button → opens modal form
 * 
 * TABLE COLUMNS:
 * | Name | City | Type | Rating | Verified | Source | Actions |
 * |------|------|------|--------|----------|--------|---------|
 * | PGIMER | Chandigarh | Govt | ⭐4.8 | ✅ | SIMULATED | ✏️ 🗑️ |
 */
```

---

### Days 7-9: Upload & Verification Workflow

#### [NEW] `web/src/app/admin/upload/page.tsx`
```typescript
/**
 * Bulk Data Upload Page
 * 
 * FLOW:
 * 1. UPLOAD: Drag-and-drop or click to upload CSV/JSON file
 *    → Shows file name, size, type
 * 
 * 2. PREVIEW: Parse file and show column mapping
 *    ┌──────────────────────────────────────┐
 *    │ Column Mapping                        │
 *    │ File Column    →    DB Field          │
 *    │ "Hospital Name"  →  [name ▼]         │
 *    │ "City"           →  [city ▼]         │
 *    │ "Latitude"       →  [latitude ▼]     │
 *    │ "Cost Min"       →  [cost_min ▼]     │
 *    │ "UNMAPPED"       →  [Skip ▼]         │
 *    └──────────────────────────────────────┘
 * 
 * 3. VALIDATE: Show validation results
 *    ✅ 45 valid records
 *    ⚠️ 3 records with warnings (missing optional fields)
 *    ❌ 2 records with errors (invalid pincode, missing name)
 *    → Show error details in expandable rows
 * 
 * 4. IMPORT: Progress bar with real-time status
 *    [██████████████░░░░░░] 72% (36/50 records)
 *    → All imported records labeled with data_source_label
 * 
 * 5. RESULT: Summary
 *    "Successfully imported 48 hospital records"
 *    "2 records skipped due to validation errors"
 *    [View imported hospitals →]
 */
```

#### [NEW] `web/src/components/admin/UploadDropzone.tsx`
Drag-and-drop file upload with file type validation (CSV, JSON only), size limit (10MB).

#### [NEW] `web/src/components/admin/ColumnMapper.tsx`
Column mapping UI — auto-matches similar column names, dropdown for manual mapping.

#### [NEW] `web/src/components/admin/ValidationReport.tsx`
Expandable validation results — row-level errors with line numbers and fix suggestions.

#### [NEW] `web/src/components/admin/ImportProgress.tsx`
Real-time progress bar with record count and error log.

#### [NEW] `web/src/components/admin/HospitalTable.tsx`
Reusable data table with sorting, filtering, pagination, inline editing, row selection.

#### [NEW] `web/src/components/admin/VerifyModal.tsx`
Verification modal — approve/reject with reason, shows hospital details for review.

---

### Days 10-12: README & Documentation

> [!IMPORTANT]
> The README is the most important document in the project. It's the first thing anyone reads — evaluators, users, contributors. It must be **exceptional**.

#### [NEW] `README.md`
```markdown
Structure:

# 🏥 Med Route — AI-Powered Hospital Discovery Platform

## The Problem (3-4 sentences, emotionally compelling)

## The Solution (Med Route's value proposition, 1 paragraph)

## ✨ Key Features (with emojis, bullet points)
- 🔍 AI-Powered Natural Language Search
- ⚖️ Side-by-Side Hospital Comparison
- 📊 Transparent Ranking Algorithm
- 🆘 Zero-Friction SOS Emergency Router
- ⭐ User Reviews & Ratings
- 👨‍💼 Admin Dashboard with Data Upload
- 📱 Full Mobile App with Home Screen SOS Widget

## 🖼️ Screenshots / Demo
(Embed actual screenshots of the running app)
(Include a GIF of the NLP search in action)

## 🏗️ Architecture
(Mermaid diagram — copied from implementation plan)

## 🛠️ Tech Stack (table with rationale for each choice)

## 🚀 Quick Start
### Prerequisites
### Clone & Setup
### Run with Docker (recommended)
```bash
git clone https://github.com/your-org/med-route.git
cd med-route
cp backend/.env.example backend/.env
# Add your GEMINI_API_KEY to backend/.env
docker-compose up --build
```
### Run Manually (without Docker)
### Environment Variables Reference

## 📊 Data Provenance
(Explain SIMULATED vs PMJAY_HBP vs MANUAL_VERIFIED labels)
(Why this matters for trust)

## 🤖 AI Search — How It Works
(Flow diagram: user query → Gemini → entities → PostGIS → ranked results)
(5 example queries with expected outputs)

## 📱 Mobile App
(Setup instructions for Expo)
(SOS Widget setup)

## 🧪 Testing
(How to run backend tests)
(How to run E2E tests)
(Test coverage report)

## 📁 Project Structure (tree with annotations)

## 🔐 Security Considerations
(JWT auth, rate limiting, input validation, CORS, SQL injection prevention)

## 📈 Scalability Path
(What to add for 10x scale: Elasticsearch, CDN, load balancer, read replicas)

## 👥 Team & Contributions

## 📄 License
```

#### [NEW] `docs/architecture.md`
Detailed architecture: component diagram, data flow, sequence diagrams, technology rationale.

#### [NEW] `docs/api-reference.md`
All API endpoints documented with:
- Method + URL
- Request body (with example)
- Response body (with example)
- Auth requirements
- Error codes
- Notes

Auto-generated from FastAPI's OpenAPI schema + hand-written examples.

#### [NEW] `docs/data-dictionary.md`
Every table, every column, documented:
- Column name, type, constraints
- Description (what it means in plain English)
- Example values
- Relationships to other tables
- Data source implications

---

### Days 13-14: End-to-End Testing

#### [NEW] `web/e2e/search.spec.ts`
```typescript
/**
 * E2E Test: Search Flow
 * 
 * Tests the complete user journey:
 * 1. User lands on home page
 * 2. Types NL query in search bar
 * 3. Gets redirected to search results
 * 4. Sees AI-parsed chips
 * 5. Sees hospital result cards
 * 6. Clicks on a hospital → detail page
 * 7. Sees procedures, facilities, reviews
 * 8. Clicks "Add to Compare" → compare bar appears
 * 9. Goes to compare page → sees side-by-side table
 */
```

#### [NEW] `web/e2e/sos.spec.ts`
```typescript
/**
 * E2E Test: SOS Emergency Flow
 * 
 * Tests:
 * 1. User clicks SOS button
 * 2. Location permission is granted (mocked)
 * 3. Nearest hospital is found
 * 4. Hospital details are displayed
 * 5. Call button is visible and functional
 */
```

#### [NEW] `web/e2e/admin.spec.ts`
```typescript
/**
 * E2E Test: Admin Workflow
 * 
 * Tests:
 * 1. Admin logs in
 * 2. Navigates to dashboard → sees stats
 * 3. Goes to hospitals → sees table
 * 4. Clicks verify → hospital is verified
 * 5. Goes to upload → uploads CSV → sees preview → imports
 * 6. Checks imported records appear in table
 */
```

#### [NEW] `web/e2e/reviews.spec.ts`
```typescript
/**
 * E2E Test: Review System
 * 
 * Tests:
 * 1. User navigates to hospital page
 * 2. Sees existing reviews and rating distribution
 * 3. Clicks "Write Review" → form appears
 * 4. Fills in rating, title, content
 * 5. Submits → review appears in list
 * 6. Another user clicks "Helpful" → count increments
 */
```

---

### Day 15: Final Polish

- Cross-browser testing: Chrome, Firefox, Safari, Edge
- Mobile viewport testing: 360px, 390px, 414px, 768px
- Link all screenshots in README
- Final documentation review
- Verify all data source labels are visible in UI
- Check all `id` attributes are unique and descriptive
- Run Lighthouse audit, fix any issues below threshold

---

## Acceptance Criteria

- [ ] Admin dashboard: login, stats, hospital table, verify workflow — all functional
- [ ] Upload: CSV/JSON upload with column mapping, validation, import progress — all functional
- [ ] Reviews: write review form, rating distribution, helpful votes — all functional
- [ ] README: comprehensive, with screenshots, setup instructions, architecture diagram
- [ ] `docs/architecture.md`: component diagram + data flow + sequence diagrams
- [ ] `docs/api-reference.md`: all endpoints documented with examples
- [ ] `docs/data-dictionary.md`: all tables and columns documented
- [ ] E2E tests: search flow, SOS flow, admin flow, review flow — all passing
- [ ] Cross-browser: works on Chrome, Firefox, Safari
- [ ] All data source badges visible in admin table and hospital detail

---

## Your Dependencies

| You Need | From Whom | When |
|---|---|---|
| Backend API running with auth | M1 (Backend Lead) | Day 3 |
| Design system CSS + component library | M3 (Web Frontend Lead) | Day 2 (CSS), Day 8 (components) |
| Hospital detail page to add review section | M3 (Web Frontend Lead) | Day 6 |
| Review API routes merged into backend | M1 (Backend Lead) | Day 6 |

## Others Need From You

| They Need | Who Needs It | When |
|---|---|---|
| Review UI requirements (fields, validation) | M1 (Backend Lead) | Day 3 |
| E2E test results (bug reports) | M1, M2, M3 | Day 14 |
| README with setup instructions | ALL (for deployment) | Day 12 |
