# Development

## Prerequisites

- **Node.js** 20+
- An **OpenAI API key** if you want live AI chat (optional — demo mode works without one)
- **Python** 3.10+ only if you want to run the optional intent service

## Run the app

```bash
npm install
cp .env.example .env          # optional: set OPENAI_API_KEY
npm run dev                    # http://localhost:5173
```

`npm run dev` also serves the backend at `/api/chat` (a Vite middleware in `vite.config.js` that loads `server/chat.js`), so there is no second process to start. Restart the dev server after editing `.env`.

The pill in the top-right corner shows **AI live** or **Demo mode**. You can check the backend directly:

```bash
curl localhost:5173/api/chat
```

## Checks

```bash
npm test          # Vitest
npm run lint      # ESLint
npm run build     # production build
```

## Testing against a different model or provider

Set `OPENAI_MODEL`, and `OPENAI_BASE_URL` for any OpenAI-compatible endpoint.

## Optional: Python intent service

```bash
cd server-python
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
pytest -v
```

Then add `VITE_INTENT_SERVICE_URL=http://localhost:8000/classify` to `.env`. Without it, the same rules run in the browser (`src/lib/intent.js`).

## Deploying to Vercel

1. Import the repository (framework preset: Vite).
2. Add `OPENAI_API_KEY` in **Settings → Environment Variables**.
3. Deploy. `api/chat.js` runs as a serverless function.

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the pieces fit together.
