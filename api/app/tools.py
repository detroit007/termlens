import json
import uuid
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
from sqlmodel import Session, select
from app.database import engine
from app.models import HITLRequest

# Path to the Stanford HAI glossary
BASE_DIR = Path(__file__).resolve().parent.parent
POSSIBLE_GLOSSARY_PATHS = [
    BASE_DIR / "data" / "glossary.json",
    BASE_DIR.parent / "data" / "glossary.json",
]

def load_glossary() -> Dict[str, Dict[str, Any]]:
    """Load and normalize Stanford HAI glossary entries."""
    for path in POSSIBLE_GLOSSARY_PATHS:
        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                glossary = {}
                if isinstance(data, list):
                    for item in data:
                        raw_term = item.get("term", "").strip()
                        term_lower = raw_term.lower()
                        slug_lower = item.get("slug", "").strip().lower()
                        entry = {
                            "term": raw_term,
                            "slug": item.get("slug", ""),
                            "definition": item.get("definition", "").strip(),
                            "url": item.get("url", ""),
                            "source": item.get("source", "Stanford University HAI"),
                        }
                        
                        glossary[term_lower] = entry
                        if slug_lower:
                            glossary[slug_lower] = entry
                        # Also register acronyms (e.g., 'rag' from 'RAG (Retrieval-Augmented Generation)')
                        if "(" in raw_term:
                            acronym = raw_term.split("(")[0].strip().lower()
                            glossary[acronym] = entry
                return glossary
            except Exception as e:
                print(f"Error loading glossary: {e}")
                return {}
    return {}

GLOSSARY_STORE = load_glossary()


# ============================================================================
# Tool 1: AI Glossary Lookup Tool
# ============================================================================

def lookup_glossary_term(term: str) -> Tuple[Optional[Dict[str, Any]], bool]:
    """Look up an AI term in the Stanford HAI AI glossary.
    
    Args:
        term: The AI concept or acronym to look up.
        
    Returns:
        (entry_dict, found_bool)
    """
    clean_query = term.strip().lower()
    
    # Exact or acronym lookup
    if clean_query in GLOSSARY_STORE:
        return GLOSSARY_STORE[clean_query], True
    
    # Partial substring search
    for key, val in GLOSSARY_STORE.items():
        if clean_query in key or key in clean_query:
            return val, True

    return None, False


# ============================================================================
# Tool 2: Safe Web Search with Human-in-the-Loop (HITL) Gate
# ============================================================================

# Educational curated fallbacks for common unlisted AI terms (for school students)
EDUCATIONAL_FALLBACKS = {
    "lora": "Low-Rank Adaptation (LoRA) is an efficient technique to customize a pre-trained AI model by training only a tiny fraction of extra parameters, like adding sticky notes with new instructions to a textbook instead of rewriting the entire book.",
    "mixture of experts": "Mixture of Experts (MoE) is an architecture where multiple specialized sub-networks ('experts') exist, and a routing mechanism only activates the 1-2 experts best suited for each word, saving immense computer energy.",
    "diffusion model": "Diffusion models generate images by starting with random static noise and gradually learning to remove that noise step by step until a clear picture appears.",
    "token": "A token is a piece of a word or character that language models read and write, like building blocks or syllables.",
}

def request_web_search_with_hitl(term: str, user_id: int = 1) -> Dict[str, Any]:
    """Request a safe web search with human-in-the-loop review.
    
    For school safety, external web searches must be approved by a teacher/curator.
    This creates an approval request record in the database.
    """
    req_id = str(uuid.uuid4())
    search_query = f"what is {term} in artificial intelligence for students"

    # Pre-generate safe summary for curator review
    clean_term = term.strip().lower()
    summary = EDUCATIONAL_FALLBACKS.get(
        clean_term,
        f"Safe verified educational search request for AI concept: '{term}'."
    )

    with Session(engine) as session:
        hitl_record = HITLRequest(
            id=req_id,
            user_id=user_id,
            term=term,
            search_query=search_query,
            search_summary=summary,
            status="pending",
        )
        session.add(hitl_record)
        session.commit()

    return {
        "request_id": req_id,
        "term": term,
        "status": "pending_human_approval",
        "message": "Web search queued for teacher/curator approval.",
        "search_summary": summary,
    }

def check_hitl_status(request_id: str) -> Optional[HITLRequest]:
    """Check the status of an approval request."""
    with Session(engine) as session:
        statement = select(HITLRequest).where(HITLRequest.id == request_id)
        return session.exec(statement).first()
