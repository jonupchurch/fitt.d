# Implementation Plan: About Page Bio & Journey

**Branch**: `008-about-page-bio` | **Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-about-page-bio/spec.md`

## Summary

Replace `/about`'s feature-006 placeholder copy with a personal bio
page: a framed photo (white mat + thin black border) and a contact
column (email/LinkedIn/GitHub/repo, no phone, no resume control yet)
side by side at the top, then a full-width chronological timeline
below telling the project's real build story in plain language for a
non-technical reader. Purely presentational — no new Server Actions,
no new persisted state, no new entities.

## Technical Context

**Language/Version**: TypeScript (strict mode), unchanged

**Primary Dependencies**: `next/image` (already available via Next.js,
not a new dependency) for the photo — needed here specifically because
the source asset is 2.3MB at 1024×1536 and must be optimized down for
a ~150px display size rather than shipped at full resolution

**Storage**: N/A — no new state of any kind

**Testing**: Playwright for photo/frame presence, contact link
correctness (href values, `target="_blank"` on external links),
responsive stacking, and the timeline's presence/structure; no new
Vitest coverage — this feature introduces no non-trivial business
logic, only presentational components (consistent with feature 006's
reasoning for its own presentational pieces)

**Target Platform**: Web, deployed to Vercel — unchanged

**Project Type**: Web application — same single Next.js app; rewrites
one existing route (`/about`), no new routes

**Performance Goals**: The photo must not become a page-weight
regression — `next/image` handles resizing/format negotiation
automatically so the ~2.3MB source is never shipped as-is to a browser
displaying it at ~150px wide

**Constraints**: MUST NOT reintroduce a resume-download control (even
as a disabled/placeholder button) per spec.md FR-005; MUST remain
WCAG 2.1 AA (meaningful photo alt text, contrast) and fully legible at
mobile widths per FR-009/FR-010

**Scale/Scope**: One rewritten route, three new presentational
components colocated with the page (framed photo, contact links,
timeline), one small content module for the real timeline copy — zero
new Server Actions, zero new persisted state, no ADR obligations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec-Driven Development & Legible Architecture | PASS, no ADR needed | No data model, validation strategy, streaming approach, auth, storage, or error-handling decision is being made here — purely presentational composition and content, the same reasoning that exempted feature 006 from an ADR. |
| II. Full-Stack Substance | N/A by design | No new Server Actions or model calls — static content and existing links. |
| III. Designed, Accessible Experience | PASS, with obligation | On-brand framing (brand tokens, not default styling), meaningful `alt` text on the photo, mobile-legible stacking (FR-009), and the existing axe gate (already covering `/about` since feature 006) continues to apply with zero violations. |
| IV. Product Judgment & Scope Discipline | PASS | Matches spec.md exactly — no resume-download control, no phone number, no scope creep into new interactive features. |
| V. Test Discipline | PASS | No new business logic to unit-test (this feature is presentational); Playwright covers the acceptance scenarios from spec.md directly. |
| VI. Legible History | PASS | Conventional Commits; CHANGELOG.md entry on push. |

No unjustified violations — Complexity Tracking table below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/008-about-page-bio/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not yet created)
```

`data-model.md` and `contracts/` are not created — no new entities, no
new Server Actions/API surface (spec.md has no Key Entities section,
by design).

### Source Code (repository root)

```text
fitt.d/
├── public/
│   └── img/
│       └── jonupchurchbiopicture.png   # already in the repo (unchanged)
├── src/
│   └── app/
│       └── about/
│           ├── page.tsx              # rewritten — composes the pieces below
│           ├── framed-photo.tsx       # NEW — white mat + black frame around next/image
│           ├── contact-links.tsx      # NEW — email/LinkedIn/GitHub/repo list
│           ├── timeline.tsx           # NEW — presentational timeline component
│           └── timeline-data.ts       # NEW — the real milestone copy, separate from
│                                        # the presentational component so content edits
│                                        # don't require touching component code
└── e2e/
    └── about-page.spec.ts            # NEW — Playwright: photo/frame present, all four
                                        # contact links present and correct (external
                                        # links open in a new tab), no phone/resume
                                        # control present, timeline renders with real
                                        # milestone content, mobile stacking
```

**Structure Decision**: New components are colocated under
`src/app/about/` rather than `src/components/`, matching this
project's existing convention that page-specific pieces live next to
their page (e.g., `wizard-status-panel.tsx` lives in
`src/app/analyze/`, not `src/components/`) — only genuinely
cross-page pieces (`SiteHeader`, `SiteFooter`, icons) live in
`src/components/`. Timeline content is split into its own data module
so the real copy is easy to find and revise independent of the
rendering component.

## Complexity Tracking

*No entries — Constitution Check passed with no unjustified
violations and no ADR obligations.*
