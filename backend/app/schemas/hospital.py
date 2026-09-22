"""
──────────────────────────────────────────────
schemas/hospital.py — Hospital API Schemas
──────────────────────────────────────────────

DESIGN: Separate schemas for Create / Update / Response because:
- Create: requires only what admin provides
- Update: all fields optional (PATCH semantics)
- Response: includes computed fields (distance, ranking_score) not stored in DB
"""

import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


# ── Sub-schemas ───────────────────────────────────────────────────

class FacilityResponse(BaseModel):
    id: uuid.UUID
    name: str
    category: str
    is_available: bool
    is_24x7: bool
    count: Optional[int]
    icon_key: Optional[str]
    model_config = {"from_attributes": True}


class DepartmentResponse(BaseModel):
    id: uuid.UUID
    name: str
    head_doctor: Optional[str]
    head_doctor_qualification: Optional[str]
    doctor_count: Optional[int]
    specialization: Optional[str]
    model_config = {"from_attributes": True}


class ProcedureBriefResponse(BaseModel):
    id: uuid.UUID
    name: str
    category: str
    icd10_code: Optional[str]
    model_config = {"from_attributes": True}


class HospitalProcedureResponse(BaseModel):
    procedure: ProcedureBriefResponse
    cost_min: Optional[int]
    cost_max: Optional[int]
    cost_avg: Optional[int]
    pmjay_covered: bool
    pmjay_package_rate: Optional[int]
    success_rate: Optional[float]
    volume_per_year: Optional[int]
    is_available: bool
    wait_time_days: Optional[int]
    data_source_label: str
    model_config = {"from_attributes": True}


# ── Main Hospital Schemas ──────────────────────────────────────────

class HospitalResponse(BaseModel):
    """
    Full hospital detail response — used in hospital detail page and compare page.
    """
    id: uuid.UUID
    name: str
    slug: str
    type: str
    address: str
    city: str
    state: str
    pincode: str
    latitude: float
    longitude: float

    # Contact
    phone: str
    emergency_phone: Optional[str]
    email: Optional[str]
    website: Optional[str]

    # Capacity
    beds_total: int
    beds_icu: int
    beds_icu_available: int
    beds_emergency: int
    beds_general: int

    # Accreditation
    is_trauma_center: bool
    is_pmjay_empanelled: bool
    pmjay_id: Optional[str]
    accreditation: Optional[str]

    # Ratings
    overall_rating: float
    total_reviews: int
    cost_transparency_rating: float

    # Info
    established_year: Optional[int]
    total_doctors: Optional[int]
    description: Optional[str]
    image_url: Optional[str]

    # Provenance
    verified: bool
    data_source_label: str

    # Computed at query time
    distance_km: Optional[float] = None
    ranking_score: Optional[float] = None
    ranking_breakdown: Optional[dict] = None

    # Nested data
    hospital_procedures: list[HospitalProcedureResponse] = []
    facilities: list[FacilityResponse] = []
    departments: list[DepartmentResponse] = []

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HospitalListItem(BaseModel):
    """
    Compact hospital card — used in search results list view.
    Minimal data to keep list responses fast.
    """
    id: uuid.UUID
    name: str
    slug: str
    type: str
    city: str
    state: str
    latitude: float
    longitude: float
    beds_icu_available: int
    is_trauma_center: bool
    is_pmjay_empanelled: bool
    accreditation: Optional[str]
    overall_rating: float
    total_reviews: int
    image_url: Optional[str]
    verified: bool
    data_source_label: str
    distance_km: Optional[float] = None
    ranking_score: Optional[float] = None
    cost_range: Optional[dict] = None  # {"min": 50000, "max": 200000} for searched procedure
    model_config = {"from_attributes": True}


class HospitalCreateRequest(BaseModel):
    """Admin: create new hospital record."""
    name: str = Field(..., min_length=3, max_length=255)
    type: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^\d{6}$")
    latitude: float = Field(..., ge=6, le=38)    # India bounds
    longitude: float = Field(..., ge=68, le=98)  # India bounds
    phone: str = Field(..., pattern=r"^[0-9+\-\s()]{8,15}$")
    emergency_phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    beds_total: int = Field(default=0, ge=0)
    beds_icu: int = Field(default=0, ge=0)
    beds_emergency: int = Field(default=0, ge=0)
    is_trauma_center: bool = False
    is_pmjay_empanelled: bool = False
    pmjay_id: Optional[str] = None
    accreditation: Optional[str] = None
    established_year: Optional[int] = None
    description: Optional[str] = None
    data_source_label: str = "MANUAL_VERIFIED"


class HospitalUpdateRequest(BaseModel):
    """Admin: update hospital — all fields optional (PATCH semantics)."""
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    beds_total: Optional[int] = None
    beds_icu: Optional[int] = None
    beds_icu_available: Optional[int] = None
    beds_emergency: Optional[int] = None
    is_trauma_center: Optional[bool] = None
    is_pmjay_empanelled: Optional[bool] = None
    accreditation: Optional[str] = None
    verified: Optional[bool] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
