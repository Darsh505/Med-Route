"""schemas/review.py — Review Request & Response Schemas"""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReviewCreateRequest(BaseModel):
    rating_overall: int = Field(..., ge=1, le=5)
    rating_cleanliness: Optional[int] = Field(None, ge=1, le=5)
    rating_staff: Optional[int] = Field(None, ge=1, le=5)
    rating_cost_transparency: Optional[int] = Field(None, ge=1, le=5)
    rating_wait_time: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=200)
    content: str = Field(..., min_length=20, max_length=2000)
    treatment_type: Optional[str] = Field(None, max_length=100)
    visit_date: Optional[str] = None
    would_recommend: Optional[bool] = None


class ReviewResponse(BaseModel):
    id: uuid.UUID
    hospital_id: uuid.UUID
    user_id: uuid.UUID
    user_name: str  # Joined from user
    rating_overall: int
    rating_cleanliness: Optional[int]
    rating_staff: Optional[int]
    rating_cost_transparency: Optional[int]
    rating_wait_time: Optional[int]
    title: Optional[str]
    content: str
    treatment_type: Optional[str]
    would_recommend: Optional[bool]
    is_verified_visit: bool
    helpful_count: int
    created_at: datetime
    model_config = {"from_attributes": True}


class ReviewListResponse(BaseModel):
    reviews: list[ReviewResponse]
    total: int
    average_rating: float
    rating_breakdown: dict  # {1: 5, 2: 10, 3: 20, 4: 30, 5: 80} — count per star
