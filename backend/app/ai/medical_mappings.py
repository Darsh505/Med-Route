"""
ai/medical_mappings.py — Medical Domain Knowledge Base

Maps natural language terms (English + Hinglish) to canonical
procedure names and procedure categories.

This is the "medical dictionary" that allows queries like:
  "gurdey ka ilaj" → kidney treatment → ["dialysis", "kidney_transplant"]
  "dil ki bimari"  → heart disease   → ["bypass", "angioplasty", "echocardiography"]
  "aankh ka operation" → eye surgery → ["cataract", "lasik"]
"""

# Maps canonical procedure name → list of search aliases (English + Hinglish)
PROCEDURE_ALIASES: dict[str, list[str]] = {
    # Renal / Kidney
    "dialysis": [
        "dialysis", "hemodialysis", "kidney dialysis", "gurdey ki safai",
        "blood purification", "kidney cleaning", "kidney treatment", "kidney", "renal",
    ],
    "kidney_transplant": [
        "kidney transplant", "renal transplant", "gurdey ka transplant",
        "kidney replacement",
    ],
    "lithotripsy": [
        "kidney stone", "kidney stones", "stone removal", "lithotripsy",
        "pathri", "pathari", "gall stone", "gall bladder stone",
    ],
    "nephrectomy": ["kidney removal", "nephrectomy", "gurdey ka operation"],

    # Cardiac / Heart
    "bypass_surgery": [
        "bypass", "bypass surgery", "cabg", "open heart surgery",
        "dil ka operation", "heart surgery",
    ],
    "angioplasty": [
        "angioplasty", "stent", "heart stent", "coronary angioplasty",
        "dil mein stent", "blocked artery",
    ],
    "echocardiography": [
        "echo", "echocardiography", "heart echo", "heart scan",
    ],
    "pacemaker": ["pacemaker", "heart pacemaker", "pacemaker implant"],

    # Orthopedic
    "knee_replacement": [
        "knee replacement", "knee surgery", "ghutne ka operation",
        "ghutne ka dard", "knee joint replacement", "tkr",
    ],
    "hip_replacement": [
        "hip replacement", "hip surgery", "kadhe ka operation", "tha replacement",
    ],
    "spine_surgery": [
        "spine surgery", "back surgery", "slip disc", "disc surgery",
        "reedh ki haddi", "sciatica", "laminectomy",
    ],
    "fracture_treatment": [
        "fracture", "bone fracture", "haddi tootna", "bone break",
        "broken bone", "cast", "plaster",
    ],

    # Neurological
    "brain_surgery": [
        "brain surgery", "brain tumor", "neurosurgery", "brain tumor surgery",
        "dimag ka operation",
    ],
    "stroke_treatment": ["stroke", "brain stroke", "paralysis", "brain attack"],

    # Ophthalmology
    "cataract_surgery": [
        "cataract", "cataract surgery", "eye surgery", "aankh ka operation",
        "motia", "motiyabind", "lens replacement",
    ],
    "lasik": ["lasik", "laser eye surgery", "glasses removal", "eye laser"],

    # Oncology
    "chemotherapy": [
        "chemotherapy", "chemo", "cancer treatment", "cancer ki dawa",
    ],
    "radiation_therapy": [
        "radiation", "radiation therapy", "radiotherapy", "cancer radiation",
    ],

    # Gynecology
    "delivery": [
        "delivery", "normal delivery", "c-section", "caesarean", "baby delivery",
        "bachcha paida karna", "prasav",
    ],
    "hysterectomy": ["hysterectomy", "uterus removal", "bacchedani ka operation"],

    # General Surgery
    "appendectomy": ["appendix", "appendectomy", "appendicitis"],
    "hernia_repair": ["hernia", "hernia surgery"],
    "laparoscopy": ["laparoscopy", "laparoscopic surgery", "keyhole surgery"],

    # Dental
    "dental_implant": ["dental implant", "tooth implant", "dental", "daant"],
    "root_canal": ["root canal", "rct", "daant ki jad", "tooth root canal"],

    # Diagnostic
    "mri_scan": ["mri", "mri scan", "magnetic resonance"],
    "ct_scan": ["ct scan", "ct", "computed tomography"],
}

# Maps common Indian city names and abbreviations to canonical names
LOCATION_SHORTCUTS: dict[str, str] = {
    # Chandigarh + Tricity
    "chandigarh": "Chandigarh",
    "chd": "Chandigarh",
    "mohali": "Mohali",
    "panchkula": "Panchkula",
    "tricity": "Chandigarh",

    # Punjab
    "ludhiana": "Ludhiana",
    "amritsar": "Amritsar",
    "jalandhar": "Jalandhar",
    "patiala": "Patiala",
    "bathinda": "Bathinda",

    # Haryana
    "gurugram": "Gurugram",
    "gurgaon": "Gurugram",
    "faridabad": "Faridabad",
    "ambala": "Ambala",
    "rohtak": "Rohtak",
    "hisar": "Hisar",

    # Delhi
    "delhi": "Delhi",
    "new delhi": "Delhi",
    "ndmc": "Delhi",

    # Major cities
    "mumbai": "Mumbai",
    "bombay": "Mumbai",
    "bangalore": "Bangalore",
    "bengaluru": "Bangalore",
    "hyderabad": "Hyderabad",
    "chennai": "Chennai",
    "madras": "Chennai",
    "kolkata": "Kolkata",
    "calcutta": "Kolkata",
    "pune": "Pune",
    "ahmedabad": "Ahmedabad",
    "jaipur": "Jaipur",
    "lucknow": "Lucknow",
}

# Maps specialty keywords to procedure categories
SPECIALTY_TO_CATEGORY: dict[str, str] = {
    "cardiologist": "cardiac",
    "nephrologist": "renal",
    "orthopedic": "orthopedic",
    "neurologist": "neurological",
    "ophthalmologist": "ophthalmology",
    "oncologist": "oncology",
    "gynecologist": "gynecology",
    "pediatrician": "pediatric",
    "dentist": "dental",
    "gastroenterologist": "gastroenterology",
    "pulmonologist": "pulmonology",
    "psychiatrist": "psychiatry",
}
