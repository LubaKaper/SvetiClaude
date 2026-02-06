"""
Tests for the intent classifier and FastAPI endpoint.

Covers all 6 intent categories with >=12 unit tests plus API integration tests.
"""

import pytest
from fastapi.testclient import TestClient

from app.classifier import classify
from app.main import app


# ---------------------------------------------------------------------------
# Unit tests for classify()
# ---------------------------------------------------------------------------


class TestExplainConcept:
    def test_what_is(self):
        result = classify("What is a variable?")
        assert result["intent"] == "explain_concept"
        assert result["confidence"] >= 0.6

    def test_explain_keyword(self):
        result = classify("Explain how to solve quadratics")
        assert result["intent"] == "explain_concept"
        assert result["confidence"] == 0.85

    def test_how_does(self):
        result = classify("How does factoring work?")
        assert result["intent"] == "explain_concept"

    def test_help_me_understand(self):
        result = classify("Help me understand the distributive property")
        assert result["intent"] == "explain_concept"
        assert result["confidence"] == 0.85


class TestGiveExample:
    def test_show_me_example(self):
        result = classify("Show me an example of factoring")
        assert result["intent"] == "give_example"
        assert result["confidence"] == 0.85

    def test_demonstrate(self):
        result = classify("Can you demonstrate long division?")
        assert result["intent"] == "give_example"
        assert result["confidence"] == 0.85

    def test_example_keyword(self):
        result = classify("I need an example")
        assert result["intent"] == "give_example"
        assert result["confidence"] >= 0.6


class TestPractice:
    def test_practice_problem(self):
        result = classify("Give me a practice problem")
        assert result["intent"] == "practice"
        assert result["confidence"] == 0.85

    def test_quiz(self):
        result = classify("I want to try a quiz")
        assert result["intent"] == "practice"
        assert result["confidence"] == 0.85

    def test_exercise(self):
        result = classify("Can I do an exercise?")
        assert result["intent"] == "practice"
        assert result["confidence"] == 0.85


class TestCheckAnswer:
    def test_is_this_correct(self):
        result = classify("Is this correct? 2x + 3 = 7, x = 2")
        assert result["intent"] == "check_answer"
        assert result["confidence"] == 0.85

    def test_check_my(self):
        result = classify("Check my answer please")
        assert result["intent"] == "check_answer"
        assert result["confidence"] == 0.85

    def test_did_i_get(self):
        result = classify("Did I get this right?")
        assert result["intent"] == "check_answer"
        assert result["confidence"] == 0.85

    def test_review_my(self):
        result = classify("Review my work on problem 3")
        assert result["intent"] == "check_answer"
        assert result["confidence"] == 0.85


class TestMotivation:
    def test_confused_and_struggling(self):
        result = classify("I'm so confused and struggling")
        assert result["intent"] == "motivation"
        assert result["confidence"] >= 0.6

    def test_too_hard(self):
        result = classify("This is too hard I want to give up")
        assert result["intent"] == "motivation"
        assert result["confidence"] == 0.85

    def test_stuck(self):
        result = classify("I'm stuck on this problem")
        assert result["intent"] == "motivation"
        assert result["confidence"] == 0.85


class TestOther:
    def test_greeting(self):
        result = classify("Hello")
        assert result["intent"] == "other"
        assert result["confidence"] == 0.3

    def test_unrelated(self):
        result = classify("Tell me about your day")
        assert result["intent"] == "other"
        assert result["confidence"] == 0.3

    def test_empty_string(self):
        result = classify("")
        assert result["intent"] == "other"
        assert result["confidence"] == 0.3

    def test_whitespace_only(self):
        result = classify("   ")
        assert result["intent"] == "other"
        assert result["confidence"] == 0.3


class TestClassifyReturnShape:
    """Ensure classify always returns the expected dict shape."""

    def test_has_required_keys(self):
        result = classify("anything")
        assert "intent" in result
        assert "confidence" in result
        assert "rationale" in result

    def test_confidence_in_range(self):
        for text in ["explain this", "practice", "hello", "", "is this right?"]:
            result = classify(text)
            assert 0.0 <= result["confidence"] <= 1.0

    def test_intent_is_valid_category(self):
        valid = {"explain_concept", "give_example", "practice", "check_answer", "motivation", "other"}
        for text in ["explain this", "example", "quiz", "check my work", "I'm stuck", "yo"]:
            result = classify(text)
            assert result["intent"] in valid


# ---------------------------------------------------------------------------
# API integration tests
# ---------------------------------------------------------------------------

client = TestClient(app)


class TestAPI:
    def test_classify_endpoint_returns_200(self):
        response = client.post("/classify", json={"text": "explain what a variable is"})
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "explain_concept"
        assert "confidence" in data
        assert "rationale" in data

    def test_classify_empty_text(self):
        response = client.post("/classify", json={"text": ""})
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "other"

    def test_classify_missing_text_field(self):
        response = client.post("/classify", json={})
        assert response.status_code == 422  # Pydantic validation error

    def test_classify_practice_via_api(self):
        response = client.post("/classify", json={"text": "Give me a practice problem about fractions"})
        assert response.status_code == 200
        assert response.json()["intent"] == "practice"
