# Implementation Plan: Side-by-Side Comparison & Export

**Branch**: `005-comparison-export` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-comparison-export/spec.md`

## Summary

Render a side-by-side resume↔job-description comparison (highlighting
matches/gaps from feature 004's `GapAnalysis`, reflecting the current
`WorkingResumeCopy`), and let the candidate export a report (PDF via
print stylesheet, or a shareable link encoding a trimmed summary with
no new server-side storage), download the tailored resume as `.docx`
(generated client-side), and restart from the job-description step
without re-uploading. This is the final MVP feature and the only one
requiring no new LLM calls or Server Actions — everything it needs
already exists in client session state.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js latest active LTS (unchanged)

**Primary Dependencies**: `docx` (new — client-side `.docx` generation). No new PDF library (browser print), no new compression library (trimmed share payload fits comfortably in a URL)

**Storage**: N/A — no new persistence of any kind; the shareable link encodes its (trimmed) payload directly in the URL, not a database row

**Testing**: Vitest (highlight utility, share-link encode/decode round-trip, `.docx` buffer validity) and Playwright (comparison view + export/download/share flow) — no fake-provider concerns, since this feature makes no model calls

**Target Platform**: Web, deployed to Vercel — unchanged; the `/share` route is a public, unauthenticated page

**Project Type**: Web application — same single Next.js app; adds the `/analyze/match` screen's remaining panels (diff view, export/download/share/reset controls) and one new public route (`/share`)

**Performance Goals**: Exports/downloads/comparison rendering should feel instant (well under 2s) since no model call is involved — this feature's own target, since `docs/non-functional.md`'s budgets are LLM-pipeline-specific and don't apply here

**Constraints**: No new server-side persistence (FR-010); exports MUST work from session state alone with no new model call (FR-011); `.docx` output MUST be a valid, properly formatted document; shareable link payload MUST stay small by carrying only a trimmed summary, never raw resume/JD text (privacy, not just size)

**Scale/Scope**: One new public route (`/share`), three client-side utility modules (highlight, `.docx` builder, share-link encode/decode), remaining panels on the existing `/analyze/match` page, two ADRs — zero new Server Actions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec-Driven Development & Legible Architecture | PASS, with a task obligation | Two real tradeoffs: the export approach (print-stylesheet PDF + client-side `.docx`, over heavier alternatives) and the shareable-link mechanism (URL-encoded trimmed summary, deliberately avoiding new server-side storage). `docs/adr/0007` and `0008` MUST be authored during `/speckit-tasks`/implementation. |
| II. Full-Stack Substance | N/A by design | This feature introduces no new Server Actions or model calls — it renders and exports data already produced by features 001–004. The same reasoning feature 000's plan used for its own scaffolding-only scope applies here: forcing a server round-trip for data the client already holds would be unjustified complexity, not "more full-stack." |
| III. Designed, Accessible Experience | PASS | The comparison view (highlighted matches/gaps, tabbed mobile layout), export controls, and the public `/share` report are all brand-tokened, designed states (including a disabled state pre-analysis and a clear error state for a malformed share link). Existing axe check extended to `/share` and the completed `/analyze/match` screen. |
| IV. Product Judgment & Scope Discipline | PASS | Stays compositional — no new domain entities, no scope creep into re-analysis or new model calls at export time. |
| V. Test Discipline | PASS | Vitest covers the highlight utility, share-link round-trip (including a malformed-payload case), and `.docx` buffer validity; one Playwright e2e covers the full comparison/export/download/share/reset flow. No fake-provider work needed — no model calls exist in this feature. |
| VI. Legible History | PASS | Conventional Commits, CHANGELOG.md entry on push. |

No unjustified violations — Complexity Tracking table below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/005-comparison-export/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── contracts/
│   └── actions.md       # Phase 1 output — client utility + /share route contracts
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not yet created)
```

`data-model.md` is not duplicated — this feature introduces no new
entities (spec.md Key Entities); it composes `Resume`, `JobDescription`,
`ResumeAnalysis`, `JDAnalysis`, `GapAnalysis`, and `WorkingResumeCopy`,
all already defined in `docs/data-model.md`.

### Source Code (repository root)

```text
fitt.d/
├── src/
│   ├── app/
│   │   ├── analyze/
│   │   │   └── match/
│   │   │       └── page.tsx        # extended (feature 004) — adds the side-by-side
│   │   │                            # diff view, export/download/share controls, and
│   │   │                            # "Try another job" reset
│   │   └── share/
│   │       └── page.tsx            # NEW — public, read-only shared-report view
│   └── lib/
│       ├── compare/
│       │   └── highlight.ts        # NEW — pure text-highlighting utility
│       ├── export/
│       │   └── build-docx.ts       # NEW — client-side .docx generation via `docx`
│       └── share/
│           └── report-link.ts       # NEW — encode/decode the trimmed share payload
├── tests/
│   ├── compare/
│   │   └── highlight.test.ts        # NEW
│   ├── export/
│   │   └── build-docx.test.ts        # NEW
│   └── share/
│       └── report-link.test.ts       # NEW — includes a malformed-payload case
├── e2e/
│   └── analyze-match-export.spec.ts   # NEW — Playwright, comparison + export/share/reset flow
└── docs/
    └── adr/
        ├── 0007-report-export-approach.md              # NEW
        └── 0008-shareable-link-without-persistence.md   # NEW
```

**Structure Decision**: No new Server Actions — everything is a client
utility module or a public read-only page, per `research.md`. The
`/share` route is deliberately outside `/analyze/`, since it's reachable
by anyone with the link, not just a candidate mid-wizard. `.docx`
generation runs entirely client-side, avoiding a needless round-trip
for data the browser already holds.

## Complexity Tracking

*No entries — Constitution Check passed with no unjustified
violations. The two ADR obligations above are documentation
commitments stemming from real decisions, not complexity violations
requiring justification.*
