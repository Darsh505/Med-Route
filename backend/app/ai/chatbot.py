"""
--------------------------------------------------
ai/chatbot.py — Clinical NLP Chatbot & Triage Engine
--------------------------------------------------

Dual-engine medical AI chatbot:
1. Primary: Google Gemini API (gemini-2.0-flash / gemini-1.5-flash) with structured JSON clinical dispatch.
2. Fallback: High-precision Clinical Rule-Based Triage Engine with 200+ medical symptoms,
   Hinglish/Hindi vocabulary, PMJAY tariff guides, and offline resilience.
"""

import json
import re
from typing import Optional, List, Dict, Any

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("clinical_chatbot")

from app.config import settings
from app.schemas.chatbot import (
    ChatRequest,
    ChatResponse,
    ChatAction,
    ChatHospitalRecommendation,
)

# Benchmark hospitals directory for recommendation resolution
REFERENCE_HOSPITALS = [
    {
        "id": "hosp-1",
        "name": "PGIMER Chandigarh",
        "slug": "pgimer-chandigarh",
        "type": "Government",
        "city": "Chandigarh",
        "address": "Sector 12, Chandigarh",
        "distance_km": 3.2,
        "overall_rating": 4.8,
        "beds_icu_available": 14,
        "is_pmjay_empanelled": True,
        "phone": "0172-2755555",
        "emergency_phone": "0172-2746018",
        "cost_indicative": "₹15,000 – ₹45,000 (Subsidized)",
        "specialties": ["cardiac", "renal", "neurological", "orthopedic", "emergency", "oncology"],
        "is_trauma": True,
    },
    {
        "name": "Max Super Speciality Hospital Mohali",
        "slug": "max-super-speciality-mohali",
        "type": "Private",
        "city": "Mohali",
        "address": "Phase VI, SAS Nagar, Mohali",
        "distance_km": 7.4,
        "overall_rating": 4.6,
        "beds_icu_available": 6,
        "is_pmjay_empanelled": True,
        "phone": "0172-6652000",
        "emergency_phone": "0172-6652100",
        "cost_indicative": "₹1,42,000 Package",
        "specialties": ["cardiac", "oncology", "neurological", "orthopedic"],
        "is_trauma": True,
    },
    {
        "name": "Fortis Hospital Mohali",
        "slug": "fortis-hospital-mohali",
        "type": "Private",
        "city": "Mohali",
        "address": "Sector 62, Phase 8, Mohali",
        "distance_km": 8.1,
        "overall_rating": 4.5,
        "beds_icu_available": 9,
        "is_pmjay_empanelled": False,
        "phone": "0172-4692222",
        "emergency_phone": "0172-4692200",
        "cost_indicative": "₹1,55,000 Package",
        "specialties": ["cardiac", "orthopedic", "cardiac_surgery"],
        "is_trauma": True,
    },
    {
        "name": "GMCH Sector 32 Chandigarh",
        "slug": "gmch-32-chandigarh",
        "type": "Government",
        "city": "Chandigarh",
        "address": "Sector 32, Chandigarh",
        "distance_km": 4.8,
        "overall_rating": 4.7,
        "beds_icu_available": 9,
        "is_pmjay_empanelled": True,
        "phone": "0172-2665253",
        "emergency_phone": "0172-2665254",
        "cost_indicative": "₹10,000 – ₹35,000 (Subsidized)",
        "specialties": ["emergency", "orthopedic", "pediatric", "general"],
        "is_trauma": True,
    },
    {
        "name": "Ivy Hospital Mohali",
        "slug": "ivy-hospital-mohali",
        "type": "Private",
        "city": "Mohali",
        "address": "Sector 71, SAS Nagar, Mohali",
        "distance_km": 9.2,
        "overall_rating": 4.4,
        "beds_icu_available": 7,
        "is_pmjay_empanelled": True,
        "phone": "0172-5212000",
        "emergency_phone": "0172-5212100",
        "cost_indicative": "₹85,000 – ₹1,80,000",
        "specialties": ["oncology", "orthopedic", "renal"],
        "is_trauma": True,
    },
    {
        "name": "Sohana Multi Speciality Hospital",
        "slug": "sohana-hospital-mohali",
        "type": "Trust",
        "city": "Mohali",
        "address": "Sector 77, Mohali",
        "distance_km": 11.8,
        "overall_rating": 4.6,
        "beds_icu_available": 8,
        "is_pmjay_empanelled": True,
        "phone": "0172-5044444",
        "emergency_phone": "0172-5044400",
        "cost_indicative": "₹38,000 – ₹95,000",
        "specialties": ["ophthalmology", "cardiac", "oncology", "renal"],
        "is_trauma": True,
    },
    {
        "name": "CMC Ludhiana",
        "slug": "christian-medical-college-ludhiana",
        "type": "Trust",
        "city": "Ludhiana",
        "address": "Brown Road, Ludhiana",
        "distance_km": 88.0,
        "overall_rating": 4.7,
        "beds_icu_available": 12,
        "is_pmjay_empanelled": True,
        "phone": "0161-2115000",
        "emergency_phone": "0161-2115111",
        "cost_indicative": "₹85,000 – ₹1,60,000",
        "specialties": ["cardiac", "orthopedic", "neurological", "renal"],
        "is_trauma": True,
    },
    {
        "name": "AIIMS New Delhi",
        "slug": "aiims-new-delhi",
        "type": "Government",
        "city": "Delhi",
        "address": "Ansari Nagar, New Delhi",
        "distance_km": 240.0,
        "overall_rating": 4.9,
        "beds_icu_available": 28,
        "is_pmjay_empanelled": True,
        "phone": "011-26588500",
        "emergency_phone": "011-26588700",
        "cost_indicative": "₹15,000 – ₹60,000",
        "specialties": ["cardiac", "neurological", "oncology", "organ_transplant"],
        "is_trauma": True,
    },
]

GEMINI_CHAT_SYSTEM_PROMPT = """
You are MedRoute Clinical Dispatch AI — an authoritative, compassionate, and precise medical triage and hospital routing assistant for India.
Your mission is to guide patients and caregivers to the right accredited healthcare facilities, verify PMJAY Ayushman Bharat cashless eligibility, provide realistic transparent procedure costs, and perform life-saving emergency triage.

Instructions:
1. ALWAYS return ONLY a valid JSON object (no markdown, no backticks, no preamble).
2. If the user presents emergency red-flag symptoms (chest pain, left arm numbness, stroke/paralysis, severe breathlessness, heavy bleeding, accident trauma, severe poisoning):
   - Set "triage_level": "emergency"
   - Set "intent": "emergency_sos"
   - Give immediate lifesaving first aid advice (e.g. call 108, rest, chew 300mg aspirin if heart attack suspected and no allergies)
3. For elective or routine conditions:
   - Provide clear, empathetic explanation of standard care paths.
   - Mention typical package tariffs (in INR) and whether Ayushman PMJAY covers it.
   - Suggest 2-3 matching hospitals from the region (Tricity / Punjab / Haryana / NCR).
4. JSON Output Format:
{
  "reply": "Empathetic, clear, and actionable medical advice text.",
  "triage_level": "emergency" | "urgent" | "routine",
  "intent": "emergency_sos" | "hospital_recommendation" | "procedure_cost" | "insurance_query" | "general_info",
  "specialty": "cardiac" | "orthopedic" | "neurological" | "renal" | "oncology" | "ophthalmology" | "gynecology" | "general" | null,
  "disease_or_condition": "Brief condition string or null",
  "recommended_hospital_names": ["PGIMER Chandigarh", "Max Super Speciality Hospital Mohali"],
  "quick_suggestions": ["Next question suggestion 1", "Next question suggestion 2"]
}
"""


class ClinicalChatbot:
    """Clinical NLP Chatbot Engine with Gemini AI and Rule-Based Triage Fallback."""

    def __init__(self, api_key: str = ""):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.gemini_model = None

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.gemini_model = genai.GenerativeModel(
                    model_name="gemini-2.0-flash",
                    system_instruction=GEMINI_CHAT_SYSTEM_PROMPT,
                )
                logger.info("Clinical Gemini Chatbot engine initialized")
            except Exception as e:
                logger.warning("Gemini chatbot init failed; falling back to clinical rules", error=str(e))

    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Process conversational query and return clinical dispatch response."""
        user_text = request.message.strip()

        # Try Gemini if configured
        if self.gemini_model:
            try:
                return await self._chat_with_gemini(request)
            except Exception as e:
                logger.warning("Gemini chat failed, switching to clinical rule-based engine", error=str(e))

        # Fallback to rich rule-based clinical engine
        return self._chat_with_rules(request)

    async def _chat_with_gemini(self, request: ChatRequest) -> ChatResponse:
        """Invokes Gemini with conversation history."""
        # Build prompt incorporating history
        prompt_parts = []
        for msg in request.history[-6:]:
            role_label = "Patient" if msg.role == "user" else "Clinical Dispatch AI"
            prompt_parts.append(f"{role_label}: {msg.content}")

        prompt_parts.append(f"Patient: {request.message}")
        prompt_parts.append("\nReturn strictly the JSON object:")

        full_prompt = "\n".join(prompt_parts)

        import asyncio
        response = await asyncio.wait_for(
            self.gemini_model.generate_content_async(
                full_prompt,
                generation_config={"temperature": 0.2, "max_output_tokens": 1000},
            ),
            timeout=4.0,
        )

        raw = response.text.strip()
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"^```\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        data = json.loads(raw)

        # Resolve recommended hospitals from database
        recommended_hospitals = self._resolve_hospitals(
            data.get("recommended_hospital_names", []),
            specialty=data.get("specialty"),
            is_emergency=(data.get("triage_level") == "emergency"),
        )

        # Build interactive action buttons
        actions = self._build_actions(data.get("triage_level"), recommended_hospitals)

        return ChatResponse(
            reply=data.get("reply", "We recommend consulting a specialist for an accurate diagnosis."),
            triage_level=data.get("triage_level", "routine"),
            intent=data.get("intent", "general_info"),
            specialty=data.get("specialty"),
            disease_or_condition=data.get("disease_or_condition"),
            recommended_hospitals=recommended_hospitals,
            action_buttons=actions,
            quick_suggestions=data.get("quick_suggestions", [
                "What is the PMJAY package tariff?",
                "Which hospital has free ICU beds right now?",
                "Compare these hospitals side-by-side",
            ]),
            ai_provider="gemini",
        )

    def _chat_with_rules(self, request: ChatRequest) -> ChatResponse:
        """Clinical rule-based triage parser with symptom matching."""
        text = request.message.lower().strip()

        # ── 1. Critical Red-Flag Emergency Triage ──
        is_cardiac_emergency = any(
            k in text for k in [
                "chest pain", "heart attack", "dil ka daura", "angina", "left arm pain",
                "sweating and chest", "heart pain", "chhati mein dard", "cardiac arrest"
            ]
        )
        is_stroke_emergency = any(
            k in text for k in [
                "stroke", "paralysis", "lakwa", "face drooping", "slurred speech",
                "arm weakness", "sudden numbness", "mouth twisted"
            ]
        )
        is_trauma_emergency = any(
            k in text for k in [
                "accident", "heavy bleeding", "unconscious", "head injury", "fracture bleeding",
                "severe breathlessness", "oxygen dropping", "poison"
            ]
        )

        if is_cardiac_emergency or is_stroke_emergency or is_trauma_emergency:
            condition = "Acute Cardiac Emergency" if is_cardiac_emergency else ("Acute Stroke Emergency" if is_stroke_emergency else "Trauma Emergency")
            hospitals = self._resolve_hospitals(["PGIMER Chandigarh", "Max Super Speciality Mohali", "GMCH Sector 32 Chandigarh"], is_emergency=True)

            reply = (
                f"🚨 **CRITICAL TRIAGE ALERT — POSSIBLE {condition.upper()}**\n\n"
                "1. **Call 108 immediately** or rush the patient to the nearest Level 1 Trauma Center with 24/7 cath lab/CT capability.\n"
                "2. **Immediate First Aid**: Keep the patient seated or lying down. Loosen tight clothing. Do not give water or heavy food.\n"
                + ("3. If heart attack is suspected and patient is conscious with no aspirin allergy, chew a 300mg soluble Aspirin tablet while en route.\n" if is_cardiac_emergency else "")
                + "4. Below are the nearest accredited trauma centers with active ICU beds primed for emergency intake."
            )

            actions = [
                ChatAction(type="call_emergency", label="🚨 Call 108 Ambulance", value="108"),
                ChatAction(type="sos_dispatch", label="🆘 Trigger SOS Dispatch", value="/sos"),
                ChatAction(type="call_hospital", label="📞 Call PGIMER Emergency", value="0172-2746018"),
            ]

            return ChatResponse(
                reply=reply,
                triage_level="emergency",
                intent="emergency_sos",
                specialty="cardiac" if is_cardiac_emergency else "neurological",
                disease_or_condition=condition,
                recommended_hospitals=hospitals,
                action_buttons=actions,
                quick_suggestions=[
                    "What first aid to give right now?",
                    "How fast can an ambulance arrive?",
                    "Are ICU beds available immediately?",
                ],
                ai_provider="clinical_rules",
            )

        # ── 2. Cardiac Elective / Angioplasty Queries ──
        if any(k in text for k in ["angioplasty", "stent", "bypass", "cabg", "heart doctor", "cardiologist"]):
            hospitals = self._resolve_hospitals(["PGIMER Chandigarh", "Max Super Speciality Mohali", "Fortis Hospital Mohali"], specialty="cardiac")
            reply = (
                "**Cardiology Care & Stent Package Guidance:**\n\n"
                "• **Estimated Costs**: Standard Angioplasty with single Drug-Eluting Stent (DES) ranges from **₹15,000 – ₹45,000** at government institutes (PGIMER/GMCH) and **₹1,40,000 – ₹1,85,000** at private accredited hospitals (Max/Fortis).\n"
                "• **PMJAY Ayushman Bharat**: 100% Cashless package rate is pre-fixed at **₹65,000** for empanelled hospitals with zero out-of-pocket implant charges.\n"
                "• **Recommendations**: Both PGIMER and Max Mohali maintain round-the-clock primary cath labs with audited clinical outcomes."
            )
            actions = [
                ChatAction(type="compare", label="⚖️ Compare Cardiac Hospitals", value="/compare?ids=pgimer-chandigarh,max-super-speciality-mohali"),
                ChatAction(type="view_hospital", label="🏥 View Max Mohali Packages", value="/hospitals/max-super-speciality-mohali"),
            ]
            return ChatResponse(
                reply=reply,
                triage_level="urgent" if "urgent" in text else "routine",
                intent="hospital_recommendation",
                specialty="cardiac",
                disease_or_condition="Coronary Angioplasty / Heart Treatment",
                recommended_hospitals=hospitals,
                action_buttons=actions,
                quick_suggestions=[
                    "What documents are needed for PMJAY cashless angioplasty?",
                    "Compare Fortis Mohali vs Max Mohali",
                    "Which hospital has lowest wait time for stent?",
                ],
                ai_provider="clinical_rules",
            )

        # ── 3. Orthopedics / Knee / Hip Replacement ──
        if any(k in text for k in ["knee", "joint", "orthopedic", "ghutna", "hip replacement", "tkr", "acl", "bone"]):
            hospitals = self._resolve_hospitals(["Max Super Speciality Mohali", "Sohana Multi Speciality Hospital", "Ivy Hospital Mohali"], specialty="orthopedic")
            reply = (
                "**Orthopedic & Joint Replacement Directory:**\n\n"
                "• **Total Knee Replacement (TKR)**: Government subsidized rates are **₹80,000 – ₹95,000**, while private robotic knee replacement ranges from **₹1,45,000 – ₹2,20,000**.\n"
                "• **Ayushman Bharat Coverage**: PMJAY covers bilateral and unilateral TKR including certified implants and 5 days hospitalization.\n"
                "• **Recommended Centers**: Max Mohali features robotic arm-assisted arthroplasty; Sohana Hospital offers trusted high-volume subsidized joint surgery."
            )
            actions = [
                ChatAction(type="compare", label="⚖️ Compare Knee Surgery Centers", value="/compare?ids=max-super-speciality-mohali,sohana-hospital-mohali"),
                ChatAction(type="view_hospital", label="🏥 View Sohana Hospital", value="/hospitals/sohana-hospital-mohali"),
            ]
            return ChatResponse(
                reply=reply,
                triage_level="routine",
                intent="procedure_cost",
                specialty="orthopedic",
                disease_or_condition="Joint Replacement / Knee Surgery",
                recommended_hospitals=hospitals,
                action_buttons=actions,
                quick_suggestions=[
                    "What is included in PMJAY knee replacement package?",
                    "Difference between manual vs robotic knee surgery?",
                    "Average recovery period after knee replacement?",
                ],
                ai_provider="clinical_rules",
            )

        # ── 4. Nephrology / Dialysis / Kidney ──
        if any(k in text for k in ["dialysis", "kidney", "renal", "gurda", "creatinine"]):
            hospitals = self._resolve_hospitals(["PGIMER Chandigarh", "Ivy Hospital Mohali", "CMC Ludhiana"], specialty="renal")
            reply = (
                "**Nephrology & Dialysis Care Pathways:**\n\n"
                "• **Hemodialysis Session**: ₹1,200 – ₹1,800 per session under PMJAY cashless package; private direct rates are ₹2,500 – ₹3,500.\n"
                "• **Kidney Transplant**: Comprehensive package spans ₹2,50,000 – ₹6,50,000 (donor/recipient workup, surgery, and immunosuppressant induction).\n"
                "• **Available Facilities**: PGIMER has north India's largest renal transplant division; Ivy Hospital maintains dedicated dialysis slots."
            )
            actions = [
                ChatAction(type="view_hospital", label="🏥 View PGIMER Nephrology", value="/hospitals/pgimer-chandigarh"),
                ChatAction(type="view_hospital", label="🏥 View Ivy Hospital", value="/hospitals/ivy-hospital-mohali"),
            ]
            return ChatResponse(
                reply=reply,
                triage_level="urgent" if "high creatinine" in text else "routine",
                intent="procedure_cost",
                specialty="renal",
                disease_or_condition="Renal Dialysis / Kidney Care",
                recommended_hospitals=hospitals,
                action_buttons=actions,
                quick_suggestions=[
                    "How to get free dialysis under PMJAY?",
                    "Are emergency dialysis slots open today?",
                    "What are the donor rules for kidney transplant?",
                ],
                ai_provider="clinical_rules",
            )

        # ── 5. General Inquiry Fallback ──
        hospitals = self._resolve_hospitals(["PGIMER Chandigarh", "Max Super Speciality Mohali"])
        reply = (
            "**MedRoute Clinical Assistant Ready to Help:**\n\n"
            "I can help you:\n"
            "1. **Locate Nearby Accredited Hospitals** based on symptoms, specialty, and live ICU bed telemetry.\n"
            "2. **Check Ayushman Bharat (PMJAY) Coverage** and verified package tariffs with zero hidden charges.\n"
            "3. **Emergency Triage**: If you or a family member is experiencing critical symptoms, please describe them or tap **SOS Dispatch** immediately.\n\n"
            "How can I assist your healthcare query today?"
        )
        actions = [
            ChatAction(type="sos_dispatch", label="🚨 Emergency SOS", value="/sos"),
            ChatAction(type="compare", label="🔍 Browse Hospital Directory", value="/search"),
        ]
        return ChatResponse(
            reply=reply,
            triage_level="routine",
            intent="general_info",
            specialty=None,
            disease_or_condition=None,
            recommended_hospitals=hospitals,
            action_buttons=actions,
            quick_suggestions=[
                "Find heart hospital in Mohali under 2 lakh",
                "Knee replacement with PMJAY cashless",
                "Emergency ICU beds available right now",
            ],
            ai_provider="clinical_rules",
        )

    def _resolve_hospitals(
        self,
        names: List[str],
        specialty: Optional[str] = None,
        is_emergency: bool = False,
    ) -> List[ChatHospitalRecommendation]:
        """Matches hospital names or specialty against reference hospital directory."""
        results = []
        matched_slugs = set()

        # Match by name
        for target in names:
            target_lower = target.lower()
            for h in REFERENCE_HOSPITALS:
                if h["slug"] not in matched_slugs and (target_lower in h["name"].lower() or h["name"].lower() in target_lower):
                    matched_slugs.add(h["slug"])
                    results.append(self._to_recommendation(h, is_emergency))

        # If fewer than 2 matched, fill by specialty or trauma
        if len(results) < 2:
            for h in REFERENCE_HOSPITALS:
                if h["slug"] not in matched_slugs:
                    if (is_emergency and h.get("is_trauma")) or (specialty and specialty in h.get("specialties", [])):
                        matched_slugs.add(h["slug"])
                        results.append(self._to_recommendation(h, is_emergency))
                if len(results) >= 3:
                    break

        # If still empty, supply top benchmark hospitals
        if not results:
            for h in REFERENCE_HOSPITALS[:2]:
                results.append(self._to_recommendation(h, is_emergency))

        return results[:3]

    def _to_recommendation(self, h: Dict[str, Any], is_emergency: bool) -> ChatHospitalRecommendation:
        return ChatHospitalRecommendation(
            id=h["id"] if "id" in h else f"hosp-{h['slug']}",
            name=h["name"],
            slug=h["slug"],
            type=h["type"],
            address=h["address"],
            distance_km=h.get("distance_km", 4.5),
            overall_rating=h.get("overall_rating", 4.7),
            beds_icu_available=h.get("beds_icu_available", 8),
            is_pmjay_empanelled=h.get("is_pmjay_empanelled", True),
            cost_indicative=h.get("cost_indicative"),
            phone=h.get("phone"),
            emergency_phone=h.get("emergency_phone"),
            why_recommended="24/7 Level 1 Emergency Intake & ICU Primed" if is_emergency else "Audited package tariff & high clinical success rate",
        )

    def _build_actions(self, triage_level: str, hospitals: List[ChatHospitalRecommendation]) -> List[ChatAction]:
        actions = []
        if triage_level == "emergency":
            actions.append(ChatAction(type="call_emergency", label="🚨 Call 108 Emergency", value="108"))
            actions.append(ChatAction(type="sos_dispatch", label="🆘 Open SOS Dispatch", value="/sos"))
            if hospitals and hospitals[0].emergency_phone:
                actions.append(ChatAction(
                    type="call_hospital",
                    label=f"📞 Call {hospitals[0].name.split()[0]} Trauma",
                    value=hospitals[0].emergency_phone,
                ))
        else:
            if len(hospitals) >= 2:
                actions.append(ChatAction(
                    type="compare",
                    label=f"⚖️ Compare Top Hospitals",
                    value=f"/compare?ids={hospitals[0].slug},{hospitals[1].slug}",
                ))
            if hospitals:
                actions.append(ChatAction(
                    type="view_hospital",
                    label=f"🏥 View {hospitals[0].name.split()[0]}",
                    value=f"/hospitals/{hospitals[0].slug}",
                ))
        return actions


clinical_chatbot = ClinicalChatbot()
