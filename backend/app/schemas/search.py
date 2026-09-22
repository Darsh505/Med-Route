"""
──────────────────────────────────────────────
schemas/search.py — Search Request & Response Schemas
──────────────────────────────────────────────

These schemas define the contract between:
1. The frontend (sends NL query)
2. The NLP parser (extracts structured filters)
3. The search service (applies filters to PostGIS query)
4. The ranking service (scores and sorts results)
"""

import uuid
from typing import Optional
from pydantic import BaseModel, Field


class NLSearchRequest(BaseModel):
    """Natural language search — what the user types in the search bar."""
    query: str = Field(
        ...,
        min_length=3,
        max_length=500,
        examples=["Find kidney treatment near Chandigarh under 2 lakhs"],
    )
    # Optional: client-side GPS (more accurate than text geocoding)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    # Optional: override extracted radius
    radius_km: Optional[float] = Field(None, ge=1, le=500)


class SearchFilters(BaseModel):
    """
    Structured search filters — output of the NLP parser.

    This is the contract between M2 (AI Lead) and M1 (Backend Lead).
    The NLP parser produces this; the search service consumes it.
    """
    # ── Intent ─────────────────────────────────────────────────
    intent: str = Field(
        default="hospital_search",
        examples=["hospital_search", "sos_emergency", "cost_inquiry"],
    )

    # ── Medical Query ──────────────────────────────────────────
    disease: Optional[str] = None              # "kidney disease"
    procedure_categories: list[str] = []       # ["renal"]
    mapped_procedures: list[str] = []          # ["dialysis", "kidney_transplant"]
    specialties: list[str] = []                # ["nephrology"]

    # ── Location ───────────────────────────────────────────────
    location_text: Optional[str] = None        # "Chandigarh"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: float = 50.0

    # ── Budget ─────────────────────────────────────────────────
    max_budget: Optional[int] = None           # In INR (e.g. 200000)
    min_budget: Optional[int] = None

    # ── Filters ────────────────────────────────────────────────
    hospital_types: list[str] = []             # ["government", "private"]
    accreditation: Optional[str] = None        # "NABH"
    requires_pmjay: Optional[bool] = None
    requires_trauma: Optional[bool] = None
    min_rating: Optional[float] = None
    min_icu_beds: Optional[int] = None

    # ── Sort ───────────────────────────────────────────────────
    sort_by: str = "relevance"                 # relevance | distance | rating | cost

    # ── AI Metadata ────────────────────────────────────────────
    ai_provider: str = "rule_based"            # gemini | rule_based
    confidence: float = 1.0
    raw_query: Optional[str] = None


class RankingWeights(BaseModel):
    """
    Configurable ranking weights — users can adjust via UI sliders.
    All weights must sum to 1.0 (validated at service layer).
    """
    distance: float = Field(default=0.30, ge=0, le=1)
    cost: float = Field(default=0.25, ge=0, le=1)
    rating: float = Field(default=0.25, ge=0, le=1)
    accreditation: float = Field(default=0.20, ge=0, le=1)


class StructuredSearchRequest(BaseModel):
    """Structured search for when user applies manual filters."""
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: float = 50.0
    procedure_category: Optional[str] = None
    hospital_type: Optional[str] = None
    max_budget: Optional[int] = None
    accreditation: Optional[str] = None
    requires_pmjay: Optional[bool] = None
    min_rating: Optional[float] = None
    sort_by: str = "distance"
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=50)


class RankingBreakdown(BaseModel):
    """
    Transparent ranking breakdown — shown to user so they can see WHY
    this hospital is ranked where it is.
    """
    total_score: float
    distance_score: float
    cost_score: float
    rating_score: float
    accreditation_score: float
    weights_used: RankingWeights


class SearchResultMeta(BaseModel):
    total: int
    page: int
    per_page: int
    radius_km: float
    location_text: Optional[str]
    ai_provider: str
    confidence: float
    extracted_filters: SearchFilters
    data_source: str = "SIMULATED"
