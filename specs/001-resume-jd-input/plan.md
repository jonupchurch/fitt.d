# Implementation Plan: Resume & Job Description Input

**Branch**: `001-resume-jd-input` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-resume-jd-input/spec.md`

## Summary

Give a candidate a validated, normalized `Resume` and `JobDescription`
(upload PDF/DOCX/TXT or paste; paste-only for the JD) ready to hand off
to JD analysis (002) and resume analysis (003), plus a one-click "Try a
sample" path that populates the same shapes from a bundled fixture with
zero typed input. This is the first feature with real product surface
area — it introduces this project's first Server Actions, its first
Zod-validated data, and the first file-parsing dependencies — but stays
strictly to capture/validation/normalization; no analysis logic runs
here.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js latest active LTS (unchanged from feature 000)

**Primary Dependencies**: Next.js Server Actions (existing), Zod (new — first introduction), `unpdf` (PDF text extraction), `mammoth` (DOCX text extraction) — see `research.md`

**Storage**: N/A — normalized `Resume`/`JobDescription` held in `sessionStorage` via client context; no database, no server-side persistence (Technology Constraints: stateless/ephemeral default)

**Testing**: Vitest (validation/parsing unit tests), Playwright (wizard-entry e2e), axe accessibility check extended to the new `/analyze/*` routes

**Target Platform**: Web, deployed to Vercel — Node.js runtime (not Edge; `unpdf`/`mammoth` need Node, and Edge isn't needed or recommended here)

**Project Type**: Web application — same single Next.js app from feature 000, no new deployables

**Performance Goals**: File upload → normalized text should complete in well under the pipeline's own "instant-feeling" bar; target < 2s for a typical resume file at the 5MB cap. (`docs/non-functional.md`'s streaming/latency budgets are analysis-specific, not applicable to input capture itself.)

**Constraints**: Enforce `docs/non-functional.md` size budgets (20,000 char resume cap, 12,000 char JD cap) and the wireframe's 5MB upload cap; no persistence; no auth; every rejection path MUST return a typed, actionable error, never throw/crash (spec Edge Cases)

**Scale/Scope**: Two new routes + a shared wizard layout, three Server Actions, one small validation/parsing library module, one bundled sample fixture — no new persistence layer, no multi-tenant concerns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec-Driven Development & Legible Architecture | PASS, with a task obligation | This feature's spec/plan/tasks are committed artifacts. Unlike feature 000 (no product-architecture tradeoff), this feature makes real ones — parsing-library choice and the input-validation/error-model pattern — which Principle I's ADR trigger list names explicitly ("error handling"). **`docs/adr/0001-resume-jd-input-validation.md` MUST be authored during `/speckit-tasks`/implementation**, correcting feature 000's plan note that assumed the first ADR would arrive with feature 002. |
| II. Full-Stack Substance | PASS | Introduces this project's first Server Actions and first real validation layer (Zod). No LLM calls exist in this feature, so the LLM-specific sub-clauses (streaming, provider abstraction) are N/A here and apply starting feature 002 — this feature's job is to establish the validation-layer pattern feature 002+ will reuse for LLM output. |
| III. Designed, Accessible Experience | PASS | New routes (`/analyze/upload`, `/analyze/job`) and the updated home-route CTAs use brand tokens, not defaults; every state (empty/disabled, error, success/ready) is a designed state per spec's Acceptance Scenarios and Edge Cases. Existing axe CI check (`e2e/accessibility.spec.ts`) is extended to cover the new routes, not left scoped to `/` only. |
| IV. Product Judgment & Scope Discipline | PASS | Scope is deliberately capped at capture/validate/normalize + the sample trigger. The wireframe's live keyword-detection preview on the JD screen is explicitly excluded (that's `JDAnalysis`, feature 002, per `docs/data-model.md`) — called out in spec.md Assumptions and preserved here rather than re-litigated. |
| V. Test Discipline | PASS | Vitest unit tests cover validation/parsing edge cases (wrong format, oversized file, unparseable PDF, over-limit text) from spec.md's Edge Cases; one Playwright e2e test covers the upload/paste/sample entry flow. No eval-harness scoring changes are needed yet (no analysis output exists to score); this feature only authors the sample fixture's `resume`/`jobDescription` content (see `research.md` — Sample fixture shape). |
| VI. Legible History | PASS | Conventional Commits, CHANGELOG.md entry on push, per existing project practice. |

No unjustified violations — Complexity Tracking table below is empty.
The one deviation worth flagging (the ADR obligation) is a correction,
not a violation: feature 000's plan assumed no ADR was needed before
feature 002, and this plan updates that expectation with the actual
reason (Principle I's own trigger list), rather than silently skipping
it.

## Project Structure

### Documentation (this feature)

```text
specs/001-resume-jd-input/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── contracts/
│   └── actions.md       # Phase 1 output — Server Action contracts
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not yet created)
```

`data-model.md` is intentionally **not** duplicated at the feature
level: `Resume`, `JobDescription`, and `SampleFixture` are already
defined once at the repo level in `docs/data-model.md`, which exists
specifically so features 001–005 reference shared entities instead of
each redefining them. This plan settles no new field-level detail
beyond what that doc already has, so it is unchanged by this feature.

### Source Code (repository root)

```text
fitt.d/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # existing placeholder home route — this feature adds the
│   │   │                              # "Analyze my resume" (primary) and "Try a sample" (secondary) CTAs
│   │   ├── layout.tsx, globals.css   # unchanged, from feature 000
│   │   └── analyze/
│   │       ├── layout.tsx            # wizard shell: progress bar, sessionStorage-backed client context
│   │       ├── upload/
│   │       │   ├── page.tsx          # Screen 02 — resume upload/paste
│   │       │   └── actions.ts        # "use server" — submitResume
│   │       └── job/
│   │           ├── page.tsx          # Screen 04 (input half only) — JD paste + optional title/company
│   │           └── actions.ts        # "use server" — submitJobDescription
│   └── lib/
│       └── input/
│           ├── schemas.ts            # Zod schemas: Resume, JobDescription, Result<T>
│           ├── parse-file.ts         # file type/size dispatch + PDF (unpdf) / DOCX (mammoth) extraction
│           ├── validate-text.ts      # shared char-limit validation (resume/JD budgets)
│           └── sample-fixture.ts     # loadSampleFixture() — reads evals/fixtures/, "use server"
├── evals/
│   └── fixtures/
│       └── sample-1/
│           ├── resume.txt            # bundled sample resume (SampleFixture.resume)
│           └── job-description.txt   # bundled sample JD (SampleFixture.jobDescription)
│                                       # `expected` intentionally deferred — see research.md
├── tests/
│   └── input/
│       ├── validate-text.test.ts     # Vitest — char-limit edge cases
│       └── parse-file.test.ts        # Vitest — format/size/unparseable-file edge cases
├── e2e/
│   ├── smoke.spec.ts, accessibility.spec.ts   # existing, unchanged
│   └── analyze-input.spec.ts         # Playwright — upload/paste/sample flows reach "ready" state
├── docs/
│   ├── data-model.md                 # unchanged (already covers this feature's entities)
│   ├── non-functional.md             # unchanged (already covers this feature's limits)
│   └── adr/
│       └── 0001-resume-jd-input-validation.md   # NEW — authored in tasks/implementation, not this plan
└── package.json                      # +zod, +unpdf, +mammoth
```

**Structure Decision**: Real Next.js routes under `src/app/analyze/`
matching the approved wireframe's per-step URLs
(`/analyze/upload`, `/analyze/job`), rather than a single client
component with internal step state — the wireframe shows distinct
URLs with a persistent, back-navigable progress bar, and Constitution
Principle IV frames the slice as "the full flow captured in the
approved wireframes." Wizard-in-progress state lives in
`sessionStorage` via a context provided by `src/app/analyze/layout.tsx`
— no database, keeping the "analyzed in-session, never stored" claim
literally true. See `research.md` → "Wizard state across steps" for
the alternative considered and rejected.

## Complexity Tracking

*No entries — Constitution Check passed with no unjustified
violations. The ADR obligation noted above is a correction to a prior
assumption, not a complexity violation requiring justification.*
