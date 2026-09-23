"""
models/hospital.py — Core Hospital Entity

This is the most important model in Med Route.

CRITICAL DESIGN DECISIONS:

1. PostGIS Geography(POINT, 4326) for location
   → Geography type stores WGS84 coordinates (standard GPS lat/lng)
     and calculates distances in METERS on a spherical Earth model.
   → Geometry type uses flat Cartesian plane — gives WRONG distances
     for locations >100km apart (ignores Earth's curvature).
   → We always use Geography for healthcare distances since patients
     may be searching hospitals across districts/states.

2. GiST Spatial Index on `location`
   → Makes ST_DWithin (radius search) O(log n) instead of O(n).
   → Essential when we scale to 50,000+ hospitals nationally.
   → Without this index, a search over 50k hospitals takes ~2s.
     With the index: <50ms. This is non-negotiable for a healthcare app.

3. data_source_label on every record
   → Data provenance is a core Med Route feature, not an afterthought.
     Citizens must know if they're seeing government-verified data or
     simulated demo data. This transparency builds trust.

4. Denormalized overall_rating + total_reviews
   → Computing AVG(rating) from reviews table on every request would
     require a join + aggregation. We maintain these as denormalized
     counters and update them whenever a review is added/edited.
   → Tradeoff: slight inconsistency risk vs significant read performance gain.
"""

import uuid
import enum
from typing import Optional, TYPE_CHECKING

from geoalchemy2 import Geography
from sqlalchemy import (
    String, Integer, Float, Boolean, Text, Index,
    Enum as SAEnum, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.data_source import DataSource
    from app.models.hospital_procedure import HospitalProcedure
    from app.models.facility import Facility
    from app.models.department import Department
    from app.models.review import Review
    from app.models.sos_alert import SOSAlert

class HospitalType(str, enum.Enum):
    """Hospital ownership type — affects PMJAY empanelment and cost structure."""
    GOVERNMENT = "government"
    PRIVATE = "private"
    TRUST = "trust"          # Non-profit / religious / community trust
    SEMI_GOVERNMENT = "semi_government"

class DataSourceLabel(str, enum.Enum):
    """
    CRITICAL: Every hospital record MUST have a data_source_label.
    This is how we maintain trust and transparency.

    - SIMULATED: Generated for demo purposes, based on real structures
    - PMJAY_HBP: Extracted from PMJAY Health Benefit Package data
    - HFR_REGISTRY: From Health Facility Registry
    - MANUAL_VERIFIED: Manually entered and verified by admin
    - USER_CONTRIBUTED: Submitted by users (requires verification)
    """
    SIMULATED = "SIMULATED"
    PMJAY_HBP = "PMJAY_HBP"
    HFR_REGISTRY = "HFR_REGISTRY"
    MANUAL_VERIFIED = "MANUAL_VERIFIED"
    USER_CONTRIBUTED = "USER_CONTRIBUTED"

class Hospital(TimestampedBase):
    __tablename__ = "hospitals"
    __table_args__ = (
        # GiST spatial index — makes radius queries O(log n) instead of O(n)
        # REQUIRED for performance at scale. DO NOT remove.
        Index("idx_hospitals_location_gist", "location", postgresql_using="gist"),
        # Standard indexes for common filter queries
        Index("idx_hospitals_city", "city"),
        Index("idx_hospitals_type", "type"),
        Index("idx_hospitals_verified", "verified"),
        Index("idx_hospitals_pmjay", "is_pmjay_empanelled"),
        {"comment": "Hospital facility records — core entity of Med Route"},
    )

    # Identity
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="Official hospital name",
    )
    slug: Mapped[str] = mapped_column(
        String(300),
        unique=True,
        nullable=False,
        index=True,
        comment="URL-friendly identifier, e.g. pgimer-chandigarh. Auto-generated from name + city.",
    )
    type: Mapped[HospitalType] = mapped_column(
        SAEnum(HospitalType),
        nullable=False,
        comment="Ownership type: government | private | trust | semi_government",
    )

    # Address
    address: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    pincode: Mapped[str] = mapped_column(String(6))
    district: Mapped[Optional[str]] = mapped_column(String(100))

    # PostGIS Spatial Column
    # Geography(POINT, 4326) — spherical Earth model, distances in meters
    # The GiST index above is what makes this column fast for radius queries.
    location: Mapped[object] = mapped_column(
        Geography(geometry_type="POINT", srid=4326),
        nullable=False,
        comment="WGS84 GPS coordinates. Use ST_MakePoint(longitude, latitude).",
    )

    # Denormalized lat/lng for API responses (avoid PostGIS deserialize on every call)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Contact
    phone: Mapped[str] = mapped_column(String(15), nullable=False)
    emergency_phone: Mapped[Optional[str]] = mapped_column(
        String(15),
        comment="24/7 emergency line — used in SOS dispatch",
    )
    email: Mapped[Optional[str]] = mapped_column(String(255))
    website: Mapped[Optional[str]] = mapped_column(String(500))

    # Capacity
    beds_total: Mapped[int] = mapped_column(Integer, default=0)
    beds_icu: Mapped[int] = mapped_column(
        Integer,
        default=0,
        comment="Total ICU beds (occupied + available)",
    )
    beds_icu_available: Mapped[int] = mapped_column(
        Integer,
        default=0,
        comment="Currently available ICU beds — updated by hospital staff",
    )
    beds_emergency: Mapped[int] = mapped_column(Integer, default=0)
    beds_general: Mapped[int] = mapped_column(Integer, default=0)
    beds_pediatric: Mapped[int] = mapped_column(Integer, default=0)

    # Accreditation & Certification
    is_trauma_center: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Level 1 Trauma Center — used for SOS nearest-hospital query",
    )
    is_pmjay_empanelled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Ayushman Bharat / PMJAY empanelment status",
    )
    pmjay_id: Mapped[Optional[str]] = mapped_column(
        String(50),
        comment="PMJAY hospital registration ID",
    )
    accreditation: Mapped[Optional[str]] = mapped_column(
        String(50),
        comment="NABH | NABL | JCI | ISO | None",
    )
    rohini_id: Mapped[Optional[str]] = mapped_column(
        String(50),
        comment="Rohini hospital ID (CGHS empanelment)",
    )

    # Ratings (denormalized for query performance)
    overall_rating: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        comment="Average of all reviews — updated after each review submission",
    )
    total_reviews: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )
    cost_transparency_rating: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        comment="Avg of cost transparency sub-rating from reviews",
    )

    # Operational Info
    established_year: Mapped[Optional[int]] = mapped_column(Integer)
    total_doctors: Mapped[Optional[int]] = mapped_column(Integer)
    specialties_count: Mapped[Optional[int]] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(String(500))

    # Data Provenance (CRITICAL)
    verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Has this record been verified by an admin?",
    )
    data_source_label: Mapped[DataSourceLabel] = mapped_column(
        SAEnum(DataSourceLabel),
        default=DataSourceLabel.SIMULATED,
        nullable=False,
        comment="CRITICAL: provenance label — shown to users as trust badge",
    )
    data_source_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("data_sources.id"),
        comment="Link to the data_source record for audit trail",
    )

    # Soft Delete
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    data_source: Mapped[Optional["DataSource"]] = relationship(back_populates="hospitals")
    hospital_procedures: Mapped[list["HospitalProcedure"]] = relationship(
        back_populates="hospital",
        cascade="all, delete-orphan",
    )
    facilities: Mapped[list["Facility"]] = relationship(
        back_populates="hospital",
        cascade="all, delete-orphan",
    )
    departments: Mapped[list["Department"]] = relationship(
        back_populates="hospital",
        cascade="all, delete-orphan",
    )
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="hospital",
        cascade="all, delete-orphan",
    )
    sos_alerts: Mapped[list["SOSAlert"]] = relationship(back_populates="hospital")
