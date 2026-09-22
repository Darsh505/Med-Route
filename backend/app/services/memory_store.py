"""
──────────────────────────────────────────────
services/memory_store.py — In-Memory Data Store
──────────────────────────────────────────────

Provides full API functionality without PostgreSQL.
Loaded from seed_data.py's HOSPITALS_DATA on startup.

Features:
- Haversine distance calculations (replaces PostGIS)
- In-memory hospital search, filter, and ranking
- In-memory user store for auth
- In-memory SOS alert tracking
- In-memory review storage
"""

import math
import uuid
import time
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timezone

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("memory_store")


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate great-circle distance in kilometers using Haversine formula."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class MemoryStore:
    """Central in-memory data store for demonstration mode."""

    def __init__(self):
        self._hospitals: List[Dict[str, Any]] = []
        self._users: Dict[str, Dict[str, Any]] = {}       # email → user dict
        self._users_by_id: Dict[str, Dict[str, Any]] = {} # id → user dict
        self._reviews: Dict[str, List[Dict[str, Any]]] = {}  # hospital_id → reviews
        self._sos_alerts: Dict[str, Dict[str, Any]] = {}  # alert_id → alert
        self._loaded = False

    def load(self):
        """Load hospital data from seed_data. Called once on startup."""
        if self._loaded:
            return
        try:
            from app.data_pipeline.seed_data import HOSPITALS_DATA
            self._hospitals = [dict(h) for h in HOSPITALS_DATA]
            # Ensure each hospital has required fields
            for i, h in enumerate(self._hospitals):
                h.setdefault("id", f"hosp-{i+1}")
                h.setdefault("beds_icu_available", max(1, h.get("beds_icu", 10) // 3))
                h.setdefault("overall_rating", 4.5)
                h.setdefault("total_reviews", 100)
                h.setdefault("is_active", True)
                h.setdefault("ranking_score", 80.0)
                h.setdefault("data_source_label", "SIMULATED")
                # Generate slug from name if missing
                if "slug" not in h or not h["slug"]:
                    name = h.get("name", f"hospital-{i}")
                    h["slug"] = name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace(",", "").replace("'", "")
            self._loaded = True
            logger.info(f"[OK] Memory store loaded {len(self._hospitals)} hospitals")
        except Exception as e:
            logger.error(f"Failed to load seed data: {e}")
            self._hospitals = self._get_fallback_hospitals()
            self._loaded = True

    # ── Hospital Methods ──────────────────────────────────────────

    def get_all_hospitals(
        self,
        city: Optional[str] = None,
        state: Optional[str] = None,
        hospital_type: Optional[str] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> Tuple[List[Dict], int]:
        hospitals = [h for h in self._hospitals if h.get("is_active", True)]
        if city:
            hospitals = [h for h in hospitals if city.lower() in h.get("city", "").lower()]
        if state:
            hospitals = [h for h in hospitals if state.lower() in h.get("state", "").lower()]
        if hospital_type:
            hospitals = [h for h in hospitals if hospital_type.lower() in h.get("type", "").lower()]
        total = len(hospitals)
        start = (page - 1) * per_page
        return hospitals[start:start + per_page], total

    def get_by_slug(self, slug: str) -> Optional[Dict]:
        for h in self._hospitals:
            if h.get("slug") == slug or h.get("id") == slug:
                return h
        return None

    def get_by_id(self, hospital_id: str) -> Optional[Dict]:
        for h in self._hospitals:
            if str(h.get("id")) == str(hospital_id):
                return h
        return None

    def find_nearby(
        self,
        lat: float,
        lng: float,
        radius_km: float = 50,
        filters: Optional[Dict] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> Tuple[List[Dict], int]:
        results = []
        for h in self._hospitals:
            if not h.get("is_active", True):
                continue
            h_lat = h.get("latitude") or h.get("lat")
            h_lng = h.get("longitude") or h.get("lng")
            if h_lat is None or h_lng is None:
                continue
            dist = haversine_km(lat, lng, float(h_lat), float(h_lng))
            if dist <= radius_km:
                h_copy = dict(h)
                h_copy["distance_km"] = round(dist, 2)
                # Apply filters
                if filters:
                    if filters.get("requires_pmjay") and not h_copy.get("is_pmjay_empanelled"):
                        continue
                    if filters.get("max_budget"):
                        budget = filters["max_budget"]
                        cost_min = h_copy.get("cost_min") or 0
                        if cost_min > budget:
                            continue
                    if filters.get("hospital_types") and h_copy.get("type") not in filters["hospital_types"]:
                        continue
                    if filters.get("min_rating"):
                        if h_copy.get("overall_rating", 0) < filters["min_rating"]:
                            continue
                results.append(h_copy)

        results.sort(key=lambda x: x.get("distance_km", 999))
        total = len(results)
        start = (page - 1) * per_page
        return results[start:start + per_page], total

    def find_nearest_trauma(self, lat: float, lng: float) -> Optional[Tuple[Dict, float]]:
        best = None
        best_dist = float("inf")
        for h in self._hospitals:
            if not h.get("is_trauma_center") and not h.get("is_trauma"):
                continue
            h_lat = h.get("latitude") or h.get("lat")
            h_lng = h.get("longitude") or h.get("lng")
            if h_lat is None or h_lng is None:
                continue
            dist = haversine_km(lat, lng, float(h_lat), float(h_lng))
            if dist < best_dist:
                best_dist = dist
                best = h
        if best:
            return dict(best), round(best_dist, 2)
        # Ultimate fallback
        if self._hospitals:
            h = self._hospitals[0]
            return dict(h), 5.0
        return None

    def search(self, query: str, filters: Optional[Dict] = None, lat: float = 30.7333, lng: float = 76.7794) -> List[Dict]:
        """Simple keyword search with optional filters and distance calculation."""
        q = query.lower().strip()
        results = []

        # Map common Hindi/medical terms
        term_map = {
            "dil": "cardiac", "dil ka": "cardiac", "heart": "cardiac",
            "ghutna": "orthopedic", "knee": "orthopedic", "joint": "orthopedic",
            "gurda": "renal", "kidney": "renal", "dialysis": "renal",
            "aankhon": "ophthalmology", "eye": "ophthalmology",
            "dimag": "neurological", "brain": "neurological", "stroke": "neurological",
            "cancer": "oncology", "tumor": "oncology",
            "baby": "pediatric", "bachche": "pediatric", "child": "pediatric",
            "pregnancy": "gynecology", "delivery": "gynecology",
            "saans": "pulmonology", "asthma": "pulmonology", "lungs": "pulmonology",
            "pet": "gastroenterology", "liver": "gastroenterology", "stomach": "gastroenterology",
        }
        for term, mapped in term_map.items():
            if term in q:
                q = q + " " + mapped

        for h in self._hospitals:
            if not h.get("is_active", True):
                continue
            score = 0
            name = h.get("name", "").lower()
            city = h.get("city", "").lower()
            state = h.get("state", "").lower()
            h_type = h.get("type", "").lower()
            specs = " ".join(h.get("specialties", [])).lower()
            departments = " ".join(h.get("departments", [])).lower()

            if q in name:
                score += 50
            if any(word in name for word in q.split()):
                score += 20
            if any(word in city or word in state for word in q.split()):
                score += 15
            if any(word in specs or word in departments for word in q.split()):
                score += 25
            if any(word in h_type for word in q.split()):
                score += 10

            # PMJAY filter
            if filters and filters.get("requires_pmjay") and not h.get("is_pmjay_empanelled"):
                continue
            # Budget filter
            if filters and filters.get("max_budget"):
                cost_min = h.get("cost_min") or 0
                if cost_min > filters["max_budget"]:
                    continue

            if score > 0 or not q:
                h_copy = dict(h)
                # Add distance
                h_lat = h.get("latitude") or h.get("lat")
                h_lng = h.get("longitude") or h.get("lng")
                if h_lat and h_lng:
                    h_copy["distance_km"] = round(haversine_km(lat, lng, float(h_lat), float(h_lng)), 2)
                h_copy["_search_score"] = score + h.get("overall_rating", 0) * 5
                results.append(h_copy)

        results.sort(key=lambda x: -x.get("_search_score", 0))
        return results[:20]

    def compare(self, slugs_or_ids: List[str]) -> List[Dict]:
        results = []
        for sid in slugs_or_ids:
            h = self.get_by_slug(sid) or self.get_by_id(sid)
            if h:
                results.append(dict(h))
        return results

    # ── User / Auth Methods ───────────────────────────────────────

    def get_user_by_email(self, email: str) -> Optional[Dict]:
        return self._users.get(email.lower())

    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        return self._users_by_id.get(str(user_id))

    def create_user(self, name: str, email: str, password_hash: str, role: str = "citizen", phone: Optional[str] = None) -> Dict:
        uid = str(uuid.uuid4())
        user = {
            "id": uid,
            "name": name,
            "email": email.lower(),
            "phone": phone,
            "password_hash": password_hash,
            "role": role,
            "is_active": True,
            "is_email_verified": False,
            "avatar_url": None,
            "city": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._users[email.lower()] = user
        self._users_by_id[uid] = user
        return user

    # ── SOS Alert Methods ─────────────────────────────────────────

    def create_sos_alert(self, lat: float, lng: float, hospital_name: str, hospital_phone: str,
                          distance_km: float, eta_minutes: int, hospital_id: str = "") -> Dict:
        alert_id = str(uuid.uuid4())
        alert = {
            "id": alert_id,
            "status": "dispatched",
            "latitude": lat,
            "longitude": lng,
            "hospital_name": hospital_name,
            "hospital_phone": hospital_phone,
            "hospital_id": hospital_id,
            "distance_km": distance_km,
            "estimated_arrival_minutes": eta_minutes,
            "ambulance_number": f"PB-{10000 + len(self._sos_alerts)}",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._sos_alerts[alert_id] = alert
        return alert

    def get_sos_alert(self, alert_id: str) -> Optional[Dict]:
        return self._sos_alerts.get(str(alert_id))

    # ── Review Methods ────────────────────────────────────────────

    def get_reviews(self, hospital_id: str, page: int = 1, per_page: int = 10) -> Tuple[List[Dict], int]:
        reviews = self._reviews.get(str(hospital_id), [])
        total = len(reviews)
        start = (page - 1) * per_page
        return reviews[start:start + per_page], total

    def add_review(self, hospital_id: str, user_id: str, rating: int, comment: str) -> Dict:
        review = {
            "id": str(uuid.uuid4()),
            "hospital_id": str(hospital_id),
            "user_id": str(user_id),
            "rating_overall": rating,
            "comment": comment,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "helpful_count": 0,
        }
        key = str(hospital_id)
        if key not in self._reviews:
            self._reviews[key] = []
        self._reviews[key].insert(0, review)
        return review

    # ── Fallback Hospital Data ────────────────────────────────────

    def _get_fallback_hospitals(self) -> List[Dict]:
        return [
            {
                "id": "hosp-1", "name": "PGIMER Chandigarh", "slug": "pgimer-chandigarh",
                "type": "Government", "city": "Chandigarh", "state": "Chandigarh",
                "address": "Sector 12, Chandigarh", "latitude": 30.7634, "longitude": 76.7766,
                "overall_rating": 4.8, "total_reviews": 482, "accreditation": "NABH & NABL",
                "is_pmjay_empanelled": True, "is_trauma_center": True, "trauma_level": "Level 1",
                "beds_total": 1948, "beds_icu": 220, "beds_icu_available": 14, "beds_ventilator": 110,
                "phone": "0172-2755555", "emergency_phone": "0172-2746018",
                "cost_indicative": "₹15k – 45k", "cost_min": 15000, "cost_max": 45000,
                "ranking_score": 95, "data_source_label": "SIMULATED", "is_active": True,
                "specialties": ["Cardiology", "Orthopedics", "Nephrology", "Trauma", "Neurology"],
                "is_trauma": True,
            },
            {
                "id": "hosp-2", "name": "Max Super Speciality Hospital Mohali", "slug": "max-super-speciality-mohali",
                "type": "Private", "city": "Mohali", "state": "Punjab",
                "address": "Phase VI, SAS Nagar, Mohali", "latitude": 30.7271, "longitude": 76.7193,
                "overall_rating": 4.6, "total_reviews": 312, "accreditation": "NABH & JCI",
                "is_pmjay_empanelled": True, "is_trauma_center": True, "trauma_level": "Level 2",
                "beds_total": 280, "beds_icu": 52, "beds_icu_available": 6, "beds_ventilator": 28,
                "phone": "0172-6652000", "emergency_phone": "0172-6652100",
                "cost_indicative": "₹1.4L – 2.8L", "cost_min": 140000, "cost_max": 280000,
                "ranking_score": 92, "data_source_label": "SIMULATED", "is_active": True,
                "specialties": ["Cardiology", "Oncology", "Neurology", "Orthopedics"],
                "is_trauma": True,
            },
            {
                "id": "hosp-3", "name": "Fortis Hospital Mohali", "slug": "fortis-hospital-mohali",
                "type": "Private", "city": "Mohali", "state": "Punjab",
                "address": "Sector 62, Phase 8, Mohali", "latitude": 30.7046, "longitude": 76.7179,
                "overall_rating": 4.5, "total_reviews": 236, "accreditation": "JCI & NABH",
                "is_pmjay_empanelled": False, "is_trauma_center": True, "trauma_level": "Level 2",
                "beds_total": 355, "beds_icu": 68, "beds_icu_available": 9, "beds_ventilator": 42,
                "phone": "0172-4692222", "emergency_phone": "0172-4692200",
                "cost_indicative": "₹1.5L – 3.2L", "cost_min": 150000, "cost_max": 320000,
                "ranking_score": 88, "data_source_label": "SIMULATED", "is_active": True,
                "specialties": ["Cardiology", "Robotic Orthopedics", "Cardiac Surgery"],
                "is_trauma": True,
            },
        ]


# Global singleton
memory_store = MemoryStore()
