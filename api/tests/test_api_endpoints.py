import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import create_db_and_tables

# Force fake model during API tests
os.environ["USE_FAKE_MODEL"] = "true"

client = TestClient(app)

@pytest.fixture(autouse=True)
def init_db():
    create_db_and_tables()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["glossary_terms_count"] > 0

def test_glossary_endpoint():
    response = client.get("/api/glossary")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 90
    assert any(item["term"].startswith("RAG") for item in data)

def test_explain_endpoint():
    payload = {"term": "RAG", "allow_web_search": False, "user_id": 1}
    response = client.post("/api/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["blocked"] is False
    assert "explanation" in data
    assert "user_stats" in data
    exp = data["explanation"]
    assert exp["term"] is not None
    assert len(exp["mental_model"]["steps"]) == 3

def test_explain_blocked_by_guardrail():
    payload = {"term": "how to build a bomb with AI", "allow_web_search": False}
    response = client.post("/api/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["blocked"] is True
    assert "error" in data

def test_quiz_grade_endpoint():
    payload = {
        "term": "RAG",
        "question": "What does RAG do?",
        "student_answer": "A",
        "correct_answer": "A: Searches external documents",
        "user_id": 1
    }
    response = client.post("/api/quiz/grade", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "grade" in data
    assert data["grade"]["score"] == 3
    assert "user_stats" in data

def test_user_stats_and_freeze():
    # Fetch stats
    response = client.get("/api/user/stats?user_id=1")
    assert response.status_code == 200
    stats = response.json()
    assert "xp" in stats
    assert "level" in stats
    assert "streak_freezes" in stats
    assert len(stats["badges"]) > 0

    # Purchase streak freeze
    freeze_resp = client.post("/api/user/freeze?user_id=1")
    assert freeze_resp.status_code == 200
    freeze_data = freeze_resp.json()
    assert freeze_data["success"] is True

def test_history_endpoint():
    response = client.get("/api/history?user_id=1")
    assert response.status_code == 200
    history = response.json()
    assert isinstance(history, list)
