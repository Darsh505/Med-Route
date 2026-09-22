"""
──────────────────────────────────────────────
models/user.py — User Account Model
──────────────────────────────────────────────

Three user roles:
- citizen: Regular users searching for hospitals, posting reviews
- admin: Platform administrators who verify data, manage uploads
- hospital_staff: Hospital employees who respond to SOS alerts

Passwords are stored as bcrypt hashes (12 rounds).
Plain text passwords are NEVER stored — not even temporarily.
"""

import uuid
import enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Boolean, Float, Enum as SAEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.review import Review
    from app.models.sos_alert import SOSAlert


class UserRole(str, enum.Enum):
    """
    User roles — controls access throughout the application.

    CITIZEN: Can search, view, post reviews, trigger SOS
    ADMIN: All citizen permissions + verify hospitals, manage data uploads
    HOSPITAL_STAFF: Can acknowledge SOS alerts, update bed availability
    """
    CITIZEN = "citizen"
    ADMIN = "admin"
    HOSPITAL_STAFF = "hospital_staff"


class User(TimestampedBase):
    __tablename__ = "users"
    __table_args__ = {"comment": "Med Route user accounts"}

    # ── Identity ──────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Full name",
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="Email address — used for login",
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(15),
        comment="Mobile number (optional) — used for SOS contact",
    )

    # ── Auth ──────────────────────────────────────────────────────
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="bcrypt hash of password — NEVER store plain text",
    )
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole),
        default=UserRole.CITIZEN,
        nullable=False,
        comment="User role — controls permissions",
    )

    # ── Status ────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        comment="Soft disable — deactivated users cannot login",
    )
    is_email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    # ── Location (optional — for nearby hospital suggestions) ──────
    latitude: Mapped[Optional[float]] = mapped_column(
        Float,
        comment="User's saved home location latitude",
    )
    longitude: Mapped[Optional[float]] = mapped_column(
        Float,
        comment="User's saved home location longitude",
    )
    city: Mapped[Optional[str]] = mapped_column(
        String(100),
        comment="User's city — used for default search radius",
    )

    # ── Profile ───────────────────────────────────────────────────
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))

    # ── Relationships ─────────────────────────────────────────────
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    sos_alerts: Mapped[list["SOSAlert"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
