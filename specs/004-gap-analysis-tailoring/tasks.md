---

description: "Task list for feature 004 - Gap Analysis & Tailoring Output"
---

# Tasks: Gap Analysis & Tailoring Output

**Input**: Design documents from `specs/004-gap-analysis-tailoring/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/actions.md, quickstart.md (no feature-level `data-model.md` — entities live in `docs/data-model.md`)

**Tests**: Included — Constitution Principle V requires Vitest coverage of schema validation and retry logic (including the streamed-call restart case) plus one Playwright happy-path e2e test, all against the fake provider. Tests and implementation may be written together; strict test-first ordering is not enforced.

**Organization**: Three user stories from spec.md, in priority order — US1 (fit score + matched/missing skills, P1), US2 (gap advice, P2), US3 (tailored rewrites + Apply, P3). All surface facets of the same `analyzeGap`/`tailorResume` pipeline built in Foundational.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1`/`US2`/`US3`; Setup/Foundational/Polish tasks carry no story label
- File paths are relative to the repository root

## Phase 1: Setup

**No new dependencies or environment changes** — reuses `ai`/`zod` and existing `.env` configuration from features 002/003. Nothing to do here; proceed to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The full gap-analysis + tailoring pipeline, the working-copy state module, and the page shell (including the waiting state for the cross-feature dependency) that every user story builds on.

**⚠️ CRITICAL**: No user story can be implemented until this phase is complete.

- [X] T001 Define the `GapAnalysis` and `TailoringOutput` Zod schemas in `src/lib/llm/schemas.ts` (shapes per `docs/data-model.md`)
- [X] T002 [P] Extend `src/lib/llm/fake-provider.ts` with `gap-analysis` and `bullet-tailoring` fixture entries, plus a fake **streaming** response path (yields chunks before resolving)
- [X] T003 [P] Author `prompts/gap-analysis.v1.md` (informed by — not copied from — the reference bundle's draft: evidence-based matching, required-skills-weighted scoring, no inflated matches)
- [X] T004 [P] Author `prompts/bullet-tailoring.v1.md` for schema-validated structured streaming output (not raw markdown), with an explicit no-fabrication instruction (spec.md FR-008)
- [X] T005 Add a `streamText` + `Output.object` variant to `src/lib/llm/provider.ts` alongside the existing blocking variant, per `research.md`'s confirmed AI SDK v6 API shape (depends on: T001)
- [X] T006 Implement `analyzeGap(jdAnalysis, resumeAnalysis)` in `src/lib/llm/analyze-gap.ts`, mirroring `analyze-jd.ts`'s blocking shape (depends on: T001, T003)
- [X] T007 Implement `tailorResume(gapAnalysis, resumeAnalysis, jdAnalysis)` in `src/lib/llm/tailor-resume.ts`, using `provider.ts`'s streamed variant, with the whole-stream-restart retry behavior from `research.md` (depends on: T001, T004, T005)
- [X] T008 Implement the `analyzeGap` and `tailorResume` Server Actions in `src/app/analyze/match/actions.ts` per `contracts/actions.md`, checking the shared rate limiter before each call (depends on: T006, T007)
- [X] T009 [P] Implement `WorkingResumeCopy` client state and `applyBullet()`/`isApplied()` in `src/lib/resume/working-copy.ts`, `sessionStorage`-backed (no Server Action — pure client mutation, per `research.md`)
- [X] T010 [P] Extend the wizard progress bar in `src/app/analyze/layout.tsx` to include this feature's step ("Match")
- [X] T011 Scaffold the `/analyze/match` page shell in `src/app/analyze/match/page.tsx`: checks `sessionStorage` for both `JDAnalysis` and `ResumeAnalysis`, renders a clear waiting state naming what's pending if either is missing, otherwise triggers `analyzeGap` (depends on: T008, T010)

**Checkpoint**: The pipeline, working-copy state, and page shell (including the waiting state) exist end-to-end — user story work populates specific panels within it.

---

## Phase 3: User Story 1 - See the fit score and matched/missing skills (Priority: P1) 🎯 MVP

**Goal**: A candidate sees a fit score, matched skills (with evidence), missing skills (with priority), and keyword coverage.

**Independent Test**: With both prerequisite analyses complete, confirm a fit score, matched/missing skills, and keyword coverage appear — independent of tailoring output or export.

### Tests for User Story 1

- [X] T012 [P] [US1] Vitest tests for `analyze-gap.ts` covering successful schema validation and the repair-retry path, against the fake provider, in `tests/llm/analyze-gap.test.ts`

### Implementation for User Story 1

- [X] T013 [US1] Add the match-score ring, matched/missing skill chips, and keyword coverage to `src/app/analyze/match/page.tsx` — pass/fail conveyed by icon+text (depends on: T011)
- [X] T014 [US1] Add the error state (`invalid_model_output` / `provider_unavailable` / `rate_limited`) to the page (depends on: T013)

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Read gap analysis advice (Priority: P2)

**Goal**: A candidate sees a plain-language rationale and prioritized, specific gap-closing advice.

**Independent Test**: Confirm the analysis includes a rationale for the score and specific, prioritized suggestions tied to the candidate's actual gaps.

### Implementation for User Story 2

- [X] T015 [US2] Add the rationale and prioritized gap-closing advice display to `src/app/analyze/match/page.tsx` (depends on: T013)
- [X] T016 [US2] Vitest test asserting the fit score stays low when core required skills are missing, and that no skill appears as both matched and missing, in `tests/llm/analyze-gap.test.ts` (depends on: T006)

**Checkpoint**: User Stories 1 and 2 both independently functional.

---

## Phase 5: User Story 3 - Get tailored rewrite suggestions and apply them (Priority: P3)

**Goal**: A candidate sees tailored bullet rewrites, a rewritten summary, keywords, and a cover-letter opener, and can apply any bullet with one click into a working resume copy.

**Independent Test**: Confirm tailored content appears (streaming in), and that applying a bullet updates the working copy immediately without altering the originally analyzed resume.

### Implementation for User Story 3

- [X] T017 [P] [US3] Vitest tests for `tailor-resume.ts` covering successful streamed schema validation and the whole-stream-restart retry path, against the fake streaming provider, in `tests/llm/tailor-resume.test.ts`
- [X] T018 [P] [US3] Vitest tests for `working-copy.ts`'s `applyBullet()`/`isApplied()` mutations in `tests/resume/working-copy.test.ts`
- [X] T019 [US3] Add the tailoring panel (rewritten bullets, summary, keywords, cover-letter opener) with a streaming render and Apply buttons to `src/app/analyze/match/page.tsx`, wired to `working-copy.ts` (depends on: T013, T009)
- [X] T020 [US3] Add the applied-vs-not-applied visual distinction (icon+text, not color alone) to the tailoring panel (depends on: T019)
- [X] T021 [US3] Vitest test asserting tailored content never fabricates experience absent from the source resume, against a fixture, in `tests/llm/tailor-resume.test.ts` (depends on: T007)

**Checkpoint**: All three user stories independently functional — feature complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wrap-up items spanning all three stories.

- [X] T022 [P] Extend the accessibility check to cover `/analyze/match`'s states (waiting, populated, error, streaming live-region, applied-vs-not-applied)
- [X] T023 Add `e2e/analyze-match.spec.ts`: Playwright test covering the full match → tailoring → apply flow per `quickstart.md`, against the fake provider
- [X] T024 [P] Author `docs/adr/0006-tailoring-output-streaming-validation.md`
- [X] T025 Run `quickstart.md` end-to-end and confirm every scenario passes
- [X] T026 Add a `CHANGELOG.md` entry summarizing feature 004 (Constitution Principle VI), included in the push that closes this feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — nothing to do.
- **Foundational (Phase 2)**: Blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Phase 2, extends the same page shell (T013) — sequenced after US1.
- **User Story 3 (Phase 5)**: Depends on Phase 2 (including T009, the working-copy module), extends the same page shell (T013) — sequenced after US1.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each Phase

- T005 depends on T001; T006 depends on T001, T003; T007 depends on T001, T004, T005; T008 depends on T006, T007; T011 depends on T008, T010.
- T013 depends on T011; T014 depends on T013.
- T015 depends on T013; T016 depends on T006.
- T019 depends on T013, T009; T020 depends on T019; T021 depends on T007.

### Parallel Opportunities

- T002, T003, T004 (Phase 2) can proceed in parallel once T001 exists — different files.
- T009, T010 (Phase 2) have no dependency on T002–T008 and can proceed in parallel with them.
- T012 (Phase 3) can be written in parallel with T013/T014.
- T017, T018 (Phase 5) can run in parallel — different files.
- T022, T024 (Phase 6) can run in parallel — different files.

---

## Parallel Example: Phase 2

```bash
# Once T001 (schemas) is done, these can proceed independently:
Task: "Author prompts/gap-analysis.v1.md"
Task: "Author prompts/bullet-tailoring.v1.md"
Task: "Extend src/lib/llm/fake-provider.ts with new fixtures + streaming path"
Task: "Implement WorkingResumeCopy state in src/lib/resume/working-copy.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (Phase 1 has no tasks)
2. Complete Phase 3: User Story 1 — **STOP and VALIDATE** (fit score + matched/missing skills appear)
3. Demo if ready — the wireframe's "payoff screen" headline already exists

### Incremental Delivery

1. Foundational → pipeline, working-copy state, and page shell (with waiting state) ready
2. Add User Story 1 → validate independently → demo
3. Add User Story 2 → validate independently → demo
4. Add User Story 3 → validate independently → demo
5. Polish (a11y coverage, e2e flow test, the ADR, quickstart validation, CHANGELOG)

## Notes

- [P] tasks touch different files with no dependencies on each other.
- Per Constitution Principle VI, aim for roughly one commit per task or small logical group, using Conventional Commits prefixes.
- T024 (ADR) is a Constitution Principle I obligation surfaced during `/speckit-plan` — it should explain the streaming-validation tradeoff from `research.md`, not restate it as boilerplate.
- Before T005/T007 are implemented, re-verify the AI SDK's `streamText` + `Output.object` API against `node_modules/ai/docs/` — `research.md`'s finding predates actual installation in this repo.
- Verify each story's acceptance scenarios from `spec.md` manually or via `quickstart.md` before considering it done.
