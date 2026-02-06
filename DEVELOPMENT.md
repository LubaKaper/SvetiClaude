# Development Setup

How to run the full Sveti stack locally (frontend + intent classification service).

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- An **OpenAI API key** (for AI tutoring responses)

## Terminal 1 — Frontend (React + Vite)

```bash
npm install
cp .env.example .env          # then paste your OpenAI key
npm run dev                    # http://localhost:5173
```

## Terminal 2 — Intent service (FastAPI, optional)

```bash
cd server-python
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
```

The intent service classifies each student message (explain, example, practice, check answer, motivation, other) and injects a routing hint into the system prompt. If the service is not running, the frontend works identically — no errors, no hint.

## Running tests

### Python classifier tests

```bash
cd server-python
source .venv/bin/activate
pytest -v
```

### Frontend build check

```bash
npm run build     # production build
npm run lint      # ESLint
```

## Architecture overview

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full system diagram, prompt pipeline, and state management.
