# Quickstart: Gap Analysis & Tailoring Output

Validation guide for this feature once implemented. See
`contracts/actions.md` for the action/interface contracts and `spec.md`
for the requirements each scenario traces to.

## Prerequisites

- `npm install` — no new dependencies this feature adds (reuses `ai`,
  `zod`).
- Same `.env.local`/Vercel env as features 002/003 — no new variables.

## Automated checks

```sh
npm run typecheck
npm run lint
npm run test        # Vitest: gap/tailoring schema validation + retry, working-copy state — fake provider
npm run test:e2e     # Playwright: /analyze/match flow — fake provider
```

All four MUST pass. No real model calls in CI.

## Manual validation scenarios

Run `npm run dev`, with a resume and job description already analyzed
(features 002/003), reach `/analyze/match`:

1. **Waiting state (FR-011)**: reach this screen with resume or JD
   analysis still pending → a clear message names what's still in
   progress, not an error.
2. **Fit score + matched/missing (FR-001–FR-004, SC-001)**: within
   ~15 seconds, a fit score, matched skills (with evidence), missing
   skills (with priority), and keyword coverage appear.
3. **Low score for missing required skills (FR-002, SC-004)**: use a
   fixture resume missing multiple core required skills → confirm the
   score is not high.
4. **No matched/missing overlap (FR-003)**: confirm no skill appears in
   both lists.
5. **Rationale + advice (FR-005, FR-006)**: a plain-language rationale
   and specific, prioritized advice both appear.
6. **Tailoring streams in (FR-007, SC-002)**: tailored bullets, summary,
   keywords, and a cover-letter opener appear, with content visibly
   streaming rather than popping in all at once.
7. **No fabrication (FR-008)**: confirm tailored content never claims
   something absent from the original resume (spot-check against a
   fixture).
8. **Apply updates working copy (FR-009, FR-010, SC-005)**: applying a
   bullet updates a working copy immediately (no reload), and the
   applied suggestion is visibly marked as applied; the original
   analyzed resume is unchanged.
9. **Streamed validation failure (Edge Cases, FR-013, FR-014)**: with
   the fake provider forced to produce an invalid final object, confirm
   the stream restarts once, then degrades to a clear message on a
   second failure.
10. **Shared rate limit (FR-012)**: trigger the shared 6/minute limit via
    gap/tailoring calls, then confirm a JD- or resume-analysis call in
    the same window is also rate-limited.

## Privacy check

11. Confirm no request in any of the above writes gap analysis,
    tailoring output, or the working resume copy to a database or
    third-party store (FR-015).
