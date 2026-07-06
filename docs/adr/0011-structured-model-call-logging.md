# ADR-0011: Structured per-call logging for every LLM request

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Jon Upchurch

## Context

`docs/non-functional.md`'s "Reliability & observability" budget has
said since session 0 that every model call gets a structured log line
— request id, phase, latency, tokens, cost, outcome, no PII. That was
never actually built: `provider.ts` only ever called `console.error` on
the two failure paths, with no logging at all on success, no request
id, no token/cost/latency capture anywhere. This surfaced during a
repo-wide stale-artifact review — a target written down at session 0
and never revisited once the real pipeline existed. Both the eval
harness (ADR-0012) and this logging gap share the same root cause and
were fixed in the same pass.

## Decision

Add `src/lib/observability/model-call-log.ts`, exporting a single
`logModelCall(entry)` that prints one JSON line to stdout (Vercel
captures stdout as runtime logs — no dedicated log-drain integration
needed for a stateless portfolio project) and `estimateCostUsd(model,
inputTokens, outputTokens)`, a pure function against a small
per-model `$/M tokens` table (seeded with the Haiku 4.5 / Sonnet 5
prices already confirmed live against the Gateway API during the
2026-07-06 model swap).

`generateStructured` (`provider.ts`) now takes a required `phase`
parameter and logs at every exit point — first-try success, repaired
success, `invalid_output`, and `provider_error` — with a `crypto.randomUUID()`
request id and `Date.now()`-measured latency. `tailorResumeResponse`
(`tailor-resume.ts`) logs on `streamText`'s `onEnd` callback, since
that path has no synchronous catch point the way `generateStructured`'s
blocking call does (per ADR-0006) — only its success outcome is
captured; a mid-stream provider failure surfaces to the client through
the stream itself, not through this logger.

Only metadata is logged — never the prompt or the model's response
text — consistent with the stateless/ephemeral design (Constitution
Principle II, Technology Constraints).

## Alternatives considered

- **A dedicated logging library / third-party APM** — rejected as
  disproportionate for a stateless, single-environment portfolio app;
  `console.log`-as-structured-JSON is exactly what Vercel's own runtime
  logging already expects, with zero new infrastructure.
- **Log per pipeline run instead of per model call** — would lose the
  ability to see e.g. a slow `gap-analysis` call independent of a fast
  `jd-analysis` call in the same request; per-call is the granularity
  the constitution's budget actually asks for.
- **Compute cost from the Gateway's own usage dashboard instead of
  estimating locally** — the Gateway has no metrics API (only a
  dashboard and per-request logs), so a local estimate is the only way
  to get a cost figure attached to the same structured line as
  latency/outcome; accepted the small risk of the hardcoded price table
  drifting if Gateway pricing changes (a model absent from the table
  simply logs `estimatedCostUsd: undefined` rather than a wrong figure).

## Consequences

Every real model call (JD analysis, resume analysis, gap analysis,
tailoring) now produces one structured log line, closing a gap between
`docs/non-functional.md`'s stated budget and actual behavior. The
per-model pricing table is a second place (alongside CHANGELOG.md's
model-swap entry) that will need a one-line update if pricing changes
or a new model is adopted. Streaming's failure path remains unlogged
server-side — a known, accepted gap, not a silent one.
