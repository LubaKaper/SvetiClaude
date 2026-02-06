Sveti AI Tutor
A modern AI tutoring interface that adapts to a learner’s style, supports multiple subjects, and personalizes explanations with optional game-based examples. Built with React and Vite, with OpenAI integration and graceful fallback responses.

Features
Learning-style modes (visual, reading/writing, examples, socratic, analogies)
Subject switching (Algebra, English)
Personalized prompts using optional game preferences
Local chat persistence via localStorage
Test mode for OpenAI integration checks
Dark mode UI theme
Resilient AI calls with timeouts and friendly error handling
Tech Stack
Frontend: React 19, Vite 7
Styling: Tailwind CSS, PostCSS, Autoprefixer
AI: OpenAI SDK
UI: lucide-react, react-markdown
Quality: ESLint
Project Structure
.
├── public/
├── src/
│   ├── assets/
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
│   │   ├── useGamePrefs.js
│   │   ├── useMockChat.js
│   │   ├── useRealChat-fixed.js
│   │   └── useRealChat.js
│   ├── utils/
│   │   ├── openai.js
│   │   └── testOpenAI.js
│   ├── App-backup.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
Getting Started
Prerequisites
Node.js 18+ (recommended)
npm (or pnpm/yarn)
Installation
Install dependencies:

npm install
Create a .env file in the project root:

VITE_OPENAI_API_KEY=your_openai_api_key
Start the dev server:

npm run dev
Build & Preview
npm run build
npm run preview
Scripts
npm run dev – Start Vite dev server
npm run build – Production build
npm run preview – Preview production build
npm run lint – Lint the codebase
Configuration
OpenAI: The client uses VITE_OPENAI_API_KEY from .env.
Learning styles & prompts live under src/config/.
Game personalization is handled by src/hooks/useGamePrefs.js.
Notes on Production
The OpenAI client is currently configured for browser usage (dangerouslyAllowBrowser: true) for development. For production, route requests through a secure backend to protect API keys.

Contributing
Fork the repo
Create a feature branch
Commit your changes
Open a pull request
License
No license file is included. Add a LICENSE file if you want to specify usage terms.
