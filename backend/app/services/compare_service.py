"""services/compare_service.py — Hospital Comparison with In-Memory Fallback"""

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("compare_service")


def _is_memory_mode() -> bool:
    from app.database import USE_MEMORY_DB
    return USE_MEMORY_DB


class CompareService:

    async def compare(self, db, hospital_ids: list, procedure_id=None) -> dict:
        """Compare hospitals side-by-side."""
        hospitals = []

        for hid in hospital_ids:
            h = await self._get_hospital(db, str(hid))
            if h:
                hospitals.append(h)

        if not hospitals:
            # Fallback to first 3 memory store hospitals
            from app.services.memory_store import memory_store
            hospitals = memory_store.get_all_hospitals(per_page=3)[0]

        return {
            "hospitals": [self._serialize(h) for h in hospitals],
            "attributes": self._get_comparison_attributes(hospitals),
            "procedure_id": str(procedure_id) if procedure_id else None,
        }

    async def _get_hospital(self, db, hospital_id: str):
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            return memory_store.get_by_slug(hospital_id) or memory_store.get_by_id(hospital_id)
        try:
            from app.services.hospital_service import hospital_service
            import uuid
            try:
                h = await hospital_service.get_by_id(db, uuid.UUID(hospital_id))
            except (ValueError, AttributeError):
                h = await hospital_service.get_by_slug(db, hospital_id)
            return h
        except Exception as e:
            logger.warning(f"DB compare get failed, using memory: {e}")
            from app.services.memory_store import memory_store
            return memory_store.get_by_slug(hospital_id) or memory_store.get_by_id(hospital_id)

    def _serialize(self, h) -> dict:
        if isinstance(h, dict):
            return {
                "id": str(h.get("id", "")),
                "name": h.get("name", ""),
                "slug": h.get("slug", ""),
                "type": h.get("type", ""),
                "city": h.get("city", ""),
                "state": h.get("state", ""),
                "address": h.get("address", ""),
                "overall_rating": h.get("overall_rating", 4.5),
                "total_reviews": h.get("total_reviews", 0),
                "accreditation": h.get("accreditation", "NABH"),
                "is_pmjay_empanelled": h.get("is_pmjay_empanelled", False),
                "is_trauma_center": h.get("is_trauma_center", False),
                "trauma_level": h.get("trauma_level", ""),
                "beds_total": h.get("beds_total", 0),
                "beds_icu": h.get("beds_icu", 0),
                "beds_icu_available": h.get("beds_icu_available", 0),
                "beds_ventilator": h.get("beds_ventilator", 0),
                "phone": h.get("phone", ""),
                "emergency_phone": h.get("emergency_phone", ""),
                "cost_indicative": h.get("cost_indicative", ""),
                "ranking_score": h.get("ranking_score", 80),
                "data_source_label": h.get("data_source_label", "SIMULATED"),
                "specialties": h.get("specialties", []),
            }
        # ORM object
        return {
            "id": str(h.id),
            "name": h.name,
            "slug": h.slug,
            "type": h.type.value if hasattr(h.type, 'value') else str(h.type),
            "city": h.city,
            "state": h.state,
            "address": h.address,
            "overall_rating": h.overall_rating or 4.5,
            "total_reviews": h.total_reviews or 0,
            "accreditation": h.accreditation or "",
            "is_pmjay_empanelled": h.is_pmjay_empanelled,
            "is_trauma_center": h.is_trauma_center,
            "trauma_level": h.trauma_level or "",
            "beds_total": h.beds_total or 0,
            "beds_icu": h.beds_icu or 0,
            "beds_icu_available": h.beds_icu_available or 0,
            "beds_ventilator": h.beds_ventilator or 0,
            "phone": h.phone or "",
            "emergency_phone": h.emergency_phone or "",
            "ranking_score": h.ranking_score or 80,
        }

    def _get_comparison_attributes(self, hospitals: list) -> list:
        return [
            {"key": "type", "label": "Ownership Type", "icon": "business"},
            {"key": "accreditation", "label": "Accreditation", "icon": "verified"},
            {"key": "is_pmjay_empanelled", "label": "PMJAY Cashless", "icon": "health_and_safety"},
            {"key": "is_trauma_center", "label": "Trauma Center", "icon": "emergency"},
            {"key": "trauma_level", "label": "Trauma Level", "icon": "grade"},
            {"key": "beds_total", "label": "Total Beds", "icon": "bed"},
            {"key": "beds_icu", "label": "ICU Beds (Total)", "icon": "personal_injury"},
            {"key": "beds_icu_available", "label": "ICU Beds (Available)", "icon": "event_available"},
            {"key": "beds_ventilator", "label": "Ventilator Beds", "icon": "air"},
            {"key": "overall_rating", "label": "Patient Rating", "icon": "star"},
            {"key": "phone", "label": "Main Contact", "icon": "phone"},
            {"key": "emergency_phone", "label": "Emergency Contact", "icon": "e911_emergency"},
            {"key": "cost_indicative", "label": "Cost Range", "icon": "payments"},
        ]


compare_service = CompareService()
