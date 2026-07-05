# Phase 0 Research: Project Setup (Session 0)

No `[NEEDS CLARIFICATION]` markers reached this phase — every technical
choice below is already fixed by the ratified constitution or the brand
guide. This doc records the decision/rationale/alternatives for each
anyway, since a reviewer walking the repo should be able to see *why*,
not just *what*.

## Framework & language

**Decision**: Next.js (App Router) 15+, TypeScript strict mode.
**Rationale**: Constitution Technology Constraints; App Router gives
route handlers/server actions needed by Principle II for the pipeline
features arriving in 002+, without a separate backend service.
**Alternatives considered**: none — fixed by constitution.

## Package manager

**Decision**: npm, with a committed `package-lock.json`.
**Rationale**: Constitution Technology Constraints (decided over pnpm/yarn
during the constitution amendment round).
**Alternatives considered**: already resolved in `.specify/memory/constitution.md`.

## Styling & typography

**Decision**: Tailwind CSS v4, using the CSS-first `@theme` block from
`Resources/fittd-brand-guide.md` verbatim as the token source (brand
cyan/ink/coral/neutral ramps). Manrope (700–800) for display/wordmark,
Inter for body/UI, both loaded via `next/font` for self-hosted, layout-
stable font loading. System monospace (`ui-monospace`) for future
data/score displays — no font file needed.
**Rationale**: The brand guide's tokens are paste-ready and already
constitution-ratified (Principle III: distinctive identity, not Tailwind
defaults). `next/font` avoids a layout-shift/FOUT tradeoff we'd otherwise
have to make with a `<link>`-tag Google Fonts approach.
**Alternatives considered**: Google Fonts `<link>` tag — rejected, worse
CLS and an external network dependency on every page load; `next/font`
self-hosts at build time instead.

## Component base

**Decision**: Tailwind tokens only in this feature; no shadcn/ui
installation yet.
**Rationale**: Spec FR/Assumptions defer component-library installation
to feature 001+, where actual components are needed. Installing shadcn
now with nothing to restyle would be dead weight.
**Alternatives considered**: install shadcn now for "readiness" — rejected
as premature; `npx shadcn@latest init` is cheap to run later.

## Testing

**Decision**: Vitest for unit tests, Playwright for e2e, both with one
smoke test each in this feature.
**Rationale**: Constitution Principle V, verbatim.
**Alternatives considered**: none — fixed by constitution.

## Eval harness

**Decision**: `evals/run-evals.ts` + `evals/scorers.ts` + `evals/fixtures/`
(empty in this feature), wired to `npm run eval`. With zero fixtures
present, the runner iterates zero directories and exits 0.
**Rationale**: Constitution Principle V requires the harness exist and
gate CI; the repo-starter reference bundle's harness shape (a fixtures
loop + threshold-checked scorers) is a good structural model, rewritten
fresh for this repo rather than copied verbatim (Governance note on
external reference material). It has nothing to score yet because no
pipeline or fixtures exist until features 004/005.
**Alternatives considered**: skip the eval script in CI until fixtures
exist — rejected; wiring it now with a clean no-op is what lets later
features add fixtures without touching CI config.

## CI

**Decision**: GitHub Actions workflow running typecheck, lint, unit test,
eval, and an automated accessibility check (axe) against the placeholder
route, on every push; all steps required to pass.
**Rationale**: Constitution Principles III and V, combined. The
accessibility check was added during this planning pass — the initial
spec draft omitted it; Principle III requires it unconditionally, not
just once real UI exists, so it belongs in the CI pipeline being wired
once here (see spec.md FR-014).
**Alternatives considered**: add the axe check later, in feature 001 —
rejected; CI infrastructure is meant to be wired once in session 0, and
retrofitting a blocking gate after other features are already merging
against green CI is exactly the kind of drift session 0 exists to avoid.

## Deployment

**Decision**: Vercel, connected to `github.com/jonupchurch/fitt.d`,
auto-deploying `main` to a public URL.
**Rationale**: Charter/constitution default; Vercel's native Next.js
support needs no custom build configuration for this stack.
**Alternatives considered**: none — fixed by charter. Note: the actual
GitHub↔Vercel account connection is a one-time manual step by the repo
owner (OAuth), not something this plan can automate — captured as an
assumption in spec.md.

## Repository shape

**Decision**: Single Next.js app at the repo root — no monorepo/workspace
tooling (no Turborepo, no npm workspaces).
**Rationale**: Constitution Principle IV — one vertical slice. A
monorepo solves a multi-package problem this project doesn't have; adding
one would be unjustified complexity per the Governance section's
Complexity Tracking rule.
**Alternatives considered**: npm workspaces (e.g. separating `evals/` as
its own package) — rejected as premature abstraction for a single-app MVP.

## ADR scaffold

**Decision**: Create `docs/adr/README.md` (index) and
`docs/adr/0000-template.md` now, with zero decision records in them yet.
**Rationale**: Principle I requires ADRs for every real product-
architecture tradeoff, and the first one (the LLM provider abstraction)
arrives with feature 002. Creating the empty scaffold in session 0 means
feature 002's plan can write straight into an established convention
instead of inventing the ADR format under time pressure.
**Alternatives considered**: create the ADR folder lazily when feature 002
needs it — rejected; it's a two-file, zero-risk addition and matches the
"do all the setup we can in session 0" principle just established.
