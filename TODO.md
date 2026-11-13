# TODO

## Done in v1.0

- [x] Backend proxy for AI calls — the key no longer ships to the browser
- [x] Real game references: fact sheets for 10 games + custom games
- [x] Quests: locally generated and checked practice problems
- [x] Streaming replies, KaTeX math, Markdown tables
- [x] Persisted theme, responsive layout with a mobile drawer
- [x] Tests (Vitest) for the quest engine, prompts and server validation
- [x] English subject now uses the English prompt (it was silently falling back to algebra)

## High priority

- [ ] **Rotate the old OpenAI key.** Earlier deployments bundled `VITE_OPENAI_API_KEY` into the browser, so treat that key as public. Create a new one and set it as `OPENAI_API_KEY` in Vercel.
- [ ] **Rate-limit `/api/chat`** (per IP, e.g. Upstash or Vercel KV) so a public deployment can't run up the bill.

## Next

- [ ] More game packs (EA FC, Among Us, League of Legends, Animal Crossing, Hollow Knight…)
- [ ] More quest topics: inequalities, exponents, quadratics, graphing
- [ ] Have the AI tutor hand out quests in chat and see quest results (so it knows what the student struggles with)
- [ ] English "quests": grammar fixes and thesis-building with game-themed sentences
- [ ] Per-topic mastery tracking and a simple progress page
- [ ] Sync progress across devices (needs accounts)
- [ ] Component tests with React Testing Library
- [ ] Code-split KaTeX to shrink the initial bundle

## Later

- [ ] TypeScript migration
- [ ] Teacher/parent view
- [ ] Decide whether to keep the Python intent service now that the rules also run in JS
