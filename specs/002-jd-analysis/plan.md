# Implementation Plan: Job Description Analysis

**Branch**: `002-jd-analysis` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-jd-analysis/spec.md`

## Summary

Analyze the `JobDescription` captured by feature 001 into a `JDAnalysis`
(required/nice-to-have skills, responsibilities, inferred seniority, ATS
keywords, notable signals), surfaced as the live keyword-detection
preview on the existing `/analyze/job` screen. This is the first
feature that calls the LLM provider, so it establishes the project-wide
pattern the rest of the pipeline (003–005) will reuse: Vercel AI SDK
via the AI Gateway for a swappable provider, Zod-validated output with
one bounded repair retry, and a hybrid stream/block response strategy.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js latest active LTS (unchanged)

**Primary Dependencies**: Vercel AI SDK (`ai` package) via the AI Gateway (new), Zod (existing, from feature 001)

**Storage**: N/A — stateless; the rate-limit counter is an in-memory, per-instance value only (not durable — see `research.md`, an explicit, documented limitation rather than a hidden one)

**Testing**: Vitest (schema validation, repair-retry logic, rate-limiter edge cases) and Playwright (live-preview e2e), both run against a deterministic fake provider — no real network calls or model cost in CI

**Target Platform**: Web, deployed to Vercel — Node.js runtime (Fluid Compute); LLM calls are server-side only per Constitution Principle II

**Project Type**: Web application — same single Next.js app, extends the existing `/analyze/job` route from feature 001

**Performance Goals**: Per `docs/non-functional.md` — first result visible within ~2s (p50), full analysis within ~15s (p90). Since `JDAnalysis` has no prose fields, "first streamed token" is realized here as "skeleton-to-populated" for the live preview, not literal token streaming (see `research.md`)

**Constraints**: LLM calls server-side only; model output MUST validate against the `JDAnalysis` Zod schema before use, with one bounded repair retry; enforce the 6 requests/minute rate limit (`docs/non-functional.md`); no persistence of job description text or analysis beyond the session; provider/model MUST be swappable via configuration, not a code change

**Scale/Scope**: One Server Action, one internal analysis module, one versioned prompt file, three ADRs — no new routes; extends `/analyze/job`'s existing page and action file from feature 001

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec-Driven Development & Legible Architecture | PASS, with a task obligation | Three real architectural tradeoffs are made here (provider abstraction, output-validation/retry, response-delivery strategy) — Principle I's ADR trigger list names two of these explicitly. `docs/adr/0002`–`0004` MUST be authored during `/speckit-tasks`/implementation, continuing feature 001's `0001`. |
| II. Full-Stack Substance | PASS | This is the feature that actually realizes Principle II's LLM-specific clauses for the first time: server-side-only calls, Zod-validated output, a swappable provider interface, versioned prompt files, and enforced rate limiting. Everything here sets the pattern features 003–005 reuse rather than re-deciding. |
| III. Designed, Accessible Experience | PASS | The live-preview panel (skill/keyword chips, skeleton loading state, error state) is a new designed state added to the existing `/analyze/job` screen, brand-tokened like the rest — including an accessible live-region announcement so the auto-appearing result doesn't go unnoticed by assistive tech. Existing axe check extended to assert this. |
| IV. Product Judgment & Scope Discipline | PASS | Scope stops at producing and surfacing `JDAnalysis`; resume analysis (003), gap analysis, and tailoring (004) are explicitly out of scope even though they'll consume this feature's output — called out in spec.md Assumptions. |
| V. Test Discipline | PASS | Vitest covers schema validation, the repair-retry path, and rate-limit edge cases; one Playwright e2e covers the live-preview flow. Both run against a fake provider — no network calls, no cost, deterministic — the same principle Principle V already requires of the eval harness. |
| VI. Legible History | PASS | Conventional Commits, CHANGELOG.md entry on push. |

No unjustified violations — Complexity Tracking table below is empty.
The three-ADR obligation is a documentation commitment surfaced by real
decisions, not a complexity violation requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/002-jd-analysis/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── contracts/
│   └── actions.md       # Phase 1 output — Server Action + internal interface contracts
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not yet created)
```

`data-model.md` is intentionally **not** duplicated at the feature
level: `JobDescription` and `JDAnalysis` are already defined once in
`docs/data-model.md`. This plan settles no new field-level detail
beyond what that doc already has.

### Source Code (repository root)

```text
fitt.d/
├── src/
│   ├── app/
│   │   └── analyze/
│   │       └── job/
│   │           ├── page.tsx        # extended (feature 001) — adds the live-preview panel:
│   │           │                    # skill/keyword chips, skeleton state, error state
│   │           └── actions.ts      # extended — adds analyzeJobDescription() alongside
│   │                                # feature 001's submitJobDescription()
│   └── lib/
│       └── llm/
│           ├── provider.ts         # thin AI SDK/Gateway wrapper: schema-validated
│           │                        # structured generation + the one-retry repair loop
│           ├── analyze-jd.ts       # analyzeJobDescription(text): loads
│           │                        # prompts/jd-analysis.v1.md, calls provider.ts
│           ├── rate-limit.ts       # in-memory per-IP fixed-window counter
│           └── fake-provider.ts    # deterministic fake used by tests (Principle V pattern)
├── prompts/
│   ├── README.md                   # NEW — prompt versioning convention (Principle II)
│   └── jd-analysis.v1.md           # NEW — versioned prompt (content authored in tasks phase)
├── tests/
│   └── llm/
│       ├── analyze-jd.test.ts      # Vitest — schema validation + repair-retry, fake provider
│       └── rate-limit.test.ts      # Vitest — window/limit edge cases
├── e2e/
│   └── analyze-input.spec.ts       # extended (feature 001) — adds live-preview assertions
├── docs/
│   ├── data-model.md               # unchanged (JDAnalysis already defined)
│   ├── non-functional.md           # unchanged (budgets already defined)
│   └── adr/
│       ├── 0002-model-provider-abstraction.md        # NEW
│       ├── 0003-llm-output-validation-and-retry.md   # NEW
│       └── 0004-response-delivery-strategy.md        # NEW
├── .env.example                    # updated: FITTD_MODEL → Gateway-qualified string,
│                                     # + AI_GATEWAY_API_KEY
└── package.json                    # +ai (Vercel AI SDK)
```

**Structure Decision**: Extends feature 001's existing `/analyze/job`
route and Server Action file rather than adding a new route — the
approved wireframe (Screen 04) shows the live keyword preview embedded
in the same screen as the JD paste box, so this feature adds to that
screen rather than introducing its own. All LLM-calling code lives
under `src/lib/llm/`, isolated behind the interface in
`contracts/actions.md`, so features 003–005 (which also call the model)
follow the same established pattern instead of each inventing their
own provider wrapper.

## Complexity Tracking

*No entries — Constitution Check passed with no unjustified
violations. The three-ADR obligation above is a documentation
commitment stemming from real decisions, not a complexity violation
requiring justification.*
