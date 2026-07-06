# Research: Wizard Status Panel & Reset

No `[NEEDS CLARIFICATION]` markers remained after `/speckit-specify`
(panel placement and the "fitt.d analysis" checkpoint's meaning were
both resolved directly with the user before drafting spec.md). The
decisions below cover the real design questions this feature raises.

## When the persisted `GapAnalysis` goes stale

- **Decision**: Clear the persisted `GapAnalysis` unconditionally
  whenever `setStoredResumeAnalysis` or `setStoredJdAnalysis` is
  called — i.e., any time a *new* resume analysis or JD analysis
  result is written, any previously computed fit is discarded, since
  it was computed against whatever the *old* value was. Additionally,
  `setStoredResume` must clear it immediately (not wait for the next
  `setStoredResumeAnalysis` call) whenever it detects changed resume
  content — otherwise there's a real window, between a resume being
  replaced and its new analysis resolving, where a stale fit result
  would still read "done" even though `resumeAnalysis` has already
  gone back to `null`. Also clear it explicitly in `resetForNewJob()`
  (feature 005's "Try another job") and in `clearWizardState()` (this
  feature's full reset).
- **Rationale**: `analyzeGap` always runs against whatever
  `jdAnalysis`/`resumeAnalysis` are current at the moment `/analyze/match`
  computes it — so the instant either input is replaced, the
  previously stored fit no longer corresponds to the current pair.
  Tracing the actual call patterns: `setStoredResumeAnalysis` only
  fires once per genuine analysis completion (feature 003's effect,
  not on every render), and `setStoredJdAnalysis` only fires when the
  live-preview effect actually recomputes (which requires the JD
  textarea's local `text` state to change — itself only possible after
  clicking "Change job description," not from merely revisiting the
  already-saved "ready" screen). So an unconditional clear on write
  never fires spuriously from simple navigation; it only fires when a
  genuinely new analysis result lands, which is exactly when the old
  fit result should be invalidated.
- **Alternatives considered**: Tagging the stored `GapAnalysis` with a
  fingerprint (e.g., a hash) of the `resumeAnalysis`/`jdAnalysis` pair
  it was computed from, and comparing on read instead of clearing on
  write — more precise in theory (would survive, e.g., a resume being
  re-analyzed to an identical result), but meaningfully more complex
  for a difference that doesn't matter in practice (re-analysis
  producing byte-identical output is not a real scenario worth
  engineering around), and inconsistent with how `Resume`/`ResumeAnalysis`
  invalidation already works elsewhere in `wizard-state.ts` (a simple
  "did the input change" check, not a fingerprint system).

## Reset confirmation mechanism

- **Decision**: Use the browser's native `window.confirm()` for the
  required confirmation step (FR-010), not a custom in-app modal.
- **Rationale**: This app already uses browser-native UI for an
  equivalent "are you sure / here's a system-level action" moment —
  feature 005's PDF export deliberately uses the browser's own print
  dialog rather than a custom implementation, for the same reason:
  it's a system-level confirmation, not a product surface that needs
  the brand's visual identity, and it keeps this feature's scope to
  "wire up a confirm step" rather than "design and build a modal
  component" for a single, infrequent, destructive action.
- **Alternatives considered**: A custom styled confirmation
  dialog/modal — rejected as disproportionate scope for one rarely-used
  destructive action, and Constitution Principle III's "distinctive
  visual identity" bar is about the product's own screens, not
  browser-level system dialogs (the same reasoning that already
  applies to the existing print-dialog-based export).

## Panel layout mechanics

- **Decision**: Widen `/analyze/layout.tsx`'s content constraint from
  `max-w-3xl` to accommodate a two-column flex layout (main content +
  sidebar) at wider viewports, collapsing to a single stacked column
  (sidebar below main content) below the layout's existing responsive
  breakpoint conventions (matching how `/analyze/match`'s comparison
  view already collapses to tabs on narrow viewports, per feature 005).
- **Rationale**: Reuses the responsive pattern already established
  elsewhere in the wizard rather than inventing a new one; a sidebar
  needs more total width than the current single-column
  `max-w-3xl` wizard content was ever budgeted for.
- **Alternatives considered**: A fixed-position/floating panel
  overlaying content — rejected; it would need its own collision/
  scroll handling and doesn't match this app's existing
  document-flow-based layout approach anywhere else.
