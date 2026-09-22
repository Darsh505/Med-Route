"""routers/hospitals.py — Hospital CRUD & Discovery Endpoints"""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import APIResponse
from app.schemas.hospital import (
    HospitalResponse, HospitalListItem,
    HospitalCreateRequest, HospitalUpdateRequest
)
from app.services.hospital_service import hospital_service
from app.routers.auth import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])


@router.get("", response_model=APIResponse[list[HospitalListItem]])
async def list_hospitals(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=50),
    city: Optional[str] = None,
    state: Optional[str] = None,
    type: Optional[str] = None,
    verified_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """List hospitals with optional filters and pagination."""
    hospitals, total = await hospital_service.list_all(
        db, page, per_page, city, state, type, verified_only
    )
    return APIResponse(
        data=[HospitalListItem.model_validate(h) for h in hospitals],
        message=f"{total} hospitals found",
        meta={"total": total, "page": page, "per_page": per_page},
    )


@router.get("/nearby", response_model=APIResponse[list[HospitalListItem]])
async def find_nearby(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude"),
    radius_km: float = Query(default=50, ge=1, le=300),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Find hospitals within radius_km of the given coordinates.
    Results sorted by distance (nearest first).
    Uses PostGIS ST_DWithin with GiST spatial index.
    """
    hospitals, total = await hospital_service.find_nearby(
        db, lat, lng, radius_km, page=page, per_page=per_page
    )
    return APIResponse(
        data=[HospitalListItem.model_validate(h) for h in hospitals],
        message=f"{total} hospitals within {radius_km}km",
        meta={"total": total, "page": page, "per_page": per_page, "radius_km": radius_km},
    )


@router.get("/{slug}", response_model=APIResponse[HospitalResponse])
async def get_hospital(slug: str, db: AsyncSession = Depends(get_db)):
    """Get full hospital details by slug. Includes procedures, facilities, departments."""
    hospital = await hospital_service.get_by_slug(db, slug)
    if not hospital:
        raise HTTPException(
            status_code=404,
            detail={"code": "HOSPITAL_NOT_FOUND", "message": f"No hospital found with slug '{slug}'"},
        )
    data_src = hospital.get("data_source_label", "SIMULATED") if isinstance(hospital, dict) else getattr(hospital, "data_source_label", "SIMULATED")
    return APIResponse(
        data=HospitalResponse.model_validate(hospital),
        message="Hospital retrieved",
        meta={"data_source": data_src},
    )


@router.post("", response_model=APIResponse[HospitalResponse], status_code=201)
async def create_hospital(
    data: HospitalCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin: Create a new hospital record."""
    hospital = await hospital_service.create(db, data)
    return APIResponse(
        data=HospitalResponse.model_validate(hospital),
        message="Hospital created successfully",
    )


@router.patch("/{hospital_id}", response_model=APIResponse[HospitalResponse])
async def update_hospital(
    hospital_id: uuid.UUID,
    data: HospitalUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin: Update hospital fields (PATCH — only provided fields updated)."""
    hospital = await hospital_service.get_by_id(db, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail={"code": "HOSPITAL_NOT_FOUND"})
    hospital = await hospital_service.update(db, hospital, data)
    return APIResponse(
        data=HospitalResponse.model_validate(hospital),
        message="Hospital updated",
    )


@router.delete("/{hospital_id}", status_code=204)
async def delete_hospital(
    hospital_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin: Soft-delete a hospital (sets is_active=False)."""
    hospital = await hospital_service.get_by_id(db, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail={"code": "HOSPITAL_NOT_FOUND"})
    await hospital_service.soft_delete(db, hospital)
