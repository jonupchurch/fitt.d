# Fitt.d

**Paste a resume and a job description. See exactly how well you fit — and get the rewrites to close the gap.**

🔗 **Live demo:** _<add Vercel URL>_ · 🧭 **[How this was built](#how-this-was-built)** · 📐 **[Spec & architecture](#architecture)**

> Built as a portfolio project to demonstrate spec-driven architecture (Spec Kit), full-stack Next.js/TypeScript, and product judgment. The repo is meant to be *read*, not just run — start with the spec, follow the decisions, then the code.

---

## The problem

Applicants guess at whether they're a fit and rewrite their resume blind. Fitt.d turns that into a measured, guided loop: analyze the JD, analyze the resume, quantify the gap, and generate tailored, copy-ready bullet rewrites — in one flow, no signup.

## How it works

1. **Bring inputs** — paste/upload a resume, paste a job description.
2. **JD analysis** — required vs. nice-to-have skills, responsibilities, inferred seniority, ATS keywords.
3. **Resume analysis** — parsed into structured sections.
4. **Fit score + gap** — a match score, matched skills, missing/weak skills, keyword coverage.
5. **Tailor** — rewritten bullets, summary, and a cover-letter starter, all copyable.

_Try it instantly with the **Sample resume + JD** button — no paste required._

![Screenshot placeholder](docs/media/screenshot-flow.png)

## <a id="how-this-was-built"></a>How this was built

This project was specified before it was coded, using [Spec Kit](https://github.com/github/spec-kit):

| Artifact | What it shows |
|---|---|
| `.specify/` constitution · spec · plan · tasks | the product and the plan, committed, not hidden |
| [`docs/adr/`](docs/adr) | the decisions with real tradeoffs, and why |
| [`prompts/`](prompts) | versioned prompt IP for the AI pipeline |
| [`evals/`](evals) | how AI output quality is measured, in CI |
| [`docs/privacy.md`](docs/privacy.md) | how resume PII is handled (in-memory, never stored) |

## <a id="architecture"></a>Architecture at a glance

- **Next.js (App Router) + TypeScript (strict)**, Tailwind, restyled component base.
- **Server-side LLM calls** behind a swappable `LLMProvider` interface ([ADR-0005](docs/adr/0005-model-provider-abstraction.md)).
- **Structured output validated with Zod**, with a repair-retry loop ([ADR-0002](docs/adr/0002-llm-output-validation-and-retries.md)).
- **Streaming** for human-readable sections; validated JSON for scores ([ADR-0004](docs/adr/0004-response-streaming-strategy.md)).
- **Ephemeral by design** — inputs processed in memory, not persisted ([ADR-0003](docs/adr/0003-ephemeral-processing-no-persistence.md)).

## Tech stack

Next.js · TypeScript · Tailwind · Zod · Anthropic API (swappable) · Vitest · Playwright · GitHub Actions · Vercel.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
pnpm dev
```

## Testing & quality

```bash
pnpm typecheck && pnpm lint && pnpm test   # unit
pnpm test:e2e                              # Playwright happy path
pnpm eval                                  # score AI output against fixtures
```

CI runs typecheck, lint, unit tests, and evals on every PR, with a Vercel preview deploy.

## Cost & performance

Each analysis logs token count, latency, and cost. Target: **first token < 2s**, full analysis **< ~15s**, **~$0.0X per run**. See [`docs/non-functional.md`](docs/non-functional.md).

## Privacy

Resumes are personal data. Fitt.d processes them **in memory per request and never stores them** — no accounts, no database of resumes, no training use. See [`docs/privacy.md`](docs/privacy.md).

## Roadmap (post-MVP)

Saved history & multiple resume versions · `.docx` upload · JD-by-URL · PDF/Word export · side-by-side diff.

## License

MIT — see [LICENSE](LICENSE).
