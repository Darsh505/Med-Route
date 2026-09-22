"""services/compare_service.py — Hospital Comparison"""

import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hospital import Hospital
from app.models.hospital_procedure import HospitalProcedure


class CompareService:

    async def compare(
        self,
        db: AsyncSession,
        hospital_ids: list[uuid.UUID],
        procedure_id: uuid.UUID = None,
    ) -> dict:
        """
        Fetch and normalize comparison data for 2-4 hospitals.

        Returns a structured comparison with:
        - Basic info (name, type, city, rating)
        - Capacity (beds, ICU, emergency)
        - Accreditation (NABH, PMJAY, JCI)
        - Facilities side by side
        - Procedure costs (if procedure_id specified)
        - Ranking score
        """
        # Fetch hospitals with full related data
        result = await db.execute(
            select(Hospital)
            .where(Hospital.id.in_(hospital_ids), Hospital.is_active == True)
            .options(
                selectinload(Hospital.facilities),
                selectinload(Hospital.hospital_procedures).selectinload(
                    HospitalProcedure.procedure
                ),
            )
        )
        hospitals = result.scalars().all()

        # Preserve requested order
        id_to_hospital = {h.id: h for h in hospitals}
        ordered = [id_to_hospital[hid] for hid in hospital_ids if hid in id_to_hospital]

        # Build comparison attribute rows
        attributes = self._build_attributes(ordered)

        # Procedure costs if requested
        proc_costs = None
        if procedure_id:
            proc_costs = {}
            for hospital in ordered:
                for hp in hospital.hospital_procedures:
                    if hp.procedure_id == procedure_id:
                        proc_costs[str(hospital.id)] = {
                            "min": hp.cost_min,
                            "max": hp.cost_max,
                            "pmjay_covered": hp.pmjay_covered,
                            "pmjay_rate": hp.pmjay_package_rate,
                        }

        return {
            "hospitals": [
                {
                    "id": str(h.id),
                    "name": h.name,
                    "city": h.city,
                    "type": h.type,
                    "rating": h.overall_rating,
                    "image_url": h.image_url,
                    "data_source_label": h.data_source_label,
                }
                for h in ordered
            ],
            "attributes": attributes,
            "procedure_costs": proc_costs,
        }

    def _build_attributes(self, hospitals: list) -> list[dict]:
        """Build the comparison rows for the comparison table."""
        def vals(fn):
            return {str(h.id): fn(h) for h in hospitals}

        return [
            {"label": "Hospital Type", "values": vals(lambda h: h.type.value.title()), "section": "overview"},
            {"label": "Overall Rating", "values": vals(lambda h: f"⭐ {h.overall_rating}/5"), "section": "overview", "highlight_best": True},
            {"label": "Total Reviews", "values": vals(lambda h: h.total_reviews), "section": "overview"},
            {"label": "Accreditation", "values": vals(lambda h: h.accreditation or "None"), "section": "quality"},
            {"label": "PMJAY Empanelled", "values": vals(lambda h: "✅ Yes" if h.is_pmjay_empanelled else "❌ No"), "section": "quality"},
            {"label": "Trauma Center", "values": vals(lambda h: "✅ Yes" if h.is_trauma_center else "❌ No"), "section": "quality"},
            {"label": "Total Beds", "values": vals(lambda h: h.beds_total), "section": "capacity", "highlight_best": True},
            {"label": "ICU Beds", "values": vals(lambda h: h.beds_icu), "section": "capacity"},
            {"label": "ICU Available Now", "values": vals(lambda h: f"🟢 {h.beds_icu_available}"), "section": "capacity", "highlight_best": True},
            {"label": "Emergency Beds", "values": vals(lambda h: h.beds_emergency), "section": "capacity"},
            {"label": "Est. Year", "values": vals(lambda h: h.established_year or "N/A"), "section": "info"},
            {"label": "Total Doctors", "values": vals(lambda h: h.total_doctors or "N/A"), "section": "info"},
            {"label": "Emergency Phone", "values": vals(lambda h: h.emergency_phone or "See main no."), "section": "contact"},
        ]


compare_service = CompareService()
