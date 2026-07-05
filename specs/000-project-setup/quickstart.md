# Quickstart Validation: Project Setup (Session 0)

Run this after implementation to confirm the feature meets its Success
Criteria. No product features exist yet, so "passing" here means the
*infrastructure* works, not that there's a product to demo.

## Prerequisites

- Node.js (latest active LTS, pinned per the repo's engine/version file)
- npm
- A GitHub account with push access to `github.com/jonupchurch/fitt.d`
- (For deploy validation only) A Vercel account connected to the repo

## Setup

```bash
git clone https://github.com/jonupchurch/fitt.d.git
cd fitt.d
npm install
cp .env.example .env.local   # values can stay placeholder for this feature
```

## Validation

| Command | Expected outcome | Maps to |
|---|---|---|
| `npm run dev` | Dev server starts; browser shows a Fitt.d-branded placeholder page (brand colors, Manrope/Inter fonts) | SC-001, FR-004 |
| `npm run typecheck` | Exits 0, no TypeScript errors | SC-002, FR-001 |
| `npm run lint` | Exits 0, no lint errors | SC-002, FR-010 |
| `npm run test` | Exits 0; at least one Vitest smoke test passes | SC-002, FR-005 |
| `npm run test:e2e` | Exits 0; Playwright smoke test loads the placeholder route | SC-002, FR-006 |
| `npm run eval` | Exits 0 with a "0 fixtures" no-op result, not a failure | SC-002, FR-007 |
| `npm run build` | Production build completes with no errors | SC-002 |

## CI validation

1. Push this feature's branch (or merge to `main`).
2. Confirm the GitHub Actions run shows: typecheck, lint, test, eval, and
   an accessibility (axe) check against the placeholder route — all green.
   (FR-008, FR-014, SC-003)

## Deploy validation

1. Confirm the Vercel project is connected to the GitHub repo (one-time
   manual step — see spec.md Assumptions).
2. Push to `main`.
3. Confirm a new deployment appears in the Vercel dashboard and is
   reachable at its public URL within a few minutes. (FR-009, SC-004)

## Done when

All rows above pass with zero product code — proving features 001–005
will be built on infrastructure that's already known to work.
