# Quickstart: Resume & Job Description Input

Validation guide for this feature once implemented. See
`contracts/actions.md` for action signatures and `spec.md` for the
requirements each scenario below traces to.

## Prerequisites

- Node.js version pinned in `.nvmrc`, dependencies installed:

  ```sh
  npm install
  ```

  (pulls in the new deps this feature adds: `zod`, `unpdf`, `mammoth`)
- No new environment variables — this feature makes no model-provider
  calls, so `.env.example` is unchanged by it.

## Automated checks

```sh
npm run typecheck
npm run lint
npm run test        # Vitest: input validation/parsing unit tests
npm run test:e2e     # Playwright: wizard-entry flow + accessibility
```

All four MUST pass before this feature is considered done (Constitution
Principle V).

## Manual validation scenarios

Run `npm run dev` and, at `/analyze/upload`:

1. **Upload path (FR-001, FR-004)**: upload a real PDF resume under
   5MB → extracted text appears normalized, "proceed" action enables.
2. **Paste path (FR-001)**: paste resume text directly, no file → same
   result, no file required.
3. **Reject wrong format (FR-003)**: attempt to upload a `.png` →
   specific error naming accepted formats (PDF/DOCX/TXT), no crash.
4. **Reject oversized file (FR-003)**: attempt to upload a file over
   5MB → clear size-limit error before any extraction is attempted.
5. **Unparseable PDF (Edge Cases)**: upload a scanned image-only PDF (no
   text layer) → error suggesting paste instead, not a blank result.
6. **Over-limit paste (FR-005)**: paste resume text over 20,000 chars →
   clear error, no silent truncation.
7. **Disabled proceed state (FR-006)**: with no input yet, confirm the
   proceed action is disabled; becomes enabled only after valid input.

At `/analyze/job`:

8. **JD paste (FR-002)**: paste job description text with title/company
   blank → accepted, both fields confirmed optional.
9. **Over-limit JD (FR-005)**: paste JD text over 12,000 chars → clear
   error.

From the home route:

10. **Try a sample (FR-007, FR-008, SC-002)**: click "Try a sample" with
    zero prior input → sample resume and job description load
    immediately, wizard state is indistinguishable from manually-entered
    input to whatever consumes it next.

## Privacy check

11. Confirm no network request in any of the above scenarios writes
    resume/JD content to a database or third-party store (FR-009) —
    inspect the server action's code path, not just the UI.
