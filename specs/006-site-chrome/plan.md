# Implementation Plan: Site Chrome (Header, Footer, About Page)

**Branch**: `006-site-chrome` | **Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-site-chrome/spec.md`

## Summary

Add a sitewide header (Fitt.d wordmark linking home, a single "wizard"
nav item that's active across all four `/analyze/*` routes, and an
"About" nav item) and a sitewide footer (copyright only) by extending
the root layout, plus a new content-only `/about` route. Purely
presentational composition — no new Server Actions, no new LLM calls,
no new persisted state.

## Technical Context

**Language/Version**: TypeScript (strict mode), unchanged

**Primary Dependencies**: None new — Next.js App Router layout
composition, existing Tailwind brand tokens, `next/link`/`next/navigation`
already used elsewhere (e.g. `wizard-progress.tsx`)

**Storage**: N/A — no new state of any kind

**Testing**: Vitest for the one small pure helper this feature
introduces (which nav section is "active" for a given pathname);
Playwright for header/footer presence across every route, logo→home
navigation, wizard-active-on-all-four-steps, About-active, and
About's no-interactive-controls requirement; existing axe
accessibility suite extended to `/about` and re-run against every
existing route now that they all render new landmark elements

**Target Platform**: Web, deployed to Vercel — unchanged

**Project Type**: Web application — same single Next.js app; adds one
new route (`/about`) and two new sitewide components composed into the
root layout

**Performance Goals**: No new data fetching or model calls — chrome
renders instantly as static markup; not a meaningful performance
surface for this feature

**Constraints**: MUST NOT alter the existing `/analyze` wizard's own
progress bar (`wizard-progress.tsx`) or navigation gate
(`resume-analysis-gate.tsx`) — the new header/footer wrap around them
in the root layout without touching `/analyze/layout.tsx`; MUST use
semantic `<header>`/`<nav>`/`<footer>` landmarks per Constitution
Principle III

**Scale/Scope**: One new route, two new sitewide components, one new
tiny pure helper module, root `layout.tsx` gains two lines of
composition — no new Server Actions, no ADR-worthy tradeoffs (see
Constitution Check)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec-Driven Development & Legible Architecture | PASS, no ADR needed | This is root-layout composition (where the header/footer live, how the "active nav section" is determined for a route-spanning item), not a data model, validation strategy, streaming approach, auth, storage, or error-handling decision — none of the categories Principle I calls out as ADR-worthy apply. spec.md/plan.md/tasks.md are the process record. |
| II. Full-Stack Substance | N/A by design | No new Server Actions, no LLM calls — same reasoning feature 005 used for its export-only scope: this is presentation composing existing routes, not a new backend surface. |
| III. Designed, Accessible Experience | PASS, with obligation | Header/footer/About MUST reuse existing brand tokens/fonts (no default-styled nav), use semantic landmarks, be keyboard-operable with visible focus, and pass the existing axe gate — `accessibility.spec.ts`'s route list is extended to include `/about`, and its existing per-route checks now implicitly cover the new header/footer on every route they already test. |
| IV. Product Judgment & Scope Discipline | PASS | Matches spec.md exactly — logo, two nav items, copyright-only footer, content-only About page. No extra footer links, no mega-menu, no account/settings affordances. |
| V. Test Discipline | PASS | The one bit of real logic (which nav section is active for a given pathname) is extracted into a pure, Vitest-tested helper rather than left as inline JSX conditionals, consistent with Principle V's "non-trivial unit of business logic" bar; Playwright covers the cross-page presence/navigation behavior spec.md's acceptance scenarios describe. |
| VI. Legible History | PASS | Conventional Commits; CHANGELOG.md entry on push. |

No unjustified violations — Complexity Tracking table below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/006-site-chrome/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not yet created)
```

`data-model.md` and `contracts/` are not created — this feature
introduces no new data entities and no new Server Actions/API surface
(spec.md has no Key Entities section, by design).

### Source Code (repository root)

```text
fitt.d/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # extended — composes <SiteHeader/>, {children}, <SiteFooter/>
│   │   └── about/
│   │       └── page.tsx             # NEW — read-only About content, no interactive controls
│   ├── components/
│   │   ├── site-header.tsx          # NEW — logo (→home) + wizard/About nav
│   │   └── site-footer.tsx          # NEW — copyright notice
│   └── lib/
│       └── nav/
│           └── active-section.ts     # NEW — pure helper: pathname -> which nav item is active
├── tests/
│   └── nav/
│       └── active-section.test.ts    # NEW — Vitest, covers all four /analyze/* routes + home + about
└── e2e/
    └── site-chrome.spec.ts           # NEW — Playwright: header/footer on every route, logo→home,
                                        # wizard nav active across all 4 steps, About nav active,
                                        # About page has zero interactive controls
```

**Structure Decision**: Header/footer are composed once in the root
`src/app/layout.tsx`, which already wraps every route in the app
(home, `/analyze/*` via its own nested layout, `/about`, `/share`) —
so no per-route wiring is needed and `/analyze/layout.tsx` (the
wizard's own progress bar + navigation gate) is untouched, just
visually nested beneath the new sitewide header. The "is this route
part of the wizard section" check is pulled into one tiny pure
function (`src/lib/nav/active-section.ts`) so it has a real unit test
instead of being inline, unverified JSX logic — the only piece of
this otherwise-presentational feature substantial enough to warrant
one, per Principle V.

## Complexity Tracking

*No entries — Constitution Check passed with no unjustified
violations and no ADR obligations.*
