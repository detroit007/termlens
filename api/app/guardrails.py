import re
import time
from typing import Tuple, Dict

# ============================================================================
# 1. School-Safe Filter
# ============================================================================

UNSAFE_KEYWORDS = [
    r"\b(porn|nsfw|sex|erotic|nude|naked)\b",
    r"\b(kill|murder|suicide|bomb|explosive|weapon|gun|knife|stab)\b",
    r"\b(drugs|cocaine|heroin|meth|weed|marijuana|vape|tobacco)\b",
    r"\b(hate|racist|slur|nazi|terrorist)\b",
]

COMPILED_UNSAFE = [re.compile(p, re.IGNORECASE) for p in UNSAFE_KEYWORDS]

def check_school_safe(text: str) -> Tuple[bool, str]:
    """Ensure query complies with school safety standards."""
    clean = text.strip()
    if not clean:
        return False, "Query cannot be empty."

    for pattern in COMPILED_UNSAFE:
        if pattern.search(clean):
            return False, "TermLens is a safe educational tool for students. Please ask about AI, machine learning, or computer science concepts."

    return True, ""


# ============================================================================
# 2. Prompt Injection Guardrail
# ============================================================================

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)",
    r"disregard\s+(all\s+)?(previous|prior)\s+(instructions|rules)",
    r"you\s+are\s+now\s+(in\s+)?(dan|jailbreak|developer\s+mode)",
    r"system\s*prompt",
    r"reveal\s+(your\s+)?instructions",
    r"bypass\s+(the\s+)?filter",
    r"<script.*?>",
    r"\{\{.*?\}\}",
]

COMPILED_INJECTIONS = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]

def check_prompt_injection(text: str) -> Tuple[bool, str]:
    """Detect common jailbreak and prompt injection patterns."""
    for pattern in COMPILED_INJECTIONS:
        if pattern.search(text):
            return False, "Security Notice: Prompt override or injection detected. Please submit valid AI terms only."

    return True, ""


# ============================================================================
# 3. PII Detection & Redaction Guardrail
# ============================================================================

PII_PATTERNS = {
    "EMAIL": re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"),
    "PHONE": re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    "SSN": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "CREDIT_CARD": re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b"),
}

def sanitize_and_redact_pii(text: str) -> Tuple[str, bool]:
    """Redact personal identifiable information (emails, phones, cards, SSNs)."""
    redacted_text = text
    found_pii = False

    for pii_type, regex in PII_PATTERNS.items():
        if regex.search(redacted_text):
            found_pii = True
            redacted_text = regex.sub(f"[{pii_type}_REDACTED]", redacted_text)

    return redacted_text, found_pii


# ============================================================================
# 4. Rate Limiter (In-Memory Sliding Window)
# ============================================================================

class InMemoryRateLimiter:
    """Rate limiter enforcing maximum requests per time window."""

    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.history: Dict[str, list[float]] = {}

    def is_allowed(self, identifier: str) -> Tuple[bool, int]:
        now = time.time()
        timestamps = self.history.get(identifier, [])

        # Filter out expired timestamps
        timestamps = [t for t in timestamps if now - t < self.window_seconds]
        self.history[identifier] = timestamps

        if len(timestamps) >= self.max_requests:
            retry_after = int(self.window_seconds - (now - timestamps[0])) + 1
            return False, max(1, retry_after)

        timestamps.append(now)
        self.history[identifier] = timestamps
        return True, 0

rate_limiter = InMemoryRateLimiter(max_requests=25, window_seconds=60)


# ============================================================================
# 5. Query Length & Execution Bounds
# ============================================================================

MAX_TERM_QUERY_LENGTH = 150
MAX_TOOL_CALL_LIMIT = 3

def validate_input_bounds(query: str) -> Tuple[bool, str]:
    """Validate query character length and bounds."""
    if len(query.strip()) > MAX_TERM_QUERY_LENGTH:
        return False, f"Term query exceeds maximum length of {MAX_TERM_QUERY_LENGTH} characters."
    return True, ""


def run_all_input_guardrails(query: str) -> Tuple[bool, str, str]:
    """Execute all input guardrails sequentially.
    
    Returns:
        (is_valid, sanitized_text, error_message)
    """
    # 1. Bounds check
    valid_bounds, err = validate_input_bounds(query)
    if not valid_bounds:
        return False, query, err

    # 2. PII Sanitization
    sanitized, _ = sanitize_and_redact_pii(query)

    # 3. Prompt Injection check
    safe_from_injection, injection_err = check_prompt_injection(sanitized)
    if not safe_from_injection:
        return False, sanitized, injection_err

    # 4. School-Safe content filter
    safe_content, content_err = check_school_safe(sanitized)
    if not safe_content:
        return False, sanitized, content_err

    return True, sanitized, ""
