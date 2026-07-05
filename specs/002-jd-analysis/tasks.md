---

description: "Task list for feature 002 - Job Description Analysis"
---

# Tasks: Job Description Analysis

**Input**: Design documents from `specs/002-jd-analysis/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/actions.md, quickstart.md (no feature-level `data-model.md` — entities already live in `docs/data-model.md`, per plan.md)

**Tests**: Included — Constitution Principle V requires Vitest coverage of schema validation, retry logic, and rate limiting, plus one Playwright happy-path e2e test, all against a deterministic fake provider (no network calls, no cost). Tests and implementation may be written together; strict test-first ordering is not enforced.

**Organization**: Three user stories from spec.md, in priority order — US1 (live skill/keyword preview, P1), US2 (fuller picture: seniority/responsibilities/notable signals, P2), US3 (preview stays fresh on edits, P3). All three read from the same underlying `analyzeJobDescription` action built in Foundational; the story phases are about surfacing and behavior on top of it, not separate pipelines.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1`/`US2`/`US3`; Setup/Foundational/Polish tasks carry no story label
- File paths are relative to the repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Pull in this feature's new dependency and environment config — nothing else can start until they exist.

- [ ] T001 Add `ai` (Vercel AI SDK) as a dependency in `package.json`, run `npm install`, and commit the updated `package-lock.json`
- [ ] T002 [P] Update `.env.example`: change `FITTD_MODEL` to a Gateway-qualified placeholder (e.g. `anthropic/claude-<version>` — fetch the current model ID per `research.md` rather than guessing) and add `AI_GATEWAY_API_KEY`

**Checkpoint**: New dependency installed, env documented; no application code changed yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The full analysis pipeline — schema, prompt, provider wrapper, rate limiter, and the Server Action — that every user story surfaces or exercises.

**⚠️ CRITICAL**: No user story can be implemented until this phase is complete.

- [ ] T003 Define the `JDAnalysis` Zod schema in `src/lib/llm/schemas.ts` (shape per `docs/data-model.md`)
- [ ] T004 [P] Author `prompts/README.md` (prompt versioning convention, Constitution Principle II) and `prompts/jd-analysis.v1.md` (the analysis prompt, informed by — not copied from — the reference bundle's draft)
- [ ] T005 Implement the AI SDK/Gateway wrapper — schema-validated structured generation plus the one-retry repair loop from `research.md` — in `src/lib/llm/provider.ts` (depends on: T003)
- [ ] T006 [P] Implement the deterministic fake provider used by tests in `src/lib/llm/fake-provider.ts` (Constitution Principle V pattern — no network, no cost)
- [ ] T007 [P] Implement the in-memory per-IP fixed-window rate limiter in `src/lib/llm/rate-limit.ts` (6 requests/minute, `docs/non-functional.md`)
- [ ] T008 Implement `analyzeJobDescription(text)` in `src/lib/llm/analyze-jd.ts`, loading the prompt (T004) and calling the provider wrapper (T005) (depends on: T004, T005)
- [ ] T009 Implement the `analyzeJobDescription` Server Action in `src/app/analyze/job/actions.ts` per `contracts/actions.md`, checking the rate limiter (T007) before calling T008 (depends on: T007, T008)

**Checkpoint**: The analysis pipeline works end-to-end (text in, validated `JDAnalysis` or a typed error out) — user story work is now UI/behavior on top of it.

---

## Phase 3: User Story 1 - See detected skills and keywords while pasting (Priority: P1) 🎯 MVP

**Goal**: A candidate who pastes a job description and pauses sees required skills, nice-to-have skills, and ATS keywords appear automatically.

**Independent Test**: Paste a real job description at `/analyze/job`, stop typing, and confirm a live preview of detected skills/keywords appears shortly after — independent of resume analysis or any other feature.

### Tests for User Story 1

- [ ] T010 [P] [US1] Vitest tests for `analyze-jd.ts`/`provider.ts` covering successful schema validation and the repair-retry path, against the fake provider, in `tests/llm/analyze-jd.test.ts`
- [ ] T011 [P] [US1] Vitest tests for `rate-limit.ts` window/limit edge cases in `tests/llm/rate-limit.test.ts`

### Implementation for User Story 1

- [ ] T012 [US1] Add the live-preview panel to `src/app/analyze/job/page.tsx`: debounce (~750ms) after the candidate stops editing, then call `analyzeJobDescription` and render required-skill / nice-to-have-skill / ATS-keyword chips with a skeleton loading state and an accessible live-region announcement (depends on: T009)
- [ ] T013 [US1] Add the error state to the live-preview panel for `invalid_model_output` / `provider_unavailable` / `rate_limited` — a clear, non-blocking, brand-tokened message (depends on: T012)

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Understand the fuller picture (Priority: P2)

**Goal**: A candidate reviewing the analysis also sees inferred seniority, core responsibilities, and any notable signals.

**Independent Test**: Paste a job description and confirm the analysis result includes inferred seniority, a responsibilities list, and notable signals, independent of whether a resume has been provided yet.

### Implementation for User Story 2

- [ ] T014 [US2] Extend the live-preview panel in `src/app/analyze/job/page.tsx` to also render inferred seniority and the responsibilities list from the same `JDAnalysis` result (depends on: T012)
- [ ] T015 [US2] Vitest test asserting an unusual requirement in a fixture job description is captured as a notable signal rather than dropped, against the fake provider, in `tests/llm/analyze-jd.test.ts` (depends on: T008)

**Checkpoint**: User Stories 1 and 2 both independently functional.

---

## Phase 5: User Story 3 - Preview stays accurate after edits (Priority: P3)

**Goal**: If the candidate edits or replaces the pasted job description, the preview updates to match — never showing a stale result.

**Independent Test**: Let an analysis complete, replace the pasted text with a different job description, pause again, and confirm the preview updates to the new analysis rather than the old one.

### Implementation for User Story 3

- [ ] T016 [US3] Implement a "latest-call-wins" wrapper (an earlier in-flight call resolving after a newer one MUST NOT overwrite the newer result) in `src/lib/llm/latest-only.ts`
- [ ] T017 [P] [US3] Vitest test for the latest-call-wins wrapper in `tests/llm/latest-only.test.ts` (depends on: T016)
- [ ] T018 [US3] Wire debounced re-triggering plus the latest-call-wins wrapper into `src/app/analyze/job/page.tsx` so editing the job description reruns analysis and supersedes stale or in-flight results (depends on: T012, T016)

**Checkpoint**: All three user stories independently functional — feature complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wrap-up items spanning all three stories.

- [ ] T019 [P] Extend the accessibility check (`e2e/accessibility.spec.ts` or feature 001's `/analyze/job` coverage) to also assert no violations across the live-preview panel's skeleton, populated, and error states
- [ ] T020 Extend `e2e/analyze-input.spec.ts` (feature 001) with live-preview assertions per `quickstart.md`, run against the fake provider
- [ ] T021 [P] Author `docs/adr/0002-model-provider-abstraction.md`
- [ ] T022 [P] Author `docs/adr/0003-llm-output-validation-and-retry.md`
- [ ] T023 [P] Author `docs/adr/0004-response-delivery-strategy.md`
- [ ] T024 Run `quickstart.md` end-to-end and confirm every scenario passes
- [ ] T025 Add a `CHANGELOG.md` entry summarizing feature 002 (Constitution Principle VI), included in the push that closes this feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Phase 2, and extends the same panel US1 builds (T012) — sequenced after US1 in practice even though its own value (seniority/responsibilities) is independent of US1's keyword chips.
- **User Story 3 (Phase 5)**: Depends on Phase 2, and wires into the same panel (T012) — sequenced after US1.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each Phase

- T005 depends on T003 (provider wrapper validates against the schema); T008 depends on T004, T005; T009 depends on T007, T008.
- T012 depends on T009 (panel calls the Server Action); T013 depends on T012.
- T014 depends on T012 (extends the same panel); T015 depends on T008 (exercises the analysis function directly).
- T016 has no dependency on T012 (pure client-side utility); T017 depends on T016; T018 depends on T012, T016.

### Parallel Opportunities

- T002 (Phase 1) has no dependency on T001 — parallelizable.
- T004, T006, T007 (Phase 2) can proceed in parallel once T003 exists — different files.
- T010, T011 (Phase 3 tests) can run in parallel — different files.
- T021, T022, T023 (Phase 6 ADRs) can all run in parallel — different files, no shared dependency.

---

## Parallel Example: Phase 2

```bash
# Once T003 (schema) is done, these three can run together:
Task: "Author prompts/README.md and prompts/jd-analysis.v1.md"
Task: "Implement the deterministic fake provider in src/lib/llm/fake-provider.ts"
Task: "Implement the in-memory rate limiter in src/lib/llm/rate-limit.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 — **STOP and VALIDATE** (paste a JD, confirm the live skill/keyword preview appears)
4. Demo if ready — the headline "live keyword-detection preview" value already exists

### Incremental Delivery

1. Setup + Foundational → analysis pipeline ready end-to-end
2. Add User Story 1 → validate independently → demo
3. Add User Story 2 → validate independently → demo
4. Add User Story 3 → validate independently → demo
5. Polish (a11y coverage, e2e flow test, three ADRs, quickstart validation, CHANGELOG)

## Notes

- [P] tasks touch different files with no dependencies on each other.
- Per Constitution Principle VI, aim for roughly one commit per task or small logical group, using Conventional Commits prefixes.
- T021–T023 (three ADRs) are Constitution Principle I obligations surfaced during `/speckit-plan` — don't skip them as boilerplate; each should actually explain the tradeoff from `research.md`.
- Before T005/T008 are implemented, confirm the AI SDK's current structured-generation API against `node_modules/ai/docs/` (after T001 installs it) rather than relying on possibly-outdated memory of its interface — per `research.md`.
- Verify each story's acceptance scenarios from `spec.md` manually or via `quickstart.md` before considering it done.
