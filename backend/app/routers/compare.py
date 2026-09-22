"""routers/compare.py — Hospital Comparison"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import APIResponse
from app.schemas.compare import CompareRequest, CompareResponse
from app.services.compare_service import compare_service

router = APIRouter(prefix="/api/compare", tags=["Compare"])


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
