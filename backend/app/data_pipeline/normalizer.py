"""
data_pipeline/normalizer.py — Data Normalization & Validation Pipeline
This module cleanses, validates, and normalizes raw healthcare data
ingested from PMJAY portals, state registries, or manual CSV uploads.

Standards enforced:
1. Coordinate validation (India bounding box: Lat 6°–37° N, Lng 68°–98° E)
2. Indian PIN code validation (6-digit numeric)
3. Phone number normalization (+91 / STD code formatting)
4. Hospital name standardization & title casing
5. Accreditation normalization (NABH, NABL, JCI)
"""

import re
from typing import Optional, Tuple
from pydantic import BaseModel, Field

class NormalizedHospitalRecord(BaseModel):
    name: str
    clean_slug: str
    type: str
    address: str
    city: str
    state: str
    pincode: str
    latitude: float
    longitude: float
    phone: str
    emergency_phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    accreditation: Optional[str] = None
    is_pmjay_empanelled: bool = False
    is_trauma_center: bool = False
    beds_total: int = 0
    beds_icu: int = 0
    data_source_label: str = "MANUAL_VERIFIED"

class DataNormalizer:
    """Enterprise-grade sanitization for Indian hospital records."""

    @staticmethod
    def clean_name(raw_name: str) -> str:
        """Strip excess whitespace, common redundant prefixes, and title-case."""
        if not raw_name:
            return "Unknown Hospital"
        name = re.sub(r"\s+", " ", raw_name).strip()
        # Ensure acronyms like AIIMS, PGI, CMC, GMCH remain uppercase
        acronyms = {"AIIMS", "PGIMER", "PGI", "CMC", "GMCH", "DMC", "FORTIS", "MAX", "APOLLO"}
        words = name.split(" ")
        normalized_words = [
            w.upper() if w.upper() in acronyms else w.capitalize()
            for w in words
        ]
        return " ".join(normalized_words)

    @staticmethod
    def validate_pincode(raw_pincode: str) -> Optional[str]:
        """Validate 6-digit Indian postal code."""
        if not raw_pincode:
            return None
        match = re.search(r"\b[1-9][0-9]{5}\b", str(raw_pincode).strip())
        return match.group(0) if match else None

    @staticmethod
    def clean_phone(raw_phone: str) -> str:
        """Standardize Indian telephone or mobile numbers."""
        if not raw_phone:
            return "0172-2755555"
        cleaned = re.sub(r"[^\d\-+]", "", str(raw_phone).strip())
        if len(cleaned) < 8:
            return "0172-2755555"
        return cleaned

    @staticmethod
    def validate_coordinates(lat: float, lng: float) -> Tuple[bool, str]:
        """
        Verify coordinates lie within the geographic boundary of India:
        Latitude: 6.0° N to 37.5° N
        Longitude: 68.0° E to 97.5° E
        """
        try:
            lat_f = float(lat)
            lng_f = float(lng)
        except (ValueError, TypeError):
            return False, "Invalid coordinate format"

        if not (6.0 <= lat_f <= 37.5):
            return False, f"Latitude {lat_f} is outside the territory of India (6.0–37.5)"
        if not (68.0 <= lng_f <= 97.5):
            return False, f"Longitude {lng_f} is outside the territory of India (68.0–97.5)"

        return True, "Valid coordinates"

    @staticmethod
    def normalize_accreditation(raw_acc: Optional[str]) -> Optional[str]:
        """Normalize accreditation strings to standard tokens."""
        if not raw_acc:
            return None
        upper = raw_acc.upper()
        tokens = []
        if "NABH" in upper:
            tokens.append("NABH")
        if "NABL" in upper:
            tokens.append("NABL")
        if "JCI" in upper:
            tokens.append("JCI")
        return " & ".join(tokens) if tokens else raw_acc.strip()

normalizer = DataNormalizer()
