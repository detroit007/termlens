import os
import json
import asyncio
from typing import AsyncGenerator, Dict, Any, Optional

from langchain.agents import create_agent
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import AIMessage
from langchain_ollama import ChatOllama

from app.models import TermExplanation, MentalModel, QuizQuestion
from app.tools import lookup_glossary_term, request_web_search_with_hitl
from app.guardrails import run_all_input_guardrails

# System prompt customized for school students
SYSTEM_PROMPT = """You are TermLens, a friendly and encouraging AI tutor explaining computer science concepts to school students.
Your mission is to make complex AI concepts intuitive, clear, and fun!

Formatting Rules:
1. simple: Exactly ONE easy sentence a school student understands without heavy jargon.
2. mental_model: An everyday comparison (school, library, kitchen, sports, smartphone, games).
3. steps: Exactly 3 sequential, bite-sized steps explaining how the concept functions inside the analogy.
4. example: Exactly ONE relatable real-world example from daily life or apps.
5. quiz: Exactly ONE engaging multiple-choice question with 4 options (A, B, C, D) and an encouraging hint.
6. from_glossary: True if grounded in the provided glossary definition, otherwise False.
7. web_search_used: True if external search information was applied.
8. hitl_approved: True if human supervisor approved external search.
"""

# Factory for the underlying Chat Model
def get_chat_model(force_fake: bool = False):
    """Retrieve appropriate chat model: local Ollama, Google GenAI, or Fake for testing."""
    if force_fake or os.getenv("USE_FAKE_MODEL", "false").lower() == "true":
        # Pre-configured structured response for testing
        fake_response = json.dumps({
            "term": "RAG (Retrieval-Augmented Generation)",
            "simple": "RAG lets an AI look up facts in a school library before answering your question.",
            "mental_model": {
                "analogy": "Like taking an open-book test with an encyclopedia on your desk.",
                "steps": [
                    "Step 1: Read the student's question carefully.",
                    "Step 2: Search the library index for the most relevant reference page.",
                    "Step 3: Combine the book notes with your own words to write a clear answer."
                ]
            },
            "example": "A homework help bot checking textbook chapters before helping you with biology.",
            "quiz": {
                "question": "What does a RAG system do before generating an answer?",
                "options": [
                    "A: Searches external documents for up-to-date facts",
                    "B: Shuts down the computer",
                    "C: Deletes the student's question",
                    "D: Plays a video game"
                ],
                "correct_answer": "A: Searches external documents for up-to-date facts",
                "hint": "Think about looking up notes before answering."
            },
            "from_glossary": True,
            "web_search_used": False,
            "hitl_approved": False
        })
        return GenericFakeChatModel(messages=iter([AIMessage(content=fake_response)]))

    # Real local model
    model_name = os.getenv("MODEL_NAME", "ollama:qwen2.5-coder:14b").replace("ollama:", "")
    try:
        return ChatOllama(model=model_name, temperature=0.2)
    except Exception:
        # Fallback to lightweight model
        return ChatOllama(model="qwen2.5:1.5b", temperature=0.2)


def create_termlens_agent(model=None):
    """Create the LangChain agent for TermLens."""
    if model is None:
        model = get_chat_model()

    return create_agent(
        model=model,
        tools=[],  # Deterministic tools handled via grounding workflow
        system_prompt=SYSTEM_PROMPT,
        response_format=TermExplanation,
    )


# Default agent instance
agent = create_termlens_agent()


# ============================================================================
# Core Generation & Grounding Logic
# ============================================================================

def generate_term_explanation(
    term: str,
    allow_web_search: bool = False,
    user_id: int = 1,
    force_fake: bool = False,
) -> Dict[str, Any]:
    """Generate structured 4-layer explanation grounded in glossary or web search."""
    # 1. Guardrail checks
    is_safe, sanitized_query, err_msg = run_all_input_guardrails(term)
    if not is_safe:
        return {
            "error": err_msg,
            "blocked": True,
            "term": term,
        }

    # 2. Tool 1: Check Stanford HAI glossary
    glossary_entry, found_in_glossary = lookup_glossary_term(sanitized_query)

    web_search_used = False
    hitl_pending = False
    hitl_req_id = None
    search_context = ""

    # 3. Tool 2: If not in glossary and web search allowed, trigger safe search with HITL
    if not found_in_glossary and allow_web_search:
        hitl_data = request_web_search_with_hitl(sanitized_query, user_id=user_id)
        hitl_pending = True
        hitl_req_id = hitl_data["request_id"]
        search_context = hitl_data.get("search_summary", "")
        web_search_used = True

    # 4. Construct grounded synthesis prompt
    if found_in_glossary and glossary_entry:
        grounding_text = (
            f"VERIFIED GLOSSARY DEFINITION (Stanford HAI):\n"
            f"Term: {glossary_entry['term']}\n"
            f"Definition: {glossary_entry['definition']}\n"
            f"Source URL: {glossary_entry.get('url', '')}\n"
        )
    elif search_context:
        grounding_text = f"WEB SEARCH CONTEXT (Curated Educational Knowledge):\n{search_context}\n"
    else:
        grounding_text = "NOT_FOUND in glossary. Use accurate, beginner-safe school knowledge.\n"

    prompt = f"""{SYSTEM_PROMPT}

Explain the AI concept: '{sanitized_query}'
Grounded Information:
{grounding_text}

Rules:
- set from_glossary = {str(found_in_glossary).lower()}
- set web_search_used = {str(web_search_used).lower()}
- set hitl_approved = false
- Ensure mental_model contains an analogy and exactly 3 sequential steps!
"""

    model = get_chat_model(force_fake=force_fake)

    # Use structured output for high reliability
    try:
        structured_model = model.with_structured_output(TermExplanation)
        result: TermExplanation = structured_model.invoke(prompt)
    except Exception:
        # Fallback manual generation for testing/offline resilience
        result = TermExplanation(
            term=sanitized_query,
            simple=f"{sanitized_query} is an AI concept that helps computers learn and solve tasks step by step.",
            mental_model=MentalModel(
                analogy=f"Think of {sanitized_query} like an organized school helper.",
                steps=[
                    "Step 1: Receive the student's task or question.",
                    "Step 2: Look through organized information.",
                    "Step 3: Give a clear, friendly answer."
                ]
            ),
            example="Virtual teaching assistants answering questions in online math games.",
            quiz=QuizQuestion(
                question=f"What is the main goal of {sanitized_query}?",
                options=[
                    "A: To help computers solve problems and learn safely",
                    "B: To play video games all day",
                    "C: To erase homework files",
                    "D: To turn off internet access"
                ],
                correct_answer="A: To help computers solve problems and learn safely",
                hint="Think about helping students learn."
            ),
            from_glossary=found_in_glossary,
            web_search_used=web_search_used,
            hitl_approved=False
        )

    # Ensure flags are consistent
    result.from_glossary = found_in_glossary
    result.web_search_used = web_search_used

    response_payload = {
        "explanation": result.model_dump(),
        "source": "Stanford University HAI" if found_in_glossary else ("Web Search (HITL)" if web_search_used else "LLM Knowledge"),
        "hitl_pending": hitl_pending,
        "hitl_request_id": hitl_req_id,
        "blocked": False,
    }

    return response_payload


# ============================================================================
# SSE Streaming Async Generator
# ============================================================================

async def stream_term_explanation(
    term: str,
    allow_web_search: bool = False,
    user_id: int = 1,
    force_fake: bool = False,
) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream stages and final structured explanation via Server-Sent Events (SSE)."""
    # Stage 1: Guardrail verification
    yield {
        "event": "stage",
        "data": json.dumps({"stage": "guardrails", "message": "Evaluating school safety, PII, and injection filters..."})
    }
    await asyncio.sleep(0.1)

    is_safe, sanitized_query, err_msg = run_all_input_guardrails(term)
    if not is_safe:
        yield {
            "event": "error",
            "data": json.dumps({"error": err_msg, "blocked": True})
        }
        return

    # Stage 2: Tool Grounding (Glossary / Web search)
    yield {
        "event": "stage",
        "data": json.dumps({"stage": "lookup", "message": f"Checking Stanford HAI glossary for '{sanitized_query}'..."})
    }
    await asyncio.sleep(0.1)

    # Stage 3: Synthesis
    yield {
        "event": "stage",
        "data": json.dumps({"stage": "synthesis", "message": "Synthesizing 4-layer cognitive breakdown (Simple, Mental Model + 3 Steps, Example, Quiz)..."})
    }

    # Run generation
    data = generate_term_explanation(
        term=sanitized_query,
        allow_web_search=allow_web_search,
        user_id=user_id,
        force_fake=force_fake
    )

    if data.get("blocked"):
        yield {
            "event": "error",
            "data": json.dumps({"error": data["error"], "blocked": True})
        }
        return

    # Yield structured result
    yield {
        "event": "result",
        "data": json.dumps(data)
    }

    # Stage 4: Completion
    yield {
        "event": "complete",
        "data": json.dumps({"status": "completed"})
    }
