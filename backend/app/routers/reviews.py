"""routers/reviews.py — User Review Endpoints"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import APIResponse
from app.schemas.review import ReviewCreateRequest, ReviewResponse, ReviewListResponse
from app.services.review_service import review_service
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(tags=["Reviews"])

@router.get("/api/hospitals/{hospital_id}/reviews", response_model=APIResponse[ReviewListResponse])
async def list_reviews(
    hospital_id: str,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """List reviews for a hospital. Sorted by helpful_count, then date."""
    reviews, total = await review_service.list_reviews(db, hospital_id, page, per_page)
    avg = sum(r.get("rating_overall", getattr(r, "rating_overall", 5)) for r in reviews) / len(reviews) if reviews else 0

    # Rating breakdown
    breakdown = {i: 0 for i in range(1, 6)}
    for r in reviews:
        val = r.get("rating_overall", getattr(r, "rating_overall", 5)) if isinstance(r, dict) else getattr(r, "rating_overall", 5)
        breakdown[val] = breakdown.get(val, 0) + 1

    return APIResponse(
        data=ReviewListResponse(
            reviews=[ReviewResponse.model_validate(r) for r in reviews],
            total=total,
            average_rating=round(avg, 2),
            rating_breakdown=breakdown,
        ),
        message=f"{total} reviews",
    )

@router.post("/api/hospitals/{hospital_id}/reviews", response_model=APIResponse[ReviewResponse], status_code=201)
async def create_review(
    hospital_id: str,
    data: ReviewCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a review for a hospital. Auth required. 1 review per hospital per user."""
    try:
        review = await review_service.create_review(db, hospital_id, current_user.id, data)
        return APIResponse(
            data=ReviewResponse.model_validate(review),
            message="Review submitted",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "REVIEW_ERROR", "message": str(e)})

@router.post("/api/reviews/{review_id}/helpful", response_model=APIResponse[None])
async def mark_helpful(review_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Mark a review as helpful (increments counter)."""
    await review_service.mark_helpful(db, review_id)
    return APIResponse(message="Marked as helpful")
