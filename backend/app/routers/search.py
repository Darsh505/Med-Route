"""routers/search.py — Natural Language & Structured Search"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import APIResponse
from app.schemas.search import NLSearchRequest, StructuredSearchRequest
from app.services.search_service import search_service
from app.services.hospital_service import hospital_service
from app.ai.nlp_parser import get_nlp_parser, NLPParser

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.post("/nl", response_model=APIResponse[list])
async def natural_language_search(
    request: NLSearchRequest,
    db: AsyncSession = Depends(get_db),
    nlp_parser: NLPParser = Depends(get_nlp_parser),
):
    """
    AI-powered natural language hospital search.

    Example queries:
    - "Find kidney treatment near Chandigarh under 2 lakhs"
    - "NABH accredited cardiac hospital in Delhi with ICU"
    - "Gurdey ka ilaj government hospital Ludhiana"
    - "Emergency orthopedic surgeon near me"

    Returns ranked hospitals with transparent scoring breakdown.
    AI provider (Gemini / rule-based) is indicated in meta.
    """
    hospitals, meta = await search_service.natural_language_search(
        db=db,
        request=request,
        nlp_parser=nlp_parser,
    )

    return APIResponse(
        data=[h.__dict__ for h in hospitals],
        message=f"{len(hospitals)} hospitals found",
        meta=meta.model_dump(),
    )


@router.get("/structured", response_model=APIResponse[list])
async def structured_search(
    city: str = None,
    state: str = None,
    lat: float = None,
    lng: float = None,
    radius_km: float = Query(default=50),
    procedure_category: str = None,
    hospital_type: str = None,
    max_budget: int = None,
    accreditation: str = None,
    requires_pmjay: bool = None,
    min_rating: float = None,
    sort_by: str = "distance",
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Structured filter-based search — used when user applies manual filters.
    No AI/NLP involved. Direct PostGIS query.
    """
    from app.schemas.search import SearchFilters
    filters = SearchFilters(
        procedure_categories=[procedure_category] if procedure_category else [],
        hospital_types=[hospital_type] if hospital_type else [],
        max_budget=max_budget,
        accreditation=accreditation,
        requires_pmjay=requires_pmjay,
        min_rating=min_rating,
        sort_by=sort_by,
        radius_km=radius_km,
    )

    hospitals, total = await hospital_service.find_nearby(
        db=db,
        lat=lat or 30.7333,   # Default: Chandigarh
        lng=lng or 76.7794,
        radius_km=radius_km,
        filters=filters,
        page=page,
        per_page=per_page,
    )

    return APIResponse(
        data=[h.__dict__ for h in hospitals],
        message=f"{total} hospitals match filters",
        meta={"total": total, "page": page, "per_page": per_page},
    )


@router.get("/autocomplete")
async def autocomplete(
    q: str = Query(..., min_length=2),
    db: AsyncSession = Depends(get_db),
):
    """
    Type-ahead autocomplete for hospital names and cities.
    Returns fast suggestions as user types in search bar.
    """
    from sqlalchemy import select, or_
    from app.models.hospital import Hospital

    results = await db.execute(
        select(Hospital.name, Hospital.city, Hospital.slug)
        .where(
            Hospital.is_active == True,
            or_(
                Hospital.name.ilike(f"{q}%"),
                Hospital.city.ilike(f"{q}%"),
            ),
        )
        .limit(8)
    )
    suggestions = [
        {"label": f"{name} — {city}", "slug": slug, "type": "hospital"}
        for name, city, slug in results
    ]
    return APIResponse(data=suggestions, message=f"{len(suggestions)} suggestions")
