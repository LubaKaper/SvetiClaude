# Sveti AI Tutor

A modern AI tutoring interface that adapts to a learner’s style, supports multiple subjects, and personalizes explanations with optional game-based examples. Built with React and Vite, with OpenAI integration and graceful fallback responses.

## Features

- **Learning-style modes** (visual, reading/writing, examples, socratic, analogies)
- **Subject switching** (Algebra, English)
- **Personalized prompts** using optional game preferences
- **Local chat persistence** via `localStorage`
- **Test mode** for OpenAI integration checks
- **Dark mode** UI theme
- **Resilient AI calls** with timeouts and friendly error handling

## Tech Stack

- **Frontend:** React 19, Vite 7
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **AI:** OpenAI SDK (`gpt-4o-mini`)
- **UI:** lucide-react, react-markdown
- **Quality:** ESLint

## Project Structure

```
.
├── public/
├── src/
│   ├── components/
│   │   ├── InputArea.jsx
│   │   ├── Message.jsx
│   │   ├── MessageList.jsx
│   │   └── TestOpenAI.jsx
│   ├── config/
│   │   ├── gameTemplates.js
│   │   ├── learningStyles.js
│   │   └── prompts.js
│   ├── hooks/
│   │   ├── useChat.js
│   │   └── useGamePrefs.js
│   ├── utils/
│   │   └── openai.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── CLAUDE.md
├── ARCHITECTURE.md
└── TODO.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Install dependencies:
	```bash
	npm install
	```

2. Copy the env template and add your OpenAI key:
	```bash
	cp .env.example .env
	```

3. Start the dev server:
	```bash
	npm run dev
	```

### Build & Preview

```bash
npm run build
npm run preview
```

## Scripts

- `npm run dev` -- Start Vite dev server
- `npm run build` -- Production build
- `npm run preview` -- Preview production build
- `npm run lint` -- Lint the codebase

## Configuration

- **OpenAI**: The client uses `VITE_OPENAI_API_KEY` from `.env`.
- **Learning styles & prompts** live under [src/config/](src/config).
- **Game personalization** is handled by [src/hooks/useGamePrefs.js](src/hooks/useGamePrefs.js).

## Documentation

- [CLAUDE.md](CLAUDE.md) -- How to work in this repo (commands, conventions, key files)
- [ARCHITECTURE.md](ARCHITECTURE.md) -- System diagram, request flow, state management
- [TODO.md](TODO.md) -- Prioritized backlog

## Notes on Production

The OpenAI client is currently configured for browser usage (`dangerouslyAllowBrowser: true`) for development. For production, route requests through a secure backend to protect API keys.

## License

No license file is included. Add a LICENSE file if you want to specify usage terms.
