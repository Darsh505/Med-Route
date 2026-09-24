"""
schemas/chatbot.py — Clinical Chatbot NLP Schemas
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")

class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        examples=["My father has acute chest pain and sweating in Mohali, where should I take him?"],
    )
    history: List[ChatMessage] = Field(default=[], description="Previous conversation turns")
    latitude: Optional[float] = Field(default=30.7333, ge=-90, le=90)
    longitude: Optional[float] = Field(default=76.7794, ge=-180, le=180)
    city: Optional[str] = Field(default=None, description="Patient's current active city, e.g. 'Jalandhar'")
    preferred_language: str = Field(default="en", description="'en', 'hi', or 'hinglish'")

class ChatAction(BaseModel):
    type: str = Field(..., description="'call_emergency', 'view_hospital', 'compare', 'call_hospital', 'sos_dispatch'")
    label: str
    value: str
    data: Optional[Dict[str, Any]] = None

class ChatHospitalRecommendation(BaseModel):
    id: str
    name: str
    slug: str
    type: str
    address: str
    distance_km: Optional[float] = None
    overall_rating: float = 4.5
    beds_icu_available: int = 0
    is_pmjay_empanelled: bool = False
    cost_indicative: Optional[str] = None
    phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    why_recommended: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    triage_level: str = Field(default="routine", description="'emergency', 'urgent', or 'routine'")
    intent: str = Field(
        default="general_info",
        description="'emergency_sos', 'hospital_recommendation', 'procedure_cost', 'insurance_query', or 'general_info'",
    )
    specialty: Optional[str] = None
    disease_or_condition: Optional[str] = None
    recommended_hospitals: List[ChatHospitalRecommendation] = []
    action_buttons: List[ChatAction] = []
    quick_suggestions: List[str] = []
    ai_provider: str = Field(default="gemini", description="'gemini' or 'clinical_rules'")
