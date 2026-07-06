# Non-Functional Requirements & Budgets

The feature specs say *what* Fitt.d does; this says *how well* it has to
do it. These budgets apply across the whole pipeline (all of
`specs/001`–`005`), not to any single feature, which is why they live
here rather than being repeated — or drifting — across five specs.
Architectural decisions that implement these budgets (e.g. the
retry/streaming strategy) get their own ADRs under `docs/adr/` once
`/speckit-plan` reaches the feature that needs them; this doc records the
target, the ADRs record the how.

## Performance

| Metric | Target |
|---|---|
| Time to first streamed token | < 2s (p50) |
| Full analysis complete | < ~15s (p90) |
| Interaction responsiveness | no blocking main-thread work > 50ms |

## Cost

- Log token count and estimated cost per request — implemented via
  `src/lib/observability/model-call-log.ts`, see
  [ADR-0011](adr/0011-structured-model-call-logging.md).
- Target roughly $0.0X per full analysis; any repair/retry loop (Principle
  II) must be bounded so a bad model response can't multiply cost.
- A measured (not estimated) cost-per-analysis figure for the README
  needs real production traffic to average over, not a single synthetic
  run — tracked in `docs/future-work.md` as a deferred item now that the
  logging to compute it actually exists.

## Limits & abuse

| Guard | Default | Why |
|---|---|---|
| Max resume size | 20,000 chars | bounds cost/latency; rejects a pasted whole-portfolio PDF |
| Max JD size | 12,000 chars | same |
| Rate limit | 6 requests/min per IP | abuse control without accounts (no auth in MVP) |

Over-limit input gets a clear, actionable error — never a silent
truncation.

## Accessibility

- WCAG 2.1 AA contrast, including the cyan-vs-white button rule already
  called out in the brand guide.
- Full keyboard operability; visible focus states (brand cyan focus ring).
- `prefers-reduced-motion` respected for streaming/skeleton animations.
- Enforced with automated axe checks in CI (Constitution Principle III).

## Reliability & observability

- Every model call's output is schema-validated before use; invalid
  output degrades to a typed error, never a broken UI (Constitution
  Principle II).
- Structured logs: request id, phase, latency, tokens, cost, outcome —
  no PII, no raw resume/JD text (Constitution: stateless/ephemeral by
  default). See [ADR-0011](adr/0011-structured-model-call-logging.md).

## Compatibility

- Latest 2 versions of evergreen browsers.
- Responsive down to 360px width.
