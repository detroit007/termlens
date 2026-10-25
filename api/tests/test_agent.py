import os
import pytest
from app.agent import generate_term_explanation
from app.tools import lookup_glossary_term, request_web_search_with_hitl
from app.database import create_db_and_tables

@pytest.fixture(autouse=True)
def setup_db():
    create_db_and_tables()

def test_glossary_lookup_found():
    entry, found = lookup_glossary_term("rag")
    assert found is True
    assert entry is not None
    assert "Retrieval-Augmented Generation" in entry["term"]
    assert "Stanford University HAI" in entry["source"]

def test_glossary_lookup_not_found():
    entry, found = lookup_glossary_term("completely_made_up_quantum_term")
    assert found is False
    assert entry is None

def test_web_search_hitl_creation():
    hitl_data = request_web_search_with_hitl("mixture of experts", user_id=1)
    assert hitl_data["status"] == "pending_human_approval"
    assert "request_id" in hitl_data
    assert "search_summary" in hitl_data

def test_agent_structured_output_with_fake_model():
    """Verify structured output with fake model (simple, mental model + 3 steps, example, quiz)."""
    res = generate_term_explanation("RAG", allow_web_search=False, user_id=1, force_fake=True)
    assert res["blocked"] is False
    exp = res["explanation"]

    assert exp["term"] is not None
    assert isinstance(exp["simple"], str)
    assert len(exp["simple"]) > 10

    # Verify mental model has analogy and exactly 3 steps
    assert "analogy" in exp["mental_model"]
    assert "steps" in exp["mental_model"]
    assert len(exp["mental_model"]["steps"]) == 3

    # Verify example and quiz
    assert isinstance(exp["example"], str)
    assert "question" in exp["quiz"]
    assert len(exp["quiz"]["options"]) == 4
    assert exp["from_glossary"] is True
