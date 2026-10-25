import pytest
from app.quiz_grader import grade_quiz_submission

def test_quiz_grading_correct_letter():
    res = grade_quiz_submission(
        term="RAG",
        question="What does RAG do?",
        student_answer="A",
        correct_answer="A: Searches external documents for up-to-date facts",
    )
    assert res.score == 3
    assert res.rating == "Mastery"
    assert res.is_correct is True
    assert res.xp_awarded == 30
    assert "Spot on" in res.feedback

def test_quiz_grading_incorrect_letter():
    res = grade_quiz_submission(
        term="RAG",
        question="What does RAG do?",
        student_answer="B",
        correct_answer="A: Searches external documents for up-to-date facts",
    )
    assert res.score == 0
    assert res.rating == "Needs Review"
    assert res.is_correct is False
    assert res.xp_awarded == 5
    assert "Not quite" in res.feedback

def test_quiz_grading_explanatory_answer():
    res = grade_quiz_submission(
        term="RAG",
        question="In your own words, what does RAG do?",
        student_answer="It searches and looks up facts from a database before answering.",
        correct_answer="Looks up external knowledge",
        force_fake=True,
    )
    assert res.score in [0, 1, 2, 3]
    assert len(res.feedback) > 10
    assert res.xp_awarded > 0
