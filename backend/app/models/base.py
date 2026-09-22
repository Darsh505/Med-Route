"""
──────────────────────────────────────────────
models/base.py — Common Base Model
──────────────────────────────────────────────

All Med Route models inherit from TimestampedBase which adds:
- id: UUID primary key (safe for distributed systems, prevents enumeration)
- created_at: Auto-set creation timestamp
- updated_at: Auto-updated on every save (SQLAlchemy onupdate)

WHY UUIDs instead of integers?
→ UUIDs are globally unique across tables and environments.
  This prevents ID enumeration attacks (user can't guess /hospitals/1, /2, /3).
  It also makes merging data from multiple sources trivial.
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TimestampedBase(Base):
    """
    Abstract base class — provides id, created_at, updated_at.
    This is NOT a database table (abstract=True).
    """

    __abstract__ = True

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="UUID primary key — globally unique, prevents ID enumeration",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Record creation timestamp (UTC)",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        comment="Auto-updated on every save",
    )

    def to_dict(self) -> dict[str, Any]:
        """Utility: convert model instance to dict for debugging."""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} id={self.id}>"
