# ADR-0002: Abstract the model provider behind the Vercel AI Gateway

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Jon Upchurch

## Context

Feature 002 is the first feature that calls an LLM. Hard-wiring a
specific vendor SDK throughout the codebase would make the model
impossible to swap, hard to mock in tests, and would couple business
logic to a vendor's response shape — Constitution Principle II
explicitly requires the provider be "abstracted behind a small,
swappable interface."

A separately-authored reference bundle (`Resources/fittd-repo-starter.zip`,
prior art per the Constitution's Governance section) had drafted this
as a hand-rolled `LLMProvider` interface directly over the Anthropic
SDK. Since that draft was written, Vercel's own current guidance is to
default to the AI Gateway rather than a provider-specific package.

## Decision

Model calls go through the **Vercel AI SDK's `generateText`/`streamText`
with a Gateway-routed `"provider/model"` string** (`FITTD_MODEL`,
currently `anthropic/claude-sonnet-5`), not a direct Anthropic SDK
call. `src/lib/llm/provider.ts` wraps this in a thin
`generateStructured()` function — the actual "small, swappable
interface" Principle II asks for — so every analysis feature (002–005)
calls one function and never touches the AI SDK or a vendor SDK
directly.

Authentication defaults to **Vercel OIDC** (zero-config once "AI
Gateway" is enabled in the project's Vercel dashboard settings), with a
static `AI_GATEWAY_API_KEY` as a documented fallback for local
development without the Vercel CLI, or non-Vercel CI.

## Alternatives considered

- **Hand-rolled interface over the Anthropic SDK directly** (the
  reference bundle's draft) — rejected: the Gateway already makes the
  model a config-string change and adds fallback/observability for
  free; a hand-rolled interface would only re-implement what the
  Gateway already provides, for a worse result.
- **Call the AI Gateway ad hoc from each feature's code** — rejected:
  would duplicate the model-string resolution, retry, and error-mapping
  logic in every feature; one `provider.ts` module keeps that in one
  place.
- **A heavyweight adapter framework** — overkill; `provider.ts` only
  needs the one operation (`generateStructured`) every analysis feature
  actually uses.

## Consequences

The provider/model is a `FITTD_MODEL` config change, not a code change.
Business logic (`analyze-jd.ts`, and 003–005's equivalents) is
model-agnostic and fully testable via `fake-provider.ts` (no network,
no cost — see ADR-0003). Small ongoing cost: any new AI SDK capability
(e.g. tool calling) has to be added to `provider.ts` deliberately
rather than reached for ad hoc at a call site.
