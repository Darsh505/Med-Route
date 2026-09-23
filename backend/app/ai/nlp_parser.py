"""
──────────────────────────────────────────────
ai/nlp_parser.py — Natural Language Query Parser
──────────────────────────────────────────────

The Brain of Med Route Search.

ARCHITECTURE:
1. Primary: Google Gemini API with structured JSON output
2. Fallback: Rule-based regex parser (works offline, no API key needed)

The parser ALWAYS tries Gemini first. If Gemini fails (rate limit,
network error, timeout), it seamlessly falls back to the rule-based
parser. The response includes ai_provider field so the frontend can
show "🤖 AI-powered" or "📋 Basic search" accordingly.

EXAMPLE:
  Input:  "Find kidney treatment hospital near Chandigarh under 2 lakhs rs"
  Output: SearchFilters(
      intent="hospital_search",
      disease="kidney treatment",
      procedure_categories=["renal"],
      mapped_procedures=["dialysis", "kidney_transplant"],
      location_text="Chandigarh",
      max_budget=200000,
      radius_km=50,
      ai_provider="gemini",
      confidence=0.92,
  )
"""

import json
import re
try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("nlp_parser")

from typing import Optional
from app.ai.medical_mappings import PROCEDURE_ALIASES, LOCATION_SHORTCUTS
from app.schemas.search import SearchFilters

# ── Gemini Prompt Template ─────────────────────────────────────────
GEMINI_EXTRACTION_PROMPT = """
You are a medical query parser for an Indian hospital discovery platform.

Parse this query and return ONLY valid JSON (no markdown, no explanation):

Query: "{query}"

Return JSON with these fields:
{{
  "intent": "hospital_search" | "sos_emergency" | "cost_inquiry" | "general_info",
  "disease": string or null,
  "procedure_categories": array of: "cardiac"|"orthopedic"|"neurological"|"ophthalmology"|"renal"|"dental"|"general"|"pediatric"|"oncology"|"gynecology"|"gastroenterology"|"pulmonology"|"dermatology"|"psychiatry"|"emergency"|"diagnostic",
  "mapped_procedures": array of procedure names in English,
  "specialties": array of specialty names,
  "location_text": string or null (city/area name),
  "max_budget": integer in INR or null,
  "min_budget": integer in INR or null,
  "hospital_types": array of "government"|"private"|"trust",
  "accreditation": "NABH"|"JCI"|"NABL"|null,
  "requires_pmjay": boolean or null,
  "sort_by": "distance"|"rating"|"cost"|"relevance",
  "confidence": float between 0 and 1
}}

Rules:
- "2 lakh" or "2 lakhs" means 200000 INR
- "1 crore" means 10000000 INR
- Budget phrases like "under 2 lakhs", "below 50000", "within 3 lakh" → max_budget
- Hinglish terms: "gurdey ka ilaj" = kidney treatment, "dil ka doctor" = cardiologist, "haddi" = bone/orthopedic
- Indian cities: Chandigarh, Delhi, Mumbai, Bangalore, etc.
- If emergency keywords (accident, critical, emergency, urgent): intent="sos_emergency"
- PMJAY / Ayushman keywords → requires_pmjay=true
- Government / sarkari → hospital_types=["government"]
"""


class NLPParser:
    """
    Dual-mode NLP parser with Gemini primary and rule-based fallback.

    WHY dual-mode?
    → Gemini is excellent at understanding nuanced queries including
      Hinglish ("heart ka achha hospital NCR mein"), but it costs
      money per call and can fail. The rule-based fallback ensures
      the app ALWAYS works, even offline or when API quota is exceeded.
    """

    def __init__(self, gemini_api_key: str = ""):
        self.gemini_api_key = gemini_api_key
        self.gemini_model = None
        self.fallback = RuleBasedExtractor()

        if gemini_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_api_key)
                self.gemini_model = genai.GenerativeModel("gemini-2.0-flash")
                logger.info("Gemini NLP parser initialized")
            except Exception as e:
                logger.warning("Gemini init failed, will use rule-based parser", error=str(e))

    async def parse(self, query: str) -> SearchFilters:
        """Parse natural language query into structured search filters."""
        query = query.strip()

        if self.gemini_model:
            try:
                return await self._parse_with_gemini(query)
            except Exception as e:
                logger.warning("Gemini parsing failed, using fallback", error=str(e))

        return self._parse_with_rules(query)

    async def _parse_with_gemini(self, query: str) -> SearchFilters:
        """
        Uses Gemini with structured JSON output mode.
        Timeout: 8 seconds (we fail fast to not delay users).
        """
        import asyncio

        prompt = GEMINI_EXTRACTION_PROMPT.format(query=query)

        # Run in thread pool (Gemini SDK is sync)
        loop = asyncio.get_event_loop()
        response = await asyncio.wait_for(
            loop.run_in_executor(None, self.gemini_model.generate_content, prompt),
            timeout=8.0,
        )

        # Parse the JSON response
        raw_json = response.text.strip()
        # Strip markdown code blocks if present
        raw_json = re.sub(r"```(?:json)?\n?(.*?)```", r"\1", raw_json, flags=re.DOTALL)

        data = json.loads(raw_json)

        filters = SearchFilters(
            intent=data.get("intent", "hospital_search"),
            disease=data.get("disease"),
            procedure_categories=data.get("procedure_categories", []),
            mapped_procedures=data.get("mapped_procedures", []),
            specialties=data.get("specialties", []),
            location_text=data.get("location_text"),
            max_budget=data.get("max_budget"),
            min_budget=data.get("min_budget"),
            hospital_types=data.get("hospital_types", []),
            accreditation=data.get("accreditation"),
            requires_pmjay=data.get("requires_pmjay"),
            sort_by=data.get("sort_by", "relevance"),
            ai_provider="gemini",
            confidence=data.get("confidence", 0.85),
            raw_query=query,
        )

        logger.info(
            "Gemini parsed query",
            query=query,
            intent=filters.intent,
            location=filters.location_text,
            budget=filters.max_budget,
        )
        return filters

    def _parse_with_rules(self, query: str) -> SearchFilters:
        """
        Rule-based fallback parser using regex patterns.
        Handles common English + Hinglish patterns.
        Works without any API calls.
        """
        query_lower = query.lower()
        filters = SearchFilters(raw_query=query, ai_provider="rule_based", confidence=0.7)

        # ── Intent detection ──────────────────────────────────────
        emergency_words = ["emergency", "accident", "critical", "urgent", "ambulance", "sos"]
        if any(w in query_lower for w in emergency_words):
            filters.intent = "sos_emergency"

        # ── Procedure / specialty detection ───────────────────────
        for procedure, aliases in PROCEDURE_ALIASES.items():
            if any(alias in query_lower for alias in aliases):
                filters.mapped_procedures.append(procedure)
                # Infer category
                category = self._infer_category(procedure)
                if category and category not in filters.procedure_categories:
                    filters.procedure_categories.append(category)

        # ── Location detection ────────────────────────────────────
        # Check known city shortcuts first
        for location, canonical in LOCATION_SHORTCUTS.items():
            if location in query_lower:
                filters.location_text = canonical
                break

        # Generic "near X" pattern
        if not filters.location_text:
            near_match = re.search(
                r"(?:near|in|at|around|close to)\s+([A-Za-z\s]+?)(?:\s+under|\s+below|\s+within|\s+for|$)",
                query,
                re.IGNORECASE,
            )
            if near_match:
                filters.location_text = near_match.group(1).strip()

        # ── Budget detection ──────────────────────────────────────
        # Patterns: "under 2 lakhs", "below 50000", "within 3 lakh", "2L", "₹2 lakh"
        lakh_match = re.search(
            r"(?:under|below|within|less than|max|upto)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b",
            query_lower,
        )
        if lakh_match:
            filters.max_budget = int(float(lakh_match.group(1)) * 100_000)

        crore_match = re.search(r"(\d+(?:\.\d+)?)\s*crore\b", query_lower)
        if crore_match and not filters.max_budget:
            filters.max_budget = int(float(crore_match.group(1)) * 10_000_000)

        # Numeric only (e.g., "under 50000")
        if not filters.max_budget:
            num_match = re.search(
                r"(?:under|below|within|less than|upto)\s+(?:₹|rs\.?)?\s*(\d{4,7})\b",
                query_lower,
            )
            if num_match:
                filters.max_budget = int(num_match.group(1))

        # ── Hospital type detection ───────────────────────────────
        if any(w in query_lower for w in ["government", "govt", "sarkari", "aiims", "pgimer", "esic"]):
            filters.hospital_types.append("government")
        if any(w in query_lower for w in ["private", "apollo", "fortis", "max", "columbia"]):
            filters.hospital_types.append("private")

        # ── PMJAY / Ayushman detection ────────────────────────────
        if any(w in query_lower for w in ["pmjay", "ayushman", "free", "cashless", "government scheme"]):
            filters.requires_pmjay = True

        # ── Accreditation ─────────────────────────────────────────
        if "nabh" in query_lower:
            filters.accreditation = "NABH"
        elif "jci" in query_lower:
            filters.accreditation = "JCI"

        return filters

    def _infer_category(self, procedure: str) -> Optional[str]:
        """Infer procedure category from procedure name."""
        category_map = {
            "dialysis": "renal", "kidney_transplant": "renal", "lithotripsy": "renal",
            "bypass": "cardiac", "angioplasty": "cardiac", "pacemaker": "cardiac",
            "knee_replacement": "orthopedic", "hip_replacement": "orthopedic", "spine_surgery": "orthopedic",
            "cataract": "ophthalmology", "lasik": "ophthalmology",
            "chemotherapy": "oncology", "radiation": "oncology",
            "appendectomy": "general", "hernia": "general",
        }
        return category_map.get(procedure)


class RuleBasedExtractor:
    """Standalone rule-based extractor (used as fallback)."""
    pass  # Logic is in NLPParser._parse_with_rules()


# Global singleton — initialized with API key from settings
_parser_instance: Optional[NLPParser] = None


def get_nlp_parser() -> NLPParser:
    """FastAPI dependency for NLP parser."""
    global _parser_instance
    if _parser_instance is None:
        from app.config import settings
        _parser_instance = NLPParser(gemini_api_key=settings.GEMINI_API_KEY)
    return _parser_instance
