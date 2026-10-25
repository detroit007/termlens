import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlmodel import Session, select
from app.models import User, TermHistory, QuizAttempt, Badge, QuizGradeResult

BADGES_CATALOG = {
    "first_step": {
        "title": "First Spark",
        "description": "Explored your first AI concept with TermLens",
        "category": "Milestone",
    },
    "explorer_5": {
        "title": "Concept Explorer",
        "description": "Mastered 5 distinct AI concepts",
        "category": "Milestone",
    },
    "streak_3": {
        "title": "Three-Day Fire",
        "description": "Kept your learning streak alive for 3 days",
        "category": "Consistency",
    },
    "streak_7": {
        "title": "Weekly Sage",
        "description": "Maintained an unbroken 7-day study streak",
        "category": "Consistency",
    },
    "quiz_ace": {
        "title": "Mastery Ace",
        "description": "Scored a perfect 3/3 on an AI concept quiz",
        "category": "Mastery",
    },
    "daily_champion": {
        "title": "Daily Champion",
        "description": "Achieved your daily study goal",
        "category": "Dedication",
    },
    "curator_ally": {
        "title": "Curator Ally",
        "description": "Submitted an educational review for external search",
        "category": "Community",
    },
}

def update_streak(user: User, today_str: str) -> bool:
    """Update user streak with streak freeze protection."""
    if user.last_active_date == today_str:
        return False  # Already active today

    try:
        last_date = datetime.strptime(user.last_active_date, "%Y-%m-%d").date()
        today_date = datetime.strptime(today_str, "%Y-%m-%d").date()
        delta_days = (today_date - last_date).days

        if delta_days == 1:
            user.streak_days += 1
        elif delta_days == 2 and user.streak_freezes > 0:
            # Use streak freeze to save the streak!
            user.streak_freezes -= 1
            user.streak_days += 1
        elif delta_days > 1:
            user.streak_days = 1

        user.last_active_date = today_str
        # Reset daily progress for new day
        user.daily_progress = 0
        return True
    except Exception:
        user.last_active_date = today_str
        return False

def check_and_award_badge(user_id: int, badge_id: str, session: Session) -> bool:
    """Award a badge if the user doesn't already have it."""
    statement = select(Badge).where(Badge.user_id == user_id, Badge.badge_id == badge_id)
    existing = session.exec(statement).first()
    if existing:
        return False

    meta = BADGES_CATALOG.get(badge_id)
    if not meta:
        return False

    new_badge = Badge(
        user_id=user_id,
        badge_id=badge_id,
        title=meta["title"],
        description=meta["description"],
        category=meta["category"],
    )
    session.add(new_badge)
    session.commit()
    return True

def record_term_history(user_id: int, term_data: Dict[str, Any], session: Session) -> Dict[str, Any]:
    """Record viewed term, update daily goal, streaks, and award XP."""
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()
    if not user:
        return {}

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    update_streak(user, today_str)

    # Increment daily progress
    user.daily_progress += 1
    xp_gained = 15
    user.xp += xp_gained
    user.level = max(1, (user.xp // 100) + 1)

    # Save history
    explanation = term_data.get("explanation", {})
    mental_model = explanation.get("mental_model", {})
    steps_list = mental_model.get("steps", [])

    history = TermHistory(
        user_id=user_id,
        term=explanation.get("term", term_data.get("term", "Unknown")),
        simple=explanation.get("simple", ""),
        mental_model_analogy=mental_model.get("analogy", ""),
        mental_model_steps_json=json.dumps(steps_list),
        example=explanation.get("example", ""),
        quiz_question=explanation.get("quiz", {}).get("question", ""),
        from_glossary=explanation.get("from_glossary", False),
        web_search_used=explanation.get("web_search_used", False),
    )
    session.add(history)

    # Check badges
    check_and_award_badge(user_id, "first_step", session)

    count_history = len(session.exec(select(TermHistory).where(TermHistory.user_id == user_id)).all())
    if count_history >= 5:
        check_and_award_badge(user_id, "explorer_5", session)

    if user.streak_days >= 3:
        check_and_award_badge(user_id, "streak_3", session)
    if user.streak_days >= 7:
        check_and_award_badge(user_id, "streak_7", session)

    if user.daily_progress >= user.daily_goal:
        user.xp += 25  # Daily goal bonus!
        check_and_award_badge(user_id, "daily_champion", session)

    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "user_id": user.id,
        "xp": user.xp,
        "level": user.level,
        "streak_days": user.streak_days,
        "streak_freezes": user.streak_freezes,
        "daily_progress": user.daily_progress,
        "daily_goal": user.daily_goal,
        "credits": user.credits,
    }

def record_quiz_outcome(user_id: int, grade: QuizGradeResult, session: Session) -> Dict[str, Any]:
    """Save quiz attempt and update student rewards."""
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()
    if not user:
        return {}

    attempt = QuizAttempt(
        user_id=user_id,
        term=grade.term,
        question=grade.term,  # question
        student_answer=grade.student_answer,
        score=grade.score,
        feedback=grade.feedback,
        xp_earned=grade.xp_awarded,
    )
    session.add(attempt)

    user.xp += grade.xp_awarded
    user.level = max(1, (user.xp // 100) + 1)

    if grade.score == 3:
        check_and_award_badge(user_id, "quiz_ace", session)

    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "xp": user.xp,
        "level": user.level,
        "xp_awarded": grade.xp_awarded,
    }

def buy_or_use_streak_freeze(user_id: int, session: Session) -> Dict[str, Any]:
    """Spend 5 credits to purchase a streak freeze protection."""
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()
    if not user:
        return {"success": False, "message": "User not found"}

    if user.credits < 5:
        return {"success": False, "message": "Not enough credits. You need 5 credits for a Streak Freeze."}

    user.credits -= 5
    user.streak_freezes += 1
    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "success": True,
        "streak_freezes": user.streak_freezes,
        "credits": user.credits,
        "message": "Streak Freeze acquired! Your streak is protected from 1 missed day.",
    }
