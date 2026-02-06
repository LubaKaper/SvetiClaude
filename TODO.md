# TODO

Prioritized backlog. No feature changes -- only known issues and improvements.

## High priority

- [ ] **Add backend proxy for OpenAI calls.** The app currently uses `dangerouslyAllowBrowser: true`, exposing the API key in the browser. Production should route requests through a backend (Express, Cloudflare Worker, etc.) that holds the key server-side.
- [ ] **Rotate API key** if the `.env` file was ever shared or committed. Check OpenAI usage logs for unauthorized calls.

## Medium priority

- [ ] **Persist dark mode** to localStorage (currently resets on page reload).
- [ ] **Add tests** with Vitest + React Testing Library. Priority: `useChat` hook, `openai.js` sendMessage, prompt building.
- [ ] **Remove dead code in `openai.js`:** `createSystemMessage()` is never called (prompts.js handles this). Delete it.
- [ ] **Responsive sidebar:** The 256px fixed sidebar has no mobile layout. Add a collapsible/drawer pattern for small screens.

## Low priority

- [ ] **Add React ErrorBoundary** component for graceful crash handling.
- [ ] **Consider TypeScript migration** for type safety across hooks, config, and components.
- [ ] **Add localStorage expiration** -- old conversations should auto-clear after N days to avoid unbounded storage growth.
- [ ] **Add loading skeleton** instead of typing dots for better perceived performance.
