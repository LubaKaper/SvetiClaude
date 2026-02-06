"""
Rule-based intent classifier for student messages.

Classifies text into one of six intent categories using keyword/pattern matching.
No ML libraries required -- pure Python with regex.
"""

import re


# Intent rules in priority order.
# Each rule: (intent_name, strong_patterns, weak_patterns, rationale_template)
# Strong patterns → confidence 0.85, weak patterns → confidence 0.6

INTENT_RULES = [
    (
        "check_answer",
        [
            r"\bis this (right|correct)\b",
            r"\bcheck my\b",
            r"\bdid i (get|do)\b",
            r"\bam i right\b",
            r"\breview my\b",
            r"\bis my answer\b",
        ],
        [
            r"\bcorrect\?",
            r"\bright\?",
            r"\bwrong\b",
            r"\bmistake\b",
        ],
        "User wants to verify their work.",
    ),
    (
        "motivation",
        [
            r"\bi('m| am) (so )?(confused|frustrated|lost|stuck)\b",
            r"\bgive up\b",
            r"\btoo (hard|difficult)\b",
            r"\bcan'?t (do|understand|figure|get)\b",
            r"\bstruggling\b",
        ],
        [
            r"\bhard\b",
            r"\bdifficult\b",
            r"\bconfused\b",
            r"\bstuck\b",
            r"\blost\b",
            r"\bfrustrated\b",
            r"\bdon'?t (get|understand)\b",
        ],
        "User seems discouraged and may need encouragement.",
    ),
    (
        "practice",
        [
            r"\bpractice\b",
            r"\bpractice problem\b",
            r"\bgive me a problem\b",
            r"\btry one\b",
            r"\btry a\b",
            r"\bquiz\b",
            r"\bexercise\b",
            r"\bdrill\b",
        ],
        [
            r"\bproblem\b",
            r"\bworksheet\b",
            r"\btest me\b",
        ],
        "User wants practice problems or exercises.",
    ),
    (
        "give_example",
        [
            r"\bshow me an example\b",
            r"\bgive me an example\b",
            r"\bdemonstrate\b",
            r"\bwhat does .+ look like\b",
            r"\bfor example\b",
        ],
        [
            r"\bexample\b",
            r"\bshow me\b",
            r"\bsample\b",
            r"\billustrate\b",
        ],
        "User wants to see a worked example.",
    ),
    (
        "explain_concept",
        [
            r"\bexplain\b",
            r"\bwhat is\b",
            r"\bwhat are\b",
            r"\bhow does\b",
            r"\bwhy does\b",
            r"\bdefine\b",
            r"\bmeaning of\b",
            r"\bhelp me understand\b",
            r"\bwhat do you mean\b",
        ],
        [
            r"\bhow\b",
            r"\bwhy\b",
            r"\bwhat\b",
        ],
        "User wants a concept explained.",
    ),
]


def classify(text: str) -> dict:
    """
    Classify student message text into an intent category.

    Returns:
        dict with keys: intent (str), confidence (float), rationale (str)
    """
    if not text or not text.strip():
        return {
            "intent": "other",
            "confidence": 0.3,
            "rationale": "Empty or whitespace-only input.",
        }

    lower = text.lower().strip()

    for intent, strong_patterns, weak_patterns, rationale in INTENT_RULES:
        # Check strong patterns first
        for pattern in strong_patterns:
            if re.search(pattern, lower):
                return {
                    "intent": intent,
                    "confidence": 0.85,
                    "rationale": rationale,
                }

        # Check weak patterns
        for pattern in weak_patterns:
            if re.search(pattern, lower):
                return {
                    "intent": intent,
                    "confidence": 0.6,
                    "rationale": rationale,
                }

    # Default fallback
    return {
        "intent": "other",
        "confidence": 0.3,
        "rationale": "No strong intent signal detected.",
    }
