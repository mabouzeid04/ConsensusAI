## Product Spec: ConsensusAI (AI Arena)

### 1) Overview
- **What it is**: A web app where a user enters a prompt, the app fetches responses from multiple LLMs, shuffles and labels them, then has the models evaluate all responses. The user sees the responses with per-model evaluations and an average score.
- **Primary value**: Fast side-by-side comparison and cross-evaluation of top models for a single prompt.
- **Platforms**:
  - **Frontend**: Next.js 14 (React 18), TailwindCSS + DaisyUI, client-side rendering.
  - **Backend**: Node/Express, TypeScript, REST API.
  - **External APIs**: OpenAI, Anthropic, Google (Gemini), DeepSeek.

### 2) Objectives and KPIs
- **Objectives**
  - Enable quick, unbiased comparison across 5 AI models for any prompt.
  - Provide explainable scoring via per-model evaluations and summary scores.
- **KPIs**
  - Median end-to-end response time: ≤ 20s at p50, ≤ 45s at p95.
  - Failure rate per request: < 3%.
  - User completion rate (see results after submit): ≥ 90%.
  - Average evaluations per response: ≥ 3 models.

### 3) Personas and Use Cases
- **Persona: Researcher/Engineer**: Compares models for quality and style.
- **Persona: Content creator/student**: Wants best answer and rationale quickly.
- **Use cases**
  - Compare models for a specific question/task.
  - Evaluate quality differences with traceable explanations.
  - Repeat multiple comparisons quickly.

### 4) User Journey
1. User lands on home page.
2. Enters prompt and submits.
3. Sees interim “Processing” state.
4. Sees results page:
   - Original prompt.
   - A list of responses (A–E), showing:
     - Model name responsible for the response.
     - Rendered Markdown response.
     - Per-model evaluations with scores and explanations.
     - Average score badge per response.
5. Option to “Start New Comparison” to reset.

### 5) Functional Requirements
- **Prompt input**
  - User can enter multiline text and submit.
  - Submit disabled when empty.
- **Submission**
  - Send prompt to backend; backend concurrently queries OpenAI o1, o3-mini, Claude 3.7 Sonnet, DeepSeek R1, Gemini 2.0 Flash.
  - Tolerate partial failures; only successful model outputs are used.
  - Shuffle successful responses and label A–E in random order.
  - Return shuffled responses and original mapping.
- **Evaluation**
  - For each available model, call its evaluation endpoint to rate and explain each response (1–10).
  - Aggregate and return evaluations per response.
- **Results display**
  - Render each response with Markdown.
  - Show per-model scores and explanations.
  - Show average score per response.
- **Reset**
  - Clear current state and return to input step.

### 6) Detailed Flow and States
- **States in UI**: `input` → `evaluating` → `results`.
- **Concurrency**:
  - Responses fetched in parallel via Promise.allSettled.
  - Evaluations performed in parallel per available model.
- **Error handling**:
  - If all models fail on submit: show error “Failed to fetch any model responses”.
  - If evaluation failures per model: show score 0 and “Evaluation failed” for that model/response.

### 7) API Contracts (Backend)

- Base URL: `http://localhost:5000/api` or `process.env.NEXT_PUBLIC_API_URL`

- POST `/prompt/submit`
  - Request:
    ```json
    {
      "prompt": "string"
    }
    ```
  - Response (example):
    ```json
    {
      "shuffledResponses": [
        { "model": "OpenAI o1", "response": "...", "label": "B" },
        { "model": "Gemini 2.0 Flash", "response": "...", "label": "D" }
      ],
      "originalMapping": [
        { "model": "OpenAI o1", "response": "..." },
        { "model": "Gemini 2.0 Flash", "response": "..." }
      ]
    }
    ```
  - Errors:
    - 400: `{ "error": "Prompt is required" }`
    - 500: `{ "error": "Failed to fetch any model responses" }`

- POST `/prompt/evaluate`
  - Request:
    ```json
    {
      "prompt": "string",
      "shuffledResponses": [
        { "model": "OpenAI o1", "response": "...", "label": "B" }
      ],
      "originalMapping": [
        { "model": "OpenAI o1", "response": "..." }
      ]
    }
    ```
  - Response (example):
    ```json
    {
      "prompt": "string",
      "responsesWithEvaluations": [
        {
          "label": "B",
          "model": "OpenAI o1",
          "response": "...",
          "evaluations": [
            { "model": "OpenAI o1", "score": 7, "explanation": "..." },
            { "model": "Claude 3.7 Sonnet", "score": 8, "explanation": "..." }
          ]
        }
      ]
    }
    ```
  - Errors:
    - 400: `{ "error": "Prompt, shuffled responses, and original mapping are required" }`
    - 500: `{ "error": "Failed to evaluate responses" }`

### 8) Data Model
- No persistent DB. Transient objects passed between client and server:
  - `ModelResponse`: `{ model, response, label? }`
  - `Evaluation`: `{ model, score, explanation }`
  - `ResponseWithEvaluations`: `{ label, model, response, evaluations[] }`

### 9) System Architecture
- **Frontend (`frontend/`)**
  - `src/app/page.tsx`: orchestrates states, connects to API (`submitPrompt`, `evaluateResponses`).
  - Components: `PromptForm`, `ResponseList`, `ResponseCard`, `MarkdownRenderer`.
- **Backend (`backend/`)**
  - `src/index.ts`: Express app, CORS, JSON, logging, routes.
  - `src/routes/prompt.ts`: `/submit`, `/evaluate`.
  - `src/controllers/promptController.ts`: orchestration, shuffle/label, evaluation aggregation.
  - `src/services/aiServices.ts`: model calls and evaluation logic, parsers.

### 10) Configuration and Environment
- **Frontend**:
  - `NEXT_PUBLIC_API_URL` (optional). Default: `http://localhost:5000/api`.
- **Backend**:
  - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `DEEPSEEK_API_KEY`, `PORT` (optional).
- **Dependencies**:
  - Frontend: Next 14, React 18, `react-markdown`, `react-syntax-highlighter`, Tailwind, DaisyUI.
  - Backend: Express, Axios, Morgan, `@anthropic-ai/sdk`, dotenv, cors.

### 11) Security, Privacy, Compliance
- **Current**
  - No auth; public API surface.
  - CORS enabled; default permissive.
  - Secrets via env; no storage of prompts/results server-side.
- **Risks**
  - Returning `originalMapping` to client can leak identity of models (intended post-evaluation but accessible immediately).
- **Mitigations**
  - Optionally hide `model` names in UI until evaluations complete or user reveals.
  - Consider simple API key or rate limiting to avoid abuse.
  - Restrict CORS to known origins in production.

### 12) Error Handling and Edge Cases
- **Submission**
  - Empty prompt → 400 with friendly UI message.
  - Partial model failures → proceed with successful subset; if none → 500.
- **Evaluation**
  - Per-model evaluation failures yield default `{ score: 0, explanation: 'Evaluation failed' }`.
- **Timeouts**
  - Add client-side and server-side timeouts (not currently implemented).
- **Parsing**
  - `parseEvaluation` expects “Score:” and “Explanation:”. If missing, defaults score to 5 and a generic explanation.

### 13) Non-Functional Requirements
- **Performance**: Target ≤ 45s p95 end-to-end with 5 models and 5 full evaluations.
- **Availability**: Single-region acceptable for MVP.
- **Observability**: Console logging via Morgan; add structured logs and error traces later.
- **Usability**: Accessible keyboard navigation; readable Markdown.

### 14) UX/UI Requirements
- **Pages**
  - Home with hero text and prompt form.
  - Loading screen with spinner and status text.
  - Results section:
    - Original prompt block.
    - Response cards:
      - “Response A–E” + model chip + average score badge.
      - Markdown-rendered content.
      - “Model Evaluations” list with model chip, score, explanation.
    - “Start New Comparison” button resets state.
- **Styling**
  - Tailwind + DaisyUI, gradient headline, clean cards.
  - Syntax highlighting for code blocks within responses.

### 15) Analytics and Telemetry (Future)
- Track events:
  - Prompt submitted, models returned, evaluations completed, errors, time-to-result.
- Basic metrics dashboard (e.g., p50/p95 latency per model, failure rates).

### 16) Feature Flags and Settings (Future)
- Toggle visibility of model names until “Reveal”.
- Enable/disable specific models.
- Temperature and max-tokens knobs.

### 17) Risks and Mitigations
- **External API instability/quotas**: Use retries/backoffs; show partial results; expose status per model.
- **Cost sprawl**: Cap tokens; add global request budget; batch evaluations.
- **Latency**: Parallelize (already implemented); consider streaming; per-model timeouts.
- **Evaluation reliability**: Multiple evaluators reduce bias; optionally normalize scores.

### 18) Open Questions
- Should model identities be hidden until after evaluations (or always)?
- Do we need authentication, quotas, or rate limiting for public use?
- Do we want to store history for users? If yes, what PII policies?
- Add more models (e.g., local/OSS) and how to scale UI accordingly?

### 19) Release Plan
- **MVP (current)**
  - Prompt submission, 5-model responses, cross-evaluation, results UI.
- **Hardening**
  - Add per-request timeouts and retries.
  - Restrict CORS.
  - Basic rate limiting.
- **Enhancements**
  - Model visibility toggle, partial result streaming, UX polish, analytics.

### 20) Acceptance Criteria

- **Prompt submission**
  - Submitting non-empty prompt transitions to `evaluating`.
  - On success, transition to `results` with ≥ 1 response.
  - On total failure, show alert and return to `input`.

- **Results view**
  - Shows original prompt text.
  - For each response:
    - Displays label A–E.
    - Displays model name.
    - Renders markdown.
    - Lists evaluations per available model with score and explanation.
    - Shows average score with proper color category:
      - ≥ 8: green, ≥ 6: blue, else yellow.

- **Evaluation behavior**
  - If an evaluator fails, that row shows score 0 and “Evaluation failed”.
  - Average score computes only over displayed evaluations.

- **Reset**
  - “Start New Comparison” clears state and returns to `input`.

- **Configuration**
  - Works with `NEXT_PUBLIC_API_URL` override.
  - Reads backend API keys from env; fails gracefully if missing.

- **Performance**
  - With at least two model responses available, results return in ≤ 45s p95 for typical prompts (non-guaranteeing upstream rates).

### 21) Test Plan (High-level)
- **Unit**
  - Shuffle and label: ensures unique labels A–E and random order.
  - Evaluation parsing: correct extraction of “Score” and “Explanation”.
- **Integration**
  - Submit with valid prompt returns shuffled results.
  - Evaluate returns evaluations aligned with labels and original mapping.
- **E2E**
  - User flow from prompt to results to reset.
  - Failure paths: no models available; partial evaluation failures.
- **Regression**
  - Markdown rendering for code blocks.
  - Average score color thresholds.

### 22) Future Enhancements
- Persist comparisons, shareable links.
- Side-by-side compare two prompts.
- Custom evaluation rubrics and weights.
- Judge ensemble/consensus score.
- Authentication and user quotas.
- Model cost and latency telemetry surfaced in UI.


