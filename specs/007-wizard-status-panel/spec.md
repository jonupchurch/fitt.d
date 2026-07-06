# Feature Specification: Wizard Status Panel & Reset

**Feature Branch**: `007-wizard-status-panel`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "A status panel on the wizard pages, separate from the existing top progress bar, showing four checkpoints: 1) Resume Submitted, 2) Resume Analyzed, 3) JD Submitted, 4) fitt.d analysis. Placed as a sidebar alongside the wizard content. The fourth checkpoint marks done only once the fit/match has actually been computed, not just once both prerequisite analyses are ready. The panel also has a button to reset the wizard and start over."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See exactly what's actually been done (Priority: P1)

As a candidate moving through the analyze wizard, I want a clear,
persistent checklist of the four real milestones — my resume being
submitted, my resume being analyzed, my job description being
submitted, and my fit against that job actually being analyzed — so I
always know precisely what has genuinely happened versus what's still
pending, distinct from which step I'm currently viewing.

**Why this priority**: This is the entire point of the feature — a
more truthful, detailed status signal than the top progress bar
provides (which is about navigation position, not completion of real
work). Everything else in this feature hangs off this panel existing.

**Independent Test**: Can be fully tested by walking through the
wizard from an empty session to a fully completed one and confirming
each of the four checkpoints flips from not-done to done at the
correct, real moment — not at some earlier "eligible" moment.

**Acceptance Scenarios**:

1. **Given** a candidate has not yet uploaded a resume, **When** they
   view any wizard page, **Then** the panel shows all four checkpoints
   as not done.
2. **Given** a candidate has uploaded a resume but its analysis hasn't
   resolved yet, **When** they view the panel, **Then** "Resume
   Submitted" shows done and "Resume Analyzed" shows not done.
3. **Given** resume analysis has resolved (succeeded or failed),
   **When** they view the panel, **Then** "Resume Analyzed" shows done.
4. **Given** a candidate has saved a job description, **When** they
   view the panel, **Then** "JD Submitted" shows done, independent of
   whether resume analysis has finished.
5. **Given** both the resume and job-description analyses are ready but
   the candidate has not yet actually viewed/computed their fit,
   **When** they view the panel, **Then** "fitt.d analysis" still shows
   as not done.
6. **Given** the candidate has reached the Match screen and the fit has
   actually been computed, **When** they view the panel, **Then**
   "fitt.d analysis" shows done — and continues to show done if they
   navigate away and back within the same session.
7. **Given** a candidate is on any of the four wizard steps, **When**
   they view the page, **Then** both the existing top progress bar and
   this panel are visible at the same time, without either being
   hidden or replaced by the other.

---

### User Story 2 - Start over cleanly (Priority: P2)

As a candidate who wants to abandon their current resume/job
description and begin again from scratch, I want a clear reset action
on the status panel, so I don't have to individually replace the
resume and job description or rely on a full page/browser reset.

**Why this priority**: A real but secondary need next to the status
visibility itself — most sessions won't need it, but when it's needed,
today's only options are replacing each input one at a time or closing
the tab.

**Independent Test**: Can be fully tested by progressing partway (or
fully) through the wizard, triggering the reset action and confirming
it, and confirming every checkpoint returns to not-done and the
candidate lands back at the wizard's starting point with no leftover
resume, job description, or analysis data.

**Acceptance Scenarios**:

1. **Given** a candidate has made any amount of progress in the wizard,
   **When** they use the reset action on the panel, **Then** they are
   asked to confirm before anything is discarded.
2. **Given** a candidate confirms the reset, **When** it completes,
   **Then** all four checkpoints return to not-done, any previously
   entered resume/job-description text and analysis results are gone,
   and they land on the wizard's starting step.
3. **Given** a candidate opens the reset confirmation, **When** they
   cancel instead of confirming, **Then** nothing is discarded and they
   remain exactly where they were.
4. **Given** resume analysis is currently in progress and blocking
   further navigation (per feature 003's navigation gate), **When** the
   candidate uses the reset action, **Then** the reset still succeeds
   and is not itself blocked by that gate — it is the escape hatch for
   a session the candidate wants to abandon rather than wait out.

---

### Edge Cases

- What happens if the candidate clicks reset with an empty session
  (nothing submitted yet)? The action still completes without error —
  there is simply nothing to discard, and they end up exactly where the
  wizard already starts.
- What happens to a working-copy resume with applied tailoring edits
  (feature 004) when the wizard is reset? It is discarded along with
  everything else — reset means a genuinely fresh session, not a
  partial one.
- What happens if resume analysis later fails (rather than succeeding)?
  "Resume Analyzed" still marks done — this checkpoint tracks that the
  analysis attempt resolved, matching feature 003's existing
  succeed-or-fail navigation-unblock behavior, not that it succeeded.
- What happens on a narrow (mobile) viewport, where a true side rail
  doesn't fit next to the main content? The panel MUST still be
  reachable and legible, in a layout appropriate to the narrower
  viewport (e.g., positioned above or below the main content instead of
  beside it) — see FR-008.
- What happens on the home page, About page (feature 006), or a shared
  report (`/share`)? The panel does not appear there — it is specific
  to the four analyze-wizard pages, unlike feature 006's sitewide
  header/footer.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a status panel on all four
  analyze-wizard pages (`/analyze/upload`, `/analyze/job`,
  `/analyze/report`, `/analyze/match`), positioned as a sidebar
  alongside the main wizard content on wide viewports.
- **FR-002**: The panel MUST show exactly four checkpoints in order:
  "Resume Submitted," "Resume Analyzed," "JD Submitted," and "fitt.d
  analysis" — each visually distinguishing done from not-done.
- **FR-003**: "Resume Submitted" MUST mark done once a resume has been
  provided (upload or paste), independent of whether its analysis has
  resolved.
- **FR-004**: "Resume Analyzed" MUST mark done once resume analysis has
  resolved — succeeded or failed — matching the same succeed-or-fail
  semantics as feature 003's navigation gate.
- **FR-005**: "JD Submitted" MUST mark done once a job description has
  been saved, independent of the state of either analysis.
- **FR-006**: "fitt.d analysis" MUST mark done only once the fit/match
  has actually been computed for the current resume and job
  description — not merely once both prerequisite analyses are ready
  to compare. This MUST persist for the rest of the session once
  computed (e.g., navigating away from Match and back does not reset
  it back to not-done).
- **FR-007**: This panel MUST coexist with, and MUST NOT replace or
  hide, the existing wizard step-progress bar (features 001/003/004) —
  both are visible on wizard pages at the same time.
- **FR-008**: On narrow (mobile) viewports where a side-by-side layout
  isn't practical, the panel MUST still be present and legible, in a
  layout appropriate to that viewport.
- **FR-009**: The panel MUST include a reset action that, when
  confirmed, discards the current resume, job description, and every
  analysis result (resume analysis, job-description analysis, fit
  analysis, and any applied tailoring edits to the working resume
  copy), returning all four checkpoints to not-done and navigating the
  candidate to the wizard's starting step.
- **FR-010**: The reset action MUST require an explicit confirmation
  step before discarding anything — an accidental single click MUST
  NOT lose a candidate's session.
- **FR-011**: The reset action MUST function even while feature 003's
  navigation gate (ADR-0009) is actively blocking forward navigation —
  it is the one action available to leave a stuck or unwanted session
  rather than waiting for analysis to resolve.
- **FR-012**: The panel and its reset action MUST meet the same WCAG
  2.1 AA accessibility bar as the rest of the product.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On every one of the four wizard pages, a candidate can
  see the true completion state of all four checkpoints without
  navigating away from their current step.
- **SC-002**: The "fitt.d analysis" checkpoint reflects an actually
  computed fit result with 100% accuracy against whether the candidate
  has genuinely received a match result in that session — it is never
  shown done before that point.
- **SC-003**: A candidate can fully reset an in-progress or completed
  session and land back at a genuinely empty starting state in two
  actions (trigger reset, confirm).
- **SC-004**: Zero accidental resets occur without an explicit
  confirmation step.

## Assumptions

- The panel is scoped to the four analyze-wizard pages only — it does
  not appear on the home page, the About page (feature 006), or the
  `/share` page, since those aren't part of the in-progress wizard
  session.
- "fitt.d analysis" being computed requires the fit/match result to be
  retained for the rest of the session (not just held in that page's
  local state), since the checkpoint must stay accurate after
  navigating away from Match and back — this extends the existing
  session-scoped persistence pattern already used for resume/JD
  analysis (feature 004), applied here to the fit result as well.
- The reset action is a full reset (resume, job description, both
  analyses, fit result, and any applied tailoring edits) — there is no
  partial-reset option on this panel; feature 005's existing "Try
  another job" (which preserves the resume and its analysis) remains
  the option for that narrower case and is unchanged by this feature.
- Confirmation is a simple, standard confirm/cancel interaction (e.g.,
  a dialog) — no additional safeguards (typed confirmation text, a
  time delay) are assumed necessary beyond that one explicit step.
