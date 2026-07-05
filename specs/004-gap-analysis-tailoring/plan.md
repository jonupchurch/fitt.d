# Implementation Plan: Gap Analysis & Tailoring Output

**Branch**: `004-gap-analysis-tailoring` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-gap-analysis-tailoring/spec.md`

## Summary

Compare `JDAnalysis` (002) and `ResumeAnalysis` (003) into a
`GapAnalysis`, then generate a `TailoringOutput`, surfaced on the
`/analyze/match` screen alongside a one-click Apply into a
`WorkingResumeCopy`. This is the first feature needing two distinct
call shapes from the shared LLM infrastructure: a blocking structured
call (gap analysis, same pattern as 002/003) and a **streamed,
schema-validated** structured call (tailoring output) — the first real
exercise of the streaming half of the hybrid delivery strategy
established in feature 002.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js latest active LTS (unchanged)

**Primary Dependencies**: None new — reuses `ai` (Vercel AI SDK/Gateway) and `zod`. Confirmed via the `ai-sdk` skill's current guidance: AI SDK v6 removed `generateObject`/`streamObject` in favor of `generateText`/`streamText` with `output: Output.object({ schema })` — this plan's provider wrapper is built on that current shape, not the deprecated one

**Storage**: N/A — stateless; `WorkingResumeCopy` is `sessionStorage`-backed client state only, same pattern as feature 001's wizard state

**Testing**: Vitest (gap/tailoring schema validation, retry logic including the "restart whole stream once" case, working-copy state mutation) and Playwright (`/analyze/match` e2e), all against the fake provider (generalized further to support a streaming fixture)

**Target Platform**: Web, deployed to Vercel — Node.js runtime (Fluid Compute), unchanged

**Project Type**: Web application — same single Next.js app; adds one new route (`/analyze/match`)

**Performance Goals**: Per `docs/non-functional.md` — gap analysis within ~15s (p90), tailoring's first streamed content within ~2s (p50). This is the first feature where "time to first streamed token" is exercised as literal token streaming, not the skeleton-until-validated pattern 002/003 used

**Constraints**: Both calls server-side only, reusing the provider abstraction and shared rate limiter (one 6 req/min budget across all four analysis endpoints); tailoring's streamed output MUST still be schema-validated before being treated as final; no persistence of any of this feature's data beyond the session; MUST show a clear waiting state (not an error) if either prerequisite analysis hasn't completed

**Scale/Scope**: Two Server Actions, two internal analysis modules (one new streamed-call path in `provider.ts`), one new client-side state module (`WorkingResumeCopy`), two versioned prompt files, one new route, one ADR

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec-Driven Development & Legible Architecture | PASS, with a task obligation | One new architectural tradeoff: tailoring output uses schema-validated *streaming* rather than the reference bundle's raw markdown streaming, to satisfy Principle II's unconditional Zod-validation requirement. `docs/adr/0006-tailoring-output-streaming-validation.md` MUST be authored during `/speckit-tasks`/implementation. Gap analysis and the Apply mechanic reuse already-ratified patterns (ADRs `0002`–`0004`, and the Constitution's own Technology Constraints for working-copy state) — no additional ADRs owed for those. |
| II. Full-Stack Substance | PASS | First feature to exercise both halves of Principle II's response-delivery clause in the same feature: blocking-validated (gap analysis) and streamed-validated (tailoring). Both server-side only, both behind the same swappable provider. |
| III. Designed, Accessible Experience | PASS | New `/analyze/match` screen (match ring, matched/missing chips, gap advice, tailoring panel with Apply, waiting state, error state) is brand-tokened; pass/fail and matched/missing conveyed by icon+text; streaming tailoring content uses an accessible live region so it doesn't go unannounced; applied-vs-not-applied state is distinguishable beyond color alone. Existing axe check extended to this route. |
| IV. Product Judgment & Scope Discipline | PASS | Explicitly excludes the visual side-by-side diff view, export, and "Try another job" reset — all feature 005, called out in spec.md Assumptions. |
| V. Test Discipline | PASS | Vitest covers gap-analysis and tailoring schema validation, the repair-retry path (including the whole-stream-restart case), and `WorkingResumeCopy` mutation logic; one Playwright e2e covers the `/analyze/match` flow. All against the fake provider — no network calls, no cost. |
| VI. Legible History | PASS | Conventional Commits, CHANGELOG.md entry on push. |

No unjustified violations — Complexity Tracking table below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/004-gap-analysis-tailoring/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── contracts/
│   └── actions.md       # Phase 1 output
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not yet created)
```

`data-model.md` is not duplicated — `GapAnalysis`, `TailoringOutput`,
and `WorkingResumeCopy` all live in `docs/data-model.md` already.

### Source Code (repository root)

```text
fitt.d/
├── src/
│   ├── app/
│   │   └── analyze/
│   │       ├── layout.tsx          # extended (feature 001) — progress bar now reflects
│   │       │                        # all four wireframe steps
│   │       └── match/
│   │           ├── page.tsx        # NEW — Screen 05 (partial): match ring, matched/missing
│   │           │                    # skills, gap advice, tailoring panel + Apply, waiting
│   │           │                    # state, error state. Excludes the diff view/export (005)
│   │           └── actions.ts      # NEW — analyzeGap, tailorResume Server Actions
│   └── lib/
│       ├── llm/
│       │   ├── schemas.ts          # extended — adds GapAnalysis, TailoringOutput
│       │   ├── provider.ts          # extended — adds a streamText + Output.object
│       │   │                         # variant alongside the existing blocking one
│       │   ├── fake-provider.ts      # extended — gap-analysis + bullet-tailoring
│       │   │                         # fixtures, plus a fake streaming response path
│       │   ├── rate-limit.ts         # unchanged (shared counter reused)
│       │   ├── analyze-gap.ts        # NEW — mirrors analyze-jd.ts/analyze-resume.ts
│       │   └── tailor-resume.ts       # NEW — uses provider.ts's streamed variant
│       └── resume/
│           └── working-copy.ts        # NEW — client-side WorkingResumeCopy state +
│                                        # applyBullet(), sessionStorage-backed
├── prompts/
│   ├── gap-analysis.v1.md            # NEW
│   └── bullet-tailoring.v1.md         # NEW — schema-validated streaming, not raw markdown
├── tests/
│   ├── llm/
│   │   ├── analyze-gap.test.ts       # NEW
│   │   └── tailor-resume.test.ts      # NEW — includes the whole-stream-restart case
│   └── resume/
│       └── working-copy.test.ts       # NEW
├── e2e/
│   └── analyze-match.spec.ts          # NEW — Playwright, fake provider
└── docs/
    └── adr/
        └── 0006-tailoring-output-streaming-validation.md   # NEW
```

**Structure Decision**: `/analyze/match` becomes the wizard's fourth
and final analysis step, matching the wireframe's order. All new
LLM-calling code continues the `src/lib/llm/` file-per-task pattern
from features 002/003; `WorkingResumeCopy` gets its own
`src/lib/resume/` module since it's client-side resume-editing state
rather than an LLM call, distinct from the `llm/` directory's concerns.

## Complexity Tracking

*No entries — Constitution Check passed with no unjustified
violations. The single ADR obligation above is a documentation
commitment stemming from a real decision, not a complexity violation
requiring justification.*
