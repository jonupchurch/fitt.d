# Research: Gap Analysis & Tailoring Output

Phase 0 output for `specs/004-gap-analysis-tailoring/plan.md`. No
`[NEEDS CLARIFICATION]` markers remained in the Technical Context.

This feature reuses feature 002's provider/rate-limit/validation
infrastructure, but is the first to need **two** distinct call shapes
from it: a blocking structured call (gap analysis, same shape as
002/003) and a **streamed, schema-validated** structured call
(tailoring output) — the first real exercise of the streaming half of
the hybrid delivery strategy from feature 002's `research.md`.

## Confirmed AI SDK v6 API shape (verified, not assumed)

- Feature 002's `research.md` deliberately deferred the exact AI SDK
  function names, since training-data knowledge of a fast-moving SDK is
  unreliable. This plan checked the current `ai-sdk` skill's bundled
  guidance directly: **`generateObject`/`streamObject` are removed in AI
  SDK v6.** The current pattern is `generateText`/`streamText` with an
  `output: Output.object({ schema })` option — `result.output` (or its
  streaming equivalent) is the schema-typed value.
- **Decision**: `src/lib/llm/provider.ts` (built in feature 002) gets a
  second exported function alongside its existing structured-generation
  wrapper: a streamed variant using `streamText` + `Output.object`. Both
  wrap the same repair-retry and rate-limit concerns; only the
  AI-SDK-level call and delivery differ.
- **Note for whoever implements this**: re-verify against
  `node_modules/ai/docs/` at implementation time regardless — AI SDK
  minor versions move fast, and this research predates actual
  installation in this repo.

## Gap analysis: reused pattern, new inputs

- **Decision**: `analyzeGap(jdAnalysis, resumeAnalysis)` is a blocking,
  schema-validated call — identical shape to `analyze-jd.ts`/
  `analyze-resume.ts` (one repair retry, then degrade), except its
  inputs are two already-structured objects instead of raw text.
- **Rationale**: no new architectural pattern here — this is the same
  "block until validated, skeleton until then" rule from feature 002's
  `research.md`, just with structured inputs. Informed by (not copied
  from) the reference bundle's draft `gap-analysis.v1.md` prompt:
  evidence-based matching, no inflated scores, required skills weighted
  over nice-to-haves.
- **No new ADR needed** for this half — it's a straightforward
  extension of an already-decided pattern, the same judgment made for
  feature 003's `analyzeResume`.

## Tailoring output: schema-validated streaming (the real decision)

- **Decision**: `tailorResume(gapAnalysis, resumeAnalysis, jdAnalysis)`
  uses `streamText` with `output: Output.object({ schema: TailoringOutput })`
  — content streams to the client for perceived speed, but the
  complete object is still schema-validated before being treated as
  final.
- **Rationale — reconciling prior art with our own principle**: the
  reference bundle's draft `bullet-tailoring.v1.md` prompt specifies
  raw `streamed_markdown` output with no schema, parsed by convention
  (section headers, "Before/After" labels). That works for UX but
  conflicts with Constitution Principle II, which is unconditional:
  "All LLM output MUST be validated against Zod schemas before use —
  raw model JSON is never trusted." This plan uses schema-validated
  structured streaming instead, keeping the "feels alive" benefit
  without carving out an exception to Principle II. This is a
  deliberate deviation from the reference draft, substantively
  reconciled through this project's own process (per the Constitution's
  Governance section), not a silent copy.
- **Retry behavior differs from blocking calls**: a stream can't be
  "repaired" mid-flight the way a single blocking response can. If the
  complete streamed object fails schema validation, the retry is
  "restart the whole streamed call once" (showing a brief
  "regenerating" state), not a partial patch — then degrade to a clear
  error on a second failure, same bounded-retry ceiling as every other
  analysis call.
- **Alternatives considered**: raw markdown streaming parsed
  client-side by convention (the reference draft's approach) — rejected
  per Principle II, above. A second, separate blocking call purely for
  validation after a display-only markdown stream — rejected as needless
  duplicate model cost for output that schema-validated streaming
  already delivers in one call.
- **This is a real, novel architectural tradeoff** — `docs/adr/0006-tailoring-output-streaming-validation.md`
  MUST be authored during `/speckit-tasks`/implementation.

## Apply → WorkingResumeCopy

- **Decision**: `WorkingResumeCopy` is pure client-side state
  (`sessionStorage`-backed, mirroring the wizard-state pattern feature
  001 already established), created from `Resume` + `ResumeAnalysis`
  once tailoring output exists. Applying a bullet is a client-side
  mutation only — no new Server Action, since the rewritten text is
  already present on the client from the `tailorResume` response.
- **Rationale**: Constitution Technology Constraints already ratifies
  this exact pattern ("the in-wizard working resume copy... is
  session/client-scoped state, not durable storage") — this is applying
  an existing decision, not making a new one, so no ADR is needed here.
- **Alternatives considered**: a Server Action for Apply that
  re-persists something server-side — rejected, contradicts the
  ratified stateless/ephemeral default for no benefit.

## Waiting state for the cross-feature dependency

- **Decision**: before calling `analyzeGap`, the `/analyze/match` page
  checks (client-side, from `sessionStorage`) that both `JDAnalysis` and
  `ResumeAnalysis` already exist for the session. If either is missing,
  it renders a clear "still analyzing your resume/job description"
  state naming which one, instead of calling the gap-analysis action at
  all.
- **Rationale**: this is the first feature that structurally depends on
  two prior features' output existing — spec.md FR-011 requires this
  not to be an error state, just an honest waiting one.
- **Alternatives considered**: attempting the call anyway and letting it
  fail server-side — rejected, produces a confusing generic error
  instead of an accurate "what's still pending" message.

## Shared rate limiter (extended, not re-decided)

- **Decision**: `analyzeGap` and `tailorResume` check the same per-IP
  counter in `src/lib/llm/rate-limit.ts` that `analyzeJobDescription`
  and `analyzeResume` already use — one 6-requests/minute budget across
  all four analysis endpoints, per `docs/non-functional.md`'s single
  stated limit (confirmed already in feature 003's research).
- **Rationale**: consistency; no new infrastructure.

## Fake provider generalization (extended, not re-decided)

- **Decision**: feature 003 already generalized `fake-provider.ts` to be
  keyed by task id. This feature adds `gap-analysis` and
  `bullet-tailoring` fixture entries, plus a fake **streaming**
  response path (a fixture that yields chunks before resolving) so
  `tailorResume`'s tests don't require a real network stream.
- **Rationale**: same no-network/deterministic testing principle
  established in feature 002, extended to cover streaming.

## Architecture Decision Records

- `docs/adr/0006-tailoring-output-streaming-validation.md` — the only
  new ADR this feature owes. Gap analysis, the Apply mechanic, and the
  shared rate limiter are all reuses of already-ratified decisions
  (Constitution Technology Constraints, or ADRs `0002`–`0004`), not new
  ones.
