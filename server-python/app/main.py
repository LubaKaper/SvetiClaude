"""
FastAPI microservice for intent classification.

Exposes POST /classify to categorize student messages by intent.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .classifier import classify

app = FastAPI(
    title="Sveti Intent Classifier",
    description="Rule-based intent classification for student messages",
    version="0.1.0",
)

# Allow CORS for local development (Vite runs on :5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ClassifyRequest(BaseModel):
    text: str


class ClassifyResponse(BaseModel):
    intent: str
    confidence: float
    rationale: str


@app.post("/classify", response_model=ClassifyResponse)
def classify_intent(req: ClassifyRequest):
    """Classify the intent of a student message."""
    result = classify(req.text)
    return ClassifyResponse(**result)
