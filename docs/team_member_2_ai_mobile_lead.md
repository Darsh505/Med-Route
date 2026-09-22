# 🤖 Member 2 — AI & Mobile Lead

> **Complexity**: 🔴 Complex  
> **Role**: Build the AI/NLP brain of Med Route AND the full React Native mobile app with SOS widget.  
> **Tech**: Google Gemini API, spaCy, React Native (Expo SDK 52), TypeScript  
> **Est. Duration**: 15 days  

---

## Why This Role Is Complex

1. **AI/NLP Engineering** — You're building a pipeline that converts "Find kidney treatment near Chandigarh under 2 lakhs" into structured database filters. This requires prompt engineering, entity extraction, medical terminology mapping, and graceful fallback handling.
2. **Gemini API Integration** — Using structured JSON output mode with Gemini, handling rate limits, timeouts, and API failures.
3. **Medical Domain Knowledge** — Mapping everyday language (including Hinglish: "gurdey ka ilaj") to ICD procedure codes.
4. **Native Mobile Development** — The SOS widget requires native code (Android widget via `react-native-android-widget`, iOS via `expo-widgets`). This is NOT standard React Native.
5. **Background Location** — `expo-location` + `expo-task-manager` for "Always" location access — requires physical device testing and careful permission handling.

---

## Deliverables & Timeline

### Days 1-3: AI/NLP Engine

> [!IMPORTANT]
> This is your highest priority. M1 (Backend Lead) needs your NLP parser interface by Day 2 so they can wire it into the search service.

---

#### [NEW] `backend/app/ai/__init__.py`
Package init.

#### [NEW] `backend/app/ai/nlp_parser.py`
```python
"""
Core NLP Parser — The Brain of Med Route Search

Takes a natural language query from a citizen and returns structured
filters that the search service can convert into PostGIS SQL queries.

ARCHITECTURE:
1. Primary: Google Gemini API with structured JSON output
2. Fallback: Rule-based regex parser (works offline, no API key needed)

The parser always tries Gemini first. If Gemini fails (rate limit,
network error, timeout), it seamlessly falls back to the rule-based
parser. The response includes `ai_provider` field so the frontend
can show "🤖 AI-powered" or "📋 Basic search" accordingly.

EXAMPLE:
  Input:  "Find kidney treatment hospital near Chandigarh under 2 lakhs rs"
  Output: SearchFilters(
      intent="hospital_search",
      disease="kidney treatment",
      procedure_categories=["renal"],
      mapped_procedures=["dialysis", "kidney_transplant", "lithotripsy"],
      location_text="Chandigarh",
      latitude=30.7333,
      longitude=76.7794,
      max_budget=200000,
      radius_km=50,
      sort_by="distance",
      ai_provider="gemini",
      confidence=0.92,
      raw_extraction={...}  # Full AI response for debugging
  )
"""

import google.generativeai as genai
from app.ai.entity_extractor import RuleBasedExtractor
from app.ai.medical_mappings import MedicalMapper
from app.schemas.search import SearchFilters

class NLPParser:
    """
    Dual-mode NLP parser with Gemini primary and rule-based fallback.
    
    WHY dual-mode?
    → Gemini is excellent at understanding nuanced queries like
      "heart ka achha hospital bata do NCR mein" (Hinglish), but
      it costs money per call and can fail. The rule-based fallback
      ensures the app ALWAYS works, even without internet.
    """
    
    def __init__(self, gemini_api_key: str):
        self.gemini_model = genai.GenerativeModel("gemini-2.0-flash")
        self.fallback = RuleBasedExtractor()
        self.mapper = MedicalMapper()
    
    async def parse(self, query: str) -> SearchFilters:
        """Parse natural language query into structured search filters."""
        try:
            return await self._parse_with_gemini(query)
        except Exception as e:
            logger.warning(f"Gemini failed, using fallback: {e}")
            return self._parse_with_rules(query)
    
    async def _parse_with_gemini(self, query: str) -> SearchFilters:
        """
        Uses Gemini with structured JSON output.
        
        The prompt is carefully engineered to:
        1. Extract intent (search, compare, emergency, cost inquiry)
        2. Identify disease/condition in any language
        3. Extract location (city, area, or "near me")
        4. Parse budget constraints (handles lakhs, crores, k, etc.)
        5. Detect urgency level
        """
        prompt = f"""You are a medical search query parser for Indian hospitals.
        
Parse this user query and extract structured information.
Return ONLY valid JSON matching this exact schema:

{{
  "intent": "hospital_search | procedure_lookup | cost_inquiry | emergency | comparison",
  "disease_or_condition": "extracted disease/condition in English",
  "location": "city or area name",
  "max_budget": null or integer in INR,
  "min_budget": null or integer in INR,
  "urgency": "routine | urgent | emergency",
  "hospital_type": null or "government | private | trust",
  "requires_accreditation": false,
  "sort_preference": "distance | cost | rating",
  "confidence": 0.0 to 1.0
}}

Rules:
- Convert "lakhs" to actual number (2 lakhs = 200000)
- Convert "crore" to actual number (1 crore = 10000000)  
- Convert "k" to thousands (50k = 50000)
- Understand Hinglish: "gurdey" = kidney, "dil" = heart, etc.
- If location says "near me" or "nearby", set location to null
- Default radius is 50km unless user specifies otherwise

User Query: "{query}"
"""
        response = await self.gemini_model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        # Parse, validate, map to SearchFilters
        ...
```

#### [NEW] `backend/app/ai/intent_classifier.py`
```python
"""
Intent Classification — What does the user WANT?

5 intents:
- hospital_search:   "Find kidney hospital near Chandigarh"
- procedure_lookup:  "What is the cost of knee replacement?"
- cost_inquiry:      "How much does dialysis cost in Delhi?"
- emergency:         "Nearest trauma center NOW"
- comparison:        "Compare PGIMER vs Fortis for heart surgery"

WHY separate from NLP parser?
→ Intent determines which SERVICE handles the request.
  A search goes to SearchService, but an emergency goes
  directly to SOSService (bypass ranking, just find nearest).
  A comparison goes to CompareService with different data needs.
"""
```

#### [NEW] `backend/app/ai/entity_extractor.py`
```python
"""
Rule-Based Entity Extractor — Offline Fallback

Uses regex patterns + dictionary lookups to extract:
- Diseases: keyword matching against medical_mappings
- Locations: Indian city/state name dictionary
- Budget: regex for ₹, Rs, lakhs, crore, k patterns
- Hospital type: govt, private, sarkari, etc.

This is the fallback when Gemini is unavailable.
It won't understand nuanced Hinglish as well as Gemini,
but it handles 80% of straightforward queries.

PATTERN EXAMPLES:
  Budget: r'(?:under|below|within|max|upto|less than)\s*[₹rs. ]*(\d+[\d,]*)\s*(lakh|lac|k|crore)?'
  Location: r'(?:near|in|at|around)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)'
"""
```

#### [NEW] `backend/app/ai/medical_mappings.py`
```python
"""
Medical Terminology Mapping Dictionary

Maps everyday language to normalized procedure categories and codes.
Includes English, Hindi, and Hinglish variants.

STRUCTURE:
  "kidney treatment" → {
      category: "renal",
      procedures: ["dialysis", "kidney_transplant", "lithotripsy", "nephrectomy"],
      icd_codes: ["N18.6", "Z94.0", "N20.0"],
      hbp_codes: ["S-RN-1", "S-RN-2", "S-RN-3"],
      aliases: ["kidney", "gurdey", "renal", "nephro", "kidney stone", 
                "kidney failure", "dialysis", "gurdey ka ilaj"]
  }

CATEGORIES COVERED:
  cardiac, renal, orthopedic, neurological, oncology, ophthalmology,
  gastroenterology, pulmonology, obstetrics, pediatric, dental,
  dermatology, ent, urology, psychiatry, general_surgery

WHY this dictionary?
→ Citizens don't know ICD codes. They say "heart problem" or
  "ghutne ka operation". This dictionary bridges the gap between
  citizen language and medical database codes.
"""

MEDICAL_MAP = {
    "cardiac": {
        "display_name": "Heart & Cardiac",
        "procedures": [
            {"name": "Coronary Angiography", "code": "S-CR-1", "icd": "I25.1"},
            {"name": "CABG (Bypass Surgery)", "code": "S-CR-2", "icd": "I25.1"},
            {"name": "Angioplasty with Stent", "code": "S-CR-3", "icd": "I21.0"},
            {"name": "Pacemaker Implantation", "code": "S-CR-4", "icd": "I49.9"},
            {"name": "Valve Replacement", "code": "S-CR-5", "icd": "I35.0"},
        ],
        "aliases": [
            "heart", "cardiac", "dil", "cardio", "chest pain", "heart attack",
            "bypass", "angioplasty", "stent", "valve", "pacemaker",
            "dil ki bimari", "heart problem", "seene mein dard"
        ]
    },
    "renal": {
        "display_name": "Kidney & Renal",
        "procedures": [
            {"name": "Hemodialysis", "code": "S-RN-1", "icd": "N18.6"},
            {"name": "Kidney Transplant", "code": "S-RN-2", "icd": "Z94.0"},
            {"name": "Lithotripsy (Stone Removal)", "code": "S-RN-3", "icd": "N20.0"},
            {"name": "Nephrectomy", "code": "S-RN-4", "icd": "N28.9"},
        ],
        "aliases": [
            "kidney", "renal", "gurdey", "nephro", "dialysis", "kidney stone",
            "pathri", "kidney failure", "gurdey ka ilaj", "kidney treatment"
        ]
    },
    # ... 14 more categories with full procedure lists
}
```

---

### Days 4-5: Intent Classifier & Training Data

#### [NEW] `backend/app/ai/training/prepare_dataset.py`
```python
"""
Training Data Generator for NLP Query Parser

Generates 1000+ example queries with labeled intents and entities.
Used for:
1. Testing the Gemini prompt against diverse inputs
2. Training the optional custom spaCy NER model
3. Benchmarking: accuracy, precision, recall for entity extraction

EXAMPLE ENTRIES:
  {
    "query": "PGIMER jaisa achha hospital bata do kidney ke liye",
    "intent": "hospital_search",
    "entities": {
      "disease": "kidney",
      "reference_hospital": "PGIMER",
      "location": null,
      "budget": null
    },
    "language": "hinglish"
  }

Categories of test queries:
- Simple English: "Find heart hospital in Delhi"
- Complex English: "Compare top 3 NABH-accredited cancer hospitals within 100km of Chandigarh under 5 lakhs"
- Hinglish: "Chandigarh mein sasta kidney hospital batao"
- Hindi transliterated: "dil ka ilaaj kahan hoga"
- Emergency: "Nearest hospital NOW accident"
- Ambiguous: "my head hurts" (needs clarification)
- Budget variants: "under 2 lakh", "50k max", "sasta", "budget friendly"
"""
```

#### [NEW] `backend/app/ai/training/train_ner.py`
```python
"""
Optional: Custom spaCy NER Model Training

Trains a Named Entity Recognition model specifically for
Indian medical search queries. Entities:
- DISEASE: Medical condition or body part
- LOCATION: Indian city, state, area
- BUDGET: Monetary amount
- HOSPITAL_TYPE: govt, private, trust
- PROCEDURE: Specific medical procedure
- URGENCY: Emergency indicators

WHY custom NER?
→ spaCy's default models don't recognize Indian medical terms
  or Hinglish. This custom model improves offline fallback accuracy
  from ~60% to ~85% on our test dataset.

WHEN to use?
→ Only needed if you want high-accuracy offline parsing.
  Gemini API handles everything for online users.
"""
```

---

### Days 6-7: React Native App Setup

#### [NEW] `mobile/App.tsx`
Expo app entry point — wraps in navigation + auth context + location permission handler.

#### [NEW] `mobile/app.json`
Expo config — app name, icon, splash screen, plugins (location, task-manager, widgets).

#### [NEW] `mobile/package.json`
Dependencies: expo, react-navigation, expo-location, expo-task-manager, react-native-android-widget.

#### [NEW] `mobile/src/navigation/AppNavigator.tsx`
```typescript
/**
 * App Navigation Structure
 * 
 * Bottom Tab Navigator:
 *   🏠 Home → HomeScreen (search + nearby hospitals)
 *   🔍 Search → SearchScreen (full search with filters)
 *   ⚖️ Compare → CompareScreen (side-by-side)
 *   👤 Profile → ProfileScreen (reviews, settings)
 * 
 * Stack Navigator (per tab):
 *   Hospital Detail, Review Form, etc.
 * 
 * ALWAYS ACCESSIBLE:
 *   🆘 SOS Button — Floating action button on every screen
 *   Tapping it triggers SOSScreen as a full-screen modal
 * 
 * WHY floating SOS on every screen?
 * → In an emergency, the user shouldn't have to navigate
 *   anywhere. The SOS button is always 1 tap away, on every
 *   screen, at every moment.
 */
```

#### [NEW] `mobile/src/services/api.ts`
```typescript
/**
 * API Client for React Native
 * 
 * Mirrors the web API client but uses React Native's fetch.
 * Handles:
 * - Auth token storage (SecureStore)
 * - Automatic token refresh on 401
 * - Offline detection + queue for retry
 * - Request/response logging in dev mode
 * 
 * WHY SecureStore instead of AsyncStorage?
 * → JWT tokens are sensitive. SecureStore uses the device's
 *   secure enclave (Keychain on iOS, Keystore on Android)
 *   rather than plain file storage.
 */
```

#### [NEW] `mobile/src/services/location.ts`
```typescript
/**
 * Location Service — Background + Foreground
 * 
 * Uses expo-location + expo-task-manager for:
 * 1. Foreground: Get current location for search queries
 * 2. Background: Continuous tracking during active SOS alert
 * 
 * PERMISSIONS:
 * - "When In Use": For search queries (low friction)
 * - "Always": Only requested for SOS widget (high friction, explain why)
 * 
 * WHY two permission levels?
 * → Asking for "Always" permission upfront would cause most users
 *   to deny it. We ask for "When In Use" first, then upgrade to
 *   "Always" only when they enable the SOS widget — with a clear
 *   explanation of why background location is needed for emergencies.
 */
```

---

### Days 8-10: Mobile Screens

#### [NEW] `mobile/src/screens/HomeScreen.tsx`
```typescript
/**
 * Home Screen — First thing users see
 * 
 * Layout:
 * ┌──────────────────────────┐
 * │  🏥 Med Route            │
 * │                          │
 * │  ┌────────────────────┐  │
 * │  │ 🔍 Search...       │  │  ← NL Search Bar
 * │  └────────────────────┘  │
 * │                          │
 * │  🏷️ Quick Categories     │
 * │  [❤️ Heart] [🦴 Ortho]   │  ← Horizontal scroll chips
 * │  [🧠 Neuro] [👁️ Eye ]   │
 * │                          │
 * │  📍 Nearby Hospitals     │
 * │  ┌──────────────────┐   │
 * │  │ PGIMER          3km│  │  ← Hospital cards
 * │  │ ⭐ 4.8  Govt  NABH │  │
 * │  └──────────────────┘   │
 * │  ┌──────────────────┐   │
 * │  │ Fortis Mohali   7km│  │
 * │  │ ⭐ 4.3  Private    │  │
 * │  └──────────────────┘   │
 * │                          │
 * │              [🆘 SOS]    │  ← Floating action button
 * └──────────────────────────┘
 */
```

#### [NEW] `mobile/src/screens/SearchScreen.tsx`
Search results with filter sheet, map/list toggle, sort options.

#### [NEW] `mobile/src/screens/HospitalScreen.tsx`
Hospital detail — scrollable sections: overview, procedures+costs, facilities, reviews, location map.

#### [NEW] `mobile/src/screens/CompareScreen.tsx`
Horizontal-scroll comparison cards. Swipe to compare metrics.

#### [NEW] `mobile/src/screens/SOSScreen.tsx`
```typescript
/**
 * SOS Emergency Screen — Full Screen Modal
 * 
 * DESIGN: Red background, minimal UI, maximum clarity.
 * 
 * Flow:
 * 1. Screen opens → immediately gets GPS location
 * 2. Shows loading: "Finding nearest trauma center..."
 * 3. Calls POST /api/sos/nearest with coordinates
 * 4. Shows: Hospital name, distance, phone number
 * 5. Auto-dials hospital (with user confirmation)
 * 6. Fires POST /api/sos/alert to hospital dashboard
 * 7. Shows: "Hospital has been notified of your emergency"
 * 8. Navigation link to Google Maps directions
 * 
 * CRITICAL UX DECISIONS:
 * - No login required for SOS (saves lives > auth flows)
 * - Auto-dial with 3-second countdown (user can cancel)
 * - Hospital phone number shown LARGE for manual dial
 * - Works offline: falls back to dialing 108 (national ambulance)
 */
```

#### [NEW] `mobile/src/screens/ReviewScreen.tsx`
Write review form — star rating, treatment details, cost transparency rating.

#### [NEW] `mobile/src/screens/ProfileScreen.tsx`
User profile — my reviews, saved hospitals, settings, SOS widget toggle.

---

### Days 11-13: SOS Widget (Most Complex Mobile Feature)

#### [NEW] `mobile/src/widgets/SOSWidget.tsx`
```typescript
/**
 * Home Screen SOS Widget — Zero Friction Emergency
 * 
 * This is a NATIVE widget that lives on the user's home screen.
 * It works WITHOUT opening the app.
 * 
 * ANDROID: Uses react-native-android-widget
 *   - Renders a red emergency button on home screen
 *   - On tap: gets last known location → calls API → shows result
 *   - Uses SharedPreferences to sync data with main app
 * 
 * iOS: Uses expo-widgets (WidgetKit)
 *   - Renders a widget with "🆘 Emergency" button
 *   - On tap: opens app directly into SOSScreen with location
 *   - Uses UserDefaults (app group) for data sharing
 * 
 * SEQUENCE:
 *   User taps widget on home screen
 *     → Widget gets GPS (last known or fresh)
 *     → Widget calls POST /api/sos/nearest
 *     → Widget shows hospital name + "Calling..." overlay
 *     → Widget initiates phone call
 *     → API fires alert to hospital dashboard
 * 
 * DATA SYNC:
 *   Widget ←→ App share via:
 *   - Android: SharedPreferences + ContentProvider
 *   - iOS: App Groups UserDefaults
 *   
 *   Shared data: auth token, last known location, SOS history
 * 
 * TESTING:
 * → MUST test on physical device (widget rendering fails on emulator)
 * → MUST test with app killed (cold start behavior)
 * → MUST test with location permission denied (graceful fallback to 108)
 */
```

#### [NEW] `mobile/src/widgets/SOSWidgetConfig.tsx`
Widget configuration — size options, emergency type selector.

#### [NEW] `mobile/src/widgets/sos_task.ts`
Background task definition for `expo-task-manager` — handles SOS flow when app is suspended.

---

### Days 14-15: NER Training & Polish

- Run NLP parser against 1000+ test queries
- Measure accuracy, precision, recall
- Fine-tune Gemini prompt based on failure cases
- Train optional spaCy NER model
- Polish mobile UI animations and transitions
- Test SOS widget on physical Android device

---

## Acceptance Criteria

- [ ] NLP parser converts 20 diverse test queries (English + Hinglish) into correct SearchFilters
- [ ] Gemini integration handles rate limits and falls back to rule-based parser
- [ ] Medical mappings cover 15+ procedure categories with 100+ aliases
- [ ] Mobile app runs on both iOS and Android (Expo Go for dev, EAS for widget)
- [ ] All 7 mobile screens render correctly with data from backend
- [ ] SOS widget renders on Android home screen
- [ ] SOS flow completes in < 5 seconds (location → API → result)
- [ ] Background location works when app is minimized (during active SOS)
- [ ] Offline fallback: SOS dials 108 if no network

---

## Your Dependencies

| You Need | From Whom | When |
|---|---|---|
| Running backend with auth + hospital endpoints | M1 (Backend Lead) | Day 5 |
| Hospital seed data in database | M1 (Backend Lead) | Day 9 |
| API base URL and response types | M1 (Backend Lead) | Day 3 |

## Others Need From You

| They Need | Who Needs It | When |
|---|---|---|
| NLP parser interface (`parse()` function signature + SearchFilters schema) | M1 (Backend Lead) | Day 2 |
| `nlp_parser.py` module complete for integration | M1 (Backend Lead) | Day 5 |
| Intent classifier for search routing | M1 (Backend Lead) | Day 5 |
| Medical mappings dictionary for seed data alignment | M1 (Backend Lead) | Day 3 |
