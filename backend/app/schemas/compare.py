"""schemas/compare.py — Hospital Comparison Schemas"""

import uuid
from typing import Optional
from pydantic import BaseModel, Field


class CompareRequest(BaseModel):
    hospital_ids: list[uuid.UUID] = Field(..., min_length=2, max_length=4)
    procedure_id: Optional[uuid.UUID] = None  # Compare costs for a specific procedure


class ComparisonAttribute(BaseModel):
    label: str
    values: dict[str, Optional[str | int | float | bool]]  # {hospital_id: value}
    highlight_best: bool = True  # Whether to highlight the "best" value


class CompareResponse(BaseModel):
    hospitals: list[dict]  # Basic hospital info for each
    attributes: list[ComparisonAttribute]  # Side-by-side comparison rows
    procedure_costs: Optional[dict] = None  # If procedure_id specified
