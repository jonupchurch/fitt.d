# Research: Job Description Analysis

Phase 0 output for `specs/002-jd-analysis/plan.md`. No `[NEEDS
CLARIFICATION]` markers remained in the Technical Context.

This is the first feature that calls the LLM provider, so several
decisions here are project-wide precedent, not just local to this
feature. `Resources/fittd-repo-starter.zip` contains a separately-drafted
reference bundle (six ADR drafts, versioned prompt files, an eval
harness) that pre-dates this planning session; per the Constitution's
Governance section it's used as **prior art**, not imported verbatim —
each decision below either adopts its reasoning on its own merits or
explicitly deviates and says why.

## Model provider integration

- **Decision**: Vercel AI SDK (`ai` package) via the AI Gateway, using a
  plain `"anthropic/claude-<version>"` model string rather than the
  Anthropic SDK directly.
- **Rationale**: current Vercel platform guidance is to default to the
  AI Gateway for AI SDK usage rather than a provider-specific package —
  it gives the same Claude model call, plus built-in fallback/
  observability, for no extra integration cost. This *exceeds* the
  reference bundle's draft ADR-0005 (which proposed hand-rolling an
  `LLMProvider` interface directly over the Anthropic SDK): the Gateway
  already makes the model a config string, and Zod-schema-validated
  structured generation is a first-class AI SDK feature, so our own
  wrapper only needs to add the app-specific parts (prompt-file loading,
  the repair-retry loop, rate limiting, logging) — not reinvent
  provider abstraction from scratch.
- **Deviation from prior art, explicitly**: the reference bundle assumed
  a raw Anthropic SDK call behind a hand-written interface. This plan
  uses the AI SDK + Gateway instead, per current Vercel guidance. The
  app still gets its own thin `src/lib/llm/analyze-jd.ts`-level call
  site (Constitution Principle II's "small, swappable interface"), it's
  just built on top of the Gateway rather than a vendor SDK.
- **Deferred to implementation**: the exact AI SDK function names/
  parameters (e.g. the structured-generation call) are **not** pinned
  here. Per the AI SDK skill's own guidance, training-data knowledge of
  its API is unreliable; the implementation task installing `ai` MUST
  verify current usage against `node_modules/ai/docs/` before writing
  the call, and MUST fetch the current model ID from the Gateway's
  `/v1/models` endpoint rather than hardcoding one from memory.
- **Action item surfaced**: `.env.example`'s `FITTD_MODEL` value
  (`claude-sonnet-5`, set in feature 000) needs updating to a
  Gateway-qualified string (`anthropic/claude-<current-version>`) during
  implementation, once the current model ID is fetched.

## Output validation & retry

- **Decision**: Zod schema for `JDAnalysis` (per `docs/data-model.md`);
  treat model output as untrusted until `schema.safeParse` succeeds. On
  failure, one repair retry that feeds the validation error back to the
  model; on a second failure, degrade to a typed, user-facing error.
- **Rationale**: adopted directly from the reference bundle's draft
  ADR-0002 reasoning — it matches Constitution Principle II's explicit
  requirement that "retry, partial-result, and malformed-output handling
  are explicit, not implicit," and a single bounded retry keeps
  worst-case latency/cost predictable (also required by Principle II).
- **Alternatives considered**: unbounded retries (rejected — latency/
  cost risk); trusting raw model JSON (rejected — Principle II
  forbids it); post-hoc string repair via regex/JSON5 (rejected —
  brittle, hides the real failure).

## Response delivery: streamed vs. blocking

- **Decision**: `JDAnalysis` is entirely structured data (skill lists,
  seniority, keywords — no free-text prose fields), so it follows the
  "block until schema-validated, render from a skeleton placeholder
  until then" half of a hybrid streaming strategy, not token-by-token
  streaming.
- **Rationale**: adopted from the reference bundle's draft ADR-0004
  reasoning: partially-streamed structured JSON can look valid before
  it's actually validated, which is worse than a brief skeleton state.
  This feature has no prose output (that arrives with tailoring in
  feature 004, where token streaming will actually apply), so today it
  only exercises the "block on validated JSON" half of that pattern —
  this research note establishes the project-wide pattern now so 004
  doesn't have to re-derive it.
- **Reconciling with `docs/non-functional.md`**: the "time to first
  streamed token < 2s (p50)" budget is written pipeline-wide, but for a
  request with no prose output it's read here as "time to first
  rendered result" — i.e., the skeleton-to-populated transition for
  `JDAnalysis`'s fields, not a literal token stream. SC-001 in `spec.md`
  already phrases it this way.
- **Alternatives considered**: streaming raw JSON tokens to the client
  and parsing incrementally — rejected, conflicts with the validate-
  before-render rule above and Principle II.

## Debounce timing

- **Decision**: analysis triggers ~750ms after the candidate stops
  actively editing the pasted job description.
- **Rationale**: standard "stopped typing" debounce window for
  type-ahead-style UX; long enough to avoid firing mid-paste or
  mid-sentence, short enough to still feel immediate. This is a UX
  implementation detail, not a business requirement — the business
  requirement (spec.md FR-002) is just "not on every keystroke."
- **Alternatives considered**: firing on blur/explicit action only —
  rejected, doesn't match Constitution Principle IV's "live" framing or
  the wireframe's "live preview" label.

## Rate limiting

- **Decision**: a simple in-memory, per-IP fixed-window counter inside
  the Node process (Fluid Compute keeps instances warm across nearby
  requests, so this is reasonably effective at this traffic scale),
  enforcing the 6 requests/minute budget from `docs/non-functional.md`.
- **Rationale**: the Constitution's Technology Constraints default to
  stateless/ephemeral persistence; introducing a distributed store
  (e.g. Redis/Upstash) purely for rate limiting would be exactly the
  kind of undocumented persistence deviation Principle I's Technology
  Constraints section warns against, for a single-developer portfolio
  project's traffic scale. This is a known, acceptable limitation (not
  perfectly consistent across cold starts or multiple instances) rather
  than a hidden one.
- **Alternatives considered**: a managed distributed rate limiter —
  rejected as unjustified complexity at this scale; would need its own
  ADR to justify the persistence deviation, which this project-scale
  doesn't warrant.

## Testing without real model calls

- **Decision**: Vitest unit tests and the Playwright e2e test for this
  feature run against a deterministic fake implementation of the
  analysis call (no network, no cost), the same principle Constitution
  Principle V already mandates for the eval harness.
- **Rationale**: keeps CI free, fast, and deterministic; matches the
  reference bundle's own note that a fake provider is what makes
  business logic "testable without calling the model."
- **Alternatives considered**: hitting the real API in CI — rejected,
  costs money and is non-deterministic (real model output vs. a fixed
  fixture assertion).

## Prompt file convention

- **Decision**: `prompts/jd-analysis.v1.md` — one versioned file per
  task, with frontmatter (`id`, `version`, `model`, `temperature`,
  `output_schema`) plus System/Input sections, per Constitution
  Principle II's "versioned files, never inline strings" and the
  reference bundle's own prompts/README convention.
- **Rationale**: directly satisfies Principle II; a behavior change is a
  new version (`v2`), never an in-place edit, so evals can pin a
  version for reproducibility.
- **Note**: the actual prompt *content* is authored during
  implementation, informed by — not copied from — the reference
  bundle's draft, per the Constitution Governance section's rule that
  externally-authored material must be substantively reconciled through
  this project's own process.

## Architecture Decision Records

This feature settles three real, project-wide architectural tradeoffs
(Principle I's ADR trigger list: "LLM output validation strategy,
streaming approach" are named explicitly, and provider choice is the
same class of decision). All three MUST be authored during
`/speckit-tasks`/implementation, continuing the numbering feature 001
started with `0001`:

- `docs/adr/0002-model-provider-abstraction.md`
- `docs/adr/0003-llm-output-validation-and-retry.md`
- `docs/adr/0004-response-delivery-strategy.md`
