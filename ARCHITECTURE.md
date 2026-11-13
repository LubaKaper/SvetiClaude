# Architecture

Sveti is a React single-page app with one small serverless backend. It tutors students in Algebra and English and frames everything in the video games they play.

## The pieces

```
Browser                                         Server
┌───────────────────────────────────────┐      ┌──────────────────────────────┐
│ App                                   │      │ /api/chat                    │
│  ├─ Sidebar (progress, games, style)  │      │  api/chat.js (Vercel)        │
│  ├─ ChatView ── useChat ──────────────┼─────▶│  server/chat.js              │
│  │                 │ no key           │ POST │   parseRequest()  validate   │
│  │                 ▼                  │      │   buildSystemPrompt()        │
│  │            localTutor ─┐           │◀─────┼─  stream text back           │
│  └─ QuestView ────────────┤           │ text │        │                     │
│                           ▼           │      │        ▼                     │
│   quest engine (lib/quests, builders) │      │    OpenAI API                │
│   game packs   (config/games)  ◀──────┼──────┼─ also imported by the server │
└───────────────────────────────────────┘      └──────────────────────────────┘
```

`config/` and `lib/` are plain modules with no browser dependencies, so the server imports the same game packs and prompt builder the app uses.

## Chat request flow

1. `InputArea` collects the text and an optional quick action (`explain`, `steps`, …).
2. `useChat.sendMessage` appends the user message plus an empty `pending` assistant message.
3. If the server reported no AI key (`GET /api/chat` → `{ live: false }`), `localTutor` writes a demo-mode reply and the flow ends.
4. Otherwise the message's intent is classified (`lib/intent.js`, or the Python service if configured) and `POST /api/chat` is sent with `{ subject, learningStyle, action, intent, games, messages }` — the last 12 messages, never a system prompt.
5. `server/chat.js` validates and trims the request, builds the system prompt, calls the model with streaming, and writes text chunks to the response.
6. The client reads the stream and patches the pending message as text arrives. Stop aborts the fetch and keeps what was written.

Errors before the first chunk come back as JSON with a friendly message and are shown as an error bubble. A `503` (key removed) flips the app into demo mode.

## System prompt

`buildSystemPrompt({ subject, learningStyle, action, games, intent })` in `config/prompts.js` assembles:

| Block | Source |
|---|---|
| Persona | `SUBJECTS[subject].persona` |
| How to teach | Subject rules (don't hand over homework answers, check work honestly, be concise) |
| Teaching style | `learningStyles[style].prompt` |
| Game context | Rules for using games + a fact sheet per chosen game (`games.js`) |
| Formatting | Markdown, LaTeX math with `$…$`, no bare dollar signs |
| For this reply | The quick action's instruction, or else a hint from the detected intent |

Fact sheets are what keep references accurate: the model is told to prefer them and never invent stats. Games outside the catalogue get no sheet and the model relies on its own knowledge.

## Quest engine

```
game pack scenario (r) ──▶ builder (Q.linear / percent / ratio / fn / system) ──▶ quest
   picks numbers,              computes the answer,                                { story, ask, answer, unit,
   writes the story            3 hints, worked steps                                 hints[3], steps[], … }
```

- `generateQuest({ game, topic, level, seed })` resolves the game to a pack (catalogue or generic), runs the topic's scenario with a seeded RNG, and tags the result.
- `parseAnswer` reads numbers the way students type them; `checkAnswer` compares with a two-decimal tolerance.
- `questXp` = base XP by difficulty, −25% per hint, +5 for a clean first try, 0 if the solution was revealed.

No AI is involved, so quests work offline and the answer key is always right.

## State

All state is React state persisted to `localStorage` through `useLocalStorage`.

| Key | Contents |
|---|---|
| `sveti-messages-algebra`, `sveti-messages-english` | Chat history per subject (last 200 messages) |
| `sveti-game-prefs` | Up to 3 game names |
| `sveti-game-asked` | Whether the game picker has been shown |
| `sveti-progress` | `{ xp, streak, best, solved }` |
| `sveti-learning-style`, `sveti-subject`, `sveti-theme` | Preferences |

`useLocalStorage` tolerates a changing key: switching subject re-reads that subject's history, and a late write from the previous subject goes to the previous key.

## Backend safety

- The API key is read only in `server/chat.js`.
- The client cannot send a system prompt; roles other than `user`/`assistant` are dropped.
- Limits: 16 messages, 4,000 characters each, 900 output tokens, 3 games of 40 characters.
- Custom game names are stripped of markup and newlines before entering the prompt.
- There is no rate limiting yet (see TODO.md).

## Optional Python intent service

`server-python/` is a FastAPI app exposing `POST /classify`. It predates the JS port in `lib/intent.js` and uses the same rules. Set `VITE_INTENT_SERVICE_URL` to use it; the app falls back to the built-in rules if it is unreachable.
