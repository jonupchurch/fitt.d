# Architecture Decision Records

Each ADR captures one decision that had a real tradeoff: the context,
the choice, the alternatives rejected, and the consequences accepted.
They're the "why" behind the code — read alongside the Spec Kit plan for
whichever feature introduced the decision (Constitution Principle I).

Format: lightweight [MADR](https://adr.github.io/madr/). Status is one of
`Proposed`, `Accepted`, `Superseded by ADR-XXXX`.

| # | Decision | Status |
|---|---|---|
| [0001](0001-resume-jd-input-validation.md) | Resume/JD input parsing and validation strategy (feature 001) | Accepted |
| [0002](0002-model-provider-abstraction.md) | Abstract the model provider behind the Vercel AI Gateway (feature 002) | Accepted |
| [0003](0003-llm-output-validation-and-retry.md) | Validate LLM output with Zod and a bounded repair retry (feature 002) | Accepted |
| [0004](0004-response-delivery-strategy.md) | Skeleton-until-validated for structured output; streaming reserved for prose (feature 002) | Accepted |
| [0005](0005-resume-parsing-approach.md) | One LLM call for both resume structure and judgment (feature 003) | Accepted |
| [0006](0006-tailoring-output-streaming-validation.md) | Schema-validated streaming for tailoring output via a Route Handler + `useObject` (feature 004) | Accepted |
| [0007](0007-report-export-approach.md) | Print-stylesheet PDF and client-side `.docx` generation (feature 005) | Accepted |
| [0008](0008-shareable-link-without-persistence.md) | Shareable report link as a URL-encoded trimmed summary, no server-side storage (feature 005) | Accepted |
| [0009](0009-block-navigation-until-resume-analysis-completes.md) | Hard-gate wizard navigation until resume analysis resolves (post-MVP UX fix) | Accepted |
| [0010](0010-persist-gap-analysis-with-write-time-invalidation.md) | Persist gap analysis and tailoring output with write-time invalidation (post-MVP caching fix) | Accepted |
| [0011](0011-structured-model-call-logging.md) | Structured per-call logging for every LLM request (closing a stale observability gap) | Accepted |
| [0012](0012-eval-harness-scoring-and-modes.md) | Eval harness scoring approach: fake-provider default + `--live` mode (closing a stale eval-harness gap) | Accepted |

New decision? Copy `0000-template.md`.
