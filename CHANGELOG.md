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

## 2026-07-05 — Feature 004: Gap Analysis & Tailoring Output (tasks)

- `specs/004-gap-analysis-tailoring/tasks.md` — 26 tasks. No Setup
  phase; Foundational (11) builds the gap-analysis + tailoring
  pipeline, the `WorkingResumeCopy` state module, and the page shell
  with its waiting state; three user-story phases (P1 fit score +
  matched/missing, P2 gap advice, P3 tailored rewrites + Apply);
  Polish (5: a11y, e2e, the ADR, quickstart, CHANGELOG). Suggested MVP
  slice is User Story 1 alone.

## 2026-07-05 — Feature 005: Side-by-Side Comparison & Export (spec)

- `specs/005-comparison-export/spec.md` — the final MVP feature per
  `docs/data-model.md`: renders a side-by-side resume↔JD comparison
  (highlighting matches/gaps, reflecting the current `WorkingResumeCopy`
  from feature 004), lets the candidate export a report (PDF or
  shareable link) and download the tailored resume as `.docx`, and
  lets them restart from the job-description step ("Try another job")
  without re-uploading their resume. Purely compositional — no new
  domain entities. Four user stories: P1 side-by-side comparison, P2
  report export, P3 `.docx` download, P4 try-another-job reset.
  Checklist passed clean.
- **Persistence note**: shareable links are expected to avoid new
  server-side storage (e.g. encoding report state directly) to stay
  consistent with the stateless/ephemeral default — any genuine need
  for storage would be an explicit ADR-documented deviation, decided at
  `/speckit-plan`, not assumed here.

## 2026-07-05 — Feature 005: Side-by-Side Comparison & Export (plan)

- `specs/005-comparison-export/plan.md`, `research.md`,
  `contracts/actions.md`, `quickstart.md`. **The only MVP feature with
  no new Server Actions or model calls** — everything it needs already
  exists in client session state from features 001–004.
- **Export approach**: PDF via a print stylesheet (`window.print()`),
  `.docx` via the `docx` package run entirely client-side — both
  rejected heavier alternatives (a PDF-rendering library, a server-side
  generation endpoint) as unjustified complexity. `docs/adr/0007`.
- **Shareable link**: encodes a trimmed summary (score, skill names,
  rationale) directly in the URL — never raw resume/JD text, both for
  size and for privacy (URLs get logged in history/server logs/referrer
  headers). No database row per share. `docs/adr/0008`.
- Constitution Principle II is explicitly N/A for this feature (no
  backend to speak of) — same reasoning feature 000 used for its own
  scaffolding-only scope.

## 2026-07-05 — Feature 005: Side-by-Side Comparison & Export (tasks)

- `specs/005-comparison-export/tasks.md` — 21 tasks. No Foundational
  phase: each of the four user stories (P1 comparison, P2 export, P3
  `.docx` download, P4 try-another-job) maps to its own independent
  utility and control, so — a first for this project — entire stories
  can be built in parallel rather than in priority sequence. Polish (6)
  covers a11y, e2e, the two owed ADRs, quickstart, and CHANGELOG.
- **This closes out full planning for the MVP.** Specs 001–005 all now
  have committed `plan.md` + `tasks.md`. Per the project's agreed
  workflow, `/speckit-implement` becomes available to start.

## 2026-07-05 — Feature 001: Resume & Job Description Input (implemented)

First implemented feature — all 21 tasks complete, all four quality-bar
checks green (`typecheck`, `lint`, `test`, `test:e2e`).

- Home page gained real "Analyze my resume" and "Try a sample" CTAs;
  `/analyze/upload` (drag-and-drop + paste, PDF/DOCX/TXT via `unpdf`/
  `mammoth`) and `/analyze/job` (paste + optional title/company) are
  live, sharing a wizard shell (`src/app/analyze/layout.tsx`) with a
  4-step progress indicator (steps not yet built are shown upcoming,
  not omitted).
- Shared `Result<T>`/`InputErrorCode` validation pattern
  (`src/lib/input/schemas.ts`) now backs both Server Actions
  (`submitResume`, `submitJobDescription`) and the sample-data path
  (`loadSampleFixture`, reading `evals/fixtures/sample-1/`) — all three
  produce identically-shaped output, per FR-008.
- `docs/adr/0001-resume-jd-input-validation.md` written and indexed —
  the parsing-library choices and the `Result<T>` error model, as
  planned.
- **Two real fixes surfaced during implementation, not planning:**
  - The wizard's `sessionStorage` sync originally used
    `useEffect`+`setState` (as planned in `research.md`); the newer
    `react-hooks/set-state-in-effect` lint rule flagged the cascading-
    render pattern, so it was rebuilt on `useSyncExternalStore` instead
    — React's own recommended pattern for browser-storage-backed state,
    and a cleaner fix than suppressing the rule.
  - Several buttons/accents used `bg-brand`/`text-brand` (cyan-500),
    which the brand guide itself flags as failing WCAG AA for text —
    axe caught it immediately. Fixed by using `brand-strong` (cyan-700)
    for anything carrying readable text, reserving cyan-500 for
    accents/fills paired with ink text, per the guide's own rule.
  - Adding `evals/fixtures/sample-1/` (the shared "Try a sample" +
    eval-harness fixture) broke feature 000's eval harness, which
    treated *any* fixture directory as eval-ready and failed with
    "pipeline not implemented yet." Fixed by only counting directories
    that contain an `expected.json` as scorable — `sample-1` has none
    yet (deferred to 004/005), so `npm run eval` still passes cleanly.
- Real-file verification: the PDF path is exercised end-to-end in
  Playwright against a genuinely valid generated PDF (not a mock) to
  confirm the real `unpdf` integration, not just the mocked Vitest
  unit tests.
- `next.config.ts` now explicitly traces `evals/fixtures/sample-1/**`
  into the deployed bundle — a dynamic `fs.readFile` call isn't always
  picked up by Vercel's automatic file tracing.

## 2026-07-05 — Future Work log started

- `docs/future-work.md` — per Constitution Principle IV, ideas surfaced
  mid-build that are out of the current feature's frozen scope get
  logged here rather than implemented ad hoc. First entry: editing/
  replacing the resume or job description mid-flow (found while
  reviewing feature 001) — `/analyze/upload` silently overwrites an
  existing resume with no confirmation, while `/analyze/job` locks into
  a read-only state with no way back once submitted. Deferred until the
  core MVP (000–005) is built, since feature 005's planned "Try another
  job" reset may already cover most of the real need.

## 2026-07-05 — Feature 002: Job Description Analysis (implemented)

All 25 tasks complete, all four quality-bar checks green (`typecheck`,
`lint`, `test` — 32 passing, `test:e2e` — 18 passing), plus `eval` and
`build`. This is the first feature calling an LLM.

- `/analyze/job` gained a live keyword-detection preview: paste a job
  description, pause (~750ms debounce), and required skills, nice-to-
  have skills, ATS keywords, inferred seniority, responsibilities, and
  notable signals appear — via the Vercel AI SDK routed through the AI
  Gateway (`FITTD_MODEL=anthropic/claude-sonnet-5`), Zod-validated with
  one bounded repair retry, behind a shared per-IP rate limiter.
- `docs/adr/0002`–`0004` written and indexed: provider abstraction,
  output validation/retry, and response delivery strategy (skeleton-
  until-validated for structured data; literal streaming deferred to
  feature 004's prose output).
- **No API key needed for this work**: confirmed Vercel AI Gateway
  defaults to OIDC auth (zero-config once enabled in the project's
  Vercel dashboard), not a manual key — `.env.example` corrected
  accordingly (was previously documenting a raw `ANTHROPIC_API_KEY`
  from feature 000, before the Gateway architecture was decided).
- Confirmed the AI SDK's current API directly against installed docs
  (`node_modules/ai/docs/`) rather than trusting memory: `generateText`/
  `streamText` with `output: Output.object({ schema })`, not the
  deprecated `generateObject`/`streamObject`.
- All tests (Vitest and Playwright) run against a deterministic fake
  provider — real analysis code, zero network calls or cost. The
  Playwright dev server sets `FITTD_FAKE_PROVIDER=true`; the fake path
  derives one field from the input text so freshness (US3) and
  graceful-degradation (a magic error-trigger phrase) are both
  meaningfully e2e-testable, not just unit-tested.
- One real lint fix during implementation: the live-preview's debounce
  effect tripped `react-hooks/set-state-in-effect` on its "clear when
  empty" branch; fixed by moving *all* state updates (including that
  one) inside the `setTimeout` callback rather than the synchronous
  effect body.
- `next.config.ts` gained a second `outputFileTracingIncludes` entry
  (`prompts/**` for the `/analyze/job` route) — the same dynamic-
  `fs.readFile` tracing concern as feature 001's sample fixtures.

## 2026-07-05 — Fix: edit/replace resume and job description mid-flow

Resolves the `docs/future-work.md` item logged after feature 001 —
surfaced as a real blocker while testing feature 002 live (the app got
"stuck" showing a previously-saved job description with no way to
change it).

- `/analyze/upload` and `/analyze/job` both now show a "ready" summary
  with an explicit "Replace resume" / "Change job description" button
  once a value is saved, reopening the form (pre-filled for the JD)
  with a "Cancel" option to back out.
- The wizard progress bar's steps are now real clickable links —
  they were rendered but never actually wired to navigate, a leftover
  gap from feature 001 (the wireframe's own "completed steps become
  clickable to jump back" note was never finished).
- 4 new Playwright tests cover editing, canceling, replacing, and
  progress-bar navigation. All 22 e2e tests, 32 Vitest tests,
  typecheck, lint, eval, and build remain green.

## 2026-07-05 — Feature 003: Resume Analysis (implemented)

All 20 tasks complete, full quality bar green (`typecheck`, `lint`,
`test` — 37 passing, `test:e2e` — 31 passing, `eval`, `build`).

- New `/analyze/report` screen — the wizard's real second step (Upload
  → **Analysis** → Job desc. → Match) — shows an overall score ring,
  a pass/fail ATS/formatting checklist, section-by-section feedback
  (accordion rows, a missing section shown as "Not found" rather than
  omitted), strengths/weaknesses, and before/after rewrite suggestions
  with copy-to-clipboard. Fully populated with no job description ever
  provided, and never blocks proceeding to the next step.
- Reuses feature 002's provider/Zod-validation/repair-retry/rate-limit
  infrastructure wholesale (`src/lib/llm/analyze-resume.ts` mirrors
  `analyze-jd.ts` file-for-file) — the one new architectural call is
  using a single LLM call for both resume structural parsing and
  quality judgment rather than a separate deterministic parser stage,
  documented in `docs/adr/0005-resume-parsing-approach.md`. Resume and
  job-description analysis share one rate-limit budget, per
  `docs/non-functional.md`.
- Generalized `src/lib/llm/fake-provider.ts`'s dev/e2e fake (previously
  inlined and JD-only) into a `devFakeAnalysis(taskId, text)` helper
  keyed by task id, so every future analysis feature can reuse it
  without re-inventing the magic-phrase/fixture mechanism.
- Two real accessibility bugs found and fixed by the new a11y tests,
  same class of issue as feature 002's `bg-brand`/`text-brand` fix:
  `text-danger` (#e5484d) and `text-warning` (#f5a524) both fail WCAG
  AA for text on light backgrounds. Added `danger-strong`/
  `warning-strong` tokens and swapped every readable use project-wide
  (not just the new page) — this had been silently broken in features
  001/002 too, just never exercised by an a11y test against an error
  state until now.
- Fixed e2e flakiness: the shared per-IP rate limiter keys on
  `x-forwarded-for`, which is absent for local requests, so every
  parallel Playwright worker was hammering one shared "unknown"
  bucket — `/analyze/report`'s automatic on-load analysis call tipped
  this over the default 6/minute limit under 16-way parallelism.
  Playwright's dev server now sets `FITTD_RATE_LIMIT_PER_MINUTE=1000`
  (the real limiting behavior stays covered by `rate-limit.test.ts`).

## 2026-07-05 — Fix: surface provider errors, improve the loading state

Two follow-ups from testing feature 003 live for real (with a real AI
Gateway credit card on file, after diagnosing that the live "analysis
service unavailable" message was a Gateway billing gate, not a code
bug — `generateStructured()` was catching and discarding the actual
error instead of just returning a typed result).

- `src/lib/llm/provider.ts` now `console.error`s the real cause behind
  any `provider_error` result (auth, billing, model availability,
  network) — previously invisible in Vercel's runtime logs, which
  turned a one-line diagnosis into guesswork. This is what surfaced
  `GatewayInternalServerError: AI Gateway requires a valid credit card
  on file` in under a minute.
- `/analyze/report`'s loading state got a real upgrade: a real LLM
  resume analysis takes up to ~60 seconds, and a static pulsing
  skeleton read as stuck rather than working. It now cycles through
  short status messages ("Parsing sections…", "Checking ATS
  compatibility…", etc.) every ~2.2s alongside a sliding indeterminate
  progress bar (new `animate-indeterminate` keyframe in
  `globals.css`) — a single static screen-reader announcement covers
  the wait without re-announcing on every message change.

## 2026-07-05 — Feature 004: Gap Analysis & Tailoring Output (implemented)

All 26 tasks complete, full quality bar green (`typecheck`, `lint`,
`test` — 47 passing, `test:e2e` — 39 passing, `eval`, `build`).

- New `/analyze/match` screen — the wizard's fourth step — shows a fit
  score ring, matched skills (with evidence), missing skills (with
  priority), ATS keyword coverage, a plain-language rationale, and
  prioritized gap-closing advice, comparing the resume and job
  description analyses from features 002/003. A clear waiting state
  names whichever prerequisite analysis hasn't finished yet, rather
  than erroring or showing a broken partial result.
- Below that, tailored bullet rewrites, a rewritten summary, keywords
  to weave in, and a cover-letter opener stream in for perceived speed,
  each rewrite applicable with one click into a session-scoped working
  copy of the resume (`src/lib/resume/working-copy.ts`) — applied
  suggestions are visibly marked, and the originally analyzed resume is
  never mutated.
- **Retrofitted a real gap**: neither `JDAnalysis` nor `ResumeAnalysis`
  was ever persisted anywhere — each lived only in local page state and
  was discarded on navigation, even though this feature's own contract
  assumed both would already be available client-side. Extended
  `wizard-state.ts`/`wizard-context.tsx` to persist both (mirroring the
  existing `Resume`/`JobDescription` pattern), with replacing a resume
  or job description correctly invalidating its now-stale analysis.
- **A real architecture correction, not just a plan detail**: the
  tailoring call needed schema-validated *streaming*. The plan's own
  contract sketched this as a Server Action returning a raw stream, but
  verifying the actual installed AI SDK (`ai@7.0.15`,
  `node_modules/ai/docs/`) showed that pattern depends on `@ai-sdk/rsc`,
  which the SDK's own docs mark experimental and explicitly steer away
  from for production. The real, current, production-recommended path
  is a Route Handler (`/api/tailor-resume`) paired with the
  `experimental_useObject` hook (new `@ai-sdk/react` dependency,
  version-matched to `ai@7.0.15`) — confirmed by reading the hook's own
  source, which genuinely runs `safeValidateTypes` against the schema
  on the complete streamed object, not just TypeScript-level typing.
  Full reasoning in `docs/adr/0006-tailoring-output-streaming-validation.md`.
  The "restart the whole stream once on validation failure" retry this
  feature requires lives client-side as a result, since a stream can't
  be repaired mid-flight the way a blocking call can.
- Reuses the shared rate limiter and Zod-validation/retry pattern from
  features 002/003 for the blocking half (gap analysis); adds a
  `devFakeGapAnalysis` fake-provider path plus a `GAP_TRIGGER` marker
  (embedded via a JD text phrase, propagated through the stored
  `JDAnalysis`) so both the gap-analysis and tailoring error paths are
  reachable through the real UI in e2e tests, not just unit tests.

## 2026-07-05 — Feature 005: Side-by-Side Comparison & Export (implemented)

All 21 tasks complete, full quality bar green (`typecheck`, `lint`,
`test` — 60 passing, `test:e2e` — 48 passing, `eval`, `build`). **This
closes out the full MVP** — features 001–005 are all implemented,
tested, and live.

- `/analyze/match` gained its final panels: a side-by-side resume ↔ job
  description comparison (matched skills highlighted via a new
  `highlightMatches()` utility, reflecting the *current* working resume
  copy including applied edits — not the original upload), a tabbed
  Resume ⇄ Job description view on narrow viewports, an "Export report"
  button (print stylesheet, real browser "Save as PDF"), a "Get
  shareable link" action, a "Download tailored resume (.docx)" button,
  and "Try another job" (resets the job-description step while
  preserving the resume, its analysis, and applied working-copy edits).
- This is the only MVP feature with **zero new LLM calls or Server
  Actions** — everything renders/exports data features 001–004 already
  produced entirely client-side, per `research.md`.
- New public, read-only `/share` route: the entire report summary
  (fit score, matched/missing skill names, rationale — deliberately
  never raw resume/JD text) is encoded directly into the URL
  (`src/lib/share/report-link.ts`, hand-rolled base64url codec using
  only `TextEncoder`/`TextDecoder` so it decodes identically
  server-side and client-side), with no new database or server-side
  storage. Full reasoning in
  `docs/adr/0008-shareable-link-without-persistence.md`.
- `.docx` generation (`docx` package, new dependency) and PDF export
  both run without a network round-trip — see
  `docs/adr/0007-report-export-approach.md`.
- **A real bug found and fixed**: clicking "Continue" on the job-
  description page was silently wiping the `JDAnalysis` the live
  preview had *just* computed. Feature 004's "a new JobDescription
  invalidates its stale analysis" guard (added when `JDAnalysis` was
  first persisted) compared against a `previous` value that's `null`
  on first save, so it always looked "different" and cleared the
  freshly-computed analysis — this had been silently breaking the
  intended flow (type a JD, see the live preview, click Continue)
  since feature 004 shipped, only surfaced now because this feature's
  e2e tests are the first to click Continue *after* the live preview
  already fired. Fixed by removing that invalidation entirely for
  `JobDescription` (the live-preview effect already keeps `JDAnalysis`
  in sync with the current text on every debounced change, so it's
  never genuinely stale by the time Continue is clicked); `Resume`'s
  analogous guard was left in place since resume analysis can only
  ever be computed *after* the resume itself is saved, so no such race
  exists there.
- Another real accessibility gap found and fixed: the new `/share`
  route had no landmark region (a bare `<div>` instead of `<main>`),
  unlike every other route in the app — axe's `region` rule caught it
  immediately once `/share` was added to the a11y test suite.
