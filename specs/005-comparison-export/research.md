# Research: Side-by-Side Comparison & Export

Phase 0 output for `specs/005-comparison-export/plan.md`. No
`[NEEDS CLARIFICATION]` markers remained in the Technical Context.

This is the first — and only — MVP feature with **no new LLM calls
and no new Server Actions**: everything it needs (`Resume`,
`JobDescription`, `ResumeAnalysis`, `JDAnalysis`, `GapAnalysis`,
`WorkingResumeCopy`) already exists in client session state by the time
a candidate reaches it. The work here is rendering and exporting that
data, not producing new data.

## PDF export approach

- **Decision**: a dedicated print stylesheet (`@media print`) on the
  report view, triggered by a "Export report" button calling
  `window.print()` — not a PDF-generation library.
- **Rationale**: every evergreen browser's native "Print → Save as PDF"
  already produces a real, downloadable PDF with zero new dependencies
  and zero new backend surface. A dedicated PDF-rendering library
  (e.g., server-side headless-browser rendering, or a client PDF
  library) would add real complexity — a new dependency, a new render
  path to keep in sync with the on-screen report — for a MVP requirement
  that a well-designed print stylesheet already satisfies honestly.
- **Alternatives considered**: a client-side PDF library (e.g.
  `@react-pdf/renderer`) — rejected, duplicates the report's layout in
  a second rendering system for no stated requirement (pixel-perfect
  server-generated PDF isn't asked for). Server-side headless-browser
  rendering (Playwright/Puppeteer, now viable on Vercel Functions per
  current platform guidance) — rejected as unjustified complexity for
  a single-developer portfolio MVP; revisit only if a real need for a
  non-interactive, automated PDF pipeline emerges.
- **This is a real, documented tradeoff** — `docs/adr/0007-report-export-approach.md`
  MUST be authored during `/speckit-tasks`/implementation (also covers
  the `.docx` library choice below, one ADR for the whole export
  approach rather than two).

## `.docx` generation

- **Decision**: the `docx` npm package (OOXML document construction),
  run **entirely client-side** in the browser to produce a `Blob` for
  direct download — no new Server Action or route handler.
- **Rationale**: `WorkingResumeCopy` already exists as client session
  state; sending it to a new server endpoint solely to generate a file
  the browser already has all the information for would be an
  unjustified round trip, and would mean the resume's *edited* content
  transits a new endpoint for no benefit. `docx` works in both Node and
  browser bundles, so client-side generation is a genuine, supported
  option, not a workaround.
- **Alternatives considered**: a server-side Route Handler that
  accepts `WorkingResumeCopy` and streams back a generated file —
  rejected per the reasoning above; would also be the only new backend
  endpoint in this feature, for no functional benefit over doing it
  in-browser.

## Shareable report link (no new persistence)

- **Decision**: encode a **trimmed summary** of the report (fit score,
  matched/missing skill names, rationale — explicitly NOT raw resume or
  job-description text) as compact JSON, base64url-encoded into the
  URL itself (query param or fragment). A public `/share` route decodes
  and renders it read-only. No database row per share.
- **Rationale**: satisfies FR-005/FR-010 (viewable by anyone, no new
  server-side storage) while also avoiding a privacy problem a
  full-content link would create — URLs get logged in browser history,
  server access logs, and `Referer` headers, so encoding raw resume/JD
  text into one would leak more than a candidate likely intends to
  share. Trimming to score + skill names + rationale keeps the payload
  small (well within practical URL-length limits across browsers/CDNs,
  typically a few thousand characters) without needing a compression
  library.
- **Edge case handling**: if a future change to the summary shape ever
  risks exceeding a safe URL length, the answer is trimming further
  (fewer skills, shorter rationale), not adding server-side storage —
  a document requirement to prevent that becoming a silent persistence
  deviation down the line.
- **Alternatives considered**: a database row keyed by a short share
  ID — rejected; the Constitution's Technology Constraints treat
  persistence as an explicit deviation requiring its own ADR, and no
  requirement here justifies taking on a database for one feature.
  Encoding the *full* report (including raw resume/JD text) — rejected
  on the privacy grounds above.
- **This is a real, documented tradeoff** — `docs/adr/0008-shareable-link-without-persistence.md`
  MUST be authored during `/speckit-tasks`/implementation.

## Side-by-side highlighting

- **Decision**: a small, pure client-side utility that takes the
  working resume's text, the job description's text, and
  `GapAnalysis.matchedSkills`/`missingSkills`, and returns each with
  highlight spans around occurrences of the relevant skill terms — no
  new LLM call, since `GapAnalysis` already identifies what to
  highlight.
- **Rationale**: this is pure derived rendering over data feature 004
  already computed; introducing a model call here would duplicate work
  and cost for no benefit.
- **Alternatives considered**: asking the model to also return
  character offsets/highlight spans as part of `GapAnalysis` — rejected,
  scope creep into feature 004 for a presentational concern feature 005
  can solve with simple string matching.

## "Try another job" reset

- **Decision**: a client-side action clearing `sessionStorage` entries
  for `JobDescription`, `JDAnalysis`, `GapAnalysis`, and any
  not-yet-applied `TailoringOutput` suggestions, then navigating to
  `/analyze/job` — `Resume`, `ResumeAnalysis`, and `WorkingResumeCopy`
  (with its applied edits) are left untouched.
- **Rationale**: directly implements spec.md FR-008/FR-009; no server
  interaction needed since all relevant state is already client-side.

## Constitution Principle II applicability

- This feature is the one place in the MVP where Principle II's
  "proper backend" clause is **N/A by design** — the same reasoning
  feature 000's plan used for its own scaffolding-only scope. Every
  other principle (I, III, IV, V, VI) still fully applies.

## Architecture Decision Records

- `docs/adr/0007-report-export-approach.md` — PDF via print stylesheet,
  `.docx` via the client-side `docx` library.
- `docs/adr/0008-shareable-link-without-persistence.md` — URL-encoded
  trimmed summary, not server-side storage.
