# ADR-0003: Validate LLM output with Zod and a bounded repair retry

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Jon Upchurch

## Context

The analysis pipeline (JD analysis now; resume/gap/tailoring in
003–005) depends on the model returning structured data the UI can
render directly — skill lists, scores, keyword arrays. Language models
occasionally return malformed JSON, extra prose, missing fields, or
invented values. Rendering raw model output directly would make the
product fragile and untrustworthy — Constitution Principle II states
plainly that "raw model JSON is never trusted."

## Decision

Every structured call goes through `generateStructured()`
(`src/lib/llm/provider.ts`), which validates output against a Zod
schema (the AI SDK's `Output.object({ schema })`, itself schema-checked)
and, on failure, runs **one** repair retry that feeds the invalid text
back to the model with an explicit correction instruction. On a second
failure, it returns a typed `{ ok: false, reason: "invalid_output" }`
rather than throwing — the Server Action layer turns that into a
user-facing, non-blocking error message (`invalid_model_output`).
Non-schema failures (network/provider errors) are not retried — they
degrade immediately to `provider_error`.

## Alternatives considered

- **Trust the model's JSON** — simplest, but a single malformed
  response would break the UI; unacceptable per Principle II.
- **Unbounded retries** — improves success rate but risks latency
  spikes and runaway cost; a hard cap of one retry is safer and more
  honest about failure, and keeps the pipeline's latency budget
  (`docs/non-functional.md`) predictable.
- **Post-hoc string repair (regex/JSON5 patching)** — brittle and hides
  the real failure; validation plus a targeted retry is cleaner and
  independently testable (`tests/llm/provider.test.ts` exercises the
  retry path directly against a mocked AI SDK, no network required).
- **Retrying non-schema (network) errors too** — rejected for this
  version: a network/provider outage retried with the *same* prompt is
  unlikely to succeed within budget and would double the cost of every
  outage; failing fast surfaces the outage instead of masking it.

## Consequences

Every field the UI renders is schema-valid by the time it's displayed.
The retry/validation logic is unit-testable without calling a real
model (`fake-provider.ts` for feature-level tests, a mocked `ai` module
for `provider.ts`'s own retry behavior). Cost: one bounded retry adds
to worst-case latency and token cost for the failure case only — logged
per the non-functional budget, not incurred on the common success path.
