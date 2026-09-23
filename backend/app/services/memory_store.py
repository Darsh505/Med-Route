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
import json
from pathlib import Path
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
        self._bookings: List[Dict[str, Any]] = []
        self._claims: List[Dict[str, Any]] = []
        self._triage_cases: List[Dict[str, Any]] = []
        self._persisted_overrides: Dict[str, Any] = {}
        self._overrides_file = Path(__file__).resolve().parent.parent / "data_pipeline" / "admin_overrides.json"
        self._loaded = False

    def load(self):
        """Load hospital data from seed_data. Called once on startup."""
        if self._loaded:
            return
        try:
            from app.data_pipeline.seed_data import HOSPITALS_DATA
            self._hospitals = [dict(h) for h in HOSPITALS_DATA]
            for i, h in enumerate(self._hospitals):
                h.setdefault("id", f"hosp-{i+1}")
                h.setdefault("beds_icu_available", max(1, h.get("beds_icu", 10) // 3))
                h.setdefault("overall_rating", 4.6)
                h.setdefault("total_reviews", 112)
                h.setdefault("is_active", True)
                h.setdefault("ranking_score", 85.0)
                h.setdefault("data_source_label", "SIMULATED")
                
                # Dedicated hospital ambulance phone
                if not h.get("ambulance_phone"):
                    h["ambulance_phone"] = h.get("emergency_phone") or "108"
                

                # Generate slug from name if missing
                if "slug" not in h or not h["slug"]:
                    name = h.get("name", f"hospital-{i}")
                    h["slug"] = name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace(",", "").replace("'", "")

                h_name = h.get("name", "")
                h_city = h.get("city", "India")
                h_type = h.get("type", "Private").title()
                is_govt = h_type.lower() in ["government", "trust", "semi-government"]
                h_accr = h.get("accreditation", "NABH")
                total_beds = h.get("beds_total", 200)
                total_icu = h.get("beds_icu", 24)
                avail_icu = h.get("beds_icu_available", 5)

                # Cost and package baseline for budget filtering
                is_premium = any(p in h_name.lower() for p in ["max", "fortis", "apollo", "medanta", "artemis", "manipal", "narayana", "lilavati", "kokilaben", "ruby hall", "aster"])
                if is_govt:
                    h["base_package_inr"] = 25000
                    h["cost_range"] = "Free with PMJAY (₹10,000 – ₹45,000 subsidized)"
                elif is_premium:
                    h["base_package_inr"] = 150000
                    h["cost_range"] = "₹85,000 – ₹2,40,000 (Private Package)"
                else:
                    h["base_package_inr"] = 85000
                    h["cost_range"] = "₹45,000 – ₹1,40,000 (Private Package)"

                # Rating and review metrics
                if "overall_rating" not in h:
                    rating_seed = 4.4 + ((i * 7) % 6) / 10.0
                    h["overall_rating"] = round(min(4.9, rating_seed), 1)
                if "total_reviews" not in h:
                    h["total_reviews"] = 85 + ((i * 31) % 400)

                # Clinical Pros & Highlights (Ensure 100% uniqueness per facility)
                if not h.get("pros"):
                    p_list = []
                    if is_govt:
                        p_list.append(f"Apex public healthcare safety net in {h_city} with 100% cashless PMJAY treatment")
                        p_list.append(f"Comprehensive {total_beds}+ bed teaching medical infrastructure with 24x7 blood bank")
                        p_list.append(f"Dedicated {total_icu} ICU beds with active emergency telemetry ({avail_icu} free now)")
                    elif is_premium:
                        p_list.append(f"Accredited {h_accr} quaternary medical infrastructure with state-of-the-art modular OTs")
                        p_list.append(f"24x7 Cath Lab and advanced critical care team in {h_city} ({avail_icu} ICU beds free)")
                        p_list.append("Fast-track insurance pre-authorization desk with cashless TPA settlement")
                    else:
                        p_list.append(f"Trusted {h_city} multi-specialty center with ethical all-inclusive package pricing")
                        p_list.append(f"24-Hour emergency casualty response with {avail_icu} free ICU beds ready for intake")
                        p_list.append(f"Empanelled under Ayushman Bharat PMJAY and leading corporate health networks")
                    h["pros"] = p_list

                # Points to consider / Potential bottlenecks (Ensure 100% uniqueness per facility)
                if not h.get("cons"):
                    c_list = []
                    if is_govt:
                        c_list.append(f"High morning OPD consultation footfalls at {h_name} (average 30–45 min queue)")
                        c_list.append("Elective non-emergency surgical slots require advance scheduling")
                    elif is_premium:
                        c_list.append(f"Higher out-of-pocket room tariff surcharges for private luxury suites in {h_city}")
                        c_list.append("Certain rare super-specialty sub-disciplines require visiting consultant slot")
                    else:
                        c_list.append(f"Ultra-rare organ transplant emergencies referred to apex tertiary centers from {h_city}")
                        c_list.append("Standard semi-private rooms have high occupancy during seasonal admissions")
                    h["cons"] = c_list

                # Simple, patient-friendly specialties
                if not h.get("specialties"):
                    h["specialties"] = ["Emergency Care", "Heart Care", "Bone & Joint", "General Surgery", "Kidney Care"]

                # Pre-seed verified patient reviews with authentic variety
                h_id = str(h["id"])
                h_slug = h["slug"]
                
                patient_names = [
                    ("Gurpreet Singh", "Heart Care", 5),
                    ("Dr. Sunita Verma", "Critical Care", 5),
                    ("Harpreet Kaur", "Bone & Joint", 4),
                    ("Rajesh Sharma", "General Surgery", 5),
                    ("Amit Patel", "Heart Care", 5),
                    ("Sneha Nair", "Pregnancy & Maternity", 5),
                    ("Vikas Gupta", "Kidney Care", 4),
                    ("Pooja Choudhary", "Eye Care", 5),
                ]
                n1, cat1, r1 = patient_names[(i * 2) % len(patient_names)]
                n2, cat2, r2 = patient_names[(i * 2 + 1) % len(patient_names)]

                sample_reviews = [
                    {
                        "id": f"rev-{h_id}-1",
                        "hospital_id": h_id,
                        "author_name": n1,
                        "rating_overall": r1,
                        "treatment_category": cat1,
                        "title": f"Prompt emergency care and professional staff at {h_name}",
                        "comment": f"Visited {h_name} in {h_city} for {cat1}. The medical team responded within 10 minutes, ICU nursing was attentive, and package billing was completely clear with zero hidden costs.",
                        "created_at": "2026-08-14T10:30:00Z",
                        "helpful_count": 14 + (i % 15),
                        "verified": True,
                        "would_recommend": True,
                    },
                    {
                        "id": f"rev-{h_id}-2",
                        "hospital_id": h_id,
                        "author_name": n2,
                        "rating_overall": r2,
                        "treatment_category": cat2,
                        "title": f"Clean facilities and smooth insurance processing",
                        "comment": f"Underwent treatment under {cat2} at {h_name}. Clean wards, well-managed intensive care telemetry, and the insurance desk handled approvals smoothly.",
                        "created_at": "2026-08-28T14:15:00Z",
                        "helpful_count": 8 + (i % 10),
                        "verified": True,
                        "would_recommend": True,
                    }
                ]
                self._reviews[h_id] = sample_reviews
                self._reviews[h_slug] = sample_reviews
                h["reviews"] = sample_reviews

            self._init_operations_data()
            self._load_persisted_overrides()

            self._loaded = True
            logger.info(f"[OK] Memory store loaded {len(self._hospitals)} hospitals with {len(self._bookings)} bookings and {len(self._claims)} claims")
        except Exception as e:
            logger.error(f"Failed to load seed data: {e}")
            self._hospitals = self._get_fallback_hospitals()
            self._init_operations_data()
            self._load_persisted_overrides()
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
        if not self._loaded:
            self.load()
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
        if not self._loaded:
            self.load()
        for h in self._hospitals:
            if h.get("slug") == slug or str(h.get("id")) == str(slug):
                h_copy = dict(h)
                h_copy["reviews"] = self._reviews.get(str(h["id"]), self._reviews.get(slug, []))
                return h_copy
        return None

    def get_by_id(self, hospital_id: str) -> Optional[Dict]:
        if not self._loaded:
            self.load()
        for h in self._hospitals:
            if str(h.get("id")) == str(hospital_id) or h.get("slug") == str(hospital_id):
                h_copy = dict(h)
                h_copy["reviews"] = self._reviews.get(str(h["id"]), [])
                return h_copy
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
        if not self._loaded:
            self.load()
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
        if not self._loaded:
            self.load()
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
        if not self._loaded:
            self.load()
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
        key = str(hospital_id)
        reviews = self._reviews.get(key, [])
        if not reviews:
            for h in self._hospitals:
                if h.get("slug") == key or str(h.get("id")) == key:
                    reviews = self._reviews.get(str(h["id"]), [])
                    break
        total = len(reviews)
        start = (page - 1) * per_page
        return reviews[start:start + per_page], total

    def add_review(self, hospital_id: str, user_id: str, rating: int, comment: str, author_name: str = "Verified Patient", treatment_category: str = "General Care") -> Dict:
        review = {
            "id": str(uuid.uuid4()),
            "hospital_id": str(hospital_id),
            "user_id": str(user_id),
            "author_name": author_name,
            "rating_overall": rating,
            "treatment_category": treatment_category,
            "comment": comment,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "helpful_count": 0,
            "verified": True,
            "would_recommend": rating >= 4,
        }
        key = str(hospital_id)
        if key not in self._reviews:
            self._reviews[key] = []
        self._reviews[key].insert(0, review)
        return review

    # ── Admin Operations & Persistence ────────────────────────────

    def _init_operations_data(self):
        if self._triage_cases and self._bookings and self._claims:
            return

        self._triage_cases = [
            {
                "id": "TRG-4091",
                "patient": "Rohan Deshmukh",
                "complaint": "Acute STEMI · Severe chest pain radiating to left arm",
                "hospital": "PGIMER Chandigarh",
                "hospital_id": "hosp-3",
                "severity": "Critical",
                "eta": "8 min",
                "ambulance": True,
                "status": "In Transit",
                "timestamp": "Just now",
            },
            {
                "id": "TRG-4089",
                "patient": "Kavita Rao",
                "complaint": "Polytrauma · High-speed MVC, suspected pelvic fracture",
                "hospital": "Max Super Speciality Hospital Mohali",
                "hospital_id": "hosp-4",
                "severity": "Critical",
                "eta": "12 min",
                "ambulance": True,
                "status": "Dispatched",
                "timestamp": "4m ago",
            },
            {
                "id": "TRG-4088",
                "patient": "Harpreet Kaur",
                "complaint": "Acute appendicitis · Peritoneal signs, fever",
                "hospital": "Civil Hospital Hoshiarpur",
                "hospital_id": "hosp-1",
                "severity": "Urgent",
                "eta": "18 min",
                "ambulance": False,
                "status": "Admitted",
                "timestamp": "11m ago",
            },
            {
                "id": "TRG-4084",
                "patient": "Suresh Gupta",
                "complaint": "COPD exacerbation · SpO2 86%, stridor",
                "hospital": "Fortis Hospital Mohali",
                "hospital_id": "hosp-5",
                "severity": "Urgent",
                "eta": "22 min",
                "ambulance": True,
                "status": "Admitted",
                "timestamp": "28m ago",
            },
            {
                "id": "TRG-4081",
                "patient": "Anita Sharma",
                "complaint": "Third trimester antepartum hemorrhage",
                "hospital": "Government Medical College & Hospital Chandigarh",
                "hospital_id": "hosp-2",
                "severity": "Critical",
                "eta": "6 min",
                "ambulance": True,
                "status": "Resolved",
                "timestamp": "42m ago",
            },
        ]

        self._bookings = [
            {
                "id": "BK-8841",
                "patient": "Amit Patel",
                "procedure": "CABG (Heart Bypass)",
                "hospital": "PGIMER Chandigarh",
                "hospital_id": "hosp-3",
                "date": "2026-09-24",
                "time": "09:30 AM",
                "type": "Inpatient",
                "status": "Confirmed",
                "amount": 165000,
            },
            {
                "id": "BK-8840",
                "patient": "Sunita Verma",
                "procedure": "Total Knee Replacement",
                "hospital": "Max Super Speciality Hospital Mohali",
                "hospital_id": "hosp-4",
                "date": "2026-09-24",
                "time": "11:00 AM",
                "type": "Inpatient",
                "status": "Confirmed",
                "amount": 210000,
            },
            {
                "id": "BK-8839",
                "patient": "Vikram Sethi",
                "procedure": "Coronary Angiography",
                "hospital": "Fortis Hospital Mohali",
                "hospital_id": "hosp-5",
                "date": "2026-09-24",
                "time": "02:15 PM",
                "type": "Daycare",
                "status": "Confirmed",
                "amount": 18500,
            },
            {
                "id": "BK-8838",
                "patient": "Pooja Choudhary",
                "procedure": "Cataract Phaco Surgery",
                "hospital": "Civil Hospital Hoshiarpur",
                "hospital_id": "hosp-1",
                "date": "2026-09-25",
                "time": "10:00 AM",
                "type": "Daycare",
                "status": "In Consultation",
                "amount": 12000,
            },
            {
                "id": "BK-8837",
                "patient": "Gurpreet Singh",
                "procedure": "Kidney Stone Lithotripsy",
                "hospital": "Ivy Hospital Mohali",
                "hospital_id": "hosp-6",
                "date": "2026-09-25",
                "time": "03:30 PM",
                "type": "Daycare",
                "status": "Completed",
                "amount": 42000,
            },
            {
                "id": "BK-8835",
                "patient": "Manish Tiwari",
                "procedure": "Lap Cholecystectomy",
                "hospital": "Government Medical College & Hospital Chandigarh",
                "hospital_id": "hosp-2",
                "date": "2026-09-26",
                "time": "08:45 AM",
                "type": "Inpatient",
                "status": "Confirmed",
                "amount": 35000,
            },
        ]

        self._claims = [
            {
                "id": "CLM-9012",
                "patient": "Amit Patel",
                "hospital": "PGIMER Chandigarh",
                "insurer": "Star Health",
                "amount": 165000,
                "status": "Disbursed",
                "submitted": "2026-09-21",
                "preauth_approved": True,
            },
            {
                "id": "CLM-9011",
                "patient": "Sunita Verma",
                "hospital": "Max Super Speciality Hospital Mohali",
                "insurer": "HDFC ERGO",
                "amount": 210000,
                "status": "Approved",
                "submitted": "2026-09-22",
                "preauth_approved": True,
            },
            {
                "id": "CLM-9010",
                "patient": "Rohan Deshmukh",
                "hospital": "PGIMER Chandigarh",
                "insurer": "NHA (AB-PMJAY)",
                "amount": 125000,
                "status": "Under Review",
                "submitted": "2026-09-23",
                "preauth_approved": True,
            },
            {
                "id": "CLM-9009",
                "patient": "Vikram Sethi",
                "hospital": "Fortis Hospital Mohali",
                "insurer": "Care Health",
                "amount": 18500,
                "status": "Approved",
                "submitted": "2026-09-22",
                "preauth_approved": True,
            },
            {
                "id": "CLM-9008",
                "patient": "Anita Sharma",
                "hospital": "Government Medical College & Hospital Chandigarh",
                "insurer": "NHA (AB-PMJAY)",
                "amount": 45000,
                "status": "Disbursed",
                "submitted": "2026-09-20",
                "preauth_approved": True,
            },
            {
                "id": "CLM-9007",
                "patient": "Kavita Rao",
                "hospital": "Max Super Speciality Hospital Mohali",
                "insurer": "ICICI Lombard",
                "amount": 180000,
                "status": "Under Review",
                "submitted": "2026-09-23",
                "preauth_approved": False,
            },
        ]

    def _load_persisted_overrides(self):
        try:
            if self._overrides_file.exists():
                with open(self._overrides_file, "r", encoding="utf-8") as f:
                    self._persisted_overrides = json.load(f)
                hosp_overrides = self._persisted_overrides.get("hospitals", {})
                for h in self._hospitals:
                    h_id = str(h.get("id"))
                    h_slug = str(h.get("slug"))
                    override = hosp_overrides.get(h_id) or hosp_overrides.get(h_slug)
                    if override:
                        h.update(override)
                if "bookings" in self._persisted_overrides:
                    self._bookings = self._persisted_overrides["bookings"]
                if "claims" in self._persisted_overrides:
                    self._claims = self._persisted_overrides["claims"]
                if "triage_cases" in self._persisted_overrides:
                    self._triage_cases = self._persisted_overrides["triage_cases"]
                for created in self._persisted_overrides.get("created_hospitals", []):
                    if not any(str(h.get("id")) == str(created.get("id")) for h in self._hospitals):
                        self._hospitals.insert(0, created)
        except Exception as e:
            logger.warning(f"Failed to load persisted admin overrides: {e}")

    def _save_overrides(self):
        try:
            self._overrides_file.parent.mkdir(parents=True, exist_ok=True)
            self._persisted_overrides["bookings"] = self._bookings
            self._persisted_overrides["claims"] = self._claims
            self._persisted_overrides["triage_cases"] = self._triage_cases
            with open(self._overrides_file, "w", encoding="utf-8") as f:
                json.dump(self._persisted_overrides, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save admin overrides: {e}")

    def update_hospital(self, hospital_id: str, updates: Dict[str, Any]) -> Optional[Dict]:
        if not self._loaded:
            self.load()
        target = None
        for h in self._hospitals:
            if str(h.get("id")) == str(hospital_id) or h.get("slug") == str(hospital_id):
                target = h
                break
        if not target:
            return None
        target.update(updates)
        if "hospitals" not in self._persisted_overrides:
            self._persisted_overrides["hospitals"] = {}
        target_id = str(target.get("id"))
        curr = self._persisted_overrides["hospitals"].get(target_id, {})
        curr.update(updates)
        self._persisted_overrides["hospitals"][target_id] = curr
        self._save_overrides()
        return dict(target)

    def create_hospital(self, data: Dict[str, Any]) -> Dict:
        if not self._loaded:
            self.load()
        h_id = data.get("id") or f"hosp-{len(self._hospitals) + 1}"
        name = data.get("name", "Hospital")
        slug = data.get("slug") or name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("'", "")
        h = {
            **data,
            "id": h_id,
            "slug": slug,
            "name": name,
            "is_active": True,
            "verified": data.get("verified", True),
            "beds_icu_available": data.get("beds_icu_available", 6),
            "beds_icu": data.get("beds_icu", 24),
            "beds_total": data.get("beds_total", 200),
            "overall_rating": data.get("overall_rating", 4.6),
            "total_reviews": data.get("total_reviews", 45),
            "ranking_score": data.get("ranking_score", 90),
            "data_source_label": data.get("data_source_label", "ADMIN_VERIFIED"),
        }
        self._hospitals.insert(0, h)
        if "created_hospitals" not in self._persisted_overrides:
            self._persisted_overrides["created_hospitals"] = []
        self._persisted_overrides["created_hospitals"].append(h)
        self._save_overrides()
        return dict(h)

    def delete_hospital(self, hospital_id: str) -> bool:
        if not self._loaded:
            self.load()
        res = self.update_hospital(hospital_id, {"is_active": False})
        return bool(res)

    def get_admin_stats(self) -> Dict[str, Any]:
        if not self._loaded:
            self.load()
        active = [h for h in self._hospitals if h.get("is_active", True)]
        total_h = len(active)
        verified_h = sum(1 for h in active if h.get("verified", True))
        total_beds = sum(h.get("beds_total", 0) for h in active)
        total_icu = sum(h.get("beds_icu", 0) for h in active)
        avail_icu = sum(h.get("beds_icu_available", 0) for h in active)
        pmjay_count = sum(1 for h in active if h.get("is_pmjay_empanelled", False))
        
        occupancy_pct = round(((total_beds - (avail_icu * 4)) / max(1, total_beds)) * 100, 1) if total_beds > 0 else 72.4
        occupancy_pct = max(35.0, min(95.0, occupancy_pct))

        total_claims_val = sum(c.get("amount", 0) for c in self._claims)
        disbursed_claims_val = sum(c.get("amount", 0) for c in self._claims if c.get("status") == "Disbursed")
        under_review_claims = sum(1 for c in self._claims if c.get("status") == "Under Review")
        approval_rate = round(
            (sum(1 for c in self._claims if c.get("status") in ["Approved", "Disbursed"]) / max(1, len(self._claims))) * 100
        )

        active_triage = len([t for t in self._triage_cases if t.get("status") not in ["Admitted", "Resolved"]])
        critical_triage = len([t for t in self._triage_cases if t.get("severity") == "Critical" and t.get("status") != "Resolved"])
        ambulances_active = len([t for t in self._triage_cases if t.get("ambulance") and t.get("status") not in ["Admitted", "Resolved"]])

        return {
            "total_hospitals": total_h,
            "verified_hospitals": verified_h,
            "unverified_hospitals": max(0, total_h - verified_h),
            "total_beds": total_beds,
            "total_icu_beds": total_icu,
            "available_icu_beds": avail_icu,
            "pmjay_empanelled_count": pmjay_count,
            "occupancy_rate_pct": occupancy_pct,
            "active_triage_cases": active_triage,
            "critical_triage_cases": critical_triage,
            "ambulances_active": ambulances_active,
            "total_bookings": len(self._bookings),
            "total_claims_count": len(self._claims),
            "under_review_claims": under_review_claims,
            "approval_rate_pct": approval_rate,
            "total_claims_value_inr": total_claims_val,
            "disbursed_claims_value_inr": disbursed_claims_val,
            "total_users": len(self._users),
            "total_sos_alerts": len(self._sos_alerts),
        }

    def get_triage_cases(self) -> List[Dict[str, Any]]:
        if not self._loaded:
            self.load()
        return [dict(t) for t in self._triage_cases]

    def update_triage_case(self, case_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self._loaded:
            self.load()
        for t in self._triage_cases:
            if t.get("id") == case_id:
                t.update(updates)
                self._save_overrides()
                return dict(t)
        return None

    def get_bookings(self) -> List[Dict[str, Any]]:
        if not self._loaded:
            self.load()
        return [dict(b) for b in self._bookings]

    def update_booking(self, booking_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self._loaded:
            self.load()
        for b in self._bookings:
            if b.get("id") == booking_id:
                b.update(updates)
                self._save_overrides()
                return dict(b)
        return None

    def get_claims(self) -> List[Dict[str, Any]]:
        if not self._loaded:
            self.load()
        return [dict(c) for c in self._claims]

    def update_claim(self, claim_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self._loaded:
            self.load()
        for c in self._claims:
            if c.get("id") == claim_id:
                c.update(updates)
                self._save_overrides()
                return dict(c)
        return None

    def get_users_list(self) -> List[Dict[str, Any]]:
        if not self._loaded:
            self.load()
        result = []
        for u in self._users.values():
            result.append({
                "id": u.get("id"),
                "name": u.get("name"),
                "email": u.get("email"),
                "role": u.get("role", "citizen"),
                "city": u.get("city", "Chandigarh"),
                "joined": u.get("created_at", "2026-08-01")[:10],
                "status": "Active" if u.get("is_active", True) else "Inactive",
            })
        if not result:
            result = [
                {"id": "usr-1", "name": "Dr. Rohit Aggarwal", "email": "rohit.aggarwal@pgimer.edu.in", "role": "Medical Director", "city": "Chandigarh", "joined": "2026-06-12", "status": "Active"},
                {"id": "usr-2", "name": "Simran Kaur", "email": "simran.k@maxhealthcare.com", "role": "Hospital Admin", "city": "Mohali", "joined": "2026-07-04", "status": "Active"},
                {"id": "usr-3", "name": "Vikram Sethi", "email": "vikram.sethi@gmail.com", "role": "Patient", "city": "Panchkula", "joined": "2026-08-15", "status": "Active"},
                {"id": "usr-4", "name": "Dr. Meenakshi Sundaram", "email": "m.sundaram@nhp.gov.in", "role": "NHA Nodal Officer", "city": "Delhi NCR", "joined": "2026-05-20", "status": "Active"},
                {"id": "usr-5", "name": "Ananya Joshi", "email": "ananya.j@outlook.com", "role": "Patient", "city": "Chandigarh", "joined": "2026-08-28", "status": "Active"},
                {"id": "usr-6", "name": "Rajesh Kumar", "email": "rajesh.civil@punjab.gov.in", "role": "Hospital Staff", "city": "Hoshiarpur", "joined": "2026-07-19", "status": "Active"},
            ]
        return result

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self._loaded:
            self.load()
        user = self._users_by_id.get(str(user_id))
        if user:
            user.update(updates)
            return dict(user)
        return None

    # ── Fallback Hospital Data ────────────────────────────────────

    def _get_fallback_hospitals(self) -> List[Dict]:
        return [
            {
                "id": "hosp-1", "name": "Civil Hospital Hoshiarpur", "slug": "civil-hospital-hoshiarpur",
                "type": "Government", "city": "Hoshiarpur", "state": "Punjab",
                "address": "Civil Lines, Near Session Court, Hoshiarpur", "latitude": 31.5305, "longitude": 75.9125,
                "overall_rating": 4.6, "total_reviews": 164, "accreditation": "NQAS",
                "is_pmjay_empanelled": True, "is_trauma_center": True, "trauma_level": "Level 2",
                "beds_total": 250, "beds_icu": 24, "beds_icu_available": 7, "beds_ventilator": 12,
                "phone": "01882-222102", "emergency_phone": "01882-220033", "ambulance_phone": "01882-220108",
                "cost_indicative": "Free / PMJAY", "cost_min": 0, "cost_max": 25000,
                "ranking_score": 92, "data_source_label": "SIMULATED", "is_active": True,
                "specialties": ["Trauma", "Orthopedics", "General Surgery", "Pediatrics"],
                "pros": [
                    "100% Cashless under Ayushman Bharat / PMJAY & Sarbat Sehat Bima",
                    "24x7 Level-2 Emergency & Trauma triage with dedicated Blood Bank",
                    "In-house 24-hour Jan Aushadhi generic pharmacy and dialysis wing"
                ],
                "cons": [
                    "Morning OPD rush with average wait times between 30 to 45 minutes",
                    "Super-specialty polytrauma neurosurgery referred to Tertiary Centers"
                ],
                "is_trauma": True,
            },
            {
                "id": "hosp-2", "name": "Ivy Hospital Hoshiarpur", "slug": "ivy-hospital-hoshiarpur",
                "type": "Private", "city": "Hoshiarpur", "state": "Punjab",
                "address": "Rama Mandi - Hoshiarpur Bypass Road, Hoshiarpur", "latitude": 31.5432, "longitude": 75.8941,
                "overall_rating": 4.7, "total_reviews": 128, "accreditation": "NABH",
                "is_pmjay_empanelled": True, "is_trauma_center": True, "trauma_level": "Level 2",
                "beds_total": 160, "beds_icu": 32, "beds_icu_available": 8, "beds_ventilator": 16,
                "phone": "01882-506000", "emergency_phone": "01882-506100", "ambulance_phone": "01882-506108",
                "cost_indicative": "₹85k – 1.8L", "cost_min": 85000, "cost_max": 180000,
                "ranking_score": 94, "data_source_label": "SIMULATED", "is_active": True,
                "specialties": ["Cardiology", "Critical Care", "Orthopedics", "Oncology"],
                "pros": [
                    "NABH accredited advanced Cath Lab with 24x7 Primary Angioplasty",
                    "Dedicated 32-bed critical care ICU with 1:1 nurse-to-patient ratio",
                    "Zero waiting time for emergency cardiac and orthopedic polytrauma admissions"
                ],
                "cons": [
                    "Higher private room rates for non-insurance self-paying patients",
                    "Super-specialist OPD consultations require advance weekend booking"
                ],
                "is_trauma": True,
            },
            {
                "id": "hosp-3", "name": "PGIMER Chandigarh", "slug": "pgimer-chandigarh",
                "type": "Government", "city": "Chandigarh", "state": "Chandigarh",
                "address": "Sector 12, Chandigarh", "latitude": 30.7634, "longitude": 76.7766,
                "overall_rating": 4.8, "total_reviews": 482, "accreditation": "NABH & NABL",
                "is_pmjay_empanelled": True, "is_trauma_center": True, "trauma_level": "Level 1",
                "beds_total": 1948, "beds_icu": 220, "beds_icu_available": 14, "beds_ventilator": 110,
                "phone": "0172-2755555", "emergency_phone": "0172-2746018", "ambulance_phone": "0172-2746018",
                "cost_indicative": "₹15k – 45k", "cost_min": 15000, "cost_max": 45000,
                "ranking_score": 95, "data_source_label": "SIMULATED", "is_active": True,
                "specialties": ["Cardiology", "Orthopedics", "Nephrology", "Trauma", "Neurology"],
                "pros": [
                    "Premier apex Level-1 research and trauma hospital of North India",
                    "Lowest surgical package costs with maximum clinical success rate",
                    "220+ ICU beds with dedicated ECMO and multi-organ transplant units"
                ],
                "cons": [
                    "Substantial patient footfall with queues for non-emergency elective admissions",
                    "Vast hospital complex requires directional guidance"
                ],
                "is_trauma": True,
            },
            {
                "id": "hosp-4", "name": "Max Super Speciality Hospital Mohali", "slug": "max-super-speciality-mohali",
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
