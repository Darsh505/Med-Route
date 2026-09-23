"""tests/test_chatbot.py — Clinical Chatbot NLP & Triage Tests"""

import pytest
from app.ai.chatbot import ClinicalChatbot
from app.schemas.chatbot import ChatRequest, ChatMessage

@pytest.fixture
def chatbot():
    """Rule-based clinical chatbot (offline, no API key needed for testing)."""
    return ClinicalChatbot(api_key="")

@pytest.mark.asyncio
async def test_chat_cardiac_emergency_triage(chatbot):
    req = ChatRequest(
        message="My father has severe chest pain, sweating, and left arm numbness",
        history=[],
    )
    res = await chatbot.chat(req)

    assert res.triage_level == "emergency"
    assert res.intent == "emergency_sos"
    assert res.specialty == "cardiac"
    assert "CRITICAL TRIAGE" in res.reply
    assert any(a.value == "108" for a in res.action_buttons)
    assert len(res.recommended_hospitals) > 0

@pytest.mark.asyncio
async def test_chat_stroke_emergency_triage(chatbot):
    req = ChatRequest(
        message="Patient has sudden face drooping, slurred speech, and arm weakness",
        history=[],
    )
    res = await chatbot.chat(req)

    assert res.triage_level == "emergency"
    assert res.intent == "emergency_sos"
    assert any(a.value == "/sos" for a in res.action_buttons)

@pytest.mark.asyncio
async def test_chat_elective_angioplasty_costs(chatbot):
    req = ChatRequest(
        message="What is the package rate for angioplasty stent in Mohali with PMJAY?",
        history=[],
    )
    res = await chatbot.chat(req)

    assert res.triage_level in ["routine", "urgent"]
    assert res.specialty == "cardiac"
    assert "65,000" in res.reply or "PMJAY" in res.reply
    assert len(res.recommended_hospitals) >= 2

@pytest.mark.asyncio
async def test_chat_knee_replacement_query(chatbot):
    req = ChatRequest(
        message="Mother needs knee replacement surgery, can we get it under Ayushman Bharat?",
        history=[],
    )
    res = await chatbot.chat(req)

    assert res.specialty == "orthopedic"
    assert "PMJAY" in res.reply or "Knee" in res.reply
    assert len(res.action_buttons) > 0

@pytest.mark.asyncio
async def test_chat_dialysis_query(chatbot):
    req = ChatRequest(
        message="Where can I get affordable dialysis near Chandigarh?",
        history=[],
    )
    res = await chatbot.chat(req)

    assert res.specialty == "renal"
    assert "Dialysis" in res.reply or "dialysis" in res.reply
