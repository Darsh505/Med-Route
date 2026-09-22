# 🏗️ Member 1 — Backend & Data Pipeline Lead

> **Complexity**: 🔴 Complex  
> **Role**: Build the entire backend API — the single source of truth for web, mobile, and admin.  
> **Tech**: Python 3.12, FastAPI, PostgreSQL + PostGIS, Redis, SQLAlchemy 2.0, Docker  
> **Est. Duration**: 15 days  

---

## Why This Role Is Complex

1. **Geospatial queries** — You're using PostGIS with GeoAlchemy2 for radius-based hospital search. This requires understanding spatial indexes (GiST), coordinate reference systems (EPSG:4326), and PostGIS functions (`ST_DWithin`, `ST_Distance`, `ST_MakePoint`).
2. **Async architecture** — The entire backend is async (SQLAlchemy 2.0 async sessions + `asyncpg`). You must avoid blocking I/O anywhere.
3. **Data pipeline** — You're building ETL scripts that scrape, normalize, and load government health data with proper provenance labels.
4. **Deployment** — Docker multi-stage builds, docker-compose orchestration with health checks, production Gunicorn config.
5. **You are the blocker** — Members 2, 3, and 4 all depend on your API contracts. Days 1-3 are critical.

---

## Deliverables & Timeline

### Days 1-3: Foundation (CRITICAL PATH — Everyone Depends On You)

> [!CAUTION]
> By end of Day 3, you MUST have:
> 1. All SQLAlchemy models defined
> 2. Database running with migrations applied
> 3. Auth endpoints working (register/login/me)
> 4. OpenAPI schema published for M3 and M4 to generate TypeScript types

---

#### [NEW] `backend/app/__init__.py`
Empty init file to make `app` a Python package.

#### [NEW] `backend/app/config.py`
```python
"""
Environment configuration using Pydantic BaseSettings.

WHY BaseSettings?
→ It auto-reads from .env files AND environment variables,
  which means the same code works in local dev (reads .env)
  and production (reads Railway/Render injected env vars).
"""

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database — PostGIS-enabled PostgreSQL
    DATABASE_URL: str = "postgresql+asyncpg://medroute:password@localhost:5432/medroute"
    
    # Redis — for caching and rate limiting
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT Auth
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Google Gemini — for NLP search
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    
    # Geocoding
    NOMINATIM_USER_AGENT: str = "medroute-app"
    
    # App
    APP_ENV: str = "development"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8081"]
    
    # Data pipeline
    SEED_ON_STARTUP: bool = True  # Auto-seed DB with simulated data on first run
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
```

#### [NEW] `backend/app/database.py`
```python
"""
Async database setup with SQLAlchemy 2.0.

KEY DECISIONS:
1. Using async engine (asyncpg driver) for non-blocking I/O
2. Using sessionmaker with expire_on_commit=False to avoid lazy-load issues in async
3. PostGIS extension is auto-created on first connection
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Engine setup with connection pooling
# pool_size=20: handles up to 20 concurrent connections
# max_overflow=10: allows 10 extra connections during spikes
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    echo=(settings.APP_ENV == "development"),
)

# Dependency injection: every route handler gets a fresh session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session
```

#### [NEW] `backend/app/models/base.py`
Base model class with common fields (id, created_at, updated_at) using UUIDs.

#### [NEW] `backend/app/models/user.py`
```python
"""
User model — supports three roles:
- citizen: Regular users searching for hospitals, posting reviews
- admin: Platform administrators who verify data, manage uploads
- hospital_staff: Hospital employees who respond to SOS alerts

WHY UUIDs instead of auto-increment?
→ UUIDs are globally unique, making them safe for distributed systems
  and preventing enumeration attacks (can't guess user IDs).
"""

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(15))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(default=UserRole.CITIZEN)
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    is_active: Mapped[bool] = mapped_column(default=True)
    
    # Relationships
    reviews: Mapped[list["Review"]] = relationship(back_populates="user")
    sos_alerts: Mapped[list["SOSAlert"]] = relationship(back_populates="user")
```

#### [NEW] `backend/app/models/hospital.py`
```python
"""
Hospital model — the core entity.

CRITICAL: Uses PostGIS Geography column for geospatial queries.

WHY Geography(POINT) instead of Geometry?
→ Geography type stores coordinates in lat/lng (EPSG:4326) and
  calculates distances in METERS on a spherical Earth model.
  Geometry uses a flat Cartesian plane which gives wrong distances
  for hospitals that are far apart.

The GiST spatial index on 'location' makes radius queries
O(log n) instead of O(n) — essential when we have 50k+ hospitals.
"""

from geoalchemy2 import Geography

class Hospital(Base):
    __tablename__ = "hospitals"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), index=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    type: Mapped[HospitalType] = mapped_column()  # government | private | trust
    
    # Address
    address: Mapped[str] = mapped_column(String(500))
    city: Mapped[str] = mapped_column(String(100), index=True)
    state: Mapped[str] = mapped_column(String(100), index=True)
    pincode: Mapped[str] = mapped_column(String(6))
    
    # PostGIS spatial column with GiST index
    location: Mapped[str] = mapped_column(
        Geography(geometry_type="POINT", srid=4326),
        nullable=False
    )
    
    # Contact
    phone: Mapped[str] = mapped_column(String(15))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    website: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Capacity
    beds_total: Mapped[int] = mapped_column(default=0)
    beds_icu: Mapped[int] = mapped_column(default=0)
    beds_emergency: Mapped[int] = mapped_column(default=0)
    
    # Accreditation & verification
    is_trauma_center: Mapped[bool] = mapped_column(default=False)
    is_pmjay_empanelled: Mapped[bool] = mapped_column(default=False)
    accreditation: Mapped[Optional[str]] = mapped_column(String(50))  # NABH, NABL, JCI
    
    # Ratings (denormalized for query speed)
    overall_rating: Mapped[float] = mapped_column(Float, default=0.0)
    total_reviews: Mapped[int] = mapped_column(default=0)
    
    # Data provenance
    verified: Mapped[bool] = mapped_column(default=False)
    data_source_label: Mapped[str] = mapped_column(String(50), default="SIMULATED")
    data_source_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("data_sources.id"))
```

#### [NEW] `backend/app/models/procedure.py`
Normalized procedure catalog — ICD codes, HBP package codes, categories, search aliases (e.g., `["kidney treatment", "renal dialysis", "gurdey ka ilaj"]`).

#### [NEW] `backend/app/models/hospital_procedure.py`
Junction table: hospital × procedure with `cost_min`, `cost_max`, `cost_avg`, `success_rate`, `volume_per_year`, and **`data_source_label`** for provenance.

#### [NEW] `backend/app/models/facility.py`
Hospital facilities (MRI, CT Scan, Blood Bank, Ventilators, etc.) with availability flags.

#### [NEW] `backend/app/models/department.py`
Departments with head doctor and specialization tags.

#### [NEW] `backend/app/models/review.py`
User reviews — rating, content, cost_transparency_rating, would_recommend, verified_visit, helpful_count.

#### [NEW] `backend/app/models/sos_alert.py`
SOS emergency alerts with status lifecycle: `sent → acknowledged → dispatched`.

#### [NEW] `backend/app/models/data_source.py`
Data provenance tracking: source name, URL, type, record count, last sync time.

---

#### [NEW] `backend/app/schemas/auth.py`
Pydantic schemas: `RegisterRequest`, `LoginRequest`, `TokenResponse`, `UserResponse`.

#### [NEW] `backend/app/schemas/hospital.py`
```python
"""
Hospital API schemas.

DESIGN DECISION: We separate Create/Update/Response schemas because:
- Create: requires only what the admin provides
- Update: all fields optional (PATCH semantics)
- Response: includes computed fields (distance, rating) that aren't stored
- List: includes pagination metadata
"""

class HospitalResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    type: str
    city: str
    state: str
    latitude: float
    longitude: float
    distance_km: Optional[float] = None  # Computed at query time
    beds_total: int
    is_trauma_center: bool
    is_pmjay_empanelled: bool
    accreditation: Optional[str]
    overall_rating: float
    total_reviews: int
    verified: bool
    data_source_label: str  # Always expose provenance
    procedures: list[HospitalProcedureResponse] = []
    facilities: list[FacilityResponse] = []
```

#### [NEW] `backend/app/schemas/search.py`, `compare.py`, `review.py`, `sos.py`
Request/response schemas for each domain — fully typed, validated, documented.

---

#### [NEW] `backend/app/routers/auth.py`
```python
"""
Authentication router — /api/auth/*

Endpoints:
  POST /api/auth/register → Create new citizen account
  POST /api/auth/login    → Get access + refresh tokens
  POST /api/auth/refresh  → Refresh expired access token
  GET  /api/auth/me       → Get current user profile

SECURITY:
- Passwords hashed with bcrypt (12 rounds)
- Access tokens expire in 30 minutes
- Refresh tokens expire in 7 days
- Admin role can only be set by other admins (not self-registration)
"""
```

#### [NEW] `backend/app/routers/hospitals.py`
```
GET    /api/hospitals                → List with pagination, geo filters
GET    /api/hospitals/:slug          → Get by slug (SEO-friendly)
GET    /api/hospitals/nearby         → PostGIS radius query
GET    /api/hospitals/:id/procedures → Procedures with costs
GET    /api/hospitals/:id/facilities → Facility availability
POST   /api/hospitals                → Admin: create hospital
PUT    /api/hospitals/:id            → Admin: update hospital
DELETE /api/hospitals/:id            → Admin: soft delete
```

#### [NEW] `backend/app/routers/search.py`
```
POST /api/search/nl           → Natural language search (calls AI engine)
GET  /api/search/structured   → Structured filter search
GET  /api/search/autocomplete → Type-ahead suggestions
```

#### [NEW] `backend/app/routers/compare.py`
```
POST /api/compare → Accepts list of hospital IDs, returns normalized comparison data
```

#### [NEW] `backend/app/routers/reviews.py`
```
GET  /api/hospitals/:id/reviews → List reviews for hospital
POST /api/hospitals/:id/reviews → Create review (auth required)
POST /api/reviews/:id/helpful   → Mark review as helpful
```

#### [NEW] `backend/app/routers/sos.py`
```
POST /api/sos/nearest  → Find nearest trauma center from coordinates
POST /api/sos/alert    → Fire emergency alert to hospital dashboard
PATCH /api/sos/:id     → Hospital acknowledges/updates alert
GET   /api/sos/:id     → Check alert status
```

#### [NEW] `backend/app/routers/admin.py`
```
POST  /api/admin/upload          → Bulk upload CSV/JSON
GET   /api/admin/review-queue    → Hospitals pending verification
PATCH /api/admin/verify/:id      → Verify/reject hospital
GET   /api/admin/data-sources    → List data sources
GET   /api/admin/stats           → Dashboard analytics
```

---

### Days 4-6: Services & Business Logic

#### [NEW] `backend/app/services/hospital_service.py`
```python
"""
Hospital business logic.

KEY FUNCTION — find_nearby():
Uses PostGIS ST_DWithin for radius-based search.

SQL generated:
  SELECT *, ST_Distance(location, ST_MakePoint(:lng, :lat)::geography) as distance
  FROM hospitals
  WHERE ST_DWithin(location, ST_MakePoint(:lng, :lat)::geography, :radius_meters)
  ORDER BY distance ASC;

WHY ST_DWithin instead of ST_Distance < X?
→ ST_DWithin uses the GiST spatial index for an index-accelerated
  filter. ST_Distance alone would scan every row to compute distance
  and THEN filter — much slower for large datasets.
"""

async def find_nearby(
    db: AsyncSession,
    lat: float,
    lng: float,
    radius_km: float = 50,
    filters: Optional[SearchFilters] = None
) -> list[HospitalResponse]:
    ...
```

#### [NEW] `backend/app/services/ranking_service.py`
```python
"""
Transparent ranking algorithm.

Each hospital gets a composite score from 0–100:
  score = (distance_score × 0.30) + (cost_score × 0.25) 
        + (rating_score × 0.25) + (accreditation_score × 0.20)

TRANSPARENCY: The API response includes the breakdown for each
hospital, so the user sees WHY it's ranked where it is.

Weights are configurable per-query — the frontend lets users
drag sliders to adjust what matters most to them.
"""
```

#### [NEW] `backend/app/services/search_service.py`
Orchestrates: receive NL query → call M2's AI engine → convert to SQL filters → query with ranking → return results.

#### [NEW] `backend/app/services/compare_service.py`
Fetches and normalizes data for 2-4 hospitals. Handles missing data gracefully (shows "N/A" with reason).

#### [NEW] `backend/app/services/review_service.py`
CRUD + anti-spam (rate limit: 1 review per hospital per user). Recalculates `overall_rating` on hospital after each review.

#### [NEW] `backend/app/services/sos_service.py`
Emergency router: PostGIS query for nearest `is_trauma_center=true` hospital. Creates SOS alert record. Broadcasts via WebSocket.

#### [NEW] `backend/app/services/admin_service.py`
CSV/JSON parsing, column validation, data quality checks, bulk insert with conflict resolution.

---

### Days 7-8: Geospatial & Ranking

Focus on tuning PostGIS queries, building the ranking algorithm, and ensuring spatial index performance.

**Key deliverables:**
- Benchmark: Radius query for 50k hospitals < 50ms
- Ranking breakdown in every search response
- Distance calculation matches Google Maps within 5%

---

### Days 9-11: Data Pipeline

#### [NEW] `backend/app/data_pipeline/seed_data.py`
```python
"""
Realistic seed data generator.

Generates 50+ hospitals across Punjab, Haryana, Delhi NCR, Chandigarh.
Data is based on real PMJAY HBP package structures but ALL records
are labeled as data_source_label="SIMULATED".

WHY simulated data?
→ Direct PMJAY API access requires ABDM registration. We model our
  data after real HBP packages so the schema is production-ready,
  but label everything honestly. When real data comes, it drops in
  with a different label.

INCLUDES:
- 50+ hospitals with real coordinates (geocoded from real addresses)
- 200+ procedure-hospital links with realistic cost ranges
- 100+ facilities across hospitals
- 20+ departments
- Sample reviews
- PMJAY HBP package code mappings
"""
```

#### [NEW] `backend/app/data_pipeline/pmjay_scraper.py`
Web scraper for `hospitals.pmjay.gov.in` — search by state/district, extract hospital listings. Rate-limited, respectful. Ready for real data connection.

#### [NEW] `backend/app/data_pipeline/hbp_mapper.py`
Maps PMJAY Health Benefit Package codes to our normalized procedure catalog. Handles 3-tier pricing (metro/tier-2/rural).

#### [NEW] `backend/app/data_pipeline/normalizer.py`
Standardizes: hospital names, procedure names → ICD codes, addresses → geocoded lat/lng, cost strings → integers.

---

### Days 12-13: Docker & Deployment

#### [NEW] `backend/Dockerfile`
```dockerfile
# Multi-stage build for production
# Stage 1: Build dependencies
# Stage 2: Production image with only runtime deps
# Uses gunicorn with uvicorn workers for production ASGI serving
```

#### [NEW] `docker-compose.yml`
```yaml
# Full stack orchestration:
# - postgres (16 + PostGIS 3.4)
# - redis (7-alpine)
# - backend (FastAPI)
# - web (Next.js)
# Health checks ensure services start in correct order
```

#### [NEW] `backend/gunicorn.conf.py`
Production ASGI config: 4 uvicorn workers, graceful timeouts.

#### [NEW] `backend/nginx.conf`
Reverse proxy config: SSL termination, gzip, static file caching, rate limiting.

---

### Days 14-15: Integration Testing

#### [NEW] `backend/tests/conftest.py`
Pytest fixtures: async test database, test client, authenticated users, seed data.

#### [NEW] `backend/tests/test_hospitals.py`
Tests: list, get by slug, nearby query, create, update, delete.

#### [NEW] `backend/tests/test_search.py`
Tests: NL search, structured search, autocomplete, empty results.

#### [NEW] `backend/tests/test_sos.py`
Tests: nearest trauma center, alert creation, status update, no-nearby fallback.

#### [NEW] `backend/tests/test_auth.py`
Tests: register, login, token refresh, role-based access, invalid credentials.

---

## Acceptance Criteria

- [ ] `docker-compose up` starts all services with zero errors
- [ ] All API endpoints return correct response format with `data_source` provenance
- [ ] PostGIS nearby query returns hospitals sorted by distance
- [ ] Ranking score breakdown is included in search responses
- [ ] Seed data loads 50+ hospitals labeled as `SIMULATED`
- [ ] Auth: JWT tokens work, admin-only routes are protected
- [ ] SOS endpoint returns nearest trauma center in < 100ms
- [ ] All tests pass: `pytest tests/ -v --cov=app` shows > 80% coverage
- [ ] OpenAPI docs available at `/docs` with all schemas

---

## Your Dependencies

| You Need | From Whom | When |
|---|---|---|
| NLP parser interface (function signature + return type) | M2 (AI Lead) | Day 2 |
| Review UI requirements (fields, validation rules) | M4 (Admin Lead) | Day 3 |

## Others Need From You

| They Need | Who Needs It | When |
|---|---|---|
| Running PostgreSQL + API with auth endpoints | M2, M3, M4 | Day 3 |
| OpenAPI schema / generated TypeScript types | M3, M4 | Day 3 |
| Search API live with ranking | M3 | Day 7 |
| SOS API live | M2, M3 | Day 10 |
| Docker Compose working | ALL | Day 13 |
