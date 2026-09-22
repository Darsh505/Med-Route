"""
──────────────────────────────────────────────
services/hospital_service.py — Hospital Data Service
──────────────────────────────────────────────

Supports in-memory mode (no PostgreSQL) and full DB mode.
"""

import math
import uuid
from typing import Optional, List, Tuple, Any

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("hospital_service")


def _is_memory_mode() -> bool:
    from app.database import USE_MEMORY_DB
    return USE_MEMORY_DB


def estimate_travel_time(distance_km: float) -> int:
    """Estimate ambulance arrival time based on distance."""
    if distance_km <= 2:
        return 5
    elif distance_km <= 5:
        return 10
    elif distance_km <= 10:
        return 18
    elif distance_km <= 20:
        return 30
    elif distance_km <= 50:
        return 55
    else:
        return 90


class HospitalService:

    # ── List All ──────────────────────────────────────────────────

    async def list_all(self, db, page=1, per_page=20, city=None, state=None,
                       hospital_type=None, verified_only=False):
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            return memory_store.get_all_hospitals(city=city, state=state,
                                                   hospital_type=hospital_type,
                                                   page=page, per_page=per_page)
        try:
            from sqlalchemy import select, func
            from app.models.hospital import Hospital
            q = select(Hospital).where(Hospital.is_active == True)
            if city:
                q = q.where(Hospital.city.ilike(f"%{city}%"))
            if state:
                q = q.where(Hospital.state.ilike(f"%{state}%"))
            if hospital_type:
                q = q.where(Hospital.type == hospital_type)
            count_q = select(func.count()).select_from(q.subquery())
            total_result = await db.execute(count_q)
            total = total_result.scalar_one()
            q = q.offset((page - 1) * per_page).limit(per_page)
            result = await db.execute(q)
            hospitals = result.scalars().all()
            return hospitals, total
        except Exception as e:
            logger.warning(f"DB list_all failed, using memory: {e}")
            from app.services.memory_store import memory_store
            return memory_store.get_all_hospitals(city=city, state=state,
                                                   hospital_type=hospital_type,
                                                   page=page, per_page=per_page)

    # ── Get by Slug ───────────────────────────────────────────────

    async def get_by_slug(self, db, slug: str):
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            return memory_store.get_by_slug(slug)
        try:
            from sqlalchemy import select
            from app.models.hospital import Hospital
            result = await db.execute(
                select(Hospital).where(Hospital.slug == slug, Hospital.is_active == True)
            )
            hospital = result.scalar_one_or_none()
            if hospital:
                return hospital
        except Exception as e:
            logger.warning(f"DB get_by_slug failed: {e}")
        from app.services.memory_store import memory_store
        return memory_store.get_by_slug(slug)

    # ── Get by ID ─────────────────────────────────────────────────

    async def get_by_id(self, db, hospital_id):
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            return memory_store.get_by_id(str(hospital_id))
        try:
            from sqlalchemy import select
            from app.models.hospital import Hospital
            result = await db.execute(
                select(Hospital).where(Hospital.id == hospital_id)
            )
            h = result.scalar_one_or_none()
            if h:
                return h
        except Exception as e:
            logger.warning(f"DB get_by_id failed: {e}")
        from app.services.memory_store import memory_store
        return memory_store.get_by_id(str(hospital_id))

    # ── Find Nearby ───────────────────────────────────────────────

    async def find_nearby(self, db, lat: float, lng: float, radius_km: float = 50,
                          filters=None, page: int = 1, per_page: int = 20):
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            filter_dict = {}
            if filters:
                if hasattr(filters, 'requires_pmjay'):
                    filter_dict['requires_pmjay'] = filters.requires_pmjay
                if hasattr(filters, 'max_budget'):
                    filter_dict['max_budget'] = filters.max_budget
                if hasattr(filters, 'hospital_types') and filters.hospital_types:
                    filter_dict['hospital_types'] = filters.hospital_types
                if hasattr(filters, 'min_rating'):
                    filter_dict['min_rating'] = filters.min_rating
            return memory_store.find_nearby(lat, lng, radius_km, filter_dict, page, per_page)

        try:
            from sqlalchemy import select, func, text
            from app.models.hospital import Hospital
            from geoalchemy2.functions import ST_DWithin, ST_Distance, ST_MakePoint, ST_GeogFromText
            point = ST_GeogFromText(f"SRID=4326;POINT({lng} {lat})")
            radius_m = radius_km * 1000
            q = select(Hospital).where(
                Hospital.is_active == True,
                ST_DWithin(Hospital.location, point, radius_m),
            )
            result = await db.execute(q.limit(per_page).offset((page - 1) * per_page))
            hospitals = result.scalars().all()
            # Attach distances
            for h in hospitals:
                if h.latitude and h.longitude:
                    h.distance_km = _haversine(lat, lng, h.latitude, h.longitude)
            hospitals.sort(key=lambda h: getattr(h, 'distance_km', 999))
            return hospitals, len(hospitals)
        except Exception as e:
            logger.warning(f"DB find_nearby failed, using memory: {e}")
            from app.services.memory_store import memory_store
            return memory_store.find_nearby(lat, lng, radius_km, {}, page, per_page)

    # ── Find Nearest Trauma Center ────────────────────────────────

    async def find_nearest_trauma_center(self, db, lat: float, lng: float):
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            return memory_store.find_nearest_trauma(lat, lng)
        try:
            from sqlalchemy import select
            from app.models.hospital import Hospital
            result = await db.execute(
                select(Hospital).where(Hospital.is_trauma_center == True, Hospital.is_active == True)
            )
            hospitals = result.scalars().all()
            best = None
            best_dist = float("inf")
            for h in hospitals:
                if h.latitude and h.longitude:
                    dist = _haversine(lat, lng, h.latitude, h.longitude)
                    if dist < best_dist:
                        best_dist = dist
                        best = h
            if best:
                return best, round(best_dist, 2)
        except Exception as e:
            logger.warning(f"DB find_nearest_trauma failed, using memory: {e}")
        from app.services.memory_store import memory_store
        return memory_store.find_nearest_trauma(lat, lng)

    def _find_fallback_nearest_trauma(self, lat: float, lng: float):
        from app.services.memory_store import memory_store
        return memory_store.find_nearest_trauma(lat, lng)

    # ── Create / Update / Delete ──────────────────────────────────

    async def create(self, db, data):
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            h = {**data.model_dump(), "id": f"hosp-{len(memory_store._hospitals)+1}"}
            memory_store._hospitals.append(h)
            return h
        from app.models.hospital import Hospital
        h = Hospital(**data.model_dump(exclude_unset=True))
        db.add(h)
        await db.flush()
        await db.refresh(h)
        return h

    async def update(self, db, hospital, data):
        if _is_memory_mode():
            updates = data.model_dump(exclude_unset=True)
            if isinstance(hospital, dict):
                hospital.update(updates)
                return hospital
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(hospital, field, value)
        await db.flush()
        await db.refresh(hospital)
        return hospital

    async def soft_delete(self, db, hospital):
        if _is_memory_mode():
            if isinstance(hospital, dict):
                hospital["is_active"] = False
            return
        hospital.is_active = False
        await db.flush()


def _haversine(lat1, lng1, lat2, lng2) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


hospital_service = HospitalService()
