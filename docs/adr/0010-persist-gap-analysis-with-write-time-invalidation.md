# ADR-0010: Persist GapAnalysis and TailoringOutput, invalidated on write

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Jon Upchurch

## Context

Feature 007's wizard status panel needs a "fitt.d analysis" checkpoint
that marks done only once a fit has actually been computed, not merely
once its two prerequisite analyses exist — and that checkpoint must
stay accurate after navigating away from Match and back within the
same session. Today, `GapAnalysis` and `TailoringOutput` (both feature
004) only ever live in `/analyze/match`'s local React state; neither
was persisted the way `JDAnalysis`/`ResumeAnalysis` were retrofitted
into `wizard-state.ts` during feature 004 (see that feature's own
"retrofitted a real gap" note in `CHANGELOG.md`). That turned out to be
a real, user-visible bug beyond the status panel: navigating away from
Match and back re-ran *both* model calls (gap analysis and the tailored
rewrite stream) from scratch every time, even when nothing about the
resume or job description had changed — silently wasting two billable
calls per revisit. Persisting this data raises a question this project
hasn't had to answer before: both are computed *from* other analyses,
so when does either stop being valid?

## Decision

Add `GAP_ANALYSIS_KEY` and `TAILORING_OUTPUT_KEY` to
`src/lib/input/wizard-state.ts`, following the exact existing
`JDAnalysis`/`ResumeAnalysis` getter/setter pattern. Invalidate both
**on write**, not by checking staleness on read, at the same points —
`TailoringOutput` is derived from `GapAnalysis` plus the same two
prerequisite analyses, so it goes stale at exactly the same moments:

- `setStoredResumeAnalysis` and `setStoredJdAnalysis` unconditionally
  clear both — any time either prerequisite analysis is replaced, the
  fit (and anything tailored from it) computed against the old one is
  no longer valid.
- `setStoredResume` clears both immediately when resume content
  changes (not just once the new analysis eventually lands) —
  otherwise there is a real window where a stale fit result would
  still read "done" for a resume that no longer exists.
- `resetForNewJob()` (feature 005's "Try another job") and
  `clearWizardState()` (feature 007's full reset) both clear both
  explicitly.

On `/analyze/match` itself, the effects that call `analyzeGap` and
`submitTailoring` now check for an existing value first
(`if (... || gapAnalysis) return;` / `!tailoringOutput` in the
tailoring-trigger condition) and skip the call entirely when one is
already present — the persisted value **is** the page's state now,
not a separate local copy kept in sync via a setter.

Tracing actual call patterns confirms the write-time clears don't fire
spuriously: `setStoredJdAnalysis` only fires when the JD live-preview
effect genuinely recomputes, which requires the JD textarea's local
`text` state to change — itself only possible after clicking "Change
job description," never from simply revisiting the already-saved
"ready" screen. So an unconditional clear-on-write only ever fires when
a genuinely new analysis result lands.

## Alternatives considered

- **Fingerprint-based staleness tracking** — store a hash/reference of
  the `resumeAnalysis`/`jdAnalysis` pair a `GapAnalysis`/`TailoringOutput`
  was computed from, and compare on read instead of clearing on write.
  More precise in theory (would survive, e.g., re-analysis producing a
  byte-identical result), but that scenario isn't real in practice, and
  it's inconsistent with how `Resume` invalidation already works
  elsewhere in this file (a simple "did the input change" check, not a
  fingerprint system) — added complexity for a difference that doesn't
  matter.
- **Leave both unpersisted, computed fresh every time Match is
  visited** — the status quo this ADR replaces. Rejected: it made the
  "fitt.d analysis" checkpoint impossible to answer correctly after
  navigating away (spec.md FR-006 requires it to persist for the rest
  of the session), and silently re-ran two model calls on every single
  revisit to a page whose inputs hadn't changed.
- **Cache only `GapAnalysis`, leave `TailoringOutput` re-streaming every
  visit** — considered when only the status panel's checkpoint was in
  scope, but rejected once the actual user-visible symptom (the whole
  page appears to "redo the analysis" on revisit) was raised — the
  rewrite suggestions are just as wasteful to recompute as the fit
  score, for exactly the same reason.

## Consequences

`GapAnalysis` and `TailoringOutput` now follow the same persisted,
invalidate-on-write pattern as every other analysis result in this app
— no new persistence *category*, just two more fields in an existing
mechanism. `clearWizardState()` (present since feature 001 but never
called until now) gets its first real caller: feature 007's "Start
over" reset. `/analyze/match` no longer keeps separate local state for
either value — `useWizard()`'s persisted value is used directly,
removing what had become a duplicate, easy-to-desync copy.
