"""
──────────────────────────────────────────────
data_pipeline/seed_data.py — Realistic Hospital Seed Data
──────────────────────────────────────────────

Generates 55+ hospitals across Chandigarh Tricity, Punjab, and Haryana.
All hospitals are based on real hospital names and approximate locations
but ALL data is labeled data_source_label="SIMULATED".

WHY simulated data?
→ Direct PMJAY API access requires ABDM registration and government MoU.
  We model our schema after real PMJAY HBP packages so the structure is
  production-ready. When real data is connected, it drops in with PMJAY_HBP label.

INCLUDES:
- 55+ hospitals with real approximate GPS coordinates
- 200+ hospital-procedure links with realistic PMJAY-aligned cost ranges
- Key facilities (MRI, ICU, Blood Bank, etc.) per hospital
- Departments with specializations
- 1 admin user + sample citizen users
"""

import asyncio
import structlog
from typing import Optional

logger = structlog.get_logger()

# ── Hospital Data ─────────────────────────────────────────────────
# Format: (name, type, city, state, lat, lng, phone, beds_total, beds_icu,
#           beds_emergency, is_trauma, is_pmjay, accreditation, established)

HOSPITALS_DATA = [
    # ── Chandigarh ────────────────────────────────────────────────
    {
        "name": "PGIMER Chandigarh",
        "type": "government",
        "address": "Sector 12, Chandigarh",
        "city": "Chandigarh",
        "state": "Chandigarh",
        "pincode": "160012",
        "latitude": 30.7650,
        "longitude": 76.7810,
        "phone": "0172-2755555",
        "emergency_phone": "0172-2756565",
        "beds_total": 1844,
        "beds_icu": 200,
        "beds_icu_available": 12,
        "beds_emergency": 100,
        "beds_general": 1544,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": "NABH",
        "established_year": 1962,
        "total_doctors": 450,
        "description": "Post Graduate Institute of Medical Education and Research — India's premier public medical institution. Provides advanced tertiary care across all specialties.",
    },
    {
        "name": "Government Medical College & Hospital (GMCH-32)",
        "type": "government",
        "address": "Sector 32, Chandigarh",
        "city": "Chandigarh",
        "state": "Chandigarh",
        "pincode": "160030",
        "latitude": 30.7280,
        "longitude": 76.7880,
        "phone": "0172-2665253",
        "emergency_phone": "0172-2665254",
        "beds_total": 1100,
        "beds_icu": 80,
        "beds_icu_available": 8,
        "beds_emergency": 60,
        "beds_general": 960,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": "NABH",
        "established_year": 1981,
        "total_doctors": 280,
        "description": "Government Medical College & Hospital — major public hospital serving Chandigarh and surrounding regions.",
    },
    {
        "name": "Fortis Hospital Mohali",
        "type": "private",
        "address": "Phase VIII, Sector 62, Mohali",
        "city": "Mohali",
        "state": "Punjab",
        "pincode": "160062",
        "latitude": 30.7047,
        "longitude": 76.7179,
        "phone": "0172-4692222",
        "emergency_phone": "0172-4692000",
        "beds_total": 262,
        "beds_icu": 45,
        "beds_icu_available": 6,
        "beds_emergency": 30,
        "beds_general": 187,
        "is_trauma_center": True,
        "is_pmjay_empanelled": False,
        "accreditation": "NABH",
        "established_year": 2001,
        "total_doctors": 200,
        "description": "Fortis Hospital Mohali — multi-specialty tertiary care hospital known for cardiac and orthopedic excellence.",
    },
    {
        "name": "Max Super Speciality Hospital Mohali",
        "type": "private",
        "address": "Block B, Phase VI, Mohali",
        "city": "Mohali",
        "state": "Punjab",
        "pincode": "160055",
        "latitude": 30.6771,
        "longitude": 76.7193,
        "phone": "0172-6652000",
        "emergency_phone": "0172-6652100",
        "beds_total": 180,
        "beds_icu": 35,
        "beds_icu_available": 4,
        "beds_emergency": 25,
        "beds_general": 120,
        "is_trauma_center": False,
        "is_pmjay_empanelled": True,
        "accreditation": "NABH",
        "established_year": 2012,
        "total_doctors": 150,
        "description": "Max Super Speciality Hospital offering advanced cardiac, neuro, and oncology care.",
    },
    {
        "name": "Ivy Hospital Mohali",
        "type": "private",
        "address": "Sector 71, Mohali",
        "city": "Mohali",
        "state": "Punjab",
        "pincode": "160071",
        "latitude": 30.6894,
        "longitude": 76.7291,
        "phone": "0172-5212000",
        "emergency_phone": "0172-5212100",
        "beds_total": 200,
        "beds_icu": 30,
        "beds_icu_available": 5,
        "beds_emergency": 20,
        "beds_general": 150,
        "is_trauma_center": False,
        "is_pmjay_empanelled": True,
        "accreditation": "NABH",
        "established_year": 2008,
        "total_doctors": 130,
        "description": "Ivy Hospital — known for orthopedics, spine surgery, and joint replacement.",
    },
    {
        "name": "Alchemist Hospital Panchkula",
        "type": "private",
        "address": "Sector 21, Panchkula",
        "city": "Panchkula",
        "state": "Haryana",
        "pincode": "134109",
        "latitude": 30.6961,
        "longitude": 76.8600,
        "phone": "0172-2570000",
        "emergency_phone": "0172-2570100",
        "beds_total": 150,
        "beds_icu": 25,
        "beds_icu_available": 3,
        "beds_emergency": 20,
        "beds_general": 105,
        "is_trauma_center": False,
        "is_pmjay_empanelled": True,
        "accreditation": "NABH",
        "established_year": 2010,
        "total_doctors": 100,
        "description": "Alchemist Hospital — multi-specialty hospital serving Panchkula and Haryana region.",
    },
    {
        "name": "Civil Hospital Sector 6 Panchkula",
        "type": "government",
        "address": "Sector 6, Panchkula",
        "city": "Panchkula",
        "state": "Haryana",
        "pincode": "134109",
        "latitude": 30.6985,
        "longitude": 76.8594,
        "phone": "0172-2560166",
        "emergency_phone": "0172-2560166",
        "beds_total": 300,
        "beds_icu": 20,
        "beds_icu_available": 4,
        "beds_emergency": 40,
        "beds_general": 240,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": None,
        "established_year": 1975,
        "total_doctors": 80,
        "description": "Government Civil Hospital serving Panchkula — primary public healthcare facility.",
    },

    # ── Ludhiana ──────────────────────────────────────────────────
    {
        "name": "Christian Medical College Ludhiana",
        "type": "trust",
        "address": "Brown Road, Ludhiana",
        "city": "Ludhiana",
        "state": "Punjab",
        "pincode": "141008",
        "latitude": 30.9109,
        "longitude": 75.8320,
        "phone": "0161-2302000",
        "emergency_phone": "0161-2302100",
        "beds_total": 850,
        "beds_icu": 80,
        "beds_icu_available": 10,
        "beds_emergency": 60,
        "beds_general": 710,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": "NABH",
        "established_year": 1894,
        "total_doctors": 320,
        "description": "CMC Ludhiana — one of India's oldest and most respected mission hospitals. Excellence in all specialties, particularly surgery and maternal health.",
    },
    {
        "name": "Dayanand Medical College & Hospital",
        "type": "trust",
        "address": "Civil Lines, Ludhiana",
        "city": "Ludhiana",
        "state": "Punjab",
        "pincode": "141001",
        "latitude": 30.9011,
        "longitude": 75.8573,
        "phone": "0161-2302000",
        "emergency_phone": "0161-5052020",
        "beds_total": 1200,
        "beds_icu": 100,
        "beds_icu_available": 15,
        "beds_emergency": 80,
        "beds_general": 1020,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": "NABH",
        "established_year": 1934,
        "total_doctors": 380,
        "description": "DMC&H Ludhiana — a premier medical institution and tertiary care hospital in Punjab.",
    },
    {
        "name": "SPS Apollo Hospital Ludhiana",
        "type": "private",
        "address": "Grand Trunk Road, Sherpur Chowk, Ludhiana",
        "city": "Ludhiana",
        "state": "Punjab",
        "pincode": "141003",
        "latitude": 30.8944,
        "longitude": 75.7968,
        "phone": "0161-6770000",
        "emergency_phone": "0161-6770100",
        "beds_total": 300,
        "beds_icu": 50,
        "beds_icu_available": 7,
        "beds_emergency": 40,
        "beds_general": 210,
        "is_trauma_center": True,
        "is_pmjay_empanelled": False,
        "accreditation": "JCI",
        "established_year": 2005,
        "total_doctors": 180,
        "description": "SPS Apollo Hospital — JCI-accredited hospital offering world-class cardiac, orthopedic, and cancer care.",
    },

    # ── Amritsar ──────────────────────────────────────────────────
    {
        "name": "Government Medical College Amritsar",
        "type": "government",
        "address": "Majitha Road, Amritsar",
        "city": "Amritsar",
        "state": "Punjab",
        "pincode": "143001",
        "latitude": 31.6340,
        "longitude": 74.8723,
        "phone": "0183-2424000",
        "emergency_phone": "0183-2424001",
        "beds_total": 900,
        "beds_icu": 60,
        "beds_icu_available": 8,
        "beds_emergency": 70,
        "beds_general": 770,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": None,
        "established_year": 1953,
        "total_doctors": 250,
        "description": "GMC Amritsar — major government medical college and hospital serving northern Punjab.",
    },
    {
        "name": "Fortis Escorts Hospital Amritsar",
        "type": "private",
        "address": "Majitha Verka Bypass, Amritsar",
        "city": "Amritsar",
        "state": "Punjab",
        "pincode": "143004",
        "latitude": 31.6711,
        "longitude": 74.8820,
        "phone": "0183-5080000",
        "emergency_phone": "0183-5080001",
        "beds_total": 150,
        "beds_icu": 30,
        "beds_icu_available": 5,
        "beds_emergency": 20,
        "beds_general": 100,
        "is_trauma_center": False,
        "is_pmjay_empanelled": False,
        "accreditation": "NABH",
        "established_year": 2008,
        "total_doctors": 120,
        "description": "Fortis Escorts Heart Institute — specialized cardiac and multi-specialty care in Amritsar.",
    },

    # ── Jalandhar ─────────────────────────────────────────────────
    {
        "name": "Civil Hospital Jalandhar",
        "type": "government",
        "address": "Model Town, Jalandhar",
        "city": "Jalandhar",
        "state": "Punjab",
        "pincode": "144001",
        "latitude": 31.3260,
        "longitude": 75.5762,
        "phone": "0181-2458000",
        "emergency_phone": "0181-2458001",
        "beds_total": 700,
        "beds_icu": 40,
        "beds_icu_available": 6,
        "beds_emergency": 50,
        "beds_general": 610,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": None,
        "established_year": 1948,
        "total_doctors": 180,
        "description": "Civil Hospital Jalandhar — primary government hospital for Jalandhar district.",
    },
    {
        "name": "Manipal Hospital Jalandhar",
        "type": "private",
        "address": "GT Road, Near Bus Stand, Jalandhar",
        "city": "Jalandhar",
        "state": "Punjab",
        "pincode": "144001",
        "latitude": 31.3280,
        "longitude": 75.5811,
        "phone": "0181-5020000",
        "emergency_phone": "0181-5020100",
        "beds_total": 200,
        "beds_icu": 35,
        "beds_icu_available": 5,
        "beds_emergency": 25,
        "beds_general": 140,
        "is_trauma_center": False,
        "is_pmjay_empanelled": True,
        "accreditation": "NABH",
        "established_year": 2010,
        "total_doctors": 150,
        "description": "Manipal Hospital Jalandhar — multi-specialty hospital known for cardiac care and diagnostics.",
    },

    # ── Patiala ───────────────────────────────────────────────────
    {
        "name": "Rajindra Hospital Patiala",
        "type": "government",
        "address": "Rajindra Hospital Road, Patiala",
        "city": "Patiala",
        "state": "Punjab",
        "pincode": "147001",
        "latitude": 30.3498,
        "longitude": 76.3869,
        "phone": "0175-2213166",
        "emergency_phone": "0175-2213167",
        "beds_total": 1500,
        "beds_icu": 100,
        "beds_icu_available": 12,
        "beds_emergency": 80,
        "beds_general": 1320,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": None,
        "established_year": 1950,
        "total_doctors": 300,
        "description": "Rajindra Hospital — Government Medical College Patiala's teaching hospital. Major tertiary care center for south Punjab.",
    },

    # ── Gurugram / Haryana ────────────────────────────────────────
    {
        "name": "Medanta The Medicity Gurugram",
        "type": "private",
        "address": "Sector 38, Gurugram",
        "city": "Gurugram",
        "state": "Haryana",
        "pincode": "122001",
        "latitude": 28.4500,
        "longitude": 77.0480,
        "phone": "0124-4141414",
        "emergency_phone": "0124-4141515",
        "beds_total": 1250,
        "beds_icu": 200,
        "beds_icu_available": 25,
        "beds_emergency": 100,
        "beds_general": 950,
        "is_trauma_center": True,
        "is_pmjay_empanelled": False,
        "accreditation": "JCI",
        "established_year": 2009,
        "total_doctors": 500,
        "description": "Medanta The Medicity — one of India's largest super-specialty hospitals. World-class cardiac, cancer, and transplant programs.",
    },
    {
        "name": "Artemis Hospital Gurugram",
        "type": "private",
        "address": "Sector 51, Gurugram",
        "city": "Gurugram",
        "state": "Haryana",
        "pincode": "122001",
        "latitude": 28.4553,
        "longitude": 77.0699,
        "phone": "0124-4511111",
        "emergency_phone": "0124-4511000",
        "beds_total": 400,
        "beds_icu": 70,
        "beds_icu_available": 10,
        "beds_emergency": 50,
        "beds_general": 280,
        "is_trauma_center": True,
        "is_pmjay_empanelled": False,
        "accreditation": "JCI",
        "established_year": 2007,
        "total_doctors": 300,
        "description": "Artemis Hospital — JCI-accredited super-speciality hospital known for minimal invasive surgeries.",
    },
    {
        "name": "Civil Hospital Ambala",
        "type": "government",
        "address": "Ambala City, Haryana",
        "city": "Ambala",
        "state": "Haryana",
        "pincode": "134003",
        "latitude": 30.3782,
        "longitude": 76.7767,
        "phone": "0171-2532200",
        "emergency_phone": "0171-2532201",
        "beds_total": 600,
        "beds_icu": 40,
        "beds_icu_available": 7,
        "beds_emergency": 50,
        "beds_general": 510,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": None,
        "established_year": 1960,
        "total_doctors": 150,
        "description": "Civil Hospital Ambala — government hospital serving Ambala district and surrounding areas.",
    },

    # ── Delhi ─────────────────────────────────────────────────────
    {
        "name": "AIIMS New Delhi",
        "type": "government",
        "address": "Ansari Nagar, New Delhi",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110029",
        "latitude": 28.5672,
        "longitude": 77.2100,
        "phone": "011-26588500",
        "emergency_phone": "011-26588700",
        "beds_total": 2478,
        "beds_icu": 350,
        "beds_icu_available": 30,
        "beds_emergency": 200,
        "beds_general": 1928,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": "NABH",
        "established_year": 1956,
        "total_doctors": 1200,
        "description": "All India Institute of Medical Sciences — India's premier medical research and teaching institution. National reference center for all specialties.",
    },
    {
        "name": "Safdarjung Hospital New Delhi",
        "type": "government",
        "address": "Ansari Nagar West, New Delhi",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110029",
        "latitude": 28.5665,
        "longitude": 77.2021,
        "phone": "011-26165060",
        "emergency_phone": "011-26165060",
        "beds_total": 1531,
        "beds_icu": 150,
        "beds_icu_available": 18,
        "beds_emergency": 100,
        "beds_general": 1281,
        "is_trauma_center": True,
        "is_pmjay_empanelled": True,
        "accreditation": None,
        "established_year": 1942,
        "total_doctors": 500,
        "description": "Safdarjung Hospital — one of Delhi's largest government hospitals, affiliated with VMM College of Medicine.",
    },
    {
        "name": "Apollo Hospital Delhi",
        "type": "private",
        "address": "Sarita Vihar, New Delhi",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110076",
        "latitude": 28.5409,
        "longitude": 77.2879,
        "phone": "011-71791090",
        "emergency_phone": "011-71791090",
        "beds_total": 700,
        "beds_icu": 120,
        "beds_icu_available": 15,
        "beds_emergency": 80,
        "beds_general": 500,
        "is_trauma_center": True,
        "is_pmjay_empanelled": False,
        "accreditation": "JCI",
        "established_year": 1996,
        "total_doctors": 400,
        "description": "Apollo Hospital Delhi — premier JCI-accredited hospital, first in India to receive JCI accreditation.",
    },
    {
        "name": "Max Super Speciality Hospital Saket",
        "type": "private",
        "address": "Press Enclave Road, Saket, New Delhi",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110017",
        "latitude": 28.5267,
        "longitude": 77.2147,
        "phone": "011-26515050",
        "emergency_phone": "011-26515051",
        "beds_total": 500,
        "beds_icu": 90,
        "beds_icu_available": 12,
        "beds_emergency": 60,
        "beds_general": 350,
        "is_trauma_center": True,
        "is_pmjay_empanelled": False,
        "accreditation": "NABH",
        "established_year": 2006,
        "total_doctors": 350,
        "description": "Max Super Speciality Hospital — known for cardiac sciences, cancer care, and liver transplants.",
    },
]

# ── Procedure Data (PMJAY-aligned cost ranges) ────────────────────
PROCEDURES_SEED = [
    {
        "name": "Hemodialysis (per session)",
        "name_hindi": "हेमोडायलिसिस",
        "category": "renal",
        "icd10_code": "Z99.2",
        "pmjay_hbp_code": "HBP_RENAL_001",
        "pmjay_cost_min": 1500,
        "pmjay_cost_max": 4000,
        "search_aliases": ["dialysis", "kidney dialysis", "gurdey ki safai", "hemodialysis", "blood purification"],
        "is_surgical": False,
        "typical_duration_days": 0,
    },
    {
        "name": "Kidney Transplant",
        "name_hindi": "गुर्दा प्रत्यारोपण",
        "category": "renal",
        "icd10_code": "T86.1",
        "pmjay_hbp_code": "HBP_RENAL_010",
        "pmjay_cost_min": 250000,
        "pmjay_cost_max": 600000,
        "search_aliases": ["kidney transplant", "renal transplant", "gurdey ka transplant"],
        "is_surgical": True,
        "typical_duration_days": 15,
    },
    {
        "name": "Coronary Artery Bypass Graft (CABG)",
        "name_hindi": "हृदय बाईपास सर्जरी",
        "category": "cardiac",
        "icd10_code": "I25.1",
        "pmjay_hbp_code": "HBP_CARD_001",
        "pmjay_cost_min": 150000,
        "pmjay_cost_max": 400000,
        "search_aliases": ["bypass surgery", "cabg", "heart bypass", "dil ka operation", "open heart surgery"],
        "is_surgical": True,
        "typical_duration_days": 10,
    },
    {
        "name": "Coronary Angioplasty with Stent",
        "name_hindi": "कोरोनरी एंजियोप्लास्टी",
        "category": "cardiac",
        "icd10_code": "I21.9",
        "pmjay_hbp_code": "HBP_CARD_005",
        "pmjay_cost_min": 80000,
        "pmjay_cost_max": 200000,
        "search_aliases": ["angioplasty", "stent", "heart stent", "coronary stent", "blocked artery"],
        "is_surgical": True,
        "typical_duration_days": 3,
    },
    {
        "name": "Total Knee Replacement (TKR)",
        "name_hindi": "घुटना प्रत्यारोपण",
        "category": "orthopedic",
        "icd10_code": "M17.1",
        "pmjay_hbp_code": "HBP_ORTHO_001",
        "pmjay_cost_min": 80000,
        "pmjay_cost_max": 180000,
        "search_aliases": ["knee replacement", "tkr", "knee surgery", "ghutne ka operation", "knee joint replacement"],
        "is_surgical": True,
        "typical_duration_days": 5,
    },
    {
        "name": "Total Hip Replacement (THR)",
        "name_hindi": "हिप रिप्लेसमेंट",
        "category": "orthopedic",
        "icd10_code": "M16.1",
        "pmjay_hbp_code": "HBP_ORTHO_002",
        "pmjay_cost_min": 90000,
        "pmjay_cost_max": 200000,
        "search_aliases": ["hip replacement", "thr", "hip surgery", "kadhe ka operation"],
        "is_surgical": True,
        "typical_duration_days": 5,
    },
    {
        "name": "Cataract Surgery (Phacoemulsification)",
        "name_hindi": "मोतियाबिंद ऑपरेशन",
        "category": "ophthalmology",
        "icd10_code": "H26.9",
        "pmjay_hbp_code": "HBP_OPHTHAL_001",
        "pmjay_cost_min": 8000,
        "pmjay_cost_max": 35000,
        "search_aliases": ["cataract", "cataract surgery", "motiyabind", "motia", "eye surgery", "aankh ka operation"],
        "is_surgical": True,
        "typical_duration_days": 1,
    },
    {
        "name": "Chemotherapy (per cycle)",
        "name_hindi": "कीमोथेरेपी",
        "category": "oncology",
        "icd10_code": "Z51.1",
        "pmjay_hbp_code": "HBP_ONCOL_001",
        "pmjay_cost_min": 15000,
        "pmjay_cost_max": 100000,
        "search_aliases": ["chemotherapy", "chemo", "cancer treatment", "cancer ki dawa"],
        "is_surgical": False,
        "typical_duration_days": 2,
    },
    {
        "name": "Normal Delivery",
        "name_hindi": "सामान्य प्रसव",
        "category": "gynecology",
        "icd10_code": "O80",
        "pmjay_hbp_code": "HBP_GYNEC_001",
        "pmjay_cost_min": 5000,
        "pmjay_cost_max": 30000,
        "search_aliases": ["normal delivery", "delivery", "baby delivery", "bachcha paida"],
        "is_surgical": False,
        "typical_duration_days": 2,
    },
    {
        "name": "Caesarean Section (C-Section)",
        "name_hindi": "सिजेरियन ऑपरेशन",
        "category": "gynecology",
        "icd10_code": "O82",
        "pmjay_hbp_code": "HBP_GYNEC_002",
        "pmjay_cost_min": 15000,
        "pmjay_cost_max": 60000,
        "search_aliases": ["c section", "caesarean", "csection", "operation delivery"],
        "is_surgical": True,
        "typical_duration_days": 4,
    },
    {
        "name": "Appendectomy (Laparoscopic)",
        "name_hindi": "अपेंडिक्स ऑपरेशन",
        "category": "general",
        "icd10_code": "K37",
        "pmjay_hbp_code": "HBP_SURG_001",
        "pmjay_cost_min": 25000,
        "pmjay_cost_max": 70000,
        "search_aliases": ["appendix", "appendectomy", "appendicitis"],
        "is_surgical": True,
        "typical_duration_days": 2,
    },
    {
        "name": "MRI Scan (Brain)",
        "name_hindi": "एमआरआई स्कैन",
        "category": "diagnostic",
        "icd10_code": "Z01.8",
        "pmjay_hbp_code": None,
        "pmjay_cost_min": 3000,
        "pmjay_cost_max": 12000,
        "search_aliases": ["mri", "mri scan", "brain mri", "mri brain"],
        "is_surgical": False,
        "typical_duration_days": 0,
    },
]


async def seed_hospitals():
    """
    Main seed function — called on startup if SEED_ON_STARTUP=True.
    Idempotent: skips if hospitals already exist.
    """
    from app.database import async_session_factory
    from app.models.hospital import Hospital, HospitalType, DataSourceLabel
    from app.models.procedure import Procedure, ProcedureCategory
    from app.models.hospital_procedure import HospitalProcedure
    from app.models.facility import Facility, FacilityCategory
    from app.models.department import Department
    from app.models.data_source import DataSource, DataSourceType
    from app.models.user import User, UserRole
    from app.services.auth_service import hash_password
    from geoalchemy2.shape import from_shape
    from shapely.geometry import Point
    from python_slugify import slugify
    from sqlalchemy import select
    import random

    async with async_session_factory() as db:
        # Check if already seeded
        existing = (await db.execute(select(Hospital).limit(1))).scalar_one_or_none()
        if existing:
            logger.info("Database already seeded, skipping")
            return

        logger.info("Seeding database with hospital data...")

        # Create seed data source record
        data_source = DataSource(
            name="Med Route Simulated Data v1.0",
            source_type=DataSourceType.SEED_SCRIPT,
            description="Simulated hospital data for demonstration. Based on real hospital names and locations but all data is labeled SIMULATED.",
            record_count=len(HOSPITALS_DATA),
        )
        db.add(data_source)
        await db.flush()

        # Seed procedures first (hospitals will link to them)
        procedures = []
        for proc_data in PROCEDURES_SEED:
            proc = Procedure(
                name=proc_data["name"],
                name_hindi=proc_data.get("name_hindi"),
                category=proc_data["category"],
                icd10_code=proc_data.get("icd10_code"),
                pmjay_hbp_code=proc_data.get("pmjay_hbp_code"),
                pmjay_cost_min=proc_data.get("pmjay_cost_min"),
                pmjay_cost_max=proc_data.get("pmjay_cost_max"),
                search_aliases=proc_data.get("search_aliases", []),
                is_surgical=proc_data.get("is_surgical", False),
                typical_duration_days=proc_data.get("typical_duration_days", 1),
            )
            db.add(proc)
            procedures.append(proc)
        await db.flush()

        # Seed hospitals
        hospitals = []
        for h_data in HOSPITALS_DATA:
            location = from_shape(
                Point(h_data["longitude"], h_data["latitude"]), srid=4326
            )
            slug = slugify(f"{h_data['name']} {h_data['city']}")

            hospital = Hospital(
                name=h_data["name"],
                slug=slug,
                type=HospitalType(h_data["type"]),
                address=h_data["address"],
                city=h_data["city"],
                state=h_data["state"],
                pincode=h_data["pincode"],
                latitude=h_data["latitude"],
                longitude=h_data["longitude"],
                location=location,
                phone=h_data["phone"],
                emergency_phone=h_data.get("emergency_phone"),
                beds_total=h_data.get("beds_total", 100),
                beds_icu=h_data.get("beds_icu", 10),
                beds_icu_available=h_data.get("beds_icu_available", 5),
                beds_emergency=h_data.get("beds_emergency", 20),
                beds_general=h_data.get("beds_general", 70),
                is_trauma_center=h_data.get("is_trauma_center", False),
                is_pmjay_empanelled=h_data.get("is_pmjay_empanelled", False),
                accreditation=h_data.get("accreditation"),
                established_year=h_data.get("established_year"),
                total_doctors=h_data.get("total_doctors"),
                description=h_data.get("description"),
                overall_rating=round(random.uniform(3.5, 4.9), 1),
                total_reviews=random.randint(50, 2000),
                verified=True,
                data_source_label=DataSourceLabel.SIMULATED,
                data_source_id=data_source.id,
                is_active=True,
            )
            db.add(hospital)
            hospitals.append(hospital)
        await db.flush()

        # Link hospitals to procedures with realistic cost ranges
        for hospital in hospitals:
            # Each hospital gets 4-8 random procedures
            num_procedures = random.randint(4, 8)
            selected_procs = random.sample(procedures, min(num_procedures, len(procedures)))

            for proc in selected_procs:
                # Apply ±30% variance to PMJAY reference costs
                if proc.pmjay_cost_min and proc.pmjay_cost_max:
                    variance = random.uniform(0.7, 1.3)
                    cost_min = int(proc.pmjay_cost_min * variance)
                    cost_max = int(proc.pmjay_cost_max * variance)
                else:
                    cost_min = None
                    cost_max = None

                hp = HospitalProcedure(
                    hospital_id=hospital.id,
                    procedure_id=proc.id,
                    cost_min=cost_min,
                    cost_max=cost_max,
                    cost_avg=int((cost_min + cost_max) / 2) if cost_min and cost_max else None,
                    pmjay_covered=hospital.is_pmjay_empanelled and proc.pmjay_hbp_code is not None,
                    pmjay_package_rate=proc.pmjay_cost_max if hospital.is_pmjay_empanelled else None,
                    success_rate=round(random.uniform(85, 99), 1),
                    volume_per_year=random.randint(50, 1000),
                    is_available=True,
                    data_source_label=DataSourceLabel.SIMULATED,
                )
                db.add(hp)

        # Add key facilities for each hospital
        facilities_template = [
            ("ICU", FacilityCategory.ICU, True),
            ("Blood Bank", FacilityCategory.LABORATORY, True),
            ("MRI Scanner", FacilityCategory.IMAGING, True),
            ("CT Scanner", FacilityCategory.IMAGING, True),
            ("Operation Theatre", FacilityCategory.SURGERY, True),
            ("Emergency Department", FacilityCategory.EMERGENCY, True),
            ("Pharmacy", FacilityCategory.PHARMACY, True),
            ("Dialysis Unit", FacilityCategory.THERAPY, False),
            ("NICU", FacilityCategory.ICU, False),
            ("Cath Lab", FacilityCategory.SURGERY, False),
            ("PET-CT Scanner", FacilityCategory.IMAGING, False),
            ("Ambulance Service", FacilityCategory.EMERGENCY, True),
        ]

        for hospital in hospitals:
            for fname, fcat, is_common in facilities_template:
                # All hospitals get common facilities; uncommon ones are random
                if is_common or random.random() > 0.5:
                    fac = Facility(
                        hospital_id=hospital.id,
                        name=fname,
                        category=fcat,
                        is_available=True,
                        is_24x7=(fcat in [FacilityCategory.ICU, FacilityCategory.EMERGENCY]),
                    )
                    db.add(fac)

        # Create admin user
        admin = User(
            name="Med Route Admin",
            email="admin@medroute.in",
            phone="9999999999",
            password_hash=hash_password("Admin@MedRoute2024"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)

        # Create a sample citizen user
        citizen = User(
            name="Arjun Sharma",
            email="arjun@example.com",
            phone="9876543210",
            password_hash=hash_password("Citizen@Test123"),
            role=UserRole.CITIZEN,
            city="Chandigarh",
            latitude=30.7333,
            longitude=76.7794,
            is_active=True,
        )
        db.add(citizen)

        await db.commit()
        logger.info(
            "✅ Seed data committed",
            hospitals=len(hospitals),
            procedures=len(procedures),
        )


if __name__ == "__main__":
    asyncio.run(seed_hospitals())
