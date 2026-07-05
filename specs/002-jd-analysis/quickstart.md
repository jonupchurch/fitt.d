# Quickstart: Job Description Analysis

Validation guide for this feature once implemented. See
`contracts/actions.md` for the action/interface contracts and `spec.md`
for the requirements each scenario traces to.

## Prerequisites

- Node.js version pinned in `.nvmrc`, dependencies installed:

  ```sh
  npm install
  ```

  (pulls in the new dependency this feature adds: `ai`, the Vercel AI
  SDK — see `research.md`)
- `.env.local` (or Vercel env) has `AI_GATEWAY_API_KEY` set for local
  development, and `FITTD_MODEL` updated to a Gateway-qualified model
  string (e.g. `anthropic/claude-<current-version>` — fetch the current
  ID per `research.md` rather than assuming one).

## Automated checks

```sh
npm run typecheck
npm run lint
npm run test        # Vitest: schema validation, retry logic, rate limiter — against a fake provider
npm run test:e2e     # Playwright: live-preview flow — against a fake provider
```

All four MUST pass (Constitution Principle V). CI never calls the real
model provider for this feature's own tests.

## Manual validation scenarios

Run `npm run dev`, reach `/analyze/job` with a resume already provided
(feature 001):

1. **Live preview appears (FR-001, FR-002, FR-003, SC-001)**: paste a
   real job description, stop typing → within ~2 seconds of the pause,
   required skills / nice-to-have skills / ATS keywords appear.
2. **No per-keystroke re-analysis (FR-002)**: watch network activity
   while actively typing — no analysis request fires until you pause.
3. **Fuller picture (US2)**: confirm the same result includes inferred
   seniority and a responsibilities list.
4. **Notable signal surfaced (US2)**: paste a JD with an unusual
   requirement (e.g., an uncommon certification) → it appears as a
   notable signal, not silently dropped.
5. **Edit invalidates stale result (FR-004, SC-003)**: after a result
   appears, replace the pasted text with a different job description,
   pause again → the preview updates to the new analysis, not the old
   one.
6. **Model failure degrades gracefully (FR-006, FR-007, SC-003)**: with
   the fake provider forced into a failure mode, confirm a clear,
   non-blocking message appears instead of a crash or blank state.
7. **Rate limit enforced (FR-008)**: trigger more than 6
   analysis-worthy edits in a minute → a clear rate-limit message
   appears rather than a silently dropped request.
8. **Progression not blocked (FR-012)**: with analysis still pending
   (or deliberately slow in a fake provider), confirm the candidate can
   still proceed using valid job-description text alone.

## Privacy check

9. Confirm no network request in any of the above scenarios writes the
   job description text or its analysis to a database or third-party
   store beyond the model provider call itself (FR-009).
