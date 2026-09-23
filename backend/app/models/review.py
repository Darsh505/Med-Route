"""
models/review.py — User Reviews

User-generated reviews with sub-ratings for:
- Overall experience
- Cost transparency (did costs match estimates?)
- Staff behavior
- Cleanliness
- Would recommend?

Anti-spam: 1 review per user per hospital (enforced at service layer).
After each review, hospital.overall_rating is recalculated.
"""

import uuid
import enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.hospital import Hospital
    from app.models.user import User

class ReviewStatus(str, enum.Enum):
    PENDING = "pending"      # Awaiting admin moderation
    APPROVED = "approved"    # Visible to all users
    REJECTED = "rejected"    # Removed for policy violation

class Review(TimestampedBase):
    __tablename__ = "reviews"

    # Foreign Keys
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hospitals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Ratings (1-5 scale)
    rating_overall: Mapped[int] = mapped_column(Integer, nullable=False)
    rating_cleanliness: Mapped[Optional[int]] = mapped_column(Integer)
    rating_staff: Mapped[Optional[int]] = mapped_column(Integer)
    rating_cost_transparency: Mapped[Optional[int]] = mapped_column(
        Integer,
        comment="Did the final bill match the estimate? 1=Not at all, 5=Exactly matched",
    )
    rating_wait_time: Mapped[Optional[int]] = mapped_column(Integer)

    # Content
    title: Mapped[Optional[str]] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    treatment_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        comment="What procedure/treatment did you receive?",
    )
    visit_date: Mapped[Optional[str]] = mapped_column(String(20))

    # Context
    would_recommend: Mapped[Optional[bool]] = mapped_column(Boolean)
    is_verified_visit: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Admin-verified that this reviewer actually visited the hospital",
    )
    helpful_count: Mapped[int] = mapped_column(Integer, default=0)

    # Moderation
    status: Mapped[ReviewStatus] = mapped_column(
        SAEnum(ReviewStatus),
        default=ReviewStatus.APPROVED,
        index=True,
    )
    admin_note: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    hospital: Mapped["Hospital"] = relationship(back_populates="reviews")
    user: Mapped["User"] = relationship(back_populates="reviews")
