"""
──────────────────────────────────────────────
models/procedure.py — Medical Procedure Catalog
──────────────────────────────────────────────

Normalized procedure catalog with:
- ICD-10 codes for clinical accuracy
- PMJAY HBP (Health Benefit Package) codes for Ayushman Bharat
- Search aliases in English + Hindi/Hinglish for NLP matching
- Category hierarchy for filtering
"""

import enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Text, Enum as SAEnum, ARRAY, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.hospital_procedure import HospitalProcedure


class ProcedureCategory(str, enum.Enum):
    """Top-level medical specialties — used for filtering and UI chips."""
    CARDIAC = "cardiac"
    ORTHOPEDIC = "orthopedic"
    NEUROLOGICAL = "neurological"
    OPHTHALMOLOGY = "ophthalmology"
    RENAL = "renal"
    DENTAL = "dental"
    GENERAL = "general"
    PEDIATRIC = "pediatric"
    ONCOLOGY = "oncology"
    GYNECOLOGY = "gynecology"
    GASTROENTEROLOGY = "gastroenterology"
    PULMONOLOGY = "pulmonology"
    DERMATOLOGY = "dermatology"
    PSYCHIATRY = "psychiatry"
    EMERGENCY = "emergency"
    DIAGNOSTIC = "diagnostic"
    OTHER = "other"


class Procedure(TimestampedBase):
    __tablename__ = "procedures"
    __table_args__ = {"comment": "Normalized medical procedure catalog"}

    # ── Identity ──────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
        comment="Canonical English procedure name, e.g. 'Hemodialysis'",
    )
    name_hindi: Mapped[Optional[str]] = mapped_column(
        String(255),
        comment="Hindi name, e.g. 'हेमोडायलिसिस'",
    )
    description: Mapped[Optional[str]] = mapped_column(Text)

    # ── Classification ────────────────────────────────────────────
    category: Mapped[ProcedureCategory] = mapped_column(
        SAEnum(ProcedureCategory),
        nullable=False,
        index=True,
    )
    sub_category: Mapped[Optional[str]] = mapped_column(
        String(100),
        comment="More specific grouping, e.g. 'Interventional Cardiology'",
    )

    # ── Clinical Codes ────────────────────────────────────────────
    icd10_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        comment="ICD-10 procedure code for clinical interoperability",
    )
    pmjay_hbp_code: Mapped[Optional[str]] = mapped_column(
        String(50),
        comment="PMJAY Health Benefit Package code — maps to Ayushman Bharat coverage",
    )
    pmjay_package_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        comment="Official PMJAY package name for this procedure",
    )

    # ── Cost Reference (National Range from PMJAY HBP) ────────────
    pmjay_cost_min: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="Minimum PMJAY package rate (INR) — government reference price",
    )
    pmjay_cost_max: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="Maximum PMJAY package rate (INR)",
    )

    # ── Search Aliases (for NLP matching) ─────────────────────────
    # Stored as JSONB array for fast GIN index full-text search
    # Example: ["kidney treatment", "renal failure", "gurdey ka ilaj", "dialysis"]
    search_aliases: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        default=list,
        comment="Search aliases in English + Hinglish — used by NLP parser to map queries",
    )

    # ── Metadata ──────────────────────────────────────────────────
    is_surgical: Mapped[bool] = mapped_column(
        default=False,
        comment="Requires surgery (OT) — affects hospital type filtering",
    )
    requires_hospitalization: Mapped[bool] = mapped_column(default=True)
    typical_duration_days: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="Typical hospital stay duration in days",
    )

    # ── Relationships ─────────────────────────────────────────────
    hospital_procedures: Mapped[list["HospitalProcedure"]] = relationship(
        back_populates="procedure"
    )
