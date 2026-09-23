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

from typing import Optional, Union, Any

class ReviewResponse(BaseModel):
    id: Union[uuid.UUID, str]
    hospital_id: Union[uuid.UUID, str]
    user_id: Optional[Union[uuid.UUID, str]] = None
    user_name: Optional[str] = "Verified Patient"
    author_name: Optional[str] = "Verified Patient"
    rating_overall: int = 5
    rating_cleanliness: Optional[int] = 5
    rating_staff: Optional[int] = 5
    rating_cost_transparency: Optional[int] = 5
    rating_wait_time: Optional[int] = 4
    title: Optional[str] = None
    content: Optional[str] = None
    comment: Optional[str] = None
    treatment_type: Optional[str] = "General"
    treatment_category: Optional[str] = "General"
    would_recommend: Optional[bool] = True
    is_verified_visit: bool = True
    verified: bool = True
    helpful_count: int = 0
    created_at: Optional[Any] = None
    model_config = {"from_attributes": True}

class ReviewListResponse(BaseModel):
    reviews: list[ReviewResponse]
    total: int
    average_rating: float
    rating_breakdown: dict  # {1: 5, 2: 10, 3: 20, 4: 30, 5: 80} — count per star
