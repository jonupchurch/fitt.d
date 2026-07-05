# ADR-0001: Resume/JD input parsing and validation strategy

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Jon Upchurch

## Context

Feature 001 is the first feature with real product surface area: it has
to accept a resume as an uploaded PDF, DOCX, or TXT file (or pasted
text) and a pasted job description, validate all of it, and hand
normalized data to the rest of the pipeline. This requires picking
file-parsing libraries for untrusted user uploads, and establishing the
input-validation/error-handling pattern the rest of the app's Server
Actions will follow — Constitution Principle I calls out "error
handling" explicitly as a decision needing an ADR, and Principle II
requires a "real validation layer," not ad hoc checks.

## Decision

- **PDF text extraction:** `unpdf`, not `pdf-parse` or raw
  `pdfjs-dist`. `unpdf` is a thin, actively-maintained wrapper around
  PDF.js purpose-built for serverless/Node environments, returning
  plain text directly via `extractText(pdf, { mergePages: true })`.
- **DOCX text extraction:** `mammoth`, via
  `mammoth.extractRawText({ buffer })`. It's the standard, maintained
  library for pulling raw text out of `.docx` and needs no lower-level
  XML handling.
- **Where parsing runs:** entirely server-side, inside Next.js Server
  Actions (`submitResume`, `submitJobDescription`). Both libraries are
  Node-only and non-trivial in size — running them server-side keeps
  them off the client bundle and gives the app one real validation
  layer instead of a client-only form.
- **Validation/error model:** every input-producing Server Action
  returns a shared `Result<T> = { ok: true; data: T } | { ok: false;
  error: { code, message } }` shape (`src/lib/input/schemas.ts`), backed
  by Zod schemas for `Resume` and `JobDescription`. Nothing throws
  across the Server Action boundary for an expected validation failure
  (wrong file type, oversized file, unparseable file, over-limit text) —
  each becomes a typed `InputErrorCode`, never a generic exception the
  UI has to guess at.

## Alternatives considered

- **`pdf-parse`** — the long-time default choice, but its last major
  version has had maintenance gaps and known issues bundling its own
  test fixtures at import time in some serverless bundlers; rejected to
  avoid inheriting that fragility.
- **`pdfjs-dist` directly** — more control (per-page text, layout
  details) than this feature needs; extra integration code for no
  functional requirement here.
- **Client-side parsing** (e.g. `pdfjs-dist` in-browser) — rejected: a
  larger client bundle, and it would bypass the server-side validation
  layer Constitution Principle II expects for a "real full-stack
  application."
- **Manual `if`-chain validation instead of Zod** — rejected; Zod is
  already required by Principle II for validating LLM output starting
  feature 002, so using it here too establishes one validation idiom
  project-wide instead of a bespoke one just for this feature.
- **Throwing exceptions on validation failure** — rejected in favor of
  the typed `Result<T>` return; a thrown error crossing a Server Action
  boundary is harder to handle predictably in the client UI than a
  discriminated-union return value.

## Consequences

Every subsequent feature that adds a Server Action (002–005) reuses
this same `Result<T>`/error-code pattern rather than inventing its own,
and the same "validate before use, never trust raw input" discipline
extends naturally to validating LLM output starting feature 002. The
cost: `unpdf`/`mammoth` are two more runtime dependencies, and any
future need for page-level PDF structure (not just raw text) would
require revisiting the `unpdf` choice.
