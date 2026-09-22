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
from typing import Optional, Union, Any, List
from datetime import datetime, timezone
from pydantic import BaseModel, Field


# ── Sub-schemas ───────────────────────────────────────────────────

class FacilityResponse(BaseModel):
    id: Union[uuid.UUID, str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    is_available: bool = True
    is_24x7: bool = False
    count: Optional[int] = None
    icon_key: Optional[str] = None
    model_config = {"from_attributes": True}


class DepartmentResponse(BaseModel):
    id: Union[uuid.UUID, str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    head_doctor: Optional[str] = None
    head_doctor_qualification: Optional[str] = None
    doctor_count: Optional[int] = None
    specialization: Optional[str] = None
    model_config = {"from_attributes": True}


class ProcedureBriefResponse(BaseModel):
    id: Union[uuid.UUID, str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    icd10_code: Optional[str] = None
    model_config = {"from_attributes": True}


class HospitalProcedureResponse(BaseModel):
    procedure: ProcedureBriefResponse
    cost_min: Optional[int] = 0
    cost_max: Optional[int] = 0
    cost_avg: Optional[int] = 0
    pmjay_covered: bool = False
    pmjay_package_rate: Optional[int] = None
    success_rate: Optional[float] = 90.0
    volume_per_year: Optional[int] = 100
    is_available: bool = True
    wait_time_days: Optional[int] = 3
    data_source_label: str = "SIMULATED"
    model_config = {"from_attributes": True}


# ── Main Hospital Schemas ──────────────────────────────────────────

class HospitalResponse(BaseModel):
    """
    Full hospital detail response — used in hospital detail page and compare page.
    """
    id: Union[uuid.UUID, str]
    name: str
    slug: str
    type: str
    address: str
    city: str
    state: str
    pincode: str = "160012"
    latitude: float
    longitude: float

    # Contact
    phone: str = "0172-2755555"
    emergency_phone: Optional[str] = None
    ambulance_phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

    # Capacity
    beds_total: int = 100
    beds_icu: int = 20
    beds_icu_available: int = 5
    beds_emergency: int = 15
    beds_general: int = 65

    # Accreditation
    is_trauma_center: bool = True
    is_pmjay_empanelled: bool = True
    pmjay_id: Optional[str] = None
    accreditation: Optional[str] = "NABH"

    # Ratings
    overall_rating: float = 4.5
    total_reviews: int = 50
    cost_transparency_rating: float = 4.0

    # Info
    established_year: Optional[int] = None
    total_doctors: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

    # Provenance
    verified: bool = True
    data_source_label: str = "SIMULATED"

    # Clinical assessment & Highlights
    pros: list[str] = []
    cons: list[str] = []

    # Computed at query time
    distance_km: Optional[float] = None
    ranking_score: Optional[float] = None
    ranking_breakdown: Optional[dict] = None

    # Nested data
    hospital_procedures: list[HospitalProcedureResponse] = []
    facilities: list[FacilityResponse] = []
    departments: list[DepartmentResponse] = []
    reviews: list[dict] = []

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class HospitalListItem(BaseModel):
    """
    Compact hospital card — used in search results list view.
    Minimal data to keep list responses fast.
    """
    id: Union[uuid.UUID, str]
    name: str
    slug: str
    type: str
    city: str
    state: str
    latitude: float
    longitude: float
    beds_icu_available: int = 5
    is_trauma_center: bool = True
    is_pmjay_empanelled: bool = True
    accreditation: Optional[str] = "NABH"
    overall_rating: float = 4.5
    total_reviews: int = 50
    image_url: Optional[str] = None
    verified: bool = True
    data_source_label: str = "SIMULATED"
    phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    ambulance_phone: Optional[str] = None
    pros: list[str] = []
    cons: list[str] = []
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
