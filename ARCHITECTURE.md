# Architecture

## Overview

Sveti is a client-side React app that tutors students in Algebra and English. It sends messages to OpenAI's chat completions API directly from the browser and personalizes responses using learning styles and optional game preferences.

There is no backend. The API key is exposed in the browser via `dangerouslyAllowBrowser: true` (development only -- production should proxy through a backend).

## Request flow

```
User types message
  |
  v
InputArea.jsx  -- captures text + optional action type (e.g. "explain", "steps")
  |
  v
useChat hook (hooks/useChat.js)
  |-- adds user message to state + localStorage
  |-- checks game preference flow (see below)
  |-- builds system prompt
  |-- calls sendMessage (utils/openai.js)
  |     |
  |     v
  |   OpenAI chat.completions.create
  |     model: gpt-4o-mini
  |     temperature: 0.7, max_tokens: 1500, timeout: 15s
  |     |
  |     v
  |   response or error
  |
  |-- on success: add assistant message to state
  |-- on failure: use fallback response (per learning style)
  |-- save all messages to localStorage
  |
  v
MessageList.jsx  -- renders messages with react-markdown
```

## Prompt pipeline

The system prompt sent to OpenAI is assembled from multiple sources:

```
getSystemPrompt(subject, actionType)    -- base persona + action-specific instructions
  +
getLearningStylePrompt(learningStyle)   -- teaching style modifier (visual, socratic, etc.)
  +
buildSystemWithGames(base, style, gamePrefs, topicKey)
  |-- adds [Personalization] block if games are known
  |-- adds [Context Template Hint] if topic matches (percent, ratio, linear)
  |-- adds [Style Rules] (no echo, stay in tutor mode)
```

## State management

All state is React local state + localStorage. No Redux, Context, or external store.

### localStorage keys

| Key                       | Type     | Purpose                                    |
|---------------------------|----------|--------------------------------------------|
| `sveti-messages-algebra`  | JSON     | Chat history for algebra subject           |
| `sveti-messages-english`  | JSON     | Chat history for english subject           |
| `sveti-learning-style`    | string   | Selected learning style ID                 |
| `sveti-game-prefs`        | JSON     | Array of game names (max 2)                |
| `sveti-game-asked`        | string   | Whether game question was asked ("true")   |
| `sveti-prefers-games`     | string   | Whether user wants game-based examples     |

### App-level state (App.jsx)

| State          | Type     | Notes                          |
|----------------|----------|--------------------------------|
| `darkMode`     | boolean  | Not persisted (resets on reload) |
| `subject`      | string   | "algebra" or "english"         |
| `testMode`     | boolean  | Toggles TestOpenAI component   |
| `learningStyle`| string   | Persisted to localStorage      |

## Game preference flow

1. After the 3rd user message (if not already asked), the hook injects an assistant message asking about video games.
2. The user's response is parsed locally (regex-based, never sent to OpenAI).
3. Up to 2 game names are saved to localStorage.
4. On subsequent messages, the system prompt includes game context for relevant math topics (percent change, ratios, linear equations).
5. "Clear Chat" resets all game preferences.

## Component hierarchy

```
App
  +-- Sidebar (learning style buttons)
  +-- Header (subject selector, clear, test mode, dark mode)
  +-- Chat Area
        +-- TestOpenAI (if test mode)
        +-- MessageList
        |     +-- Message (per message)
        |     +-- TypingIndicator (when loading)
        +-- InputArea (text input + action chips)
```

## Subjects and action chips

| Subject  | Actions                                |
|----------|----------------------------------------|
| Algebra  | explain, steps, practice, check        |
| English  | brainstorm, outline, improve, grammar  |

Each action appends specific instructions to the system prompt via `getSystemPrompt(subject, actionType)`.
