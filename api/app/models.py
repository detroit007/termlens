from datetime import datetime, timezone
from typing import Optional, List
import json
from pydantic import BaseModel, Field
from sqlmodel import SQLModel, Field as DBField, Relationship

# ============================================================================
# Pydantic Schemas for Structured Agent Output
# ============================================================================

class MentalModel(BaseModel):
    analogy: str = Field(
        description="An everyday school/home analogy that makes the idea click, e.g. 'RAG is like an open-book exam'"
    )
    steps: List[str] = Field(
        description="Exactly 3 simple, sequential steps explaining how the concept works in the analogy",
        min_length=3,
        max_length=3,
    )


class QuizQuestion(BaseModel):
    question: str = Field(description="One friendly question to test the student's recall")
    options: List[str] = Field(description="4 multiple-choice options (A, B, C, D)")
    correct_answer: str = Field(description="The correct answer text or option label")
    hint: str = Field(description="A helpful hint without giving away the full answer")


class TermExplanation(BaseModel):
    term: str = Field(description="The AI term being explained")
    simple: str = Field(description="One easy sentence a school student understands without jargon")
    mental_model: MentalModel = Field(description="An everyday analogy plus 3 sequential steps")
    example: str = Field(description="One relatable real-life example (school, apps, games)")
    quiz: QuizQuestion = Field(description="A short quiz question with 4 options and a hint")
    from_glossary: bool = Field(default=False, description="True if the definition came from the glossary")
    web_search_used: bool = Field(default=False, description="True if web search was consulted")
    hitl_approved: bool = Field(default=False, description="True if human approved the web search")


# Quiz Grading Response
class QuizGradeResult(BaseModel):
    term: str
    student_answer: str
    score: int = Field(ge=0, le=3, description="Score from 0 (off-track) to 3 (mastery)")
    rating: str = Field(description="Verbal rating: Needs Review, Developing, Proficient, Mastery")
    feedback: str = Field(description="Constructive, encouraging AI pedagogical feedback")
    xp_awarded: int = Field(description="XP awarded based on score (e.g. 0 to 30 XP)")
    is_correct: bool


# Request DTOs
class ExplainRequest(BaseModel):
    term: str
    user_id: Optional[int] = 1
    allow_web_search: Optional[bool] = False


class QuizGradeRequest(BaseModel):
    term: str
    question: str
    student_answer: str
    correct_answer: Optional[str] = None
    user_id: Optional[int] = 1


class HITLApprovalRequest(BaseModel):
    request_id: str
    approved: bool
    review_notes: Optional[str] = None


# ============================================================================
# SQLModel Database Models (SQLite)
# ============================================================================

class User(SQLModel, table=True):
    id: Optional[int] = DBField(default=None, primary_key=True)
    username: str = DBField(unique=True, index=True)
    xp: int = DBField(default=50)
    level: int = DBField(default=1)
    streak_days: int = DBField(default=1)
    streak_freezes: int = DBField(default=1)
    credits: int = DBField(default=20)
    daily_goal: int = DBField(default=3)
    daily_progress: int = DBField(default=0)
    last_active_date: str = DBField(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    created_at: datetime = DBField(default_factory=lambda: datetime.now(timezone.utc))


class TermHistory(SQLModel, table=True):
    id: Optional[int] = DBField(default=None, primary_key=True)
    user_id: int = DBField(foreign_key="user.id", index=True)
    term: str = DBField(index=True)
    simple: str
    mental_model_analogy: str
    mental_model_steps_json: str = DBField(default="[]")
    example: str
    quiz_question: str
    from_glossary: bool = DBField(default=False)
    web_search_used: bool = DBField(default=False)
    created_at: datetime = DBField(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def steps(self) -> List[str]:
        try:
            return json.loads(self.mental_model_steps_json)
        except Exception:
            return []


class QuizAttempt(SQLModel, table=True):
    id: Optional[int] = DBField(default=None, primary_key=True)
    user_id: int = DBField(foreign_key="user.id", index=True)
    term: str
    question: str
    student_answer: str
    score: int = DBField(default=0)  # 0 to 3
    feedback: str
    xp_earned: int = DBField(default=0)
    created_at: datetime = DBField(default_factory=lambda: datetime.now(timezone.utc))


class Badge(SQLModel, table=True):
    id: Optional[int] = DBField(default=None, primary_key=True)
    user_id: int = DBField(foreign_key="user.id", index=True)
    badge_id: str = DBField(index=True)
    title: str
    description: str
    category: str
    unlocked_at: datetime = DBField(default_factory=lambda: datetime.now(timezone.utc))


class HITLRequest(SQLModel, table=True):
    id: str = DBField(primary_key=True)
    user_id: int = DBField(default=1)
    term: str
    search_query: str
    search_summary: str
    status: str = DBField(default="pending")  # pending, approved, rejected
    review_notes: Optional[str] = DBField(default=None)
    created_at: datetime = DBField(default_factory=lambda: datetime.now(timezone.utc))
