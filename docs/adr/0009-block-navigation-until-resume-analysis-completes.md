# ADR-0009: Hard-gate navigation until resume analysis resolves

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Jon Upchurch

## Context

`specs/003-resume-analysis/spec.md` originally shipped FR-011: resume
analysis MUST NOT block progression to the job-description step — the
candidate could always move on, and the feature's scope ended at
producing `ResumeAnalysis` "when ready," not at gating navigation. In
practice, nothing actually triggered resume analysis until the
candidate happened to visit `/analyze/report` — uploading a resume
navigated straight to `/analyze/job`, skipping the analysis screen
entirely. A candidate could reach Match with `resumeAnalysis` still
`null` simply because they never opened the report page, discovering
the wait later (feature 004's own waiting-state screen) rather than
up front. Post-MVP dogfooding (see `docs/future-work.md`) surfaced this
as confusing rather than fast.

## Decision

Reverse FR-011: the wizard now hard-gates progression past resume
upload. Once a resume exists and its analysis has neither succeeded nor
failed yet, the candidate cannot reach `/analyze/job` or `/analyze/match`
— attempting to (via the progress-bar links, a typed URL, or
back/forward navigation) redirects back to `/analyze/report`, where the
analysis is already running. The gate lifts as soon as the analysis
*resolves* — on success **or** failure. Unblocking on failure too
(rather than only on success) is deliberate: a permanent dead end on a
transient model error would trade one confusing state for a worse one.

Implementation: `resume-analysis-gate.tsx`, a client component
mounted in the `/analyze` layout, force-redirects gated paths while
pending; `wizard-progress.tsx` renders the "Job desc."/"Match" steps as
non-interactive while pending (reusing the progress bar's existing
`href: null` rendering path); the upload flow (`upload/page.tsx`,
`try-sample-button.tsx`) now lands on `/analyze/report` directly instead
of `/analyze/job`.

## Alternatives considered

- **Soft fix — reroute post-upload to `/analyze/report` without
  gating** (the initial proposal): would put the analysis
  front-and-center immediately after upload without touching FR-011, so
  the candidate would typically see it resolve before choosing to move
  on, but wouldn't stop someone from clicking ahead early via the
  progress bar or a direct URL. Rejected once the underlying UX report
  made clear the ask was to remove that possibility entirely, not just
  make it less likely.
- **Block only on the progress-bar links, not direct navigation**:
  simpler (no new gate component), but leaves typed URLs and
  browser back/forward as an escape hatch, undermining the point of a
  hard gate.
- **Only unblock on success, never on failure**: keeps the gate
  simplest to reason about, but strands a candidate with no forward
  path if the model call fails and they don't think to replace their
  resume. Rejected as strictly worse UX than the problem being fixed.

## Consequences

- `specs/003-resume-analysis/spec.md` FR-011 and its Edge Cases entry,
  and `quickstart.md` scenario 8, are amended in place (noted inline)
  rather than left to drift from the code, per Constitution Principle I.
- Feature 004's own FR-011 (`specs/004-gap-analysis-tailoring/spec.md`)
  — Match's waiting-state copy when a prerequisite analysis isn't
  ready — is unrelated and unaffected; it remains the defensive fallback
  for the one combination that's still reachable (resume analysis done,
  JD analysis not yet run) and for a failed resume analysis (gate
  unblocked, but `resumeAnalysis` is still `null`).
- `e2e/analyze-report.spec.ts`'s "does not block proceeding to the
  job-description step" test is replaced with one that asserts the
  opposite. `e2e/analyze-match.spec.ts`'s "neither analysis ready"
  waiting-state test is no longer reachable via normal navigation (you
  get redirected before ever seeing it) and is repurposed to the
  JD-only-pending case.
- `fake-provider.ts` gained a `TRIGGER_SLOW_ANALYSIS` magic-phrase delay,
  purely so e2e tests can deterministically observe the pending window
  instead of racing a near-instant fake resolution.
