"""services/review_service.py — Review CRUD + Rating Updates"""

import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review, ReviewStatus
from app.models.hospital import Hospital
from app.schemas.review import ReviewCreateRequest


class ReviewService:

    async def create_review(
        self,
        db: AsyncSession,
        hospital_id: uuid.UUID,
        user_id: uuid.UUID,
        data: ReviewCreateRequest,
    ) -> Review:
        # Anti-spam: 1 review per user per hospital
        existing = await db.execute(
            select(Review).where(
                Review.hospital_id == hospital_id,
                Review.user_id == user_id,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("You have already reviewed this hospital")

        review = Review(
            hospital_id=hospital_id,
            user_id=user_id,
            **data.model_dump(),
        )
        db.add(review)
        await db.flush()

        # Update hospital's denormalized rating
        await self._recalculate_hospital_rating(db, hospital_id)
        return review

    async def _recalculate_hospital_rating(
        self,
        db: AsyncSession,
        hospital_id: uuid.UUID,
    ) -> None:
        """
        Recalculate overall_rating and total_reviews on hospital.
        Called after any review create/update/delete.
        Only counts APPROVED reviews.
        """
        result = await db.execute(
            select(
                func.avg(Review.rating_overall).label("avg_rating"),
                func.count(Review.id).label("count"),
                func.avg(Review.rating_cost_transparency).label("avg_cost"),
            )
            .where(
                Review.hospital_id == hospital_id,
                Review.status == ReviewStatus.APPROVED,
            )
        )
        stats = result.one()

        hospital = await db.get(Hospital, hospital_id)
        if hospital:
            hospital.overall_rating = round(float(stats.avg_rating or 0), 2)
            hospital.total_reviews = stats.count or 0
            hospital.cost_transparency_rating = round(float(stats.avg_cost or 0), 2)
            await db.flush()

    async def list_reviews(
        self,
        db: AsyncSession,
        hospital_id: uuid.UUID,
        page: int = 1,
        per_page: int = 10,
    ) -> tuple[list[Review], int]:
        stmt = (
            select(Review)
            .where(
                Review.hospital_id == hospital_id,
                Review.status == ReviewStatus.APPROVED,
            )
            .order_by(Review.helpful_count.desc(), Review.created_at.desc())
        )
        total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
        stmt = stmt.offset((page - 1) * per_page).limit(per_page)
        result = await db.execute(stmt)
        return result.scalars().all(), total

    async def mark_helpful(self, db: AsyncSession, review_id: uuid.UUID) -> Review:
        review = await db.get(Review, review_id)
        if review:
            review.helpful_count += 1
            await db.flush()
        return review


review_service = ReviewService()
