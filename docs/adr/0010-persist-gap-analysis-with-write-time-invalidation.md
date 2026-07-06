# ADR-0010: Persist GapAnalysis to wizard state, invalidated on write

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Jon Upchurch

## Context

Feature 007's wizard status panel needs a "fitt.d analysis" checkpoint
that marks done only once a fit has actually been computed, not merely
once its two prerequisite analyses exist — and that checkpoint must
stay accurate after navigating away from Match and back within the
same session. Today, `GapAnalysis` (feature 004) only ever lives in
`/analyze/match`'s local React state; it was never persisted the way
`JDAnalysis`/`ResumeAnalysis` were retrofitted into `wizard-state.ts`
during feature 004 (see that feature's own "retrofitted a real gap"
note in `CHANGELOG.md`). Persisting it raises a real question this
project hasn't had to answer for this data before: a fit result is
computed *from* two other analyses, so when does it stop being valid?

## Decision

Add a `GAP_ANALYSIS_KEY` to `src/lib/input/wizard-state.ts`, following
the exact existing `JDAnalysis`/`ResumeAnalysis` getter/setter pattern.
Invalidate it **on write**, not by checking staleness on read:

- `setStoredResumeAnalysis` and `setStoredJdAnalysis` unconditionally
  clear it — any time either prerequisite analysis is replaced, the
  fit computed from the old one is no longer valid.
- `setStoredResume` clears it immediately when resume content changes
  (not just once the new analysis eventually lands) — otherwise there
  is a real window where a stale fit result would still read "done"
  for a resume that no longer exists.
- `resetForNewJob()` (feature 005's "Try another job") and
  `clearWizardState()` (feature 007's full reset) both clear it
  explicitly.

Tracing actual call patterns confirms this doesn't fire spuriously:
`setStoredJdAnalysis` only fires when the JD live-preview effect
genuinely recomputes, which requires the JD textarea's local `text`
state to change — itself only possible after clicking "Change job
description," never from simply revisiting the already-saved "ready"
screen. So an unconditional clear-on-write only ever fires when a
genuinely new analysis result lands.

## Alternatives considered

- **Fingerprint-based staleness tracking** — store a hash/reference of
  the `resumeAnalysis`/`jdAnalysis` pair a `GapAnalysis` was computed
  from, and compare on read instead of clearing on write. More precise
  in theory (would survive, e.g., re-analysis producing a byte-identical
  result), but that scenario isn't real in practice, and it's
  inconsistent with how `Resume` invalidation already works elsewhere
  in this file (a simple "did the input change" check, not a
  fingerprint system) — added complexity for a difference that doesn't
  matter.
- **Leave `GapAnalysis` unpersisted, computed fresh every time Match is
  visited** — rejected: it would make the "fitt.d analysis" checkpoint
  impossible to answer correctly after navigating away (spec.md FR-006
  requires it to persist for the rest of the session), and would mean
  re-running a model call every time a candidate revisits Match, purely
  to answer a status question.

## Consequences

`GapAnalysis` now follows the same persisted, invalidate-on-write
pattern as every other analysis result in this app — no new
persistence *category*, just a fourth field in an existing mechanism.
`clearWizardState()` (present since feature 001 but never called until
now) gets its first real caller: feature 007's "Start over" reset.
