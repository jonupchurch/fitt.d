# Implementation Plan: Wizard Status Panel & Reset

**Branch**: `007-wizard-status-panel` | **Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-wizard-status-panel/spec.md`

## Summary

Add a sidebar panel to the four `/analyze/*` wizard pages showing four
real-completion checkpoints (Resume Submitted, Resume Analyzed, JD
Submitted, fitt.d analysis) alongside the existing top progress bar,
plus a confirm-then-reset action that fully clears the session. Making
the fourth checkpoint accurate requires persisting `GapAnalysis` to
wizard state for the first time (today it only lives in
`/analyze/match`'s local React state) — a real, ADR-worthy decision,
unlike feature 006's pure presentation work.

## Technical Context

**Language/Version**: TypeScript (strict mode), unchanged

**Primary Dependencies**: None new

**Storage**: Extends the existing `sessionStorage`-backed wizard state
(`src/lib/input/wizard-state.ts`) with one new key for `GapAnalysis` —
same mechanism already used for `Resume`, `JobDescription`,
`JDAnalysis`, `ResumeAnalysis`. No new persistence *category*, just one
more field in an existing, already-ADR'd pattern.

**Testing**: Vitest for the new invalidation rules in `wizard-state.ts`
(when the new `GapAnalysis` key gets cleared) and for the reset
helper's coverage of every key; Playwright for the panel's four
checkpoints flipping at the correct real moments, its coexistence with
the existing top progress bar, and the full confirm/cancel/reset flow
including the case where feature 003's navigation gate is actively
blocking

**Target Platform**: Web, deployed to Vercel — unchanged

**Project Type**: Web application — extends the existing `/analyze`
wizard; no new routes

**Performance Goals**: N/A — no new model calls; the panel reads
already-computed session state

**Constraints**: MUST NOT replace or hide the existing wizard
step-progress bar (spec.md FR-007); the reset action MUST work even
while `resume-analysis-gate.tsx` is actively redirecting
(FR-011) — the reset must not itself be a gated destination; MUST NOT
regress feature 005's narrower "Try another job" reset, which stays a
separate, additional action

**Scale/Scope**: One new sidebar component, one new tiny "reset the
whole wizard" helper (extending the existing but previously-unused
`clearWizardState()` in `wizard-state.ts`), one new persisted state key
(`GapAnalysis`), a small layout change to `/analyze/layout.tsx` to
accommodate a sidebar, one new ADR

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec-Driven Development & Legible Architecture | PASS, with a task obligation | Persisting `GapAnalysis` to wizard state — and, specifically, the invalidation rule for *when* it goes stale — is a real tradeoff (data model + error/staleness handling, both explicitly ADR-worthy per Principle I). `docs/adr/0010-*.md` MUST be authored during `/speckit-tasks`/implementation, mirroring how `JDAnalysis`/`ResumeAnalysis` persistence was retrofitted in feature 004 without one at the time — this feature closes that gap for the pattern going forward. |
| II. Full-Stack Substance | N/A by design | No new Server Action or model call — this composes/persists results features 002–004 already produce. |
| III. Designed, Accessible Experience | PASS | Panel and reset confirmation reuse existing brand tokens; panel MUST remain legible on mobile (FR-008) via a stacked, non-sidebar layout below that breakpoint; reset confirmation and panel meet the same WCAG 2.1 AA bar as the rest of the product (FR-012), extending the existing axe suite to the four wizard routes' now-changed layout. |
| IV. Product Judgment & Scope Discipline | PASS | Stays to spec.md's two user stories — no additional panel content, no partial-reset options beyond the existing "Try another job" (feature 005, unchanged and untouched). |
| V. Test Discipline | PASS | Vitest covers the new invalidation rules (a genuinely non-trivial piece of business logic — staleness tracking); Playwright covers the four-checkpoint timing and the full reset flow, including the gate-still-blocking case. |
| VI. Legible History | PASS | Conventional Commits; CHANGELOG.md entry on push. |

No unjustified violations — Complexity Tracking table below is empty.
The one ADR obligation above is a documentation commitment stemming
from a real decision, not a complexity violation requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/007-wizard-status-panel/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not yet created)
```

`data-model.md` is not duplicated — `GapAnalysis`'s shape
(`docs/data-model.md`) is unchanged; only *where* it lives changes
(session-persisted, not page-local). `contracts/` is not created —
no new Server Action or route is introduced.

### Source Code (repository root)

```text
fitt.d/
├── src/
│   ├── app/
│   │   └── analyze/
│   │       ├── layout.tsx                # extended — two-column layout: main content
│   │       │                              # (WizardProgress + children) alongside the
│   │       │                              # new WizardStatusPanel; stacks on mobile
│   │       ├── wizard-context.tsx        # extended — exposes gapAnalysis + setGapAnalysis
│   │       ├── wizard-status-panel.tsx   # NEW — the four-checkpoint panel + reset button
│   │       │                              # + confirm step
│   │       └── match/
│   │           └── page.tsx              # extended — persists GapAnalysis via
│   │                                       # setGapAnalysis once analyzeGap succeeds
│   │                                       # (mirrors existing setResumeAnalysis/
│   │                                       # setJdAnalysis calls elsewhere)
│   └── lib/
│       └── input/
│           └── wizard-state.ts            # extended — new GAP_ANALYSIS_KEY + getters/
│                                            # setter; invalidation added to
│                                            # setStoredResumeAnalysis/setStoredJdAnalysis;
│                                            # resetForNewJob and clearWizardState both
│                                            # clear it; clearWizardState gets its first
│                                            # real caller
├── tests/
│   └── input/
│       └── wizard-state.test.ts           # NEW (or extended, if this file already
│                                            # exists) — Vitest coverage of the new
│                                            # invalidation rules and clearWizardState
└── e2e/
    └── wizard-status-panel.spec.ts        # NEW — Playwright: checkpoint timing (all six
                                             # US1 acceptance scenarios), panel + top
                                             # progress bar coexisting, reset confirm/
                                             # cancel/confirm flow, reset while the
                                             # navigation gate is actively blocking
```

**Structure Decision**: The panel is scoped to `/analyze/layout.tsx`
(not the root layout from feature 006), since spec.md is explicit that
it's wizard-specific, not sitewide. `GapAnalysis` persistence follows
the exact existing pattern in `wizard-state.ts`/`wizard-context.tsx`
(same file, same shape of getter/setter pair) rather than introducing
a new state-management approach. The reset action reuses
`clearWizardState()`, which already existed for exactly this purpose
but had no caller until now — no new "reset everything" logic needs
inventing.

## Complexity Tracking

*No entries — Constitution Check passed with no unjustified
violations. The ADR obligation above is a documentation commitment
stemming from a real decision, not complexity requiring justification.*
