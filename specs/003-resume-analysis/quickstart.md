# Quickstart: Resume Analysis

Validation guide for this feature once implemented. See
`contracts/actions.md` for the action/interface contract and `spec.md`
for the requirements each scenario traces to.

## Prerequisites

- `npm install` — no new dependencies this feature adds (reuses `ai`,
  `zod` from feature 002).
- Same `.env.local` / Vercel env as feature 002 (`AI_GATEWAY_API_KEY`,
  `FITTD_MODEL`) — no new variables.

## Automated checks

```sh
npm run typecheck
npm run lint
npm run test        # Vitest: schema validation, retry logic — fake provider
npm run test:e2e     # Playwright: /analyze/report flow — fake provider
```

All four MUST pass (Constitution Principle V). No real model calls in CI.

## Manual validation scenarios

Run `npm run dev`, provide a resume (feature 001), reach `/analyze/report`:

1. **Score + ATS checks (FR-001, FR-003, FR-004, SC-001)**: within
   ~15 seconds, an overall score/grade and a pass/fail ATS/formatting
   checklist appear.
2. **Standalone from JD (FR-002, SC-003)**: confirm this screen is fully
   populated and useful with no job description ever provided.
3. **Section feedback (FR-005)**: each of summary/experience/skills/
   education shows a status and a short note; a resume missing a
   section (e.g., no education) shows that section as not found rather
   than omitted.
4. **Strengths/weaknesses (FR-006)**: distinct, resume-specific lists
   appear (not generic filler).
5. **Rewrite suggestions (FR-007, FR-008)**: at least one before/after
   bullet suggestion appears with a reason, for a resume with an
   identifiably weak bullet; a strong resume doesn't get a fabricated
   suggestion just to fill the section.
6. **Malformed/failed model response (Edge Cases, SC-002)**: with the
   fake provider forced into a failure mode, confirm a clear,
   non-blocking message, not a crash or blank state.
7. **Rate limit shared with JD analysis (FR-009)**: trigger the shared
   6/minute limit via resume analysis calls, then confirm a JD-analysis
   call in the same window is also rate-limited (same counter).
8. **Progression blocked until resolved (FR-011, amended 2026-07-06 —
   see ADR-0009)**: the candidate cannot reach the job-description step
   or Match while resume analysis is still in flight — attempting to
   (progress-bar link, direct URL) redirects back to the resume-analysis
   screen. Once the analysis resolves (success or failure), navigation
   is unblocked.

## Privacy check

9. Confirm no request in any of the above writes resume text or its
   analysis to a database or third-party store beyond the model
   provider call itself (FR-010).
