# Implementation Plan: Resume Analysis

**Branch**: `003-resume-analysis` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-resume-analysis/spec.md`

## Summary

Analyze the `Resume` captured by feature 001 into a `ResumeAnalysis`
(parsed sections, ATS/formatting checks, section feedback, strengths/
weaknesses, overall score, generic rewrite suggestions), surfaced on a
new `/analyze/report` screen — the wizard's real second step, per the
approved wireframe. Unlike feature 002, this feature reuses the
provider/validation/retry/rate-limit infrastructure wholesale rather
than re-deciding it; its only new architectural call is how resume
*structure* gets extracted (one LLM call vs. a separate deterministic
parser).

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js latest active LTS (unchanged)

**Primary Dependencies**: None new — reuses `ai` (Vercel AI SDK/Gateway) and `zod`, both added in feature 002

**Storage**: N/A — stateless, same as features 001/002; no new persistence

**Testing**: Vitest (schema validation, repair-retry) and Playwright (`/analyze/report` e2e), both against the fake provider generalized in this feature (see `research.md`)

**Target Platform**: Web, deployed to Vercel — Node.js runtime (Fluid Compute), unchanged

**Project Type**: Web application — same single Next.js app; adds one new route (`/analyze/report`) to the existing wizard

**Performance Goals**: Per `docs/non-functional.md` — full analysis within ~15s (p90), same budget as feature 002; `ResumeAnalysis` has no prose fields, so it follows the same "skeleton until validated" rendering rule, not token streaming

**Constraints**: Server-side-only LLM call reusing feature 002's Zod-validation/one-retry pattern; shares feature 002's rate limiter (same 6 req/min budget, not a separate one); no persistence of resume text or analysis beyond the session; must be fully functional with no `JobDescription` present

**Scale/Scope**: One Server Action, one internal analysis module, one versioned prompt file, one new route, one ADR — reuses all provider/validation/rate-limit code from feature 002 without modification to its public shape

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec-Driven Development & Legible Architecture | PASS, with a task obligation | This feature makes exactly one new architectural call — a single LLM call handles both structural parsing and quality judgment, rather than a separate deterministic parser stage. `docs/adr/0005-resume-parsing-approach.md` MUST be authored during `/speckit-tasks`/implementation. Everything else (provider, validation/retry, delivery strategy) is inherited from feature 002's `0002`–`0004`, not re-decided, so no additional ADRs are owed for that. |
| II. Full-Stack Substance | PASS | Reuses feature 002's server-side-only, Zod-validated, swappable-provider pattern exactly — no new provider-layer code, just a new prompt/schema/call-site following the established shape. |
| III. Designed, Accessible Experience | PASS | `/analyze/report` is a new designed screen (score ring, ATS checklist, section-feedback rows/accordion, strengths/weaknesses grid, rewrite-suggestion before/after diff with copy-to-clipboard) — brand-tokened, with pass/fail conveyed by icon+text (not color alone) and the score ring given a text alternative for screen readers. Existing axe check extended to this route. |
| IV. Product Judgment & Scope Discipline | PASS | Explicitly excludes gap analysis and JD-tailored rewritten bullets (feature 004's `TailoringOutput`) even though both consume this feature's `ResumeAnalysis` — called out in spec.md Assumptions. |
| V. Test Discipline | PASS | Vitest covers schema validation and the repair-retry path (reusing feature 002's test patterns against the now-generalized fake provider); one Playwright e2e covers the `/analyze/report` flow. No new eval-scoring work — fixtures still arrive with features 004/005 per the existing project assumption. |
| VI. Legible History | PASS | Conventional Commits, CHANGELOG.md entry on push. |

No unjustified violations — Complexity Tracking table below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-resume-analysis/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── contracts/
│   └── actions.md       # Phase 1 output — Server Action + internal interface contract
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not yet created)
```

`data-model.md` is not duplicated at the feature level — `Resume` and
`ResumeAnalysis` live in `docs/data-model.md`, already updated during
this feature's `/speckit-specify` step to add the missing
`rewriteSuggestions` field.

### Source Code (repository root)

```text
fitt.d/
├── src/
│   ├── app/
│   │   └── analyze/
│   │       ├── layout.tsx          # extended (feature 001) — progress bar now reflects
│   │       │                        # this feature's real step ("Analysis") between
│   │       │                        # Upload and Job desc., per the wireframe's order
│   │       ├── upload/              # unchanged (feature 001)
│   │       ├── report/
│   │       │   ├── page.tsx        # NEW — Screen 03: score ring, ATS checklist,
│   │       │   │                    # section-feedback rows (accordion on mobile),
│   │       │   │                    # strengths/weaknesses, rewrite suggestions,
│   │       │   │                    # "Next: compare to a job" CTA
│   │       │   └── actions.ts      # NEW — analyzeResume Server Action
│   │       └── job/                 # unchanged (features 001/002)
│   └── lib/
│       └── llm/
│           ├── schemas.ts          # extended — adds ResumeAnalysis alongside JDAnalysis
│           ├── provider.ts          # unchanged (reused from feature 002)
│           ├── fake-provider.ts      # extended — generalized to be keyed by task id
│           │                         # (jd-analysis | resume-analysis), not JD-only
│           ├── rate-limit.ts         # unchanged (reused; shared counter across both
│           │                         # analysis endpoints — see research.md)
│           ├── analyze-jd.ts         # unchanged
│           └── analyze-resume.ts     # NEW — analyzeResume(text), mirrors analyze-jd.ts
├── prompts/
│   └── resume-analysis.v1.md        # NEW — versioned prompt (content authored in tasks phase)
├── tests/
│   └── llm/
│       └── analyze-resume.test.ts   # NEW — Vitest, schema validation + repair-retry
├── e2e/
│   └── analyze-report.spec.ts       # NEW — Playwright, /analyze/report flow, fake provider
└── docs/
    └── adr/
        └── 0005-resume-parsing-approach.md   # NEW — authored in tasks/implementation
```

**Structure Decision**: `/analyze/report` is inserted as the wizard's
real second step (Upload → **Analysis** → Job desc. → Match), matching
the approved wireframe's order exactly — the same "honor the
wireframe's real routing" choice feature 001 made for its own routes.
All new LLM-calling code follows feature 002's `src/lib/llm/` pattern
file-for-file (schema, prompt, analyze function) rather than
introducing a parallel structure, and the fake provider is generalized
once here so features 004/005 don't have to re-generalize it later.

## Complexity Tracking

*No entries — Constitution Check passed with no unjustified
violations. The single ADR obligation above is a documentation
commitment stemming from a real decision, not a complexity violation
requiring justification.*
