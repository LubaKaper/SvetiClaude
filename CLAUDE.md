# CLAUDE.md

## Quick start

```bash
npm install
cp .env.example .env   # then add your OpenAI key
npm run dev             # http://localhost:5173
```

## Scripts

| Command           | Purpose                        |
|-------------------|--------------------------------|
| `npm run dev`     | Start Vite dev server          |
| `npm run build`   | Production build to `dist/`    |
| `npm run preview` | Preview production build       |
| `npm run lint`    | Run ESLint                     |

## Tech stack

- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS 3.4 (class-based dark mode)
- **AI:** OpenAI SDK (`gpt-4o-mini`) via `dangerouslyAllowBrowser` (dev only)
- **Icons:** lucide-react
- **Markdown:** react-markdown

## Folder structure

```
src/
  App.jsx              # Root component (sidebar, header, chat area)
  main.jsx             # React entry point
  index.css            # Tailwind directives + custom animations
  components/
    InputArea.jsx      # Chat input with subject-specific action chips
    Message.jsx        # Single message bubble (markdown, timestamps)
    MessageList.jsx    # Scrollable message container + typing indicator
    TestOpenAI.jsx     # API test suite (accessed via Test Mode)
  config/
    learningStyles.js  # 5 learning style definitions + prompts
    prompts.js         # System prompts for algebra & ELA, game integration
    gameTemplates.js   # Game-context templates for math topics
  hooks/
    useChat.js         # Main chat hook (OpenAI calls, persistence, game flow)
    useGamePrefs.js    # Game preference management (localStorage)
  utils/
    openai.js          # OpenAI client wrapper (sendMessage, validation, errors)
```

## Environment variables

| Variable              | Required | Description              |
|-----------------------|----------|--------------------------|
| `VITE_OPENAI_API_KEY` | Yes      | OpenAI API key           |

The app falls back to mock responses if the key is missing or invalid.

## Conventions

- **Styling:** Use Tailwind utility classes. Custom animations live in `index.css`.
- **State:** React hooks + localStorage. No external state library.
- **Persistence keys:** `sveti-messages-{subject}`, `sveti-learning-style`, `sveti-game-prefs`, `sveti-game-asked`, `sveti-prefers-games`.
- **Imports:** Dynamic imports for OpenAI/prompts/styles inside `useChat` (enables graceful fallback).
- **No routing:** Single-page app, no router.

## Key files

- `src/hooks/useChat.js` -- All chat logic: send messages, game preference flow, OpenAI integration, localStorage persistence.
- `src/config/prompts.js` -- System prompt construction and `buildSystemWithGames()`.
- `src/utils/openai.js` -- OpenAI API wrapper with timeout, error codes, validation.
