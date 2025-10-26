## ConsensusAI — Feature Ideas and Roadmap

### Current Capabilities (from repo audit)
- **Core flow**: User enters a prompt → app fetches responses from multiple models (OpenAI GPT‑5 low/high, Claude 4.5 Sonnet, DeepSeek R1/V3, Gemini 2.5 Flash/Pro, Grok 4) → responses are shuffled and labeled → chosen models evaluate all responses (1–10 with explanations) → UI shows scores, explanations, and averages.
- **Backend**: Express + TypeScript, routes: `POST /api/prompt/submit`, `POST /api/prompt/evaluate`, `GET /api/history`, `GET /api/history/:id`, `GET /api/auth/me`, `POST /api/auth/{register,login,logout}`, Google OAuth endpoints. Prisma with `User` and `Comparison`. JWT cookie-based session; `optionalAuth` middleware.
- **Persistence**: `Comparison` rows store clientId, optional userId, original prompt, generators/judges (JSON), and the full evaluation payload. Guest history attachable to a user upon login.
- **Frontend**: Next.js app pages for home (prompt + generators/judges selection), evaluating state, results view (markdown rendering with code highlighting), history list/detail, login/register, account. Header has theme toggle and user menu. Tailwind + DaisyUI; dark mode supported via `useTheme`.
- **Planned in FUTURE_FEATURES.md**: Auto-generate titles for history items; dark mode (already implemented in codebase and header toggle).

### Gaps and Opportunities
- No streaming; long waits lack progressive feedback.
- No timeouts/retries/circuit breakers per provider; partial fallbacks exist but not standardized.
- Evaluation rubric is single-dimension; parsing is fragile; no bias calibration.
- Limited sharing/collaboration; history exists but no titles (planned), tags, filters, or search.
- No analytics/observability surfaced to users; no cost/latency tracking per model.
- CORS/rate limiting/quotas are basic; no billing; minimal admin/ops.

---

### Feature Ideas (organized)

#### 1) Core Comparison Enhancements
- Multi‑turn conversations: persist conversations and let users run the same judge ensemble over subsequent turns.
- A/B prompt comparison: compare two prompts against the same models; show deltas in scores and content diff.
- Parameter controls: per‑model temperature, max tokens, system prompts; save presets.
- Prompt templates library: curated templates with variables; one‑click apply.
- Ensemble/consensus scoring: aggregate multiple judge models into a consensus score with configurable weighting.
- Blind/unblind toggle: keep models anonymous until reveal; per‑session flag.
- Tournament mode: pairwise playoffs among models; bracket visualization.
- Robustness checks: noise injection/paraphrasing to test response stability.
- Ground‑truth tasks: support unit‑test style prompts with automatic correctness checks and pass/fail.

#### 2) Evaluation & Scoring
- Rubric builder: weighted dimensions (correctness, reasoning, safety, style); per‑dimension scores.
- Bias calibration: normalize scores per judge model to counter systematic bias; show calibrated and raw.
- Repeat sampling: N runs per judge with confidence intervals and error bars.
- Fact‑checking: integrate web search or retrieval to detect unsupported claims and penalize hallucinations.
- Safety/toxicity signals: moderation scores with badges; optional gating.
- Cost/latency capture: record tokens/cost/time for each model; display quality vs cost frontier.
- Leaderboards: per‑domain leaderboards (coding, math, writing) based on aggregated user runs.

#### 3) UX/UI
- Title generation for history (planned): auto title + editable; display in list/detail.
- History organization: tags, folders, favorites/pin, star top results.
- Side‑by‑side diff: visually diff two responses or two runs for the same prompt.
- Annotations: inline notes on responses and on judge explanations; export with notes.
- Exports: PDF/Markdown/CSV export of runs; share graphics for social.
- Copy helpers: copy code block, copy response, copy scores; per‑block copy buttons.
- Keyboard shortcuts and command palette; quick re‑run/resubmit.
- Themes: add high‑contrast and sepia; per‑component polish for dark mode.
- Mobile polish: responsive layout for cards, sticky summary bar on small screens.

#### 4) Collaboration & Sharing
- Shareable links: public/secret links for a run with optional redactions; reveal model names toggle.
- Team workspaces: orgs, members, roles (viewer, editor, admin); shared history and quotas.
- Comments/mentions: discussion threads per run; notifications.
- Public gallery: featured prompts/runs with replication button.

#### 5) Auth, Quotas, and Billing
- Email verification, password reset, device/session management.
- API keys per user/org; rate limits and per‑key quotas.
- Usage dashboard: tokens, spend, runs by model and time.
- Billing plans (Stripe): free tier caps; Pro for higher limits and advanced evaluators.

#### 6) History, Search, and Analytics
- Full‑text search in prompts/responses; filters by date, tags, model set, score range.
- Derived summaries: best model per domain for a user; personalized recommendations.
- Metrics dashboard: p50/p95 latency and failure rate per provider; success/timeout charts.
- Backfills: scheduled jobs to re‑score past runs with new rubrics or new judge ensembles.

#### 7) Performance & Reliability
- Streaming via SSE/WebSockets: show tokens as they arrive; early partial scores.
- Per‑provider SLAs: timeouts, retries with backoff, and circuit breakers; status panel in UI.
- Background job queue: evaluate and persist asynchronously; notify when ready.
- Caching: deduplicate identical prompts with same settings; cache titles.
- Observability: structured logs, OpenTelemetry tracing, metrics; provider health page.

#### 8) Model Integrations & Modalities
- More providers: Mistral, Cohere, Groq (Gemma), Perplexity; local/Ollama and vLLM gateways.
- Multimodal: image understanding, audio transcription, image generation; judge across modalities.
- Tools/functions: web browse, code execution sandboxes; judge tool use quality.
- Constrained outputs: JSON schema guided generation for evaluators.

#### 9) Prompt Engineering & Guardrails
- Prompt optimizer: evolutionary or bandit optimization to maximize judge scores under budget.
- Few‑shot template packs: per‑domain curated exemplars; auto‑selection based on prompt intent.
- Guardrails: allow/block lists, sensitive topic handling, PII redaction before sending upstream.

#### 10) Safety, Privacy, and Compliance
- PII detection/redaction, secrets scrubbing; configurable policies per workspace.
- Data retention windows; per‑org storage regions.
- GDPR/CCPA delete endpoints; auditability of access to runs.

#### 11) Admin & Ops
- Admin panel: user/org management, model keys rotation, feature flags, kill switches.
- Configuration profiles: enable/disable specific models globally; rate caps by plan.
- System status page: provider outages, queue depth, recent error rates.

#### 12) Extensions & Integrations
- Browser extension: select text → "Compare in ConsensusAI" overlay.
- VS Code extension: send file/selection; render results in a panel.
- Slack/Discord bots: run comparisons from chat; post results cards.
- Zapier/Make connectors: automate runs and exports.

#### 13) Enterprise Readiness
- SSO/SAML (Okta, Azure AD), SCIM provisioning.
- Private gateway/proxy with IP allowlists; on‑prem options.
- Audit logs and data residency guarantees.

---

### Suggested Roadmap (phased)
- **M0: Hardening** — timeouts/retries, structured errors, streaming groundwork, observability.
- **M1: Sharing & Titles** — shareable links, history titles, exports, copy helpers.
- **M2: Rubrics & Analytics** — rubric builder, per‑dimension scoring, latency/cost metrics.
- **M3: Collaboration** — workspaces, comments, permissions, API keys and quotas.
- **M4: Optimization** — prompt optimizer, caching, repeat sampling with CIs.
- **M5: Enterprise** — SSO/SCIM, audit logs, admin panel, policies.

---

### Low‑Level Implementation Notes (quick hits)
- DB: extend `Comparison` with `title String?`, `tags String[]?`, `metrics Json?` (cost, tokens, latency).
- API: add streaming endpoints, share token generation, search filters, rubric schemas.
- Frontend: introduce state for streaming tokens, diff viewer, annotations, filters/search bar.
- Services: provider adapters with uniform timeout/retry; metrics emission per call.
- Security: stricter CORS, rate limiter, CSRF review for cookie flows.


