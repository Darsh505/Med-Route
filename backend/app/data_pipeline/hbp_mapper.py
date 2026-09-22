"""
──────────────────────────────────────────────
data_pipeline/hbp_mapper.py — PMJAY Health Benefit Package (HBP) Mapper
──────────────────────────────────────────────
Maps Ayushman Bharat PMJAY Health Benefit Package (HBP 2.2 / 2022)
specialty package codes to our normalized procedure schema.

Provides tier-based package reimbursement pricing:
- Tier 1 (Metro cities: Delhi NCR, Mumbai, Bengaluru, etc.) — base rate + 10%
- Tier 2 (State capitals & secondary hubs: Chandigarh, Ludhiana, Jaipur) — base rate
- Tier 3 / Rural (District hospitals, talukas) — base rate - 10%
──────────────────────────────────────────────
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel


class HBPMapping(BaseModel):
    hbp_code: str
    procedure_name: str
    specialty_category: str
    base_package_rate_inr: int
    icd10_code: Optional[str] = None
    pre_auth_required: bool = True
    average_stay_days: int = 3


# Core PMJAY HBP 2.2 Package Master (Aligned with National Health Authority)
HBP_PACKAGE_REGISTRY: Dict[str, HBPMapping] = {
    "MC001": HBPMapping(
        hbp_code="MC001",
        procedure_name="Coronary Angioplasty (Single Stent - Drug Eluting)",
        specialty_category="Cardiology",
        base_package_rate_inr=65000,
        icd10_code="I25.1",
        pre_auth_required=True,
        average_stay_days=2,
    ),
    "MC002": HBPMapping(
        hbp_code="MC002",
        procedure_name="Coronary Artery Bypass Graft (CABG - Off Pump)",
        specialty_category="Cardiothoracic Surgery",
        base_package_rate_inr=130000,
        icd10_code="Z95.1",
        pre_auth_required=True,
        average_stay_days=7,
    ),
    "MO001": HBPMapping(
        hbp_code="MO001",
        procedure_name="Total Knee Arthroplasty (Unilateral)",
        specialty_category="Orthopedics",
        base_package_rate_inr=80000,
        icd10_code="M17.9",
        pre_auth_required=True,
        average_stay_days=4,
    ),
    "MO002": HBPMapping(
        hbp_code="MO002",
        procedure_name="Total Hip Replacement (Cemented)",
        specialty_category="Orthopedics",
        base_package_rate_inr=75000,
        icd10_code="M16.9",
        pre_auth_required=True,
        average_stay_days=5,
    ),
    "EY001": HBPMapping(
        hbp_code="EY001",
        procedure_name="Cataract Surgery (Phacoemulsification with Foldable IOL)",
        specialty_category="Ophthalmology",
        base_package_rate_inr=8500,
        icd10_code="H26.9",
        pre_auth_required=False,
        average_stay_days=1,
    ),
    "NE001": HBPMapping(
        hbp_code="NE001",
        procedure_name="Hemodialysis (Single Session)",
        specialty_category="Nephrology",
        base_package_rate_inr=1500,
        icd10_code="Z49.1",
        pre_auth_required=False,
        average_stay_days=1,
    ),
    "GS001": HBPMapping(
        hbp_code="GS001",
        procedure_name="Laparoscopic Cholecystectomy",
        specialty_category="General Surgery",
        base_package_rate_inr=28000,
        icd10_code="K80.2",
        pre_auth_required=True,
        average_stay_days=2,
    ),
    "OB001": HBPMapping(
        hbp_code="OB001",
        procedure_name="Caesarean Section (LSCS) with Complications",
        specialty_category="Obstetrics & Gynecology",
        base_package_rate_inr=18000,
        icd10_code="O82.0",
        pre_auth_required=False,
        average_stay_days=3,
    ),
    "NS001": HBPMapping(
        hbp_code="NS001",
        procedure_name="Craniotomy for Evacuation of Subdural/Extradural Hematoma",
        specialty_category="Neurosurgery",
        base_package_rate_inr=50000,
        icd10_code="S06.5",
        pre_auth_required=True,
        average_stay_days=6,
    ),
}


class HBPMapper:
    """Utility to map and calculate package rates based on city tier."""

    @staticmethod
    def get_by_code(hbp_code: str) -> Optional[HBPMapping]:
        return HBP_PACKAGE_REGISTRY.get(hbp_code.upper().strip())

    @staticmethod
    def calculate_tiered_rate(hbp_code: str, city_tier: int = 2) -> int:
        """
        Adjust base rate according to NHA guidelines:
        - Tier 1 (+10%): Metro
        - Tier 2 (base rate): Non-metro urban
        - Tier 3 (-10%): Rural / semi-urban
        """
        mapping = HBP_PACKAGE_REGISTRY.get(hbp_code.upper().strip())
        if not mapping:
            return 0

        base = mapping.base_package_rate_inr
        if city_tier == 1:
            return int(base * 1.10)
        elif city_tier == 3:
            return int(base * 0.90)
        return base


hbp_mapper = HBPMapper()
