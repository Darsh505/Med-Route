"""tests/test_search.py — NLP Search Parser Tests"""

import pytest
from app.ai.nlp_parser import NLPParser

@pytest.fixture
def parser():
    """Rule-based parser (no API key needed for tests)."""
    return NLPParser(gemini_api_key="")  # Use rule-based fallback

@pytest.mark.asyncio
async def test_parse_kidney_chandigarh_budget(parser):
    filters = await parser.parse("Find kidney treatment near Chandigarh under 2 lakhs")
    assert filters.location_text == "Chandigarh"
    assert filters.max_budget == 200000
    assert "dialysis" in filters.mapped_procedures or "renal" in filters.procedure_categories

@pytest.mark.asyncio
async def test_parse_hinglish_query(parser):
    filters = await parser.parse("ghutne ka operation government hospital Ludhiana mein")
    assert filters.location_text == "Ludhiana"
    assert "government" in filters.hospital_types
    assert "knee_replacement" in filters.mapped_procedures

@pytest.mark.asyncio
async def test_parse_emergency_intent(parser):
    filters = await parser.parse("emergency cardiac care near Delhi urgent")
    assert filters.intent == "sos_emergency"

@pytest.mark.asyncio
async def test_parse_pmjay_filter(parser):
    filters = await parser.parse("PMJAY hospital for heart bypass Delhi")
    assert filters.requires_pmjay is True
    assert "bypass_surgery" in filters.mapped_procedures

@pytest.mark.asyncio
async def test_parse_budget_lakh(parser):
    filters = await parser.parse("orthopedic hospital under 1.5 lakhs Patiala")
    assert filters.max_budget == 150000

@pytest.mark.asyncio
async def test_parse_nabh_accreditation(parser):
    filters = await parser.parse("NABH hospital near Chandigarh")
    assert filters.accreditation == "NABH"

@pytest.mark.asyncio
async def test_parse_empty_returns_defaults(parser):
    filters = await parser.parse("hospital near me")
    assert filters.intent == "hospital_search"
    assert filters.ai_provider == "rule_based"
