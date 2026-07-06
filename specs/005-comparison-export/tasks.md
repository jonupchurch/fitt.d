---

description: "Task list for feature 005 - Side-by-Side Comparison & Export"
---

# Tasks: Side-by-Side Comparison & Export

**Input**: Design documents from `specs/005-comparison-export/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/actions.md, quickstart.md (no feature-level `data-model.md` — no new entities, per plan.md)

**Tests**: Included — Constitution Principle V requires Vitest coverage of the highlight utility, share-link encode/decode round-trip, and `.docx` buffer validity, plus one Playwright happy-path e2e test. No fake-provider work — this feature makes no model calls.

**Organization**: Four user stories from spec.md, in priority order — US1 (side-by-side comparison, P1), US2 (report export, P2), US3 (`.docx` download, P3), US4 (try another job, P4). Each maps to its own client utility and control on the existing `/analyze/match` page, so the stories are more independent of each other than in prior features.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1`/`US2`/`US3`/`US4`; Setup/Polish tasks carry no story label
- File paths are relative to the repository root

## Phase 1: Setup

- [X] T001 Add `docx` as a dependency in `package.json`, run `npm install`, and commit the updated `package-lock.json`

**Checkpoint**: New dependency installed; no application code changed yet.

---

## Phase 2: Foundational

**None needed.** Each story adds an independent utility module and control to the existing `/analyze/match` page (built in feature 004) — there's no shared blocking prerequisite beyond T001. Proceed directly to the user stories.

---

## Phase 3: User Story 1 - See the side-by-side comparison (Priority: P1) 🎯 MVP

**Goal**: A candidate sees their resume and the job description side by side, with matches and gaps visually highlighted, reflecting their current working resume copy.

**Independent Test**: With a completed gap analysis, confirm the resume and job description render side by side with highlighted matches — independent of export or the reset action.

### Tests for User Story 1

- [X] T002 [P] [US1] Vitest tests for `highlight.ts` covering no-match, multiple-occurrence, and case-insensitive matching in `tests/compare/highlight.test.ts`

### Implementation for User Story 1

- [X] T003 [US1] Implement `highlightMatches()` in `src/lib/compare/highlight.ts` per `contracts/actions.md`
- [X] T004 [US1] Add the side-by-side (resume | job description) panel to `src/app/analyze/match/page.tsx`, using `highlight.ts` against the current `WorkingResumeCopy`, `JobDescription`, and `GapAnalysis`'s matched/missing skills (depends on: T003)
- [X] T005 [US1] Add the mobile tabbed (Resume ⇄ Job Description) layout variant to the same panel (depends on: T004)

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Export a report (Priority: P2)

**Goal**: A candidate can export a PDF (via print) or a shareable link of their report in one action.

**Independent Test**: Trigger the export action and confirm a print-ready report or a working shareable link is produced; opening the link elsewhere renders the report with no session required.

### Implementation for User Story 2

- [X] T006 [US2] Add a print stylesheet (`@media print`) and an "Export report" button triggering `window.print()` to `src/app/analyze/match/page.tsx`, disabled until a gap analysis exists (spec.md FR-012)
- [X] T007 [US2] Implement `encodeShareLink()`/`decodeShareLink()` in `src/lib/share/report-link.ts` per `contracts/actions.md` — trimmed summary only (fit score, matched/missing skill names, rationale), never raw resume/JD text
- [X] T008 [P] [US2] Vitest tests for `report-link.ts` covering the encode/decode round-trip and a malformed-payload case in `tests/share/report-link.test.ts`
- [X] T009 [US2] Scaffold the public `/share` route in `src/app/share/page.tsx`: decodes the payload via `report-link.ts`, renders a read-only summary, shows a clear message on a malformed payload (depends on: T007)
- [X] T010 [US2] Add a "Get shareable link" action to `src/app/analyze/match/page.tsx`, calling `encodeShareLink()` and displaying/copying the resulting URL, disabled until a gap analysis exists (depends on: T007)

**Checkpoint**: User Stories 1 and 2 both independently functional.

---

## Phase 5: User Story 3 - Download the tailored resume (Priority: P3)

**Goal**: A candidate can download a properly formatted `.docx` of their current working resume copy.

**Independent Test**: Trigger the download and confirm a valid, properly formatted `.docx` file is produced, reflecting applied edits (or the original analyzed content if none have been applied).

### Implementation for User Story 3

- [X] T011 [US3] Implement `buildTailoredResumeDocx()` in `src/lib/export/build-docx.ts` using the `docx` package, run entirely client-side (depends on: T001)
- [X] T012 [P] [US3] Vitest tests for `build-docx.ts` asserting a valid `.docx` buffer is produced both with and without applied edits, in `tests/export/build-docx.test.ts` (depends on: T011)
- [X] T013 [US3] Add a "Download tailored resume" button to `src/app/analyze/match/page.tsx`, calling `buildTailoredResumeDocx()` and triggering a `Blob` download, disabled until a gap analysis exists (depends on: T011)

**Checkpoint**: User Stories 1, 2, and 3 all independently functional.

---

## Phase 6: User Story 4 - Try another job without re-uploading (Priority: P4)

**Goal**: A candidate can restart from the job-description step, keeping their resume and its analysis intact.

**Independent Test**: Trigger "Try another job" and confirm the candidate lands at the job-description step with resume/resume-analysis unchanged, while stale (not-yet-applied) tailoring suggestions from the prior job are cleared.

### Implementation for User Story 4

- [X] T014 [US4] Implement the reset logic: clear `sessionStorage` entries for `JobDescription`, `JDAnalysis`, `GapAnalysis`, and not-yet-applied `TailoringOutput` suggestions, while preserving `Resume`, `ResumeAnalysis`, and `WorkingResumeCopy` (including applied edits), then navigate to `/analyze/job`
- [X] T015 [US4] Add the "Try another job" button to `src/app/analyze/match/page.tsx`, wired to T014's reset logic

**Checkpoint**: All four user stories independently functional — feature complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Wrap-up items spanning all four stories.

- [X] T016 [P] Extend the accessibility check to cover `/analyze/match`'s new panels (comparison, export controls, disabled states) and the public `/share` route
- [X] T017 Add `e2e/analyze-match-export.spec.ts`: Playwright test covering the comparison view, export (print), share-link round-trip, `.docx` download, and "Try another job" reset, per `quickstart.md`
- [X] T018 [P] Author `docs/adr/0007-report-export-approach.md`
- [X] T019 [P] Author `docs/adr/0008-shareable-link-without-persistence.md`
- [X] T020 Run `quickstart.md` end-to-end and confirm every scenario passes
- [X] T021 Add a `CHANGELOG.md` entry summarizing feature 005 (Constitution Principle VI), included in the push that closes this feature — and note that this closes out full planning for the MVP (features 001–005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: None — skip.
- **User Story 1 (Phase 3)**: Depends on Phase 1 only. Independent of US2/US3/US4.
- **User Story 2 (Phase 4)**: Depends on Phase 1 only. Independent of US1/US3/US4, though its controls live on the same page as US1's panel.
- **User Story 3 (Phase 5)**: Depends on Phase 1 (needs `docx` installed). Independent of US1/US2/US4.
- **User Story 4 (Phase 6)**: No dependency on T001 or any other story — purely `sessionStorage` logic already established by feature 001.
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### Within Each Phase

- T004 depends on T003; T005 depends on T004.
- T009 depends on T007; T010 depends on T007.
- T012 depends on T011; T013 depends on T011.
- T015 depends on T014.

### Parallel Opportunities

- Because none of the four stories share a blocking prerequisite beyond T001, **entire stories can be built in parallel** by different contributors — a first for this project's features.
- T002 (US1 tests) can be written in parallel with T003.
- T008 (US2 tests) can run in parallel with T007/T009/T010's implementation.
- T012 (US3 tests) can run in parallel with T011.
- T018, T019 (Polish ADRs) can run in parallel — different files.

---

## Parallel Example: Cross-Story

```bash
# After T001 (docx installed), all four stories can start independently:
Task: "Implement highlightMatches() in src/lib/compare/highlight.ts"          # US1
Task: "Implement encodeShareLink()/decodeShareLink() in src/lib/share/report-link.ts"  # US2
Task: "Implement buildTailoredResumeDocx() in src/lib/export/build-docx.ts"    # US3
Task: "Implement the 'Try another job' reset logic"                            # US4
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 3: User Story 1 — **STOP and VALIDATE** (side-by-side comparison renders with highlights)
3. Demo if ready — the visual centerpiece of the whole pipeline already exists

### Incremental Delivery

1. Setup → `docx` installed
2. Add User Story 1 → validate independently → demo
3. Add User Story 2 → validate independently → demo
4. Add User Story 3 → validate independently → demo
5. Add User Story 4 → validate independently → demo
6. Polish (a11y coverage, e2e flow test, two ADRs, quickstart validation, CHANGELOG)

## Notes

- [P] tasks touch different files with no dependencies on each other.
- Per Constitution Principle VI, aim for roughly one commit per task or small logical group, using Conventional Commits prefixes.
- T018/T019 (ADRs) are Constitution Principle I obligations surfaced during `/speckit-plan` — each should explain its actual tradeoff from `research.md`, not restate it as boilerplate.
- Verify each story's acceptance scenarios from `spec.md` manually or via `quickstart.md` before considering it done.
- Once this feature's tasks are complete, all of specs 001–005 have committed `plan.md` + `tasks.md` — per the project's agreed workflow, `/speckit-implement` becomes available to start.
