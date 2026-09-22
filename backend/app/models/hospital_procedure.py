"""
──────────────────────────────────────────────
models/hospital_procedure.py — Hospital-Procedure Junction
──────────────────────────────────────────────

Maps which procedures each hospital offers, with hospital-specific pricing.

DESIGN: Hospital-level cost data (cost_min, cost_max) is MORE accurate
than the national PMJAY reference rate in the Procedure model. When both
exist, always show hospital-specific costs to the user.

data_source_label on each row is CRITICAL — the same procedure in the same
hospital may have:
  - PMJAY_HBP: cost from government database
  - MANUAL_VERIFIED: cost verified by our admin team
  - SIMULATED: estimated cost for demo
"""

import uuid
from typing import Optional, TYPE_CHECKING

from sqlalchemy import Integer, Float, String, ForeignKey, Enum as SAEnum, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase
from app.models.hospital import DataSourceLabel

if TYPE_CHECKING:
    from app.models.hospital import Hospital
    from app.models.procedure import Procedure


class HospitalProcedure(TimestampedBase):
    __tablename__ = "hospital_procedures"
    __table_args__ = {"comment": "Hospital-specific procedure offerings with cost data"}

    # ── Foreign Keys ──────────────────────────────────────────────
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hospitals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    procedure_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("procedures.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Hospital-Specific Pricing (INR) ───────────────────────────
    cost_min: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="Minimum cost at THIS hospital (INR). May differ from PMJAY rate.",
    )
    cost_max: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="Maximum cost at THIS hospital (INR) — depends on case complexity",
    )
    cost_avg: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="Average cost — calculated from historical cases",
    )
    pmjay_covered: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Is this procedure covered by PMJAY at this hospital?",
    )
    pmjay_package_rate: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="PMJAY package rate applicable at this hospital (INR)",
    )

    # ── Quality Metrics ───────────────────────────────────────────
    success_rate: Mapped[Optional[float]] = mapped_column(
        Float,
        comment="Reported success rate percentage (0-100)",
    )
    volume_per_year: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="Number of procedures performed annually — higher volume = more experience",
    )
    average_stay_days: Mapped[Optional[int]] = mapped_column(Integer)

    # ── Availability ──────────────────────────────────────────────
    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        comment="Is this procedure currently offered?",
    )
    wait_time_days: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="Typical appointment wait time in days",
    )
    department: Mapped[Optional[str]] = mapped_column(
        String(100),
        comment="Department that performs this procedure",
    )

    # ── Data Provenance ───────────────────────────────────────────
    data_source_label: Mapped[DataSourceLabel] = mapped_column(
        SAEnum(DataSourceLabel),
        default=DataSourceLabel.SIMULATED,
        nullable=False,
        comment="Provenance of cost data — shown to users as source badge",
    )
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # ── Relationships ─────────────────────────────────────────────
    hospital: Mapped["Hospital"] = relationship(back_populates="hospital_procedures")
    procedure: Mapped["Procedure"] = relationship(back_populates="hospital_procedures")
