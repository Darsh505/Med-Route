"""routers/admin.py — Admin Dashboard Endpoints"""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import APIResponse
from app.models.hospital import Hospital
from app.models.user import User
from app.models.review import Review, ReviewStatus
from app.models.sos_alert import SOSAlert
from app.routers.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=APIResponse[dict])
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin dashboard overview stats."""
    total_hospitals = (await db.execute(select(func.count(Hospital.id)))).scalar_one()
    verified_hospitals = (
        await db.execute(select(func.count(Hospital.id)).where(Hospital.verified == True))
    ).scalar_one()
    pending_reviews = (
        await db.execute(select(func.count(Review.id)).where(Review.status == ReviewStatus.PENDING))
    ).scalar_one()
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()
    total_sos = (await db.execute(select(func.count(SOSAlert.id)))).scalar_one()

    return APIResponse(
        data={
            "total_hospitals": total_hospitals,
            "verified_hospitals": verified_hospitals,
            "unverified_hospitals": total_hospitals - verified_hospitals,
            "pending_reviews": pending_reviews,
            "total_users": total_users,
            "total_sos_alerts": total_sos,
        },
        message="Dashboard stats",
    )


@router.get("/review-queue", response_model=APIResponse[list])
async def get_review_queue(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Hospitals pending admin verification."""
    result = await db.execute(
        select(Hospital)
        .where(Hospital.verified == False, Hospital.is_active == True)
        .order_by(Hospital.created_at.desc())
        .limit(50)
    )
    hospitals = result.scalars().all()
    return APIResponse(
        data=[{"id": str(h.id), "name": h.name, "city": h.city, "type": h.type, "data_source_label": h.data_source_label} for h in hospitals],
        message=f"{len(hospitals)} hospitals pending verification",
    )


@router.patch("/verify/{hospital_id}", response_model=APIResponse[dict])
async def verify_hospital(
    hospital_id: uuid.UUID,
    action: str = Query(..., description="'approve' or 'reject'"),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin: verify or reject a hospital record."""
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail={"code": "HOSPITAL_NOT_FOUND"})

    if action == "approve":
        hospital.verified = True
        from app.models.hospital import DataSourceLabel
        hospital.data_source_label = DataSourceLabel.MANUAL_VERIFIED
        message = f"Hospital '{hospital.name}' verified"
    elif action == "reject":
        hospital.is_active = False
        message = f"Hospital '{hospital.name}' rejected"
    else:
        raise HTTPException(status_code=400, detail={"code": "INVALID_ACTION", "message": "Use 'approve' or 'reject'"})

    await db.flush()
    return APIResponse(data={"hospital_id": str(hospital_id), "action": action}, message=message)


@router.get("/data-sources", response_model=APIResponse[list])
async def list_data_sources(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all data sources in the system."""
    from app.models.data_source import DataSource
    result = await db.execute(select(DataSource).order_by(DataSource.created_at.desc()))
    sources = result.scalars().all()
    return APIResponse(
        data=[{"id": str(s.id), "name": s.name, "type": s.source_type, "records": s.record_count, "last_synced": s.last_synced_at} for s in sources],
        message=f"{len(sources)} data sources",
    )
