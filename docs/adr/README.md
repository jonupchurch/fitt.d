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

New decision? Copy `0000-template.md`.
