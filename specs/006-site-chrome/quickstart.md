# Quickstart: Site Chrome (Header, Footer, About Page)

Validation guide for this feature once implemented. See `spec.md` for
the requirements each scenario traces to.

## Prerequisites

- No new dependencies, no new environment variables — pure UI
  composition on top of the existing app.

## Automated checks

```sh
npm run typecheck
npm run lint
npm run test        # Vitest: active-section.test.ts
npm run test:e2e     # Playwright: site-chrome.spec.ts, plus the existing
                     # suites (unaffected — header/footer add chrome,
                     # not new blocking behavior)
```

All four MUST pass.

## Manual validation scenarios

Run `npm run dev` and check each of these directly in the browser:

1. **Header everywhere (FR-001, SC-002)**: visit `/`, each of
   `/analyze/upload`, `/analyze/job`, `/analyze/report`,
   `/analyze/match`, `/about`, and a generated `/share?d=...` link —
   confirm the same header (logo + wizard nav + About nav) appears on
   every one.
2. **Logo → home (FR-002)**: from any non-home route, click the logo —
   confirm it navigates to `/`.
3. **Wizard nav is one item, active on all four steps (FR-003, SC-003)**:
   visit each of the four `/analyze/*` routes and confirm exactly one
   "wizard" nav item is present (not four), and it's visually marked
   active on all four.
4. **About nav + page (FR-004, FR-006, SC-004)**: click the About nav
   item from the home page — confirm it lands on `/about`, the nav
   marks About active, and the page contains no file upload, text
   input, or analysis controls.
5. **Wizard's own progress bar unaffected (FR-005)**: on any
   `/analyze/*` step, confirm the existing step-by-step progress bar
   (Upload / Resume analyzed / Job desc. / fitt.d) still renders
   exactly as before, beneath the new sitewide header.
6. **Footer everywhere (FR-007, SC-002)**: confirm a footer with a
   copyright notice appears on every route from step 1's list.
7. **Mobile viewport (FR-008)**: at a narrow width, confirm the header
   and footer remain legible and usable (no overlapping/clipped text,
   nav still reachable).
8. **Accessibility**: `npm run test:e2e` includes axe checks
   (`e2e/accessibility.spec.ts`) extended to `/about` — confirm zero
   violations, including on the header/footer landmarks now present on
   every previously-checked route.
