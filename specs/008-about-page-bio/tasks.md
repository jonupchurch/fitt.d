---

description: "Task list for feature 008 - About Page Bio & Journey"
---

# Tasks: About Page Bio & Journey

**Input**: Design documents from `specs/008-about-page-bio/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md (no `data-model.md`/`contracts/` — no new entities or Server Actions, per plan.md)

**Tests**: Included — Playwright covers this feature's acceptance scenarios; no new Vitest coverage since this feature introduces no non-trivial business logic (plan.md's Constitution Check).

**Organization**: Two user stories from spec.md, in priority order — US1 (photo + contact column, P1), US2 (journey timeline, P2). A shared Foundational step clears feature 006's placeholder copy and lays out the two-row shell both stories fill in.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1`/`US2`; Setup/Foundational/Polish tasks carry no story label
- File paths are relative to the repository root

## Phase 1: Setup

**None needed.** No new dependencies — `next/image` is already available.

---

## Phase 2: Foundational

**Purpose**: Clear feature 006's placeholder copy and lay out the two-row page shell both stories render into.

- [X] T001 Replace the placeholder content in `src/app/about/page.tsx` with the layout shell: a top row (`flex flex-col gap-8 lg:flex-row lg:items-start`, mirroring the pattern already used in `src/app/analyze/layout.tsx`) with a `lg:w-1/4` slot for the photo and a `lg:flex-1` slot for contact info, and a full-width section below for the timeline — no real content yet

**Checkpoint**: Page structure exists; both stories can now fill in their own pieces independently.

---

## Phase 3: User Story 1 - Find out who built this and how to reach them (Priority: P1) 🎯 MVP

**Goal**: A framed photo and working contact links (email, LinkedIn, GitHub, repo — no phone, no resume control) in the top row.

**Independent Test**: Load `/about` and confirm the photo, its framing, and all four contact links are present and functional, independent of the timeline below.

### Implementation for User Story 1

- [X] T002 [P] [US1] Implement `FramedPhoto` in `src/app/about/framed-photo.tsx`: `next/image` at the real 1024:1536 aspect ratio displayed at ~150px wide, wrapped in a white "mat" and a thin black frame border (brand tokens, per `research.md`), with meaningful `alt` text identifying who the photo is of
- [X] T003 [P] [US1] Implement `ContactLinks` in `src/app/about/contact-links.tsx`: labeled links for email (`mailto:`), LinkedIn, GitHub, and the Fitt.d repo, external links using `target="_blank" rel="noopener noreferrer"` — no phone number, no resume/CV control of any kind
- [X] T004 [US1] Wire `FramedPhoto` and `ContactLinks` into `page.tsx`'s top row (depends on: T001, T002, T003)

### Tests for User Story 1

- [X] T005 [P] [US1] Playwright test in `e2e/about-page.spec.ts`: photo visible with meaningful alt text; all four contact links present with correct hrefs (external links carry `target="_blank"`); zero phone number or resume/CV controls anywhere on the page; photo/contact row stacks into one legible column at a narrow viewport (depends on: T004)

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Understand the journey behind the build (Priority: P2)

**Goal**: A full-width chronological timeline telling the real build story in plain language.

**Independent Test**: Read the timeline section alone and confirm a non-technical reader can follow the real, chronological story end-to-end.

### Implementation for User Story 2

- [X] T006 [US2] Draft the real timeline content in `src/app/about/timeline-data.ts` as a plain array of `{ title, body }` entries — plain language, no unexplained jargon, drawn from the project's actual history (ratifying a constitution before any code, planning each feature before building it, the five core features, a later day of real bug-hunting and fixes, two more features built the same disciplined way, and a cost-conscious model swap backed by real pricing data)
- [X] T007 [US2] Implement the presentational `Timeline` component in `src/app/about/timeline.tsx`: renders `timeline-data.ts` entries as an ordered list with a connecting vertical line and brand-token markers, reusing the visual pattern already established in `wizard-progress.tsx`'s step connectors (per `research.md`) (depends on: T006)
- [X] T008 [US2] Wire `Timeline` into `page.tsx`'s full-width section below the photo/contact row (depends on: T001, T007)

### Tests for User Story 2

- [X] T009 [P] [US2] Playwright test in `e2e/about-page.spec.ts`: timeline section renders with the expected milestone entries present in order; remains a single legible column at a narrow viewport (depends on: T008)

**Checkpoint**: Both user stories independently functional — feature complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Wrap-up items spanning both stories.

- [X] T010 Re-run `e2e/accessibility.spec.ts`'s existing `/about` check and `e2e/site-chrome.spec.ts`'s About "content-only" test to confirm zero violations and zero regressions from the rewritten page
- [X] T011 Add a `docs/future-work.md` entry for the deferred resume/CV download (per spec.md's Assumptions — not a placeholder on the page, just tracked)
- [X] T012 Run `quickstart.md` end-to-end and confirm every scenario passes
- [X] T013 Add a `CHANGELOG.md` entry summarizing feature 008 (Constitution Principle VI)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — skip.
- **Foundational (Phase 2)**: No dependencies beyond existing code. BLOCKS both user stories (the page shell must exist before either story renders into it).
- **User Story 1 (Phase 3)**: Depends on Phase 2. Independent of US2.
- **User Story 2 (Phase 4)**: Depends on Phase 2. Independent of US1.
- **Polish (Phase 5)**: Depends on both user stories being complete.

### Within Each Phase

- T002, T003 can be written in parallel; T004 depends on both plus T001.
- T007 depends on T006. T008 depends on T007 and T001.
- T005 depends on T004. T009 depends on T008.

### Parallel Opportunities

- Once T001 lands, User Story 1 (T002-T005) and User Story 2 (T006-T009) can be built entirely in parallel — different files, no cross-dependency.
- T002 and T003 (different components) can be written in parallel.

---

## Parallel Example: Cross-Story

```bash
# Once T001 (page shell) lands, both stories can start independently:
Task: "Implement FramedPhoto in src/app/about/framed-photo.tsx"        # US1
Task: "Draft timeline content in src/app/about/timeline-data.ts"       # US2
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (nothing to do)
2. Complete Phase 2: Foundational — page shell exists
3. Complete Phase 3: User Story 1 — **STOP and VALIDATE** (photo + contact links work)
4. Demo if ready — the timeline can ship as a fast-follow within the same session

### Incremental Delivery

1. Foundational → page shell in place
2. Add User Story 1 → validate independently → review
3. Add User Story 2 → validate independently → review
4. Polish (a11y re-check, future-work note, quickstart validation, CHANGELOG)

## Notes

- [P] tasks touch different files with no dependencies on each other.
- Per Constitution Principle VI, aim for roughly one commit per task or small logical group, using Conventional Commits prefixes.
- No ADR obligations for this feature (plan.md's Constitution Check) — presentational content, not an architectural decision.
- T006's draft content is expected to go through a review/iteration pass with the user before being considered final — verify each story's acceptance scenarios from `spec.md` before considering the feature done.
- **Real additions during the review pass** (not in the original task breakdown, folded into spec.md FR-006 and this file's Notes rather than renumbering tasks): a "Mission" section (professional bio + project purpose, `page.tsx`) between the contact row and the timeline; small currentColor contact-link glyphs (`EmailIcon`/`LinkedInIcon`/`GitHubIcon` added to `src/components/icons.tsx`, matching the existing icon file's convention) wired into `contact-links.tsx`.
