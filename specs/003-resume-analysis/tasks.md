---

description: "Task list for feature 003 - Resume Analysis"
---

# Tasks: Resume Analysis

**Input**: Design documents from `specs/003-resume-analysis/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/actions.md, quickstart.md (no feature-level `data-model.md` — entities live in `docs/data-model.md`, already updated during `/speckit-specify`)

**Tests**: Included — Constitution Principle V requires Vitest coverage of schema validation and retry logic, plus one Playwright happy-path e2e test, both against the fake provider generalized in this feature. Tests and implementation may be written together; strict test-first ordering is not enforced.

**Organization**: Three user stories from spec.md, in priority order — US1 (score + ATS checks, P1), US2 (section feedback + strengths/weaknesses, P2), US3 (generic rewrite suggestions, P3). All three surface facets of one `analyzeResume` result built in Foundational, same pattern as feature 002.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1`/`US2`/`US3`; Setup/Foundational/Polish tasks carry no story label
- File paths are relative to the repository root

## Phase 1: Setup

**No new dependencies or environment changes** — this feature reuses feature 002's `ai`/`zod` additions and `.env` configuration unchanged. Nothing to do here; proceed to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The full resume-analysis pipeline and page shell that every user story populates.

**⚠️ CRITICAL**: No user story can be implemented until this phase is complete.

- [ ] T001 Define the `ResumeAnalysis` Zod schema in `src/lib/llm/schemas.ts` (shape per `docs/data-model.md`, including the `rewriteSuggestions` field added during this feature's spec)
- [ ] T002 [P] Generalize `src/lib/llm/fake-provider.ts` to be keyed by task id (`jd-analysis` | `resume-analysis`) rather than JD-only, adding a resume-analysis fixture response
- [ ] T003 [P] Author `prompts/resume-analysis.v1.md` (versioned prompt; content informed by — not copied from — the reference bundle's draft resume-parse prompt), instructing the model to omit rather than invent unsupported content (spec.md FR-008)
- [ ] T004 Implement `analyzeResume(text)` in `src/lib/llm/analyze-resume.ts`, mirroring `analyze-jd.ts` exactly and calling the unchanged `provider.ts` (depends on: T001, T003)
- [ ] T005 Implement the `analyzeResume` Server Action in `src/app/analyze/report/actions.ts` per `contracts/actions.md`, checking the shared, unchanged rate limiter before calling T004 (depends on: T004)
- [ ] T006 [P] Extend the wizard progress bar in `src/app/analyze/layout.tsx` to include this feature's step ("Analysis") between Upload and Job desc., per the wireframe's order
- [ ] T007 Scaffold the `/analyze/report` page shell in `src/app/analyze/report/page.tsx`: triggers `analyzeResume` once a resume exists, with a skeleton loading state and brand-tokened layout matching Screen 03 (depends on: T005, T006)

**Checkpoint**: The analysis pipeline and page shell exist end-to-end — user story work is populating specific panels within it.

---

## Phase 3: User Story 1 - See an overall score and ATS check results (Priority: P1) 🎯 MVP

**Goal**: A candidate sees an overall score/grade and a pass/fail ATS/formatting checklist.

**Independent Test**: Provide a resume (no job description) and confirm an overall score/grade and ATS/formatting checks appear — independent of job description analysis, gap analysis, or tailoring.

### Tests for User Story 1

- [ ] T008 [P] [US1] Vitest tests for `analyze-resume.ts` covering successful schema validation and the repair-retry path, against the fake provider, in `tests/llm/analyze-resume.test.ts`

### Implementation for User Story 1

- [ ] T009 [US1] Add the score ring and ATS/formatting checklist to `src/app/analyze/report/page.tsx` — pass/fail conveyed by icon+text (not color alone), score ring given a text alternative for screen readers (depends on: T007)
- [ ] T010 [US1] Add the error state (`invalid_model_output` / `provider_unavailable` / `rate_limited`) to the report page — clear, non-blocking, brand-tokened (depends on: T009)

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - See section-by-section feedback and strengths/weaknesses (Priority: P2)

**Goal**: A candidate sees a status and note per resume section, plus distinct strengths and weaknesses.

**Independent Test**: Provide a resume and confirm each parsed section shows a status and note, and strengths/weaknesses lists are present and specific.

### Implementation for User Story 2

- [ ] T011 [US2] Add section-by-section feedback rows (status + note per section; a section not found in the resume shown as such; accordion on mobile) to `src/app/analyze/report/page.tsx` (depends on: T009)
- [ ] T012 [US2] Add strengths and weaknesses lists to the same page (depends on: T009)
- [ ] T013 [US2] Vitest test asserting a resume missing an expected section (e.g. no education) is reflected as "not found" rather than omitted, against the fake provider, in `tests/llm/analyze-resume.test.ts` (depends on: T004)

**Checkpoint**: User Stories 1 and 2 both independently functional.

---

## Phase 5: User Story 3 - See generic rewrite suggestions (Priority: P3)

**Goal**: A candidate sees at least one before/after rewrite suggestion for a weak bullet, with no fabrication when none exists.

**Independent Test**: Provide a resume with an identifiably weak bullet and confirm a before/after suggestion with a reason appears; a strong resume doesn't get a fabricated one.

### Implementation for User Story 3

- [ ] T014 [US3] Add the rewrite-suggestion before/after panel (with copy-to-clipboard per suggestion) to `src/app/analyze/report/page.tsx` (depends on: T009)
- [ ] T015 [US3] Vitest test asserting no fabricated suggestion appears when the fake provider's fixture has no identifiably weak bullets (spec.md FR-008), in `tests/llm/analyze-resume.test.ts` (depends on: T004)

**Checkpoint**: All three user stories independently functional — feature complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wrap-up items spanning all three stories.

- [ ] T016 [P] Extend the accessibility check to cover `/analyze/report`'s states (skeleton, populated, error, accordion expanded/collapsed)
- [ ] T017 Add `e2e/analyze-report.spec.ts`: Playwright test covering the full report flow per `quickstart.md`, against the fake provider
- [ ] T018 [P] Author `docs/adr/0005-resume-parsing-approach.md`
- [ ] T019 Run `quickstart.md` end-to-end and confirm every scenario passes
- [ ] T020 Add a `CHANGELOG.md` entry summarizing feature 003 (Constitution Principle VI), included in the push that closes this feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — nothing to do.
- **Foundational (Phase 2)**: Blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Phase 2, and extends the same page shell (T009) — sequenced after US1 in practice.
- **User Story 3 (Phase 5)**: Depends on Phase 2, and extends the same page shell (T009) — sequenced after US1.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each Phase

- T004 depends on T001, T003; T005 depends on T004; T007 depends on T005, T006.
- T009 depends on T007; T010 depends on T009.
- T011, T012 depend on T009 (extend the same page); T013 depends on T004 (exercises the analysis function directly).
- T014 depends on T009; T015 depends on T004.

### Parallel Opportunities

- T002, T003 (Phase 2) can proceed in parallel with each other, and with T006 — different files, no shared dependency.
- T008 (Phase 3) has no dependency on T009/T010 and can be written in parallel with them.
- T016, T018 (Phase 6) can run in parallel — different files.

---

## Parallel Example: Phase 2

```bash
# Once T001 (schema) is done, these can proceed independently:
Task: "Generalize src/lib/llm/fake-provider.ts to be keyed by task id"
Task: "Author prompts/resume-analysis.v1.md"
Task: "Extend the wizard progress bar in src/app/analyze/layout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (Phase 1 has no tasks)
2. Complete Phase 3: User Story 1 — **STOP and VALIDATE** (provide a resume, confirm score + ATS checks appear)
3. Demo if ready — the "single most glanceable output" already exists

### Incremental Delivery

1. Foundational → analysis pipeline + page shell ready
2. Add User Story 1 → validate independently → demo
3. Add User Story 2 → validate independently → demo
4. Add User Story 3 → validate independently → demo
5. Polish (a11y coverage, e2e flow test, the ADR, quickstart validation, CHANGELOG)

## Notes

- [P] tasks touch different files with no dependencies on each other.
- Per Constitution Principle VI, aim for roughly one commit per task or small logical group, using Conventional Commits prefixes.
- T018 (ADR) is a Constitution Principle I obligation surfaced during `/speckit-plan` — it should explain the tradeoff from `research.md`, not restate it as boilerplate.
- Verify each story's acceptance scenarios from `spec.md` manually or via `quickstart.md` before considering it done.
