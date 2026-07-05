# ADR-0002: Validate LLM output with Zod and a repair-retry loop

- **Status:** Accepted
- **Date:** 2026-01-01
- **Deciders:** <you>

## Context

The pipeline (JD analysis, resume parsing, gap analysis) depends on the model returning structured data the UI can render — skill lists, scores, keyword arrays. Language models occasionally return malformed JSON, extra prose, missing fields, or invented values. Rendering raw model output directly would make the product fragile and untrustworthy.

## Decision

We will define a Zod schema for every structured task and treat the model's output as **untrusted until it parses**. Each call: request structured output → `schema.safeParse` → on failure, run **one** repair retry that feeds the validation error back to the model → on second failure, surface a typed, user-facing error rather than degraded data. Schemas live next to their prompts and are the single source of truth for the response shape.

## Alternatives considered

- **Trust the model's JSON** — simplest, but a single malformed response breaks the UI; unacceptable for a product meant to demonstrate production judgment.
- **Unbounded retries** — improves success rate but risks latency spikes and runaway cost; a hard cap is safer and more honest about failure.
- **Post-hoc string repair (regex/JSON5)** — brittle and hides the real failure; validation + a targeted retry is cleaner and testable.

## Consequences

Every rendered field is schema-valid, and validation logic is unit-testable without calling the model. Adds one bounded retry to worst-case latency and cost (logged per the non-functional budget). Schemas double as the contract our evals assert against (see `evals/`).
