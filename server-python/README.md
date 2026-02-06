# Intent Classification Service

A lightweight FastAPI microservice that classifies student messages by intent (explain, example, practice, check answer, motivation, or other). Uses rule-based keyword matching -- no ML dependencies.

## Quick start

```bash
cd server-python
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload    # http://localhost:8000
```

## API

### POST /classify

```bash
curl -X POST http://localhost:8000/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "explain what a variable is"}'
```

Response:
```json
{
  "intent": "explain_concept",
  "confidence": 0.85,
  "rationale": "User wants a concept explained."
}
```

**Intent categories:** `explain_concept`, `give_example`, `practice`, `check_answer`, `motivation`, `other`

## Tests

```bash
pytest -v
```
