# CLAUDE.md

Sveti is an AI tutor that teaches algebra and English through the video games a student plays.

## Quick start

```bash
npm install
cp .env.example .env   # optional: add OPENAI_API_KEY for live AI chat
npm run dev             # http://localhost:5173 (includes the /api/chat backend)
```

## Scripts

| Command           | Purpose                                    |
|-------------------|--------------------------------------------|
| `npm run dev`     | Vite dev server + `/api/chat` middleware   |
| `npm test`        | Vitest (quest engine, prompts, server)     |
| `npm run lint`    | ESLint                                     |
| `npm run build`   | Production build to `dist/`                |
| `npm run preview` | Preview the build (backend included)       |

### Python intent service (optional)

| Command | Purpose |
|---------|---------|
| `cd server-python && uvicorn app.main:app --reload` | Start intent service on :8000 |
| `cd server-python && pytest -v` | Run classifier tests |

Only used when `VITE_INTENT_SERVICE_URL` is set; otherwise `src/lib/intent.js` (a JS port of the same rules) is used.

## Tech stack

- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS 3.4, theme tokens as CSS variables in `src/index.css` (class-based dark mode, dark by default)
- **AI:** OpenAI SDK, called only from the server (`server/chat.js`), streaming. Model from `OPENAI_MODEL` (default `gpt-4o-mini`)
- **Math/Markdown:** react-markdown + remark-gfm + remark-math + rehype-katex
- **Tests:** Vitest
- **Icons:** lucide-react

## Folder structure

```
api/chat.js            # Vercel function: thin wrapper around server/chat.js
server/chat.js         # Backend core: request validation, system prompt, streaming
src/
  App.jsx              # Layout, view switching (chat/quests), theme, game picker
  main.jsx             # React entry point
  index.css            # Theme tokens, component classes, markdown styles, animations
  components/
    Sidebar.jsx        # Progress card, games, subject, learning style, theme
    ChatView.jsx       # Welcome screen + message list + composer
    Message.jsx        # One message bubble
    Markdown.jsx       # Markdown + KaTeX renderer
    InputArea.jsx      # Composer with quick-action chips
    QuestView.jsx      # Practice quests: topic/game/difficulty, hints, checking
    GamePicker.jsx     # Modal for choosing up to 3 games
    Logo.jsx           # Spark mark, avatar, wordmark
  config/
    games.js           # Game packs: facts, starters, quest scenarios; game-name helpers
    prompts.js         # Subjects, quick actions, buildSystemPrompt()
    learningStyles.js  # 5 learning styles + prompts
  lib/
    builders.js        # Problem builders: answer + hints + worked solution
    quests.js          # generateQuest, parseAnswer, checkAnswer, questXp
    intent.js          # Rule-based intent + topic detection
    localTutor.js      # Demo-mode chat replies (no AI key)
  hooks/
    useChat.js         # Chat state, streaming, demo-mode fallback
    useGamePrefs.js    # Favorite games
    useProgress.js     # XP, level, streak
    useLocalStorage.js # Persistent state hook
  utils/
    api.js             # Browser client for /api/chat
    intentService.js   # Optional Python intent service, falls back to lib/intent.js
tests/                 # Vitest suites
server-python/         # Optional FastAPI intent classifier
docs/screenshots/      # README images
```

## Environment variables (server-side only)

| Variable                  | Required | Description                                         |
|---------------------------|----------|-----------------------------------------------------|
| `OPENAI_API_KEY`          | No       | Enables live AI chat. Without it: demo mode.        |
| `OPENAI_MODEL`            | No       | Model name (default `gpt-4o-mini`)                  |
| `OPENAI_BASE_URL`         | No       | OpenAI-compatible endpoint override                 |
| `VITE_INTENT_SERVICE_URL` | No       | URL of the Python intent service                    |

`VITE_OPENAI_API_KEY` is still accepted by the server for backward compatibility. Never reference any key from code under `src/` — that would bundle it into the browser.

## Conventions

- **The key never reaches the browser.** The client sends structured choices to `/api/chat`; the system prompt is built on the server.
- **Quest math is deterministic code, never AI.** Game packs choose numbers and tell the story; `lib/builders.js` computes answers, hints and solutions.
- **Game facts must be real.** Only put mechanics and numbers in a fact sheet or scenario that are accurate for the game.
- **Shared modules use explicit `.js` import extensions** (`config/`, `lib/`) because the server imports them under plain Node.
- **Styling:** Tailwind utilities with semantic colors (`bg`, `panel`, `raised`, `line`, `fg`, `muted`, `accent`, `good`, `bad`). No hard-coded grays.
- **State:** React hooks + localStorage. No external state library, no router.
- **Persistence keys:** `sveti-messages-{subject}`, `sveti-learning-style`, `sveti-subject`, `sveti-theme`, `sveti-game-prefs`, `sveti-game-asked`, `sveti-progress`.
- **Subjects:** `algebra` and `english` (the id is `english` everywhere).
- After changing game packs or builders, run `npm test` — it generates thousands of quests and checks each.
