"""
models/sos_alert.py — Emergency SOS Alerts

SOS alert lifecycle:
  SENT → ACKNOWLEDGED → DISPATCHED → RESOLVED

When a citizen triggers SOS:
1. Their GPS coordinates are recorded
2. Nearest trauma center is found (PostGIS query)
3. SOSAlert record is created with status=SENT
4. WebSocket notification is pushed to hospital_staff dashboard
5. Hospital staff acknowledges → status=ACKNOWLEDGED
6. Ambulance dispatched → status=DISPATCHED
7. Patient reaches hospital → status=RESOLVED
"""

import uuid
import enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Float, Text, ForeignKey, Enum as SAEnum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.hospital import Hospital

class SOSStatus(str, enum.Enum):
    SENT = "sent"
    ACKNOWLEDGED = "acknowledged"
    DISPATCHED = "dispatched"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"     # User cancelled before acknowledgement

class SOSAlert(TimestampedBase):
    __tablename__ = "sos_alerts"

    # Who triggered SOS
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        comment="Null for anonymous SOS (mobile guest users)",
    )

    # Location at time of SOS
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    address_text: Mapped[Optional[str]] = mapped_column(
        String(500),
        comment="Reverse-geocoded address for display",
    )

    # Nearest Hospital Found
    hospital_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hospitals.id"),
    )
    distance_km: Mapped[Optional[float]] = mapped_column(
        Float,
        comment="Distance to the dispatched hospital at time of SOS",
    )
    estimated_arrival_minutes: Mapped[Optional[int]] = mapped_column(Integer)

    # Alert Status
    status: Mapped[SOSStatus] = mapped_column(
        SAEnum(SOSStatus),
        default=SOSStatus.SENT,
        nullable=False,
        index=True,
    )

    # Emergency Info
    emergency_description: Mapped[Optional[str]] = mapped_column(
        Text,
        comment="Brief description of emergency (optional, user-provided)",
    )
    patient_name: Mapped[Optional[str]] = mapped_column(String(100))
    contact_phone: Mapped[Optional[str]] = mapped_column(String(15))
    ambulance_number: Mapped[Optional[str]] = mapped_column(
        String(20),
        comment="Ambulance registration number once dispatched",
    )

    # Resolution
    resolved_note: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    user: Mapped[Optional["User"]] = relationship(back_populates="sos_alerts")
    hospital: Mapped[Optional["Hospital"]] = relationship(back_populates="sos_alerts")
