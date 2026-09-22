"""schemas/__init__.py — Common response wrappers."""

from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """
    Standard API response envelope for all Med Route endpoints.

    Every response follows this format:
    {
      "success": true,
      "data": {...},
      "message": "Hospitals retrieved successfully",
      "meta": {"total": 42, "page": 1, "per_page": 20, "data_source": "SIMULATED"}
    }
    """
    success: bool = True
    data: Optional[T] = None
    message: str = "OK"
    meta: Optional[dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Standard error envelope."""
    success: bool = False
    error: dict[str, Any]
