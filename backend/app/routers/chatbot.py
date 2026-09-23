"""
--------------------------------------------------
routers/chatbot.py — Clinical AI Chatbot Router
--------------------------------------------------
"""

from fastapi import APIRouter, Depends, Query
from typing import List

from app.schemas import APIResponse
from app.schemas.chatbot import ChatRequest, ChatResponse
from app.ai.chatbot import clinical_chatbot, ClinicalChatbot

router = APIRouter(prefix="/api/chat", tags=["Clinical Chatbot"])


@router.post("", response_model=APIResponse[ChatResponse])
@router.post("/triage", response_model=APIResponse[ChatResponse])
async def clinical_chat(request: ChatRequest):
    """
    AI-powered medical conversational triage & hospital dispatch.

    Features:
    - Life-saving emergency red-flag symptom triage (Chest pain, Stroke FAST, Severe Trauma).
    - Hospital discovery with live ICU telemetry and PMJAY package rates.
    - Dual-engine: Google Gemini AI + Fallback clinical rule engine.
    - Direct actionable buttons (Emergency Call, Compare, View Hospital).
    """
    response = await clinical_chatbot.chat(request)
    return APIResponse(
        data=response,
        message="Clinical dispatch advice processed",
        meta={"ai_provider": response.ai_provider, "triage_level": response.triage_level},
    )


@router.get("/suggestions")
async def get_chat_suggestions():
    """Returns curated clinical prompts for patients and caregivers."""
    suggestions = [
        {
            "category": "Emergency Triage",
            "icon": "emergency",
            "prompts": [
                "My father has severe chest pain and breathlessness in Mohali",
                "Grandmother has sudden arm numbness and slurred speech",
                "Road accident victim with head injury needing Level 1 trauma",
            ],
        },
        {
            "category": "Cardiology & Surgery",
            "icon": "favorite",
            "prompts": [
                "Find angioplasty stent under ₹1.5 Lakh near Chandigarh with PMJAY",
                "Best hospital for bypass surgery with high success rate",
            ],
        },
        {
            "category": "Joints & Orthopedics",
            "icon": "accessibility_new",
            "prompts": [
                "Knee replacement surgery covered under Ayushman Bharat",
                "Compare robotic knee replacement at Max vs Fortis",
            ],
        },
        {
            "category": "ICU & Critical Care",
            "icon": "bed",
            "prompts": [
                "Which hospital has ventilator ICU beds available right now?",
                "Nearest dialysis center with evening slots",
            ],
        },
    ]
    return APIResponse(data=suggestions, message="Curated suggestions loaded")
