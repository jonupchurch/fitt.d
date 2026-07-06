---

description: "Task list for feature 006 - Site Chrome (Header, Footer, About Page)"
---

# Tasks: Site Chrome (Header, Footer, About Page)

**Input**: Design documents from `specs/006-site-chrome/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md (no `data-model.md`/`contracts/` — no new entities or Server Actions, per plan.md)

**Tests**: Included — Constitution Principle V requires Vitest coverage of the one pure helper this feature introduces (`active-section.ts`), plus a Playwright e2e test covering cross-route chrome presence and navigation.

**Organization**: Three user stories from spec.md, in priority order — US1 (sitewide header nav, P1), US2 (About page, P2), US3 (footer copyright, P3). The header/footer shell (logo, both nav slots, footer container) is a shared Foundational prerequisite all three stories render into, since App Router layouts can't be split half-built across a single header component.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1`/`US2`/`US3`; Setup/Foundational/Polish tasks carry no story label
- File paths are relative to the repository root

## Phase 1: Setup

**None needed.** No new dependencies — pure composition of existing Next.js/Tailwind/brand-token primitives already in the project.

---

## Phase 2: Foundational

**Purpose**: The header/footer shell and the active-route helper every story renders into or depends on.

- [X] T001 [P] Implement `isWizardRoute(pathname: string): boolean` and `isAboutRoute(pathname: string): boolean` in `src/lib/nav/active-section.ts`, per `research.md`'s pathname-prefix approach
- [X] T002 [P] Vitest tests for `active-section.ts` covering all four `/analyze/*` routes (wizard active), `/about` (About active), and `/`/`/share` (neither active) in `tests/nav/active-section.test.ts` (depends on: T001)
- [X] T003 Implement `SiteHeader` in `src/components/site-header.tsx`: Fitt.d wordmark (live text, per `research.md`) linking to `/`, a single wizard nav item linking to `/analyze/upload`, and an About nav item linking to `/about` — both using `active-section.ts` for active-state styling (depends on: T001)
- [X] T004 [P] Implement `SiteFooter` in `src/components/site-footer.tsx`: a copyright notice using the current year, computed at render time
- [X] T005 Wire `SiteHeader` and `SiteFooter` into `src/app/layout.tsx`, wrapping `{children}` — confirm `/analyze/layout.tsx` (progress bar, navigation gate) renders unchanged beneath the new header (depends on: T003, T004)

**Checkpoint**: Header and footer render on every route; wizard/About nav items exist (About page itself not yet built — its link 404s until Phase 4).

---

## Phase 3: User Story 1 - Get around the site from anywhere (Priority: P1) 🎯 MVP

**Goal**: A consistent header (logo + wizard nav + About nav) on every route, with the logo returning home and the wizard nav item showing active across all four wizard steps.

**Independent Test**: Load each of `/`, the four `/analyze/*` routes, and confirm the same header appears, the logo returns to `/` from any of them, and the wizard nav item is marked active on all four wizard routes (and only those).

### Implementation for User Story 1

- [X] T006 [US1] Confirm/adjust `SiteHeader`'s active-state styling so the wizard nav item is visually distinct when active (reuse existing brand tokens, e.g. the same active/current styling pattern `wizard-progress.tsx` already uses) (depends on: T003)

### Tests for User Story 1

- [X] T007 [P] [US1] Playwright test in `e2e/site-chrome.spec.ts`: header present on `/` and all four `/analyze/*` routes; logo link navigates to `/` from a non-home route; wizard nav item marked active on all four wizard routes and not on `/`

**Checkpoint**: User Story 1 is fully functional and independently testable (About page 404 is expected until Phase 4).

---

## Phase 4: User Story 2 - Learn what Fitt.d is (Priority: P2)

**Goal**: A real, content-only `/about` page reachable from the header, with the About nav item marked active while on it.

**Independent Test**: Click the About nav item from any page, confirm `/about` renders informational content with zero interactive/product controls, and the nav marks About active.

### Implementation for User Story 2

- [X] T008 [US2] Create `src/app/about/page.tsx` with on-brand placeholder copy per `research.md` (what Fitt.d is, one or two honest sentences — no lorem ipsum, no interactive elements)

### Tests for User Story 2

- [X] T009 [P] [US2] Playwright test in `e2e/site-chrome.spec.ts`: navigating to `/about` via the header renders content and zero forms/file-inputs/buttons that trigger analysis; About nav item marked active there and not elsewhere (depends on: T008)

**Checkpoint**: User Stories 1 and 2 both independently functional.

---

## Phase 5: User Story 3 - See who owns this (Priority: P3)

**Goal**: A copyright notice visible in the footer on every route.

**Independent Test**: Load any route and confirm a footer with a copyright notice is present.

### Tests for User Story 3

- [X] T010 [P] [US3] Playwright test in `e2e/site-chrome.spec.ts`: footer with copyright text present on `/`, all four `/analyze/*` routes, `/about`, and a generated `/share` link (depends on: T004, T005, T008)

**Checkpoint**: All three user stories independently functional — feature complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wrap-up items spanning all three stories.

- [X] T011 Extend `e2e/accessibility.spec.ts`'s route list to include `/about`, and re-run the full suite to confirm the new header/footer landmarks introduce zero violations on every existing route (depends on: T005, T008)
- [X] T012 Run `quickstart.md` end-to-end and confirm every scenario passes
- [X] T013 Add a `CHANGELOG.md` entry summarizing feature 006 (Constitution Principle VI)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — skip.
- **Foundational (Phase 2)**: No dependencies beyond existing code. BLOCKS all user stories (the header/footer shell must exist before any story can render into it).
- **User Story 1 (Phase 3)**: Depends on Phase 2. Independent of US2/US3 (the About link existing-but-404ing doesn't block US1's own acceptance scenarios).
- **User Story 2 (Phase 4)**: Depends on Phase 2 (needs the header's About nav item already wired). Independent of US1/US3.
- **User Story 3 (Phase 5)**: Depends on Phase 2 (footer shell). T010 also exercises the `/about` route, so it runs after T008, but the footer functionality itself has no dependency on US1/US2's content.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each Phase

- T002 depends on T001. T003 depends on T001. T005 depends on T003, T004.
- T006 depends on T003. T007 depends on T006 (and Phase 2 generally).
- T009 depends on T008.
- T010 depends on T004, T005, T008 (needs the full route set, including `/about`, to exist).

### Parallel Opportunities

- T001 and T004 can start in parallel (different files, no shared dependency).
- T002 can be written in parallel with T003 once T001 lands.
- Once Phase 2 completes, US1 and US2's *implementation* tasks (T006, T008) can proceed in parallel — different files, no cross-dependency.

---

## Parallel Example: Foundational

```bash
# T001 and T004 have no dependency on each other:
Task: "Implement isWizardRoute/isAboutRoute in src/lib/nav/active-section.ts"
Task: "Implement SiteFooter in src/components/site-footer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (nothing to do)
2. Complete Phase 2: Foundational — header/footer shell exists
3. Complete Phase 3: User Story 1 — **STOP and VALIDATE** (header + logo + wizard nav work on every route)
4. Demo if ready — the About link will 404 until Phase 4, which is fine for an MVP checkpoint

### Incremental Delivery

1. Foundational → header/footer shell wired into every route
2. Add User Story 1 → validate independently → demo
3. Add User Story 2 → validate independently → demo
4. Add User Story 3 → validate independently → demo
5. Polish (a11y route coverage, quickstart validation, CHANGELOG)

## Notes

- [P] tasks touch different files with no dependencies on each other.
- Per Constitution Principle VI, aim for roughly one commit per task or small logical group, using Conventional Commits prefixes.
- No ADR obligations for this feature (plan.md's Constitution Check) — it's presentation composition, not a data/validation/streaming/auth/storage/error-handling decision.
- Verify each story's acceptance scenarios from `spec.md` manually or via `quickstart.md` before considering it done.
