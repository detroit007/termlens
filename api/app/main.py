import json
import os
from contextlib import asynccontextmanager
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from sqlmodel import Session, select

from app.models import (
    ExplainRequest,
    QuizGradeRequest,
    HITLApprovalRequest,
    User,
    TermHistory,
    QuizAttempt,
    Badge,
    HITLRequest,
)
from app.database import create_db_and_tables, get_session
from app.guardrails import rate_limiter, run_all_input_guardrails
from app.agent import generate_term_explanation, stream_term_explanation
from app.quiz_grader import grade_quiz_submission
from app.gamification import (
    record_term_history,
    record_quiz_outcome,
    buy_or_use_streak_freeze,
    check_and_award_badge,
    BADGES_CATALOG,
)
from app.tools import GLOSSARY_STORE

# Lifespan for database initialization
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="TermLens API",
    version="1.0.0",
    description="Intelligent AI Term Explainer for School Students",
    lifespan=lifespan,
)

# Enable CORS for Next.js web application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# 1. Health & Glossary Endpoints
# ============================================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TermLens API",
        "glossary_terms_count": len(GLOSSARY_STORE),
    }


@app.get("/api/glossary")
def get_glossary_terms():
    """Retrieve full list of Stanford HAI glossary terms."""
    unique_terms = {}
    for key, val in GLOSSARY_STORE.items():
        slug = val.get("slug")
        if slug and slug not in unique_terms:
            unique_terms[slug] = val
    return list(unique_terms.values())


# ============================================================================
# 2. Term Explanation Endpoints (Standard & SSE Stream)
# ============================================================================

@app.post("/api/explain")
def explain_term(
    req: ExplainRequest,
    request: Request,
    session: Session = Depends(get_session),
):
    """Generate structured 4-layer AI explanation."""
    # Rate Limiting
    client_ip = request.client.host if request.client else "unknown"
    allowed, retry_after = rate_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=f"Rate limit exceeded. Try again in {retry_after}s.")

    # Guardrails
    is_safe, sanitized_query, err_msg = run_all_input_guardrails(req.term)
    if not is_safe:
        return {"error": err_msg, "blocked": True, "term": req.term}

    # Generate
    result = generate_term_explanation(
        term=sanitized_query,
        allow_web_search=bool(req.allow_web_search),
        user_id=req.user_id or 1,
    )

    if result.get("blocked"):
        return result

    # Record history & gamification
    user_stats = record_term_history(req.user_id or 1, result, session)
    result["user_stats"] = user_stats

    return result


@app.get("/api/explain/stream")
async def stream_explain_endpoint(
    term: str = Query(..., description="The AI term to explain"),
    allow_web_search: bool = Query(False),
    user_id: int = Query(1),
    request: Request = None,
    session: Session = Depends(get_session),
):
    """Server-Sent Events (SSE) streaming endpoint."""
    client_ip = request.client.host if request and request.client else "unknown"
    allowed, retry_after = rate_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=f"Rate limit exceeded. Try again in {retry_after}s.")

    async def event_generator():
        async for event in stream_term_explanation(
            term=term,
            allow_web_search=allow_web_search,
            user_id=user_id,
        ):
            # Save history when result is reached
            if event.get("event") == "result":
                try:
                    res_data = json.loads(event["data"])
                    record_term_history(user_id, res_data, session)
                except Exception:
                    pass
            yield event

    return EventSourceResponse(event_generator())


# ============================================================================
# 3. Quiz Grading Endpoint (0-3 Scale with Pedagogical Feedback)
# ============================================================================

@app.post("/api/quiz/grade")
def grade_quiz(
    req: QuizGradeRequest,
    session: Session = Depends(get_session),
):
    """Grade a student quiz response on a 0-3 scale with AI feedback."""
    grade_result = grade_quiz_submission(
        term=req.term,
        question=req.question,
        student_answer=req.student_answer,
        correct_answer=req.correct_answer,
    )

    user_outcome = record_quiz_outcome(req.user_id or 1, grade_result, session)

    return {
        "grade": grade_result.model_dump(),
        "user_stats": user_outcome,
    }


# ============================================================================
# 4. Human-in-the-Loop (HITL) Teacher/Curator Endpoints
# ============================================================================

@app.get("/api/hitl/pending")
def list_pending_hitl_requests(session: Session = Depends(get_session)):
    """List pending search approval requests for human review."""
    statement = select(HITLRequest).where(HITLRequest.status == "pending")
    return session.exec(statement).all()


@app.post("/api/hitl/approve")
def review_hitl_request(
    req: HITLApprovalRequest,
    session: Session = Depends(get_session),
):
    """Teacher/Curator approves or rejects an external web search."""
    statement = select(HITLRequest).where(HITLRequest.id == req.request_id)
    hitl_item = session.exec(statement).first()
    if not hitl_item:
        raise HTTPException(status_code=404, detail="Approval request not found.")

    hitl_item.status = "approved" if req.approved else "rejected"
    hitl_item.review_notes = req.review_notes
    session.add(hitl_item)
    session.commit()

    # Award Curator badge to user
    check_and_award_badge(hitl_item.user_id, "curator_ally", session)

    return {
        "request_id": hitl_item.id,
        "status": hitl_item.status,
        "message": "Human-in-the-loop decision recorded.",
    }


# ============================================================================
# 5. Engagement & Gamification Endpoints
# ============================================================================

@app.get("/api/user/stats")
def get_user_stats(
    user_id: int = Query(1),
    session: Session = Depends(get_session),
):
    """Get student XP, levels, streaks, credits, and badges."""
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    badges = session.exec(select(Badge).where(Badge.user_id == user_id)).all()

    # Full catalog with locked/unlocked state
    unlocked_ids = {b.badge_id for b in badges}
    all_badges = []
    for bid, meta in BADGES_CATALOG.items():
        all_badges.append({
            "id": bid,
            "title": meta["title"],
            "description": meta["description"],
            "category": meta["category"],
            "unlocked": bid in unlocked_ids,
        })

    next_level_xp = user.level * 100

    return {
        "id": user.id,
        "username": user.username,
        "xp": user.xp,
        "level": user.level,
        "next_level_xp": next_level_xp,
        "streak_days": user.streak_days,
        "streak_freezes": user.streak_freezes,
        "credits": user.credits,
        "daily_goal": user.daily_goal,
        "daily_progress": user.daily_progress,
        "last_active_date": user.last_active_date,
        "badges": all_badges,
    }


@app.post("/api/user/freeze")
def purchase_streak_freeze(
    user_id: int = Query(1),
    session: Session = Depends(get_session),
):
    """Spend 5 credits to purchase a streak freeze protection."""
    return buy_or_use_streak_freeze(user_id, session)


@app.get("/api/history")
def get_history(
    user_id: int = Query(1),
    session: Session = Depends(get_session),
):
    """Retrieve history of explored AI concepts."""
    statement = (
        select(TermHistory)
        .where(TermHistory.user_id == user_id)
        .order_by(TermHistory.created_at.desc())
        .limit(20)
    )
    items = session.exec(statement).all()
    return [
        {
            "id": h.id,
            "term": h.term,
            "simple": h.simple,
            "mental_model": h.mental_model_analogy,
            "steps": h.steps,
            "example": h.example,
            "quiz_question": h.quiz_question,
            "from_glossary": h.from_glossary,
            "web_search_used": h.web_search_used,
            "created_at": h.created_at.isoformat(),
        }
        for h in items
    ]


# ============================================================================
# CLI Direct Execution Fallback
# ============================================================================

if __name__ == "__main__":
    create_db_and_tables()
    print("🎓 TermLens CLI Mode for School Students")
    term_input = input("Enter an AI term to explain (e.g., 'RAG', 'Agentic AI'): ").strip()
    if term_input:
        res = generate_term_explanation(term_input)
        if res.get("blocked"):
            print(f"\n⚠️ Guardrail Alert: {res['error']}")
        else:
            exp = res["explanation"]
            print(f"\nTerm:         {exp['term']}")
            print(f"Simple:       {exp['simple']}")
            print(f"Mental Model: {exp['mental_model']['analogy']}")
            print("Steps:")
            for s in exp['mental_model']['steps']:
                print(f"  • {s}")
            print(f"Example:      {exp['example']}")
            print(f"Quiz:         {exp['quiz']['question']}")
            for opt in exp['quiz']['options']:
                print(f"  {opt}")
            print(f"Source:       {res['source']}")