# Changelog

A human-readable log of notable pushes to this repository, in reverse
chronological order — updated each time a significant push lands.
Complements `git log` and the Spec Kit artifacts (`.specify/memory/constitution.md`,
`specs/`) with a narrative of how the product and its architecture evolved.

## 2026-07-05 — Project scaffold & resources

- `chore: scaffold Spec Kit project structure`
  ([f19d26b](https://github.com/jonupchurch/fitt.d/commit/f19d26b)) —
  initialized `.specify/` (memory, scripts, templates, workflows) and
  `.claude/skills/` via GitHub Spec Kit; added `.gitignore`; ratified the
  Fitt.d constitution v1.2.0 (spec-driven process, full-stack substance,
  designed/accessible UX, scope discipline, test/eval discipline, legible
  history).
- `docs: add project resources`
  ([3921b72](https://github.com/jonupchurch/fitt.d/commit/3921b72)) —
  added the charter prompt, filled-in design worksheet, brand guide +
  logo/icon assets, annotated wireframes, and a reference bundle (draft
  ADRs/README/prompts/evals) kept as prior art for the planning phase.
- `docs: add CHANGELOG.md` — added this file to track the project's
  evolution across pushes going forward.
- `docs: require CHANGELOG.md updates in the constitution` — ratified
  Fitt.d constitution v1.3.0, amending Principle VI (Legible History) to
  MUST-require a CHANGELOG.md entry alongside every significant push.

## 2026-07-05 — Feature 000: Project Setup (session 0)

Specified, planned, tasked, and implemented as an explicit exception to
the "plan everything, then implement" workflow agreed for this project —
session 0 is infrastructure, not product, so it was built to completion
before `/speckit-specify` resumes on feature `001`.

- `specs/000-project-setup/` — spec, plan, research, quickstart, and
  tasks for the session-0 infrastructure feature. Constitution Check
  during planning caught a real gap (Principle III's accessibility gate
  was missing from the original CI requirement) and corrected the spec
  before implementation, per Principle I.
- `docs/data-model.md`, `docs/non-functional.md` — repo-level shared
  references so the five upcoming product features (001–005) don't
  redefine the same entities or NFR budgets independently.
- Next.js 16 (App Router) + TypeScript strict + npm scaffold, with
  Tailwind v4 wired to the Fitt.d brand tokens (`Resources/fittd-brand-guide.md`)
  and Manrope/Inter via `next/font`.
- Vitest (unit), Playwright (e2e), and an axe accessibility check are all
  wired into `npm run test` / `test:e2e`, plus a GitHub Actions CI
  workflow (`.github/workflows/ci.yml`) running typecheck, lint, test,
  eval, and accessibility on every push.
- An eval harness skeleton (`evals/run-evals.ts`, `evals/scorers.ts`)
  that exits cleanly with zero fixtures — ready for features 004/005 to
  fill in without touching CI config.
- `docs/adr/` scaffolded (index + template), empty by design — feature
  000 has no product-architecture tradeoffs of its own; the first real
  ADR arrives with feature 002's LLM-provider abstraction.
- **Vercel deploy connected**: the account owner completed the one-time
  manual step (see spec.md Assumptions) linking this repo to the Vercel
  project `fitt.d.prod`, live at https://fittdprod.vercel.app/. An
  earlier dashboard import had briefly created a duplicate
  `jonupchurch/fitt.d.prod` GitHub repo before the project's Git
  connection was corrected to point at `jonupchurch/fitt.d`; pushes to
  `main` now auto-deploy to production directly from this repo.

## 2026-07-05 — Feature 001: Resume & Job Description Input (spec)

- `specs/001-resume-jd-input/spec.md` — first real product feature spec:
  candidate resume input (upload PDF/DOCX/TXT or paste) and job
  description input (paste, with optional title/company), plus the
  one-click "Try a sample" zero-input demo path required by Constitution
  Principle IV. Passed the requirements quality checklist clean with no
  `[NEEDS CLARIFICATION]` markers needed — defaults came from
  `docs/non-functional.md`, `docs/data-model.md`, and the approved
  wireframes.
- Scope boundary called out explicitly: the wireframe renders the live
  keyword-detection preview on the same screen as the JD paste box, but
  per `docs/data-model.md` that preview is `JDAnalysis` output (feature
  002), not this feature's — 001 stays scoped to capturing, validating,
  and normalizing raw input only.

## 2026-07-05 — Feature 001: Resume & Job Description Input (plan & tasks)

- `specs/001-resume-jd-input/plan.md`, `research.md`, `contracts/actions.md`,
  `quickstart.md` — implementation plan for feature 001. Introduces this
  project's first Server Actions, first Zod-validated data, and first
  file-parsing dependencies (`unpdf` for PDF, `mammoth` for DOCX).
  Real Next.js routes (`/analyze/upload`, `/analyze/job`) matching the
  approved wireframe's URLs were chosen over a single client component,
  with in-progress wizard state in `sessionStorage` (no database) —
  see `research.md` for the alternatives considered.
- **Constitution Check correction**: planning surfaced a genuine
  architectural decision (parsing-library choice, input-validation/
  error-model pattern) that Principle I's ADR trigger list covers —
  updating feature 000's plan note, which had assumed no ADR was needed
  before feature 002. `docs/adr/0001-resume-jd-input-validation.md` is
  now a tracked task rather than skipped.
- `specs/001-resume-jd-input/tasks.md` — 21 tasks across Setup,
  Foundational, three user-story phases (P1 resume input, P2 job
  description input, P3 "Try a sample"), and Polish. Suggested MVP
  slice is User Story 1 alone.

## 2026-07-05 — Feature 002: Job Description Analysis (spec & plan)

Per the agreed workflow, all of features 001–005 get specified, planned,
and tasked before any of them are implemented — feature 000 was the
explicit exception. This entry covers 002's spec and plan together, and
going forward CHANGELOG updates + commits happen automatically after
each completed Spec Kit phase rather than waiting to be asked.

- `specs/002-jd-analysis/spec.md` — analyze the `JobDescription` from
  001 into a `JDAnalysis` (required/nice-to-have skills, responsibilities,
  inferred seniority, ATS keywords, notable signals), surfaced as the
  live keyword-detection preview on the `/analyze/job` screen. Three
  user stories: P1 live skill/keyword preview, P2 seniority/
  responsibilities/notable signals, P3 preview stays fresh on edits.
  Checklist passed clean, no `[NEEDS CLARIFICATION]` markers.
- `specs/002-jd-analysis/plan.md`, `research.md`, `contracts/actions.md`,
  `quickstart.md` — the first feature calling the LLM provider, so it
  sets the pattern 003–005 reuse: the Vercel AI SDK via the AI Gateway
  (a `"anthropic/claude-<version>"` model string, not a direct provider
  SDK — current Vercel platform guidance, and a deliberate improvement
  over the reference bundle's draft ADR), Zod validation with one
  bounded repair-retry, and a hybrid response strategy (structured JSON
  blocks-until-validated with a skeleton state; only prose features
  later in the pipeline will actually token-stream). Rate limiting is a
  simple in-memory per-IP counter — an explicit, documented tradeoff at
  this project's traffic scale, not a hidden shortcut.
- Three ADRs owed during implementation: `docs/adr/0002` (provider
  abstraction), `0003` (output validation & retry), `0004` (response
  delivery strategy) — continuing feature 001's `0001`.
- Flagged for implementation: `.env.example`'s `FITTD_MODEL` needs
  updating from a bare model name to a Gateway-qualified string.

## 2026-07-05 — Feature 002: Job Description Analysis (tasks)

- `specs/002-jd-analysis/tasks.md` — 25 tasks across Setup, Foundational
  (the full analysis pipeline: schema, prompt, provider wrapper, rate
  limiter, Server Action), three user-story phases (P1 live skill/
  keyword preview, P2 seniority/responsibilities/notable signals, P3
  preview stays fresh on edits), and Polish (a11y coverage, e2e flow
  test, the three owed ADRs, quickstart validation). Suggested MVP
  slice is User Story 1 alone — the headline "live keyword-detection
  preview" value.
- Tests run against a deterministic fake provider throughout (Principle
  V pattern) — no real model calls or cost in CI for this feature.

## 2026-07-05 — Feature 003: Resume Analysis (spec)

- `specs/003-resume-analysis/spec.md` — analyze the `Resume` from 001
  into a `ResumeAnalysis` (parsed sections, ATS/formatting checks,
  section-by-section feedback, strengths/weaknesses, overall score, and
  generic rewrite suggestions), surfaced on a new `/analyze/report`
  results screen (approved wireframe Screen 03). Three user stories: P1
  score + ATS checks, P2 section feedback + strengths/weaknesses, P3
  generic rewrite suggestions. Explicitly standalone — no dependency on
  a job description existing. Checklist passed clean.
- **Data model correction**: `docs/data-model.md`'s `ResumeAnalysis` was
  missing a rewrite-suggestions field despite Constitution Principle IV
  and the approved wireframe both calling for one. Added
  `rewriteSuggestions[]`, explicitly distinct from `TailoringOutput`'s
  JD-tailored `rewrittenBullets` (feature 004).
- Reuses feature 002's provider/validation/retry/rate-limit
  infrastructure rather than re-deciding it.

## 2026-07-05 — Feature 003: Resume Analysis (plan)

- `specs/003-resume-analysis/plan.md`, `research.md`,
  `contracts/actions.md`, `quickstart.md` — this feature's only new
  architectural call is structural: one LLM call does both resume
  parsing and quality judgment, rather than a separate deterministic
  parser stage (rejected as unjustified complexity for this project's
  scope). Everything else — provider, Zod validation/retry, response
  delivery — is inherited from feature 002 without modification.
- The rate limiter is **shared** across JD analysis and resume
  analysis (one 6/minute budget per IP, not two), matching
  `docs/non-functional.md`'s single stated limit.
- `/analyze/report` becomes the wizard's real second step (Upload →
  Analysis → Job desc. → Match), matching the wireframe's order.
- One ADR owed during implementation: `docs/adr/0005-resume-parsing-approach.md`.

## 2026-07-05 — Feature 003: Resume Analysis (tasks)

- `specs/003-resume-analysis/tasks.md` — 20 tasks. No Setup phase (no
  new dependencies); Foundational (7) builds the full pipeline and page
  shell; three user-story phases (P1 score + ATS checks, P2 section
  feedback + strengths/weaknesses, P3 rewrite suggestions); Polish (5:
  a11y, e2e, the ADR, quickstart, CHANGELOG). Suggested MVP slice is
  User Story 1 alone.

## 2026-07-05 — Feature 004: Gap Analysis & Tailoring Output (spec)

- `specs/004-gap-analysis-tailoring/spec.md` — compares `JDAnalysis`
  (002) and `ResumeAnalysis` (003) into a `GapAnalysis` (fit score,
  matched/missing skills with evidence and priority, ATS keyword
  coverage, rationale), then generates a `TailoringOutput` (rewritten
  bullets, summary, keywords, cover-letter opener) with a one-click
  Apply into a `WorkingResumeCopy`. First feature with a real
  cross-feature dependency (needs both 002 and 003 complete) — resolved
  with a documented waiting state rather than blocking navigation.
  Three user stories: P1 fit score + matched/missing skills, P2 gap
  advice, P3 tailored rewrites + Apply. Checklist passed clean.
- **Scope boundary vs. feature 005**: the approved wireframe's "Match &
  comparison" screen (Screen 05) also shows a side-by-side resume↔JD
  diff view and export buttons — those stay feature 005's scope per
  `docs/data-model.md`'s entity ownership; 004 stops at producing
  `GapAnalysis`/`TailoringOutput` and the Apply mechanic.
- Reuses feature 002's provider/rate-limit/validation infrastructure;
  the rate limit is one shared budget across all analysis endpoints.

## 2026-07-05 — Feature 004: Gap Analysis & Tailoring Output (plan)

- `specs/004-gap-analysis-tailoring/plan.md`, `research.md`,
  `contracts/actions.md`, `quickstart.md`. **Confirmed via the `ai-sdk`
  skill's current guidance** (not assumed): AI SDK v6 removed
  `generateObject`/`streamObject` in favor of `generateText`/
  `streamText` with `output: Output.object({ schema })` — resolves the
  API-verification deferral noted in feature 002's `research.md`.
- **Key decision**: tailoring output uses **schema-validated
  streaming** (`streamText` + `Output.object`), not the reference
  bundle's draft raw-markdown streaming — a deliberate reconciliation
  with Constitution Principle II's unconditional Zod-validation
  requirement. One ADR owed: `docs/adr/0006-tailoring-output-streaming-validation.md`.
  Gap analysis reuses the blocking pattern from 002/003 as-is; no new
  ADR needed for it.
- `WorkingResumeCopy` is pure client-side (`sessionStorage`) state,
  applying the Constitution's Technology Constraints rather than
  deciding anything new — Apply needs no Server Action.
- Adds a waiting/pending state for when a candidate reaches this
  screen before both prerequisite analyses (002, 003) have completed —
  the first feature with a real cross-feature runtime dependency.
