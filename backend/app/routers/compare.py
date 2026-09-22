"""routers/compare.py — Hospital Comparison"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import APIResponse
from app.schemas.compare import CompareRequest, CompareResponse
from app.services.compare_service import compare_service

router = APIRouter(prefix="/api/compare", tags=["Compare"])


@router.get("/procedures", response_model=APIResponse[list[dict]])
async def get_compare_procedures():
    """Get list of standardized AB-PMJAY HBP procedures available for side-by-side comparison."""
    procs = compare_service.get_all_procedures()
    return APIResponse(
        data=procs,
        message=f"Found {len(procs)} standardized procedure packages",
    )


@router.get("", response_model=APIResponse[dict])
async def compare_hospitals_get(
    ids: str = "pgimer-chandigarh,max-mohali",
    procedure: str = "angioplasty",
    db: AsyncSession = Depends(get_db),
):
    """
    Side-by-side comparison of 2-4 hospitals via query parameters.
    ids: comma-separated list of hospital slugs or UUIDs.
    procedure: slug of clinical procedure (e.g., angioplasty, knee-replacement, cabg, c-section).
    """
    hospital_ids = [i.strip() for i in ids.split(",") if i.strip()]
    result = await compare_service.compare(
        db=db,
        hospital_ids=hospital_ids,
        procedure_id=procedure,
    )
    return APIResponse(
        data=result,
        message=f"Comparing {len(hospital_ids)} hospitals for {procedure}",
    )


@router.post("", response_model=APIResponse[dict])
async def compare_hospitals(
    data: CompareRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Side-by-side comparison of 2-4 hospitals.
    Pass hospital UUIDs + optional procedure_id for cost comparison.
    """
    result = await compare_service.compare(
        db=db,
        hospital_ids=data.hospital_ids,
        procedure_id=data.procedure_id,
    )
    return APIResponse(
        data=result,
        message=f"Comparing {len(data.hospital_ids)} hospitals",
    )
