"""
models/facility.py — Hospital Facilities & Equipment

Tracks availability of critical medical equipment and infrastructure.
This data is used in:
1. Search filtering (e.g., "ICU hospital with MRI near me")
2. Compare page (show which facilities are available at each hospital)
3. SOS routing (trauma center must have specific emergency equipment)
"""

import uuid
import enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Boolean, Integer, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.hospital import Hospital

class FacilityCategory(str, enum.Enum):
    """Groups facilities for UI display in organized sections."""
    IMAGING = "imaging"          # MRI, CT, X-ray, Ultrasound, PET-CT
    ICU = "icu"                  # ICU, NICU, PICU, CCU
    EMERGENCY = "emergency"      # Emergency dept, trauma bay, ambulance
    LABORATORY = "laboratory"    # Blood bank, pathology, microbiology
    SURGERY = "surgery"          # OT, laparoscopy, cath lab, cyberknife
    PHARMACY = "pharmacy"
    THERAPY = "therapy"          # Physiotherapy, dialysis, chemotherapy
    SUPPORT = "support"          # Canteen, parking, ambulance, mortuary

class Facility(TimestampedBase):
    __tablename__ = "facilities"
    __table_args__ = {"comment": "Hospital equipment and service availability"}

    # Foreign Key
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hospitals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Facility Info
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Facility name, e.g. '3T MRI Scanner', 'Blood Bank', 'Cath Lab'",
    )
    category: Mapped[FacilityCategory] = mapped_column(
        SAEnum(FacilityCategory),
        nullable=False,
        index=True,
    )

    # Availability
    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        comment="Is this facility currently operational?",
    )
    is_24x7: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Is this facility available 24 hours / 7 days?",
    )
    count: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="Number of units, e.g. 3 OTs, 2 MRI machines",
    )

    # Details
    description: Mapped[Optional[str]] = mapped_column(Text)
    icon_key: Mapped[Optional[str]] = mapped_column(
        String(50),
        comment="Icon name for UI display, e.g. 'mri', 'blood-drop', 'ambulance'",
    )

    # Relationships
    hospital: Mapped["Hospital"] = relationship(back_populates="facilities")
