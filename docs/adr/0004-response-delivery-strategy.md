# ADR-0004: Skeleton-until-validated for structured output; streaming reserved for prose

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Jon Upchurch

## Context

A full analysis can take several seconds. A blank wait for the whole
duration feels broken, but `JDAnalysis` is entirely structured data
(skill lists, seniority, keywords) — Constitution Principle II requires
it be Zod-validated before use (ADR-0003), and a partially-streamed,
not-yet-validated object can look complete before it actually is. This
project's later features (tailoring output, feature 004) will generate
genuine free-text prose (rewritten bullets, a summary, a cover-letter
opener), where token-by-token streaming has real value for perceived
speed. Feature 002 has no prose output at all, so it's the first place
this project has to decide what "responsive" means for structured-only
data specifically.

## Decision

For structured-only output like `JDAnalysis`, the client shows a
**skeleton placeholder while the single Server Action call is in
flight**, then swaps directly to the fully validated, populated result
— there is no partial/incremental reveal of not-yet-validated fields.
The Server Action itself is a plain `async` function returning one
resolved `Result<JDAnalysis>`, not an HTTP-level streaming response;
"streaming" in the literal token-by-token sense is reserved for
features with actual prose output (004's tailoring). `docs/non-functional.md`'s
"time to first streamed token" budget is read here as "time to first
rendered (skeleton-to-populated) result," not a literal token stream —
`specs/002-jd-analysis/spec.md`'s SC-001 states it this way explicitly.

## Alternatives considered

- **Stream the JSON incrementally and render partial fields as they
  arrive** — rejected: partial structured data can look valid before
  it's actually schema-checked, directly conflicting with ADR-0003's
  validate-before-render rule.
- **Block silently with no loading indicator** — rejected: a multi-
  second dead wait with nothing on screen reads as broken, especially
  since the live-preview panel is meant to feel automatic and alive
  (spec.md FR-002/FR-003).
- **Adopt real HTTP streaming now, even with no prose to stream** —
  rejected as premature: there's no content in this feature that
  benefits from token-level delivery; the added complexity (a
  streaming response format, client-side incremental parsing) has no
  payoff until feature 004 actually generates prose.

## Consequences

The live-preview panel's UX is simple: skeleton → populated (or error),
via one `async`/`await` Server Action call — no streaming plumbing to
maintain for this feature. This defers the real complexity (schema-
validated *streaming* structured generation, reconciling perceived
speed with ADR-0003's validation rule for prose output) to feature 004,
where it's actually needed — see that feature's own ADR for tailoring
output's streaming strategy once implemented.
