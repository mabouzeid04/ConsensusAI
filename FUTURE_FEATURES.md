## Future Features Plan

### Feature 1: Auto-generate chat titles with Gemma 2B

- **Goal**: Automatically generate concise, meaningful titles for chat/history items using Gemma 2B, improving scanability in the History view.

#### Problem & Rationale
- **Problem**: History entries currently show raw prompts which can be long or noisy, making it hard to scan.
- **Why now**: Better organization and readability; low cost to implement with a small model.

#### User Stories
- As a user, I see a short, descriptive title for each history item so I can quickly find past chats.
- As a user, I want titles that are accurate and not overly long.
- As a user, I still want to see part of my original prompt if needed.

#### UX Behavior
- Titles appear in the History list and detail header.
- If a title is not yet generated (rate limit/error), show a fallback: first 6–10 words of the prompt.
- Titles should be ~6–8 words, sentence-case, no trailing punctuation, and avoid PII when possible.

#### Backend Design
- **Generation trigger**: When a comparison/history record is created, generate the title immediately (or enqueue background job if needed).
- **API surface**:
  - Option A: Title generated server-side within the existing creation flow; returned with the payload.
  - Option B: Dedicated endpoint, e.g., `POST /history/:id/title/generate` (idempotent), for retries or backfills.
- **Provider integration (Gemma 2B)**: Use a small, fast model to minimize cost and latency.
  - Option 1 (hosted): Groq API (e.g., `gemma2-2b-it`) — low latency, simple setup.
  - Option 2 (local/dev): Ollama (`gemma2:2b`) — local inference for development.
  - Keep a provider interface so we can swap easily; configurable via env.

#### Prompting (proposed)
"Generate a short, descriptive title (6–8 words) for the following conversation prompt. Do not include quotes, punctuation at the end, or PII. Title only.\n\nPrompt: {prompt}"

#### Data Model
- Add `title` field to the `Comparison`/history entity.
  - Prisma migration: `title String?`
  - Backfill strategy: on first read, if `title` is null, attempt generation; otherwise use fallback.

#### Error Handling & Fallbacks
- If generation fails or times out: use first 6–10 words of the prompt.
- Log failures with structured context for later retry.

#### Performance & Cost
- Use low-temperature (e.g., 0.2–0.3) for deterministic titles.
- Token budget small (≤ 128). Timeout ~3s–5s. One-shot prompt.

#### Security & Privacy
- Avoid echoing PII in the title; provide guidance in the prompt and optionally apply simple PII heuristics (future enhancement).

#### Acceptance Criteria
- Titles are generated and stored for new history items using Gemma 2B.
- History list shows generated titles; if unavailable, shows fallback snippet.
- Detail page header displays the title.
- Average title length ≤ 8 words and no trailing punctuation in ≥ 95% of cases.
- Generation adds ≤ 300ms p50 latency when in-request; background mode available.

#### Milestones
- **M1: Data & API**
  - Add `title` column via Prisma migration.
  - Return `title` in history list/detail APIs.
- **M2: Model Integration**
  - Add provider abstraction (`TitleGenerator`) with Gemma 2B implementation (hosted, env-configurable).
  - Add generation call in creation flow, with timeout and fallback.
- **M3: Frontend**
  - Update History list and detail pages to display `title` primarily, prompt snippet secondarily.
- **M4: Reliability**
  - Add retry endpoint and basic observability (counts, failure rates).

#### Implementation Notes
- Keep the logic side-effect free and idempotent: generating a title for the same prompt should produce the same/similar result; re-calls overwrite only if `title` is null or a `force=true` flag is provided.
- Consider caching derived titles by prompt hash for identical prompts (optional).

### Feature 2: Dark Mode

- **Goal**: Provide a Dark Mode theme toggle across the app for better accessibility and user comfort.

#### UX Behavior
- Theme toggle available in the header/user menu; persists across sessions.
- Respects system preference on first load (`prefers-color-scheme`), then user choice overrides.
- Smooth transitions without layout shift or FOUC (flash of unstyled content).

#### Technical Approach
- Use Tailwind + DaisyUI theming or Tailwind `dark` class strategy:
  - Option A (recommended): DaisyUI themes (`light`/`dark`) with `data-theme` on `<html>`.
  - Option B: Tailwind `dark` class on `<html>` with `dark:` variants.
- Persist selection in `localStorage` and hydrate early to avoid FOUC.
- Provide a small client hook `useTheme()` to read/set theme.
- Minimal CSS tweaks for components to ensure adequate contrast (cards, borders, chips, badges).

#### Scope of Changes
- Frontend only; no backend changes required.
- Update `layout.tsx` to initialize theme from system or `localStorage`.
- Add toggle UI to `HeaderNav.tsx` or `UserMenu.tsx`.
- Verify pages: home, history list/detail, login/account.

#### Accessibility & QA
- Meet WCAG contrast guidelines for text and key UI elements.
- Ensure focus states are visible in both themes.
- Charts or code blocks (if any) should have appropriate background.

#### Acceptance Criteria
- Theme toggle switches between light and dark instantly.
- Setting persists on reload and between routes.
- Default honors system preference on first visit.
- No FOUC of wrong theme during first paint.

#### Milestones
- **M1: Infrastructure**: Theme context/hook, storage, HTML attribute wiring.
- **M2: UI**: Toggle in header; update common components for dark tokens.
- **M3: QA**: Pass contrast checks; verify all main pages.


