---

description: "Task list for feature 007 - Wizard Status Panel & Reset"
---

# Tasks: Wizard Status Panel & Reset

**Input**: Design documents from `specs/007-wizard-status-panel/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md (no feature-level `data-model.md`/`contracts/` — `GapAnalysis`'s shape is unchanged, no new Server Action, per plan.md)

**Tests**: Included — Constitution Principle V requires Vitest coverage of the new `GapAnalysis` invalidation rules and `clearWizardState()` in `wizard-state.ts`, plus a Playwright e2e test covering checkpoint timing and the full reset flow.

**Organization**: Two user stories from spec.md, in priority order — US1 (status panel, P1), US2 (reset, P2). Both build on a shared Foundational phase: persisting `GapAnalysis` to wizard state (this feature's one real architectural addition) and its invalidation rules.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1`/`US2`; Setup/Foundational/Polish tasks carry no story label
- File paths are relative to the repository root

## Phase 1: Setup

**None needed.** No new dependencies.

---

## Phase 2: Foundational

**Purpose**: Persist `GapAnalysis` to wizard state with correct invalidation — the prerequisite for an accurate "fitt.d analysis" checkpoint (US1) and a complete reset (US2).

- [X] T001 In `src/lib/input/wizard-state.ts`: add a `GAP_ANALYSIS_KEY`, `getGapAnalysisRaw()`, `getStoredGapAnalysis()`, and `setStoredGapAnalysis(analysis: GapAnalysis)`, mirroring the existing `JDAnalysis`/`ResumeAnalysis` pattern
- [X] T002 In the same file: unconditionally clear `GAP_ANALYSIS_KEY` inside `setStoredResumeAnalysis` and `setStoredJdAnalysis` (per `research.md`'s invalidation rule), and explicitly clear it in `resetForNewJob()` (depends on: T001)
- [X] T003 Extend `clearWizardState()` in the same file to also clear `GAP_ANALYSIS_KEY` (alongside its existing four keys) — this function gains its first real caller in US2 (depends on: T001)
- [X] T004 [P] Vitest tests in `tests/input/wizard-state.test.ts` (new file): `GAP_ANALYSIS_KEY` is cleared by a new `setStoredResumeAnalysis` call, by a new `setStoredJdAnalysis` call, by `resetForNewJob()`, and by `clearWizardState()`; confirm `clearWizardState()` clears all five keys (depends on: T002, T003)
- [X] T005 Extend `WizardContextValue` in `src/app/analyze/wizard-context.tsx` to expose `gapAnalysis` (read via `useSyncExternalStore`, mirroring `resumeAnalysis`/`jdAnalysis`) and `setGapAnalysis` (depends on: T001)
- [X] T006 In `src/app/analyze/match/page.tsx`: call `setGapAnalysis(result.data)` once `analyzeGap` succeeds, alongside the existing local `gapAnalysis` state (depends on: T005)
- [X] T007 Author `docs/adr/0010-persist-gap-analysis-with-write-time-invalidation.md` documenting the persistence + invalidation decision and alternatives considered, per `research.md`

**Checkpoint**: `GapAnalysis` now survives navigation within a session and is correctly invalidated — no user-visible UI yet.

---

## Phase 3: User Story 1 - See exactly what's actually been done (Priority: P1) 🎯 MVP

**Goal**: A sidebar panel on all four wizard pages showing the real completion state of four checkpoints, coexisting with the existing top progress bar.

**Independent Test**: Walk from an empty session to a fully completed one and confirm each checkpoint flips at the correct real moment.

### Implementation for User Story 1

- [X] T008 [US1] Implement `WizardStatusPanel` in `src/app/analyze/wizard-status-panel.tsx`: four checkpoints (Resume Submitted: `resume !== null`; Resume Analyzed: `resumeAnalysis !== null || resumeAnalysisFailed`; JD Submitted: `jobDescription !== null`; fitt.d analysis: `gapAnalysis !== null`), each visually distinguishing done/not-done (depends on: T005)
- [X] T009 [US1] Extend `src/app/analyze/layout.tsx` to a two-column layout (main content + `WizardStatusPanel` sidebar) on wide viewports, stacking on narrow viewports, per `research.md` — confirm `WizardProgress` continues to render unchanged inside the main column (depends on: T008)

### Tests for User Story 1

- [X] T010 [P] [US1] Playwright test in `e2e/wizard-status-panel.spec.ts`: all four checkpoints start not-done; Resume Submitted flips before Resume Analyzed; JD Submitted flips independent of resume-side state; fitt.d analysis stays not-done until a real fit is computed at `/analyze/match`, then stays done after navigating away and back; both the panel and the existing top progress bar are visible together (depends on: T009)

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Start over cleanly (Priority: P2)

**Goal**: A confirm-then-reset action on the panel that fully clears the session and returns to the wizard's start, working even while the ADR-0009 navigation gate is active.

**Independent Test**: Progress partway through the wizard, trigger reset, confirm, and confirm every checkpoint returns to not-done with no leftover data.

### Implementation for User Story 2

- [X] T011 [US2] Add a "Start over" button to `WizardStatusPanel` (`src/app/analyze/wizard-status-panel.tsx`) that calls `window.confirm(...)` per `research.md`, and on confirmation calls `clearWizardState()` then navigates to `/analyze/upload` (depends on: T003, T008)

### Tests for User Story 2

- [X] T012 [P] [US2] Playwright test in `e2e/wizard-status-panel.spec.ts`: reset without confirming leaves state untouched; reset confirmed clears all four checkpoints and applied tailoring edits, landing on `/analyze/upload`; reset works while a `TRIGGER_SLOW_ANALYSIS` resume keeps the ADR-0009 gate actively blocking `/analyze/job` (depends on: T011)

**Checkpoint**: Both user stories independently functional — feature complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Wrap-up items spanning both stories.

- [X] T013 Extend `e2e/accessibility.spec.ts` to re-check the four `/analyze/*` routes' new two-column layout and confirm zero violations from the panel and its reset control
- [X] T014 Run the full existing e2e suite (not just the new spec) to confirm the `/analyze/layout.tsx` width/layout change doesn't regress any prior wizard flow test
- [X] T015 Run `quickstart.md` end-to-end and confirm every scenario passes
- [X] T016 Add a `CHANGELOG.md` entry summarizing feature 007 (Constitution Principle VI)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — skip.
- **Foundational (Phase 2)**: No dependencies beyond existing code (features 003/004). BLOCKS both user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2. Independent of US2 (a panel with no reset button is still fully valuable/testable).
- **User Story 2 (Phase 4)**: Depends on Phase 2 (needs `clearWizardState()`, T003) and on T008 (the button lives on the panel US1 builds) — not independent of US1 the way most story pairs in this project have been, since spec.md places the reset action *on* the same panel.
- **Polish (Phase 5)**: Depends on both user stories being complete.

### Within Each Phase

- T002, T003 depend on T001. T004 depends on T002, T003. T005 depends on T001. T006 depends on T005.
- T008 depends on T005. T009 depends on T008. T010 depends on T009.
- T011 depends on T003, T008. T012 depends on T011.

### Parallel Opportunities

- T004 (Vitest) can be written in parallel with T005/T006 once T002/T003 land.
- T007 (ADR) can be authored in parallel with T008 onward — documentation, not code.

---

## Parallel Example: Foundational

```bash
# Once T001 lands, T002/T003 (invalidation) and T005 (context exposure) have no
# dependency on each other:
Task: "Clear GAP_ANALYSIS_KEY inside setStoredResumeAnalysis/setStoredJdAnalysis, and in resetForNewJob()"
Task: "Extend WizardContextValue to expose gapAnalysis/setGapAnalysis"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (nothing to do)
2. Complete Phase 2: Foundational — `GapAnalysis` persistence + invalidation in place
3. Complete Phase 3: User Story 1 — **STOP and VALIDATE** (all four checkpoints track correctly)
4. Demo if ready — reset can ship as a fast-follow

### Incremental Delivery

1. Foundational → `GapAnalysis` persisted and correctly invalidated
2. Add User Story 1 → validate independently → demo
3. Add User Story 2 → validate independently → demo
4. Polish (a11y re-check, full regression run, quickstart validation, CHANGELOG)

## Notes

- [P] tasks touch different files with no dependencies on each other.
- Per Constitution Principle VI, aim for roughly one commit per task or small logical group, using Conventional Commits prefixes.
- T007 (ADR-0010) is a Constitution Principle I obligation surfaced during `/speckit-plan` — it should explain the actual invalidation tradeoff from `research.md`, not restate it as boilerplate.
- Verify each story's acceptance scenarios from `spec.md` manually or via `quickstart.md` before considering it done.
