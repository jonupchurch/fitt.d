# Quickstart: Wizard Status Panel & Reset

Validation guide for this feature once implemented. See `spec.md` for
the requirements each scenario traces to.

## Prerequisites

- No new dependencies, no new environment variables.
- Uses the same `FITTD_FAKE_PROVIDER=true` fake-provider setup
  Playwright's `webServer` config already sets — no live model calls
  needed to exercise any checkpoint, including the fitt.d one.

## Automated checks

```sh
npm run typecheck
npm run lint
npm run test        # Vitest: wizard-state.ts's new invalidation rules + clearWizardState
npm run test:e2e     # Playwright: wizard-status-panel.spec.ts, plus a full existing-suite
                     # run to confirm the layout change doesn't regress any existing
                     # wizard flow
```

All four MUST pass.

## Manual validation scenarios

Run `npm run dev` and walk through a full session:

1. **Empty state (US1, Acceptance 1)**: visit `/analyze/upload` fresh —
   confirm the panel shows all four checkpoints not-done.
2. **Resume Submitted vs. Analyzed are distinct (US1, Acceptance 2–3)**:
   upload a resume — confirm "Resume Submitted" flips done immediately
   (landing on `/analyze/report` per ADR-0009) while "Resume Analyzed"
   stays not-done until the analysis resolves, then flips done.
3. **JD Submitted is independent (US1, Acceptance 4)**: save a job
   description — confirm "JD Submitted" flips done regardless of the
   resume-analysis checkpoints' state.
4. **fitt.d analysis only marks done when actually computed (US1,
   Acceptance 5–6)**: with both prerequisite analyses ready, confirm
   "fitt.d analysis" is still not-done until you actually visit
   `/analyze/match` and a fit result renders — then confirm it stays
   done after navigating to another wizard step and back.
5. **Coexists with the top progress bar (US1, Acceptance 7)**: on every
   wizard step, confirm both the existing step nav and this panel are
   visible simultaneously.
6. **Reset requires confirmation (US2, Acceptance 1, 3)**: trigger
   reset, cancel the confirmation — confirm nothing changed. Trigger it
   again and confirm — proceed to the next scenario.
7. **Reset clears everything (US2, Acceptance 2)**: after confirming
   reset, confirm all four checkpoints are not-done, the wizard lands
   on `/analyze/upload`, and revisiting any other wizard step shows no
   leftover resume/JD/analysis data.
8. **Reset is a working escape hatch from the navigation gate (US2,
   Acceptance 4, FR-011)**: upload a resume containing
   `TRIGGER_SLOW_ANALYSIS` so the ADR-0009 gate is actively blocking
   `/analyze/job`/`/analyze/match` — confirm the reset action still
   works from that blocked state.
9. **Applied tailoring edits are discarded too (Edge Cases)**: apply at
   least one tailored bullet (feature 004) before resetting — confirm
   the working resume copy is gone after reset, not just the top-level
   analyses.
10. **Mobile layout (FR-008)**: at a narrow viewport, confirm the panel
    is still present, legible, and usable (not clipped or hidden)
    alongside the wizard's main content.
