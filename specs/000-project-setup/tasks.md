---

description: "Task list for feature 000 - Project Setup (session 0)"
---

# Tasks: Project Setup (Session 0)

**Input**: Design documents from `specs/000-project-setup/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md (no data-model.md/contracts/ — this feature has neither, per plan.md)

**Tests**: Included — Constitution Principle V requires Vitest/Playwright/eval scaffolding as part of this feature's own deliverable, not as pre-implementation TDD gates. Per Principle V, tests and implementation may be written together; strict test-first ordering is not enforced.

**Organization**: Single user story (P1) — this whole feature *is* the MVP increment for infrastructure. Phases below split by technical layer (bootstrap → styling/fonts → env → the story's deliverables → polish), per the agreed task-generation approach.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1` for the single user story; Setup/Foundational/Polish tasks carry no story label
- File paths are relative to the repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: The absolute bootstrap — nothing else in this feature can start until this exists.

- [X] T001 Initialize npm project and Next.js App Router scaffold with TypeScript strict mode at repo root: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/` directory structure per plan.md
- [X] T002 [P] Pin Node.js version via `engines` in `package.json` and a `.nvmrc` file (latest active LTS)
- [X] T003 [P] Configure ESLint with TypeScript strict rules in `eslint.config.mjs`
- [X] T004 Add `dev`, `build`, `typecheck`, `lint` scripts to `package.json` (`test`, `test:e2e`, `eval` scripts are added in Phase 3 once those tools exist)

**Checkpoint**: A bare Next.js/TypeScript project builds and lints; nothing renders yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design-system and environment scaffolding that User Story 1's acceptance criteria depend on.

**⚠️ CRITICAL**: User Story 1 cannot be verified until this phase is complete — its acceptance scenarios require brand-tokened rendering.

- [X] T005 Configure Tailwind CSS v4 with the Fitt.d brand `@theme` token block in `src/app/globals.css`, copied from `Resources/fittd-brand-guide.md`
- [X] T006 [P] Configure `next/font` for Manrope (display, 700–800) and Inter (body) and expose them as CSS variables for use in `src/app/layout.tsx`
- [X] T007 [P] Create `.env.example` documenting `ANTHROPIC_API_KEY`, a model-selection variable, `FITTD_MAX_RESUME_CHARS`, `FITTD_MAX_JD_CHARS`, a rate-limit variable, and a usage-logging flag — values are placeholders/documentation only, no real secrets (see `docs/non-functional.md` for the numbers)

**Checkpoint**: Brand tokens, fonts, and env scaffolding exist — User Story 1 implementation can begin.

---

## Phase 3: User Story 1 - Verified infrastructure before feature work begins (Priority: P1) 🎯 MVP

**Goal**: A developer can clone the repo, run it locally, pass every quality-bar check, and see it live at a public URL — with zero product code written yet.

**Independent Test**: Fresh clone → `npm install` → `npm run dev` shows the branded placeholder page; `typecheck`/`lint`/`test`/`test:e2e`/`eval`/`build` all succeed; a push produces a green CI run and (once Vercel is connected) a live deployment.

### Implementation for User Story 1

- [X] T008 [US1] Build the root layout in `src/app/layout.tsx`, wiring the brand fonts (T006) and tokens (T005) into `<html>`/`<body>` (depends on: T005, T006)
- [X] T009 [US1] Build the placeholder home route in `src/app/page.tsx`, rendering Fitt.d's brand identity (wordmark treatment, brand color) with no product UI (depends on: T008)
- [X] T010 [P] [US1] Configure Vitest in `vitest.config.ts` and add one passing smoke test in `tests/smoke.test.ts`
- [X] T011 [P] [US1] Configure Playwright in `playwright.config.ts` and add one passing smoke test in `e2e/smoke.spec.ts` that loads the placeholder home route and asserts it renders
- [X] T012 [P] [US1] Scaffold the eval harness: `evals/run-evals.ts` (runner), `evals/scorers.ts` (scoring functions, unused until fixtures exist), empty `evals/fixtures/` directory — the runner MUST exit 0 when zero fixtures are present
- [X] T013 [US1] Add `test`, `test:e2e`, and `eval` scripts to `package.json` (depends on: T010, T011, T012)
- [X] T014 [US1] Add an automated accessibility check (axe) against the placeholder home route, runnable as its own script (depends on: T009, T011)
- [X] T015 [US1] Create `.github/workflows/ci.yml` running typecheck, lint, unit test, eval, and the accessibility check on every push, failing the build on any failure (depends on: T004, T013, T014)
- [X] T016 [US1] Connect the repository to Vercel and confirm a push to `main` produces a live deployment at a public URL — **manual step**: requires the repo owner (Jon) to complete the one-time GitHub↔Vercel account link via the Vercel dashboard or CLI login; not executable by an agent without account credentials (depends on: T001–T009 pushed to `main`). **STATUS: done — live at https://fittdprod.vercel.app/.**

**Checkpoint**: User Story 1 is fully functional — every Success Criterion in spec.md is verifiable, with zero product features implemented.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Wrap-up items that support later features without being part of User Story 1's own acceptance criteria.

- [X] T017 [P] Create `docs/adr/README.md` (ADR index, empty table) and `docs/adr/0000-template.md` (ADR template), so feature 002's first real ADR has an established home
- [X] T018 Run `quickstart.md` end-to-end and confirm every row in its validation table passes
- [X] T019 Add a `CHANGELOG.md` entry summarizing session 0 (per Constitution Principle VI), to be included in the push that closes this feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 (needs the Next.js project to exist) — blocks User Story 1's acceptance criteria.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion.
- **Polish (Phase 4)**: Depends on Phase 3 completion (T016's manual Vercel step may trail the rest — see note below).

### Within Phase 3

- T008 depends on T005, T006 (needs tokens and fonts to exist before the layout can use them).
- T009 depends on T008 (needs the layout before the page).
- T010, T011, T012 have no dependencies on each other — parallelizable.
- T013 depends on T010, T011, T012 (scripts reference the configs those tasks create).
- T014 depends on T009 (needs a real route to check) and T011 (reuses Playwright to drive the check).
- T015 depends on T004, T013, T014 (CI runs the scripts those tasks add).
- T016 depends on T001–T009 being merged to `main`, and is otherwise independent of T010–T015 — it can proceed in parallel with testing/CI work once there's something to deploy, but is a **manual, non-agent-executable step**.

### Parallel Opportunities

- T002, T003 (Phase 1) can run in parallel.
- T006, T007 (Phase 2) can run in parallel with each other (both depend only on T001/T005 respectively, not on each other).
- T010, T011, T012 (Phase 3) can run in parallel — different files, no shared dependencies.
- T017 (Phase 4) has no dependency on T018/T019 and can run any time after Phase 1.

---

## Parallel Example: Phase 3

```bash
# Once T008/T009 (layout + page) are done, these three can run together:
Task: "Configure Vitest and add smoke test in tests/smoke.test.ts"
Task: "Configure Playwright and add smoke test in e2e/smoke.spec.ts"
Task: "Scaffold eval harness in evals/run-evals.ts, evals/scorers.ts, evals/fixtures/"
```

---

## Implementation Strategy

Since this feature has exactly one user story, there is no MVP-vs-later split within it — Phase 3 complete means the feature is done. The broader project's incremental strategy is: complete all of `000` (this feature) before starting `/speckit-specify` work resumes on `001`–`005`, per the "session 0" approach agreed for this project.

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 — **STOP and VALIDATE** using `quickstart.md`
4. Complete Phase 4: Polish
5. Commit and push (with a CHANGELOG.md entry), then proceed to `/speckit-specify` for feature `001`

## Notes

- [P] tasks touch different files with no dependencies on each other.
- Per Constitution Principle VI, aim for roughly one commit per task or small logical group, using Conventional Commits prefixes.
- T016 (Vercel connection) is the one task in this list that requires the repo owner's direct action — flag it clearly during `/speckit-implement` rather than attempting to script around it.
- Verify each Phase 3 acceptance scenario from spec.md manually or via `quickstart.md` before considering the feature done.
