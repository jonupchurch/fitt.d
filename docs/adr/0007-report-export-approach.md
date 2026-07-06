# ADR-0007: Print-stylesheet PDF and client-side .docx generation

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Jon Upchurch

## Context

Feature 005 needs two export artifacts: a PDF (or shareable link) of
the analysis report, and a `.docx` download of the tailored resume.
Unlike every prior analysis feature, this one makes no LLM calls — the
data these exports need (`GapAnalysis`, `WorkingResumeCopy`) already
exists in client session state by the time a candidate reaches this
screen.

## Decision

**PDF**: a dedicated print stylesheet (Tailwind's `print:` variant,
used to hide interactive chrome — the wizard progress bar, Apply/Copy/
tab buttons, export controls themselves) on the existing
`/analyze/match` screen, triggered by an "Export report" button
calling `window.print()`. No PDF-generation library.

**`.docx`**: the `docx` npm package (OOXML document construction), run
**entirely client-side** in the browser (`src/lib/export/build-docx.ts`)
to produce a `Blob` for direct download via an anchor-element click —
no new Server Action or Route Handler.

## Alternatives considered

- **A client-side PDF library** (e.g. `@react-pdf/renderer`) —
  rejected. It would duplicate the report's layout in a second
  rendering system for a requirement ("a downloadable PDF," spec.md
  FR-004) a well-designed print stylesheet already satisfies honestly —
  every evergreen browser's native "Print → Save as PDF" produces a
  real, downloadable file with zero new dependencies.
- **Server-side headless-browser rendering** (Playwright/Puppeteer) for
  pixel-perfect, non-interactive PDF generation — rejected as
  unjustified complexity for a single-developer portfolio MVP with no
  stated requirement for an automated/non-interactive PDF pipeline;
  revisit only if that need materializes.
- **A server-side Route Handler for `.docx` generation**, accepting
  `WorkingResumeCopy` and streaming back a generated file — rejected.
  `WorkingResumeCopy` already exists as client state in full; routing
  it through a new endpoint solely to generate a file the browser
  already has all the information for is an unjustified round trip,
  and would mean the resume's *edited* content transits a new endpoint
  for no benefit. `docx` works in both Node and browser bundles, so
  client-side generation is a genuine, supported option, not a
  workaround.

## Consequences

This feature adds exactly one new dependency (`docx`) and zero new
Server Actions or Route Handlers for its export half (the shareable
link is covered separately in ADR-0008). The printed PDF's fidelity is
bounded by what CSS print styles can express — acceptable here since
the report is already a straightforward vertical stack of cards, not a
complex multi-column layout. If a future requirement calls for
pixel-perfect, automated, or non-interactive PDF generation, that's a
new decision, not a natural extension of this one.
