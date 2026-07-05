---

description: "Task list for feature 001 - Resume & Job Description Input"
---

# Tasks: Resume & Job Description Input

**Input**: Design documents from `specs/001-resume-jd-input/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/actions.md, quickstart.md (no feature-level `data-model.md` — entities already live in `docs/data-model.md`, per plan.md)

**Tests**: Included — Constitution Principle V requires Vitest coverage of non-trivial business logic (validation/parsing) and one Playwright happy-path e2e test, as part of this feature's own deliverable rather than a pre-implementation TDD gate. Tests and implementation may be written together; strict test-first ordering is not enforced.

**Organization**: Three user stories from spec.md, in priority order — US1 (resume input, P1), US2 (job description input, P2), US3 (Try a sample, P3). Each is independently testable per spec.md's "Independent Test" for that story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1`/`US2`/`US3`; Setup/Foundational/Polish tasks carry no story label
- File paths are relative to the repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Pull in this feature's new dependencies — nothing else can start until they exist.

- [ ] T001 Add `zod`, `unpdf`, and `mammoth` as dependencies in `package.json`, run `npm install`, and commit the updated `package-lock.json`

**Checkpoint**: New dependencies installed; no application code changed yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared validation layer and wizard shell every user story builds on.

**⚠️ CRITICAL**: No user story can be implemented until this phase is complete.

- [ ] T002 Define `Resume` and `JobDescription` Zod schemas plus the shared `Result<T>` / `InputErrorCode` types in `src/lib/input/schemas.ts` (shapes per `docs/data-model.md`, contract per `contracts/actions.md`)
- [ ] T003 [P] Implement shared char-limit validation in `src/lib/input/validate-text.ts` — resume 20,000 char cap, job description 12,000 char cap (`docs/non-functional.md`), rejecting empty/whitespace-only input (depends on: T002)
- [ ] T004 [P] Vitest tests for `validate-text.ts` covering resume and job-description edge cases (empty, whitespace-only, at-limit, over-limit) in `tests/input/validate-text.test.ts` (depends on: T003)
- [ ] T005 Build the `/analyze` wizard shell in `src/app/analyze/layout.tsx`: progress bar UI plus a `sessionStorage`-backed client context holding the in-progress `Resume`/`JobDescription` state (depends on: T002)

**Checkpoint**: Shared schemas, validation, and wizard shell exist — user story implementation can begin.

---

## Phase 3: User Story 1 - Provide a resume (Priority: P1) 🎯 MVP

**Goal**: A candidate can upload a PDF/DOCX/TXT resume or paste resume text and have it accepted as a normalized, ready-to-use `Resume`.

**Independent Test**: Upload a valid file (or paste text) at `/analyze/upload` and confirm the system extracts/accepts normalized text and marks the resume ready — with no job description or any other feature involved.

### Tests for User Story 1

- [ ] T006 [P] [US1] Vitest tests for `parse-file.ts` covering unsupported format, oversized file, valid PDF/DOCX/TXT extraction, and an unparseable (image-only) PDF in `tests/input/parse-file.test.ts`

### Implementation for User Story 1

- [ ] T007 [US1] Implement file type/size validation and PDF (`unpdf`) / DOCX (`mammoth`) text extraction in `src/lib/input/parse-file.ts` (5MB cap per the approved wireframe) (depends on: T002)
- [ ] T008 [US1] Implement the `submitResume` Server Action in `src/app/analyze/upload/actions.ts` per `contracts/actions.md` (depends on: T002, T003, T007)
- [ ] T009 [US1] Build the resume upload/paste page in `src/app/analyze/upload/page.tsx`: drag-and-drop zone + "Browse files" + paste-text fallback + privacy note ("analyzed in-session, never stored") + proceed action disabled until valid input exists, calling `submitResume` and updating the wizard context on success (depends on: T005, T008)
- [ ] T010 [P] [US1] Add the "Analyze my resume" primary CTA to the home route `src/app/page.tsx`, linking to `/analyze/upload`

**Checkpoint**: User Story 1 is fully functional and independently testable — resume upload or paste reaches a ready state.

---

## Phase 4: User Story 2 - Provide a job description (Priority: P2)

**Goal**: A candidate can paste a job description, with optional title/company, and have it accepted as a normalized, ready-to-use `JobDescription`.

**Independent Test**: Paste job description text (with and without optional title/company) at `/analyze/job` and confirm it's accepted and normalized, independent of resume upload or any analysis logic.

### Implementation for User Story 2

- [ ] T011 [US2] Implement the `submitJobDescription` Server Action in `src/app/analyze/job/actions.ts` per `contracts/actions.md` (depends on: T002, T003)
- [ ] T012 [US2] Build the job description page in `src/app/analyze/job/page.tsx`: optional job title/company fields + paste textarea + proceed action disabled until valid text exists, calling `submitJobDescription` and updating the wizard context on success — **no live keyword-detection preview** (that UI is `JDAnalysis`, feature 002's scope per `spec.md` Assumptions) (depends on: T005, T011)

**Checkpoint**: User Stories 1 and 2 both independently functional.

---

## Phase 5: User Story 3 - Try a sample with zero input (Priority: P3)

**Goal**: A first-time visitor can click "Try a sample" and have a bundled sample resume and job description loaded with no typed or uploaded input.

**Independent Test**: From a fresh session with nothing entered, click "Try a sample" and confirm the bundled sample resume and job description populate the wizard state, in the same shape downstream features expect from manual input.

### Implementation for User Story 3

- [ ] T013 [US3] Author the bundled sample fixture content: `evals/fixtures/sample-1/resume.txt` and `evals/fixtures/sample-1/job-description.txt` (the fixture's `expected` field stays a documented stub — see `research.md`)
- [ ] T014 [US3] Implement the `loadSampleFixture` Server Action in `src/lib/input/sample-fixture.ts` per `contracts/actions.md` (depends on: T002, T013)
- [ ] T015 [US3] Add the "Try a sample" secondary CTA to the home route `src/app/page.tsx`, calling `loadSampleFixture` and populating the wizard context identically to manual input (FR-008) (depends on: T005, T014; touches the same file as T010 — sequence after it, don't edit in parallel)
- [ ] T016 [P] [US3] Vitest test asserting `loadSampleFixture`'s output shape matches `submitResume`/`submitJobDescription`'s (FR-008) in `tests/input/sample-fixture.test.ts` (depends on: T014)

**Checkpoint**: All three user stories independently functional — feature complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wrap-up items spanning all three stories.

- [ ] T017 [P] Extend `e2e/accessibility.spec.ts` to also check `/analyze/upload` and `/analyze/job` (currently scoped to `/` only)
- [ ] T018 Add `e2e/analyze-input.spec.ts`: Playwright test covering the upload, paste, and "Try a sample" paths reaching a ready state (per `quickstart.md`)
- [ ] T019 Author `docs/adr/0001-resume-jd-input-validation.md`, capturing the file-parsing-library and validation/error-model decisions (Constitution Principle I obligation identified in `plan.md`; content drawn from `research.md`)
- [ ] T020 Run `quickstart.md` end-to-end and confirm every scenario passes
- [ ] T021 Add a `CHANGELOG.md` entry summarizing feature 001 (Constitution Principle VI), included in the push that closes this feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion. Independent of US1's implementation, though it reuses `validate-text.ts` (T003).
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion, and its home-route CTA (T015) lands after US1's (T010) since both edit `src/app/page.tsx`.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each Phase

- T003 depends on T002 (schemas exist before validation logic references their types); T004 depends on T003.
- T005 depends on T002 (the wizard context stores schema-typed state).
- T007 depends on T002; T008 depends on T002, T003, T007; T009 depends on T005, T008.
- T011 depends on T002, T003; T012 depends on T005, T011.
- T013 has no code dependency (content authoring); T014 depends on T002, T013; T015 depends on T005, T014; T016 depends on T014.

### Parallel Opportunities

- T003 and building toward T004 can proceed while T005 is also in progress (Phase 2) — different files.
- T006 (parse-file tests) can be written in parallel with T007 (parse-file implementation) if following a test-first order, or immediately after if not — Principle V doesn't enforce test-first.
- T010 (US1 CTA) and later T015 (US3 CTA) both touch `src/app/page.tsx` — not parallelizable with each other; safe to parallelize each against work in a different story's other files.
- T016 and T017 can run in parallel (different files, no shared dependency).

---

## Parallel Example: Phase 2

```bash
# Once T002 (schemas) is done, these can run together:
Task: "Implement shared char-limit validation in src/lib/input/validate-text.ts"
Task: "Build the /analyze wizard shell in src/app/analyze/layout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 — **STOP and VALIDATE** (upload/paste a resume, confirm ready state)
4. Demo if ready — a candidate can already provide a resume, even before JD input or the sample path exist

### Incremental Delivery

1. Setup + Foundational → shared validation/wizard shell ready
2. Add User Story 1 → validate independently → demo
3. Add User Story 2 → validate independently → demo
4. Add User Story 3 → validate independently → demo
5. Polish (a11y coverage, e2e flow test, ADR, CHANGELOG)

## Notes

- [P] tasks touch different files with no dependencies on each other.
- Per Constitution Principle VI, aim for roughly one commit per task or small logical group, using Conventional Commits prefixes.
- T019 (ADR) is a Constitution Principle I obligation surfaced during `/speckit-plan` — don't skip it as boilerplate; it should actually explain the tradeoffs in `research.md`.
- Verify each story's acceptance scenarios from `spec.md` manually or via `quickstart.md` before considering it done.
