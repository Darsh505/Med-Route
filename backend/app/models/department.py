"""models/department.py — Hospital Departments"""

import uuid
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.hospital import Hospital


class Department(TimestampedBase):
    __tablename__ = "departments"

    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hospitals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    head_doctor: Mapped[Optional[str]] = mapped_column(String(150))
    head_doctor_qualification: Mapped[Optional[str]] = mapped_column(String(200))
    doctor_count: Mapped[Optional[int]] = mapped_column(Integer)
    specialization: Mapped[Optional[str]] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    hospital: Mapped["Hospital"] = relationship(back_populates="departments")
