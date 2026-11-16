# TODO

## Done in v1.0

- [x] Backend proxy for AI calls — the key no longer ships to the browser
- [x] Real game references: fact sheets for 10 games + custom games
- [x] Quests: locally generated and checked practice problems
- [x] Streaming replies, KaTeX math, Markdown tables
- [x] Persisted theme, responsive layout with a mobile drawer
- [x] Tests (Vitest) for the quest engine, prompts and server validation
- [x] English subject now uses the English prompt (it was silently falling back to algebra)

## Done in v1.1

- [x] Tutor can place live quests in the chat and sees the results
- [x] Tutor sees the student's practice record
- [x] English drills (confusing words, commas, agreement, thesis)
- [x] Per-topic solved counts
- [x] Basic per-IP rate limiting on `/api/chat`
- [x] New logo
- [x] UI tests (components and whole-app flows), server endpoint tests, CI workflow

## High priority

- [ ] **Rotate the old OpenAI key.** Earlier deployments bundled `VITE_OPENAI_API_KEY` into the browser, so treat that key as public. Create a new one and set it as `OPENAI_API_KEY` in Vercel.
- [ ] **Make the rate limit durable.** The current limiter is in memory per server instance. Move the counters to a shared store (Upstash Redis / Vercel KV) for a hard cap, and consider a daily spend limit in the OpenAI dashboard.
- [ ] **Try the tutor with a real key** and tune the prompt: check that it uses the game fact sheets accurately and uses quest markers sensibly.

## Next

- [ ] More game packs (EA FC, Among Us, League of Legends, Animal Crossing, Hollow Knight…)
- [ ] More quest topics: inequalities, exponents, quadratics, graphing
- [ ] More English drill skills (apostrophes, sentence fragments, evidence for a thesis) and difficulty levels
- [ ] A progress page with mastery per topic (the data is already recorded)
- [ ] Sync progress across devices (needs accounts)
- [ ] Code-split KaTeX to shrink the initial bundle

## Later

- [ ] TypeScript migration
- [ ] Teacher/parent view
- [ ] Decide whether to keep the Python intent service now that the rules also run in JS
