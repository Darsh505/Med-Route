"""
──────────────────────────────────────────────
services/hospital_service.py — Hospital Business Logic
──────────────────────────────────────────────

This service handles all hospital-related operations:
1. CRUD operations for hospital records
2. Geospatial "nearby" queries using PostGIS ST_DWithin
3. Transparent ranking algorithm integration

WHY PostGIS instead of Python-side distance calc?
→ PostGIS uses spatial indexes (GiST) which makes radius queries
  O(log n) instead of O(n). With 50k+ hospitals nationally, this
  difference is ~2 seconds vs ~40ms per search.

WHY ST_DWithin instead of ST_Distance < X?
→ ST_DWithin can use the spatial index to filter BEFORE computing
  distances. ST_Distance alone computes distance for every row first,
  then filters — much slower.
"""

import uuid
import math
from typing import Optional

from geoalchemy2.functions import ST_DWithin, ST_Distance, ST_MakePoint, ST_AsText
from sqlalchemy import select, func, and_, or_, cast
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.hospital import Hospital, DataSourceLabel
from app.models.hospital_procedure import HospitalProcedure
from app.models.procedure import Procedure
from app.schemas.hospital import (
    HospitalCreateRequest, HospitalUpdateRequest,
    HospitalResponse, HospitalListItem
)
from app.schemas.search import SearchFilters
from python_slugify import slugify


class HospitalService:
    """Hospital CRUD + geospatial search operations."""

    # ── Read Operations ───────────────────────────────────────────

    async def get_by_slug(
        self,
        db: AsyncSession,
        slug: str,
    ) -> Optional[Hospital]:
        """
        Get hospital by URL slug.
        Includes all related data (procedures, facilities, departments)
        using selectinload to avoid N+1 query problem.
        """
        result = await db.execute(
            select(Hospital)
            .where(Hospital.slug == slug, Hospital.is_active == True)
            .options(
                selectinload(Hospital.hospital_procedures).selectinload(
                    HospitalProcedure.procedure
                ),
                selectinload(Hospital.facilities),
                selectinload(Hospital.departments),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id(
        self,
        db: AsyncSession,
        hospital_id: uuid.UUID,
    ) -> Optional[Hospital]:
        result = await db.execute(
            select(Hospital).where(Hospital.id == hospital_id)
        )
        return result.scalar_one_or_none()

    async def find_nearby(
        self,
        db: AsyncSession,
        lat: float,
        lng: float,
        radius_km: float = 50,
        filters: Optional[SearchFilters] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[Hospital], int]:
        """
        PostGIS radius query — finds hospitals within radius_km of (lat, lng).

        The generated SQL looks like:
            SELECT hospitals.*,
                   ST_Distance(location, ref_point::geography) / 1000 AS distance_km
            FROM hospitals
            WHERE ST_DWithin(location, ref_point::geography, radius_meters)
              AND is_active = true
              [AND type IN (...)]
              [AND is_pmjay_empanelled = true]
            ORDER BY distance_km ASC
            LIMIT 20 OFFSET 0;

        The GiST index on `location` makes the ST_DWithin condition use
        an index scan instead of a full table scan.
        """
        # Reference point as PostGIS geography
        # ST_MakePoint takes (longitude, latitude) — NOTE: X=lng, Y=lat!
        ref_point = ST_MakePoint(lng, lat)

        # Distance column (converted from meters to km)
        distance_col = (
            ST_Distance(Hospital.location, ref_point) / 1000
        ).label("distance_km")

        # Base query — only active hospitals within radius
        stmt = (
            select(Hospital, distance_col)
            .where(
                Hospital.is_active == True,
                ST_DWithin(Hospital.location, ref_point, radius_km * 1000),
            )
        )

        # Apply optional filters
        if filters:
            if filters.hospital_types:
                stmt = stmt.where(Hospital.type.in_(filters.hospital_types))
            if filters.requires_pmjay:
                stmt = stmt.where(Hospital.is_pmjay_empanelled == True)
            if filters.requires_trauma:
                stmt = stmt.where(Hospital.is_trauma_center == True)
            if filters.accreditation:
                stmt = stmt.where(Hospital.accreditation == filters.accreditation)
            if filters.min_rating:
                stmt = stmt.where(Hospital.overall_rating >= filters.min_rating)
            if filters.min_icu_beds:
                stmt = stmt.where(Hospital.beds_icu_available >= filters.min_icu_beds)

        # Get total count (before pagination)
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await db.execute(count_stmt)).scalar_one()

        # Apply sort and pagination
        if filters and filters.sort_by == "rating":
            stmt = stmt.order_by(Hospital.overall_rating.desc())
        elif filters and filters.sort_by == "cost":
            # Cost sort handled at application level after cost lookup
            stmt = stmt.order_by(distance_col)
        else:
            stmt = stmt.order_by(distance_col)  # Default: nearest first

        stmt = stmt.offset((page - 1) * per_page).limit(per_page)
        stmt = stmt.options(
            selectinload(Hospital.facilities),
        )

        results = await db.execute(stmt)
        rows = results.all()

        # Attach distance to each Hospital instance
        hospitals_with_distance = []
        for hospital, dist_km in rows:
            hospital.distance_km = round(dist_km, 2) if dist_km else None
            hospitals_with_distance.append(hospital)

        return hospitals_with_distance, total

    async def find_nearest_trauma_center(
        self,
        db: AsyncSession,
        lat: float,
        lng: float,
        radius_km: float = 100,
    ) -> Optional[tuple[Hospital, float]]:
        """
        SOS: Find the nearest Level-1 Trauma Center.
        Used for emergency dispatch — must be < 100ms.
        """
        ref_point = ST_MakePoint(lng, lat)
        distance_col = (ST_Distance(Hospital.location, ref_point) / 1000).label("distance_km")

        result = await db.execute(
            select(Hospital, distance_col)
            .where(
                Hospital.is_active == True,
                Hospital.is_trauma_center == True,
                ST_DWithin(Hospital.location, ref_point, radius_km * 1000),
            )
            .order_by(distance_col)
            .limit(1)
        )
        row = result.first()
        if row:
            hospital, dist = row
            return hospital, round(dist, 2)
        return None

    async def list_all(
        self,
        db: AsyncSession,
        page: int = 1,
        per_page: int = 20,
        city: Optional[str] = None,
        state: Optional[str] = None,
        hospital_type: Optional[str] = None,
        verified_only: bool = False,
    ) -> tuple[list[Hospital], int]:
        """Paginated list for admin panel and general browsing."""
        stmt = select(Hospital).where(Hospital.is_active == True)

        if city:
            stmt = stmt.where(Hospital.city.ilike(f"%{city}%"))
        if state:
            stmt = stmt.where(Hospital.state.ilike(f"%{state}%"))
        if hospital_type:
            stmt = stmt.where(Hospital.type == hospital_type)
        if verified_only:
            stmt = stmt.where(Hospital.verified == True)

        count = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
        stmt = stmt.order_by(Hospital.overall_rating.desc())
        stmt = stmt.offset((page - 1) * per_page).limit(per_page)

        result = await db.execute(stmt)
        return result.scalars().all(), count

    # ── Write Operations ──────────────────────────────────────────

    async def create(
        self,
        db: AsyncSession,
        data: HospitalCreateRequest,
    ) -> Hospital:
        """Create new hospital. Auto-generates slug from name + city."""
        from geoalchemy2.shape import from_shape
        from shapely.geometry import Point

        slug = await self._generate_unique_slug(db, data.name, data.city)

        # Build PostGIS point from lat/lng
        # IMPORTANT: Point takes (longitude, latitude) — X=lng, Y=lat!
        location = from_shape(Point(data.longitude, data.latitude), srid=4326)

        hospital = Hospital(
            **data.model_dump(exclude={"latitude", "longitude"}),
            latitude=data.latitude,
            longitude=data.longitude,
            location=location,
            slug=slug,
        )
        db.add(hospital)
        await db.flush()
        await db.refresh(hospital)
        return hospital

    async def update(
        self,
        db: AsyncSession,
        hospital: Hospital,
        data: HospitalUpdateRequest,
    ) -> Hospital:
        """Partial update — only modify provided fields."""
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(hospital, field, value)
        await db.flush()
        await db.refresh(hospital)
        return hospital

    async def soft_delete(self, db: AsyncSession, hospital: Hospital) -> None:
        """Soft delete — sets is_active=False, does not remove from DB."""
        hospital.is_active = False
        await db.flush()

    # ── Helpers ───────────────────────────────────────────────────

    async def _generate_unique_slug(
        self, db: AsyncSession, name: str, city: str
    ) -> str:
        """
        Generate URL-friendly slug: 'pgimer-chandigarh'.
        If slug exists, append a number: 'apollo-delhi-2'.
        """
        base_slug = slugify(f"{name} {city}")
        slug = base_slug
        counter = 1
        while True:
            existing = await db.execute(
                select(Hospital).where(Hospital.slug == slug)
            )
            if not existing.scalar_one_or_none():
                return slug
            slug = f"{base_slug}-{counter}"
            counter += 1

    @staticmethod
    def estimate_travel_time(distance_km: float) -> int:
        """
        Rough ambulance travel time estimate in minutes.
        Assumes 40 km/h average in urban traffic (India-realistic).
        """
        return max(5, math.ceil((distance_km / 40) * 60))


hospital_service = HospitalService()
