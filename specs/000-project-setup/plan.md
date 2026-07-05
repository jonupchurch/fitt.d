# Implementation Plan: Project Setup (Session 0)

**Branch**: `000-project-setup` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/000-project-setup/spec.md`

## Summary

Stand up a fully-wired, verified Next.js application skeleton — framework,
brand-tokened styling, unit/e2e/eval test scaffolding, CI, and deployment —
with zero product logic, so features 001–005 build on infrastructure
that's already proven to work rather than being scaffolded piecemeal.
Every technical choice below is already fixed by the ratified
constitution or brand guide; this plan's job is to make those choices
concrete and dependency-ordered, not to decide them.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js latest active LTS

**Primary Dependencies**: Next.js 15+ (App Router), Tailwind CSS v4,
`next/font` (Manrope + Inter), ESLint, Vitest, Playwright

**Storage**: N/A — this feature introduces no data model (see spec.md Key
Entities; product entities live in `docs/data-model.md`, introduced by
features 001–005)

**Testing**: Vitest (unit), Playwright (e2e), a bespoke eval harness
(`evals/run-evals.ts`) that must no-op cleanly with zero fixtures

**Target Platform**: Web, deployed to Vercel

**Project Type**: Web application — single Next.js app at the repo root

**Performance Goals**: N/A for this feature (no product pipeline yet);
pipeline-wide budgets are recorded in `docs/non-functional.md` for
features that need them

**Constraints**: No product business logic, no auth (FR-013); CI must
block merge on any quality-bar failure including accessibility (FR-014)

**Scale/Scope**: Single-developer portfolio project; no multi-package or
workspace tooling needed (see Complexity Tracking — N/A, no violations)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec-Driven Development & Legible Architecture | PASS | This feature's own spec/plan/tasks are committed artifacts. No product-architecture tradeoff exists in pure scaffolding, so no ADR is expected from this feature — `docs/adr/` is scaffolded (index + template) so feature 002's LLM-provider ADR has an established home, not because 000 itself has a decision to record. |
| II. Full-Stack Substance | N/A by design | FR-013 explicitly excludes provider interfaces, schemas, and pipeline code from this feature. The App Router structure doesn't preclude Principle II compliance later — route handlers slot into `src/app/api/` when feature 002 needs them. |
| III. Designed, Accessible Experience | PASS (post-correction) | Brand tokens + fonts wired end-to-end (FR-003, FR-004). **Correction made during this planning pass**: the original spec draft's CI requirement (FR-008) omitted the automated accessibility check Principle III unconditionally requires. Added as FR-014 and reflected in CI below — see `research.md` for rationale. |
| IV. Product Judgment & Scope Discipline | PASS | FR-013 keeps this feature infrastructure-only; no MVP-scope feature work happens here. |
| V. Test Discipline | PASS | Vitest smoke test, Playwright smoke test, eval harness skeleton, and CI running all of typecheck/lint/test/eval (FR-005–FR-008) are all present from the first commit. |
| VI. Legible History | PASS | This plan, and the feature's eventual tasks/implementation, follow Conventional Commits and get a CHANGELOG.md entry on push, per existing project practice. |

No unjustified violations — Complexity Tracking table below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/000-project-setup/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not yet created)
```

`data-model.md` and `contracts/` are intentionally omitted for this
feature: spec.md's Key Entities section is empty (pure infrastructure,
no product data), and the feature exposes no external interface. Shared
product entities live at the repo level in `docs/data-model.md`.

### Source Code (repository root)

```text
fitt.d/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # root layout: next/font (Manrope, Inter), brand <html> setup
│   │   ├── page.tsx          # placeholder home route (brand-tokened, no product UI)
│   │   └── globals.css       # Tailwind v4 @theme block (brand tokens from Resources/fittd-brand-guide.md)
│   └── lib/                  # empty in this feature; reserved for shared code in 002+
├── tests/
│   └── smoke.test.ts         # Vitest smoke test
├── e2e/
│   └── smoke.spec.ts         # Playwright smoke test (loads placeholder route)
├── evals/
│   ├── run-evals.ts          # runner; no-ops cleanly with zero fixtures
│   ├── scorers.ts            # scoring functions (unused until 004/005 add fixtures)
│   └── fixtures/             # empty in this feature
├── docs/
│   ├── data-model.md         # already exists (repo-level, pre-dates this feature)
│   ├── non-functional.md     # already exists (repo-level, pre-dates this feature)
│   └── adr/
│       ├── README.md         # ADR index, empty table
│       └── 0000-template.md  # ADR template for feature 002+ to copy
├── .github/
│   └── workflows/
│       └── ci.yml            # typecheck, lint, unit test, eval, accessibility check
├── public/
├── .env.example
├── next.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
├── playwright.config.ts
├── vitest.config.ts
└── eslint.config.mjs
```

**Structure Decision**: Single Next.js application at the repository root
(no monorepo/workspace tooling). This is the "Web application" shape from
the template, simplified to one app since there's no separate deployable
backend — Next.js route handlers serve that role starting in feature 002.
See `research.md` → "Repository shape" for why a monorepo would be
unjustified complexity here.

## Complexity Tracking

*No entries — Constitution Check passed with no unjustified violations.*
