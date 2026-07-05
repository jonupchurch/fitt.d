# Quickstart: Side-by-Side Comparison & Export

Validation guide for this feature once implemented. See
`contracts/actions.md` for the client utility/route contracts and
`spec.md` for the requirements each scenario traces to.

## Prerequisites

- `npm install` — this feature adds one new dependency: `docx`
  (client-side `.docx` generation). No new environment variables
  (no LLM calls in this feature).

## Automated checks

```sh
npm run typecheck
npm run lint
npm run test        # Vitest: highlight utility, share-link encode/decode round-trip, docx buffer validity
npm run test:e2e     # Playwright: comparison view + export/download/share flow
```

All four MUST pass. No fake-provider concerns — this feature makes no
model calls.

## Manual validation scenarios

Run `npm run dev`, complete a full analysis through feature 004:

1. **Side-by-side comparison (FR-001, SC-001)**: at the match screen,
   confirm resume and job description render side by side with matched
   content and JD requirements visually highlighted.
2. **Reflects applied edits (FR-003, SC-004)**: apply a tailored bullet
   (feature 004), then confirm the comparison updates to show the
   edited resume content, not the original.
3. **Mobile tabbed view (FR-002)**: at a narrow viewport, confirm the
   comparison becomes a tabbed Resume ⇄ Job Description view instead of
   two columns.
4. **PDF export (FR-004, SC-002)**: click "Export report" → the print
   dialog opens with a well-formatted, paginated report; saving as PDF
   produces a real file.
5. **Shareable link (FR-004, FR-005)**: generate a share link, open it
   in a fresh/incognito context with no session → the summary report
   renders without an account or the original session.
6. **Malformed share link (Edge Cases)**: manually corrupt a share
   link's payload and open it → a clear message appears, not a raw
   error or blank page.
7. **`.docx` download (FR-006, FR-007, SC-003)**: download the tailored
   resume with at least one applied edit → the file opens as a valid,
   properly formatted Word document reflecting that edit; repeat with
   zero applied edits → still produces a valid file from the original
   analyzed content.
8. **Try another job (FR-008, FR-009, SC-005)**: click "Try another
   job" → lands back at the job-description step; resume and its
   analysis are unchanged; any not-yet-applied tailoring suggestions
   from the prior job are gone, while already-applied working-copy
   edits remain.
9. **Export disabled before analysis (FR-012)**: before a gap analysis
   exists, confirm export/download/share actions are unavailable or
   clearly disabled rather than producing broken output.

## Privacy check

10. Inspect a generated share link's payload and confirm it contains
    only the trimmed summary (score, skill names, rationale) — never
    raw resume or job-description text (FR-010, `research.md`).
