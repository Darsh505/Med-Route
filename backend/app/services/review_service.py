"""services/review_service.py — User Reviews with In-Memory Fallback"""

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("review_service")


def _is_memory_mode() -> bool:
    from app.database import USE_MEMORY_DB
    return USE_MEMORY_DB


class ReviewService:

    async def list_reviews(self, db, hospital_id, page=1, per_page=10):
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            reviews, total = memory_store.get_reviews(str(hospital_id), page, per_page)
            return reviews, total
        try:
            from sqlalchemy import select, func
            from app.models.review import Review
            import uuid
            q = select(Review).where(Review.hospital_id == uuid.UUID(str(hospital_id)))
            count_q = select(func.count()).select_from(q.subquery())
            total = (await db.execute(count_q)).scalar_one()
            result = await db.execute(q.offset((page - 1) * per_page).limit(per_page))
            return result.scalars().all(), total
        except Exception as e:
            logger.warning(f"DB list_reviews failed: {e}")
            from app.services.memory_store import memory_store
            return memory_store.get_reviews(str(hospital_id), page, per_page)

    async def create_review(self, db, hospital_id, user_id, data):
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            return memory_store.add_review(
                hospital_id=str(hospital_id),
                user_id=str(user_id),
                rating=data.rating_overall,
                comment=data.comment or "",
            )
        try:
            from app.models.review import Review
            import uuid
            review = Review(
                hospital_id=uuid.UUID(str(hospital_id)),
                user_id=uuid.UUID(str(user_id)),
                rating_overall=data.rating_overall,
                comment=data.comment,
            )
            db.add(review)
            await db.flush()
            await db.refresh(review)
            return review
        except Exception as e:
            logger.warning(f"DB create_review failed: {e}")
            from app.services.memory_store import memory_store
            return memory_store.add_review(str(hospital_id), str(user_id), data.rating_overall, data.comment)

    async def mark_helpful(self, db, review_id):
        if _is_memory_mode():
            return  # In-memory: no-op
        try:
            from sqlalchemy import select
            from app.models.review import Review
            import uuid
            result = await db.execute(select(Review).where(Review.id == uuid.UUID(str(review_id))))
            review = result.scalar_one_or_none()
            if review:
                review.helpful_count = (review.helpful_count or 0) + 1
                await db.flush()
        except Exception as e:
            logger.warning(f"DB mark_helpful failed: {e}")


review_service = ReviewService()
