# Research: Resume & Job Description Input

Phase 0 output for `specs/001-resume-jd-input/plan.md`. No `[NEEDS
CLARIFICATION]` markers remained in the Technical Context, so this
records the concrete choices made and why, rather than resolving
open unknowns.

## PDF text extraction

- **Decision**: `unpdf`.
- **Rationale**: it's a thin, actively-maintained wrapper around
  `pdf.js` purpose-built for serverless/edge Node environments (no
  native bindings, no filesystem assumptions), which matches deploying
  on Vercel Functions (Fluid Compute, Node runtime). It returns plain
  text directly, which is all `Resume.rawText` needs.
- **Alternatives considered**:
  - `pdf-parse` — the long-time default choice, but its last major
    version has had maintenance gaps and known issues loading its
    bundled test fixtures at import time in some serverless bundlers;
    rejected to avoid inheriting that fragility.
  - `pdfjs-dist` directly — more control (per-page text, layout), but
    that granularity isn't needed here; extra integration code for no
    functional requirement.

## DOCX text extraction

- **Decision**: `mammoth`.
- **Rationale**: the standard, actively-maintained library for pulling
  raw text out of `.docx`; `mammoth.extractRawText({ buffer })` is a
  one-call fit for `Resume.rawText`, and it's Node-only (fine — this
  feature already requires the Node runtime for PDF parsing).
- **Alternatives considered**: hand-rolling `.docx` XML parsing
  (`.docx` is a zip of XML) — rejected, reinvents a solved problem for
  no benefit.

## Input/output validation

- **Decision**: Zod schemas for `Resume` and `JobDescription` (per
  `docs/data-model.md`), plus a shared `Result<T> = { ok: true; data:
  T } | { ok: false; error: { code; message } }` return shape from
  every server action.
- **Rationale**: Constitution Principle II already mandates Zod for
  (later) LLM output validation; introducing it here for input
  validation establishes one consistent validation pattern across the
  codebase instead of a bespoke one for this feature. A typed `Result`
  (rather than throwing) is what lets FR-003/FR-012's "clear,
  actionable error, never a crash" be enforced at the type level.
- **Alternatives considered**: manual `if`-chain validation — rejected,
  doesn't scale to feature 002+'s schema-validation needs and would be
  a second validation idiom to maintain.

## Where extraction/validation runs

- **Decision**: Next.js Server Actions (`"use server"`), not client-side
  parsing.
- **Rationale**: `unpdf`/`mammoth` are Node-only and non-trivial in
  bundle size — running them in a Server Action keeps them off the
  client bundle entirely and satisfies Constitution Principle II's
  "proper backend / real validation layer" requirement instead of this
  being a client-only form feature. It also means the same validation
  path is exercised whether the resume arrives via upload or paste
  (paste still calls a server action, just skips the file-extraction
  step), so there's one code path per entity, not two.
- **Alternatives considered**: client-side extraction (e.g.
  `pdfjs-dist` in-browser) — rejected: larger client bundle, and would
  bypass the server-side validation layer Principle II expects.

## Wizard state across steps

- **Decision**: real Next.js routes matching the approved wireframe
  (`/analyze/upload`, `/analyze/job`, …), with in-progress wizard state
  (accepted `Resume`/`JobDescription`, current step) held in
  `sessionStorage` via a small client context provided by
  `src/app/analyze/layout.tsx` — not a database, not a single all-in-one
  client component.
- **Rationale**: the wireframe explicitly shows distinct URLs per step
  with a persistent, click-back-capable progress bar (Sitemap section,
  Screen 02 annotation 1), and Constitution Principle IV says the slice
  is "the full flow captured in the approved wireframes" — real routes
  honor that fidelity. `sessionStorage` (not a server session/DB) keeps
  the "analyzed in-session, never stored" privacy claim (FR-009) true
  without inventing a persistence layer the Technology Constraints
  section doesn't call for.
- **Alternatives considered**: single client component with internal
  step state — simpler, but discards the wireframe's real routing/
  back-navigation behavior for no stated benefit; rejected per Principle
  IV's fidelity-to-wireframe framing.

## Sample fixture shape

- **Decision**: this feature authors the `resume` and `jobDescription`
  fields of the bundled `SampleFixture` (docs/data-model.md); the
  `expected` field (ground-truth used by the eval harness, Constitution
  Principle V) is left as an explicit `null`/TODO until a feature with
  real scoring output (004/005) defines what "expected" needs to
  contain.
- **Rationale**: `expected`'s shape depends on `GapAnalysis`/
  `TailoringOutput`, which don't exist yet; authoring it now would be a
  guess this feature has no way to validate. One fixture file, filled
  in incrementally, is simpler than two fixture files that must later
  be reconciled.
- **Alternatives considered**: deferring the whole fixture to a later
  feature — rejected, since "Try a sample" (FR-007/FR-008) is this
  feature's own requirement and needs real sample content to work at
  all.

## Architecture Decision Record

- This feature introduces a genuine architectural tradeoff (file-parsing
  library choices, and the validation/error-model pattern other
  features will follow) per Constitution Principle I's ADR trigger list
  ("error handling" is named explicitly). Unlike feature 000 — which
  had none — this feature's tasks phase MUST include authoring
  `docs/adr/0001-resume-jd-input-validation.md` alongside the code, not
  defer it.
