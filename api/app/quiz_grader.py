import json
from typing import Optional
from pydantic import BaseModel, Field

from app.agent import get_chat_model
from app.models import QuizGradeResult

class LLMGradeOutput(BaseModel):
    score: int = Field(ge=0, le=3, description="Score 0, 1, 2, or 3")
    feedback: str = Field(description="Warm, encouraging student feedback explaining what was correct or missing")
    is_correct: bool = Field(description="True if score >= 2")

GRADING_PROMPT = """You are a friendly, encouraging AI computer science teacher grading a school student's quiz answer.
Grade the student's answer on a 0 to 3 scale:
- 0: Off-track, incorrect, or irrelevant.
- 1: Developing — partial understanding, but has noticeable misconceptions.
- 2: Proficient — understands the core concept correctly with minor omissions.
- 3: Mastery — completely accurate, clear, and insightful.

Guidelines for feedback:
- Address the student warmly and constructively.
- If correct, praise their reasoning and reinforce why it works.
- If incorrect or partial, explain the concept simply without making them feel bad.

AI Term: {term}
Quiz Question: {question}
Expected / Target Answer: {correct_answer}
Student's Answer: {student_answer}
"""

def grade_quiz_submission(
    term: str,
    question: str,
    student_answer: str,
    correct_answer: Optional[str] = None,
    force_fake: bool = False,
) -> QuizGradeResult:
    """Grade a student's answer using the LLM on a 0-3 scale with feedback."""
    clean_ans = student_answer.strip()
    target_ans = (correct_answer or "").strip()

    # Fast heuristic check for exact multiple-choice letter match
    if target_ans and len(clean_ans) == 1 and clean_ans.upper() in ["A", "B", "C", "D"]:
        is_exact = target_ans.upper().startswith(clean_ans.upper())
        if is_exact:
            return QuizGradeResult(
                term=term,
                student_answer=clean_ans,
                score=3,
                rating="Mastery",
                feedback=f"Spot on! Option {clean_ans.upper()} is completely correct. You've got a firm grasp of {term}!",
                xp_awarded=30,
                is_correct=True,
            )
        else:
            return QuizGradeResult(
                term=term,
                student_answer=clean_ans,
                score=0,
                rating="Needs Review",
                feedback=f"Not quite. Option {clean_ans.upper()} isn't the best match for {term}. Review the mental model and try again!",
                xp_awarded=5,
                is_correct=False,
            )

    # LLM evaluation for explanatory or full answers
    prompt = GRADING_PROMPT.format(
        term=term,
        question=question,
        correct_answer=target_ans or "A correct understanding of the concept",
        student_answer=clean_ans,
    )

    try:
        model = get_chat_model(force_fake=force_fake)
        structured_model = model.with_structured_output(LLMGradeOutput)
        evaluated: LLMGradeOutput = structured_model.invoke(prompt)

        score = max(0, min(3, evaluated.score))
        feedback = evaluated.feedback
        is_correct = evaluated.is_correct
    except Exception:
        # Fallback heuristic grading
        if any(word in clean_ans.lower() for word in ["true", "correct", "yes", "search", "lookup", "learn", "facts"]):
            score = 3
            feedback = f"Great work! Your response demonstrates a strong intuitive understanding of {term}."
            is_correct = True
        else:
            score = 1
            feedback = f"Good effort! You're on the right track, but review how {term} connects to the mental model."
            is_correct = False

    ratings = {
        0: "Needs Review",
        1: "Developing",
        2: "Proficient",
        3: "Mastery",
    }
    xp_map = {0: 5, 1: 15, 2: 25, 3: 35}

    return QuizGradeResult(
        term=term,
        student_answer=clean_ans,
        score=score,
        rating=ratings[score],
        feedback=feedback,
        xp_awarded=xp_map[score],
        is_correct=is_correct,
    )
