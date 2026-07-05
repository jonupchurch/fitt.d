# ADR-0005: One LLM call for both resume structure and judgment

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Jon Upchurch

## Context

Feature 003 needs to turn a candidate's raw resume text into a
`ResumeAnalysis`: parsed sections (contact, summary, experience,
skills, education) *and* ATS/formatting checks, section feedback,
strengths/weaknesses, an overall score, and rewrite suggestions.

Unlike a job description, resumes arrive in wildly inconsistent
formats — no common layout the way a JD is roughly free-form prose
with predictable sections. A natural alternative is a two-stage
pipeline: a deterministic resume-parsing step (regex/heuristic
section-splitting, possibly a dedicated parsing library) that produces
`sections`, followed by a separate LLM call that judges quality against
those already-parsed sections.

## Decision

A **single LLM call** produces the entire `ResumeAnalysis` — structural
parsing and quality judgment together — via the same
`generateStructured()` provider wrapper, Zod-validated output, and
one-bounded-retry repair established in feature 002
(`src/lib/llm/provider.ts`, ADR-0002/0003). `src/lib/llm/analyze-resume.ts`
mirrors `analyze-jd.ts` file-for-file; the only new pieces are the
prompt (`prompts/resume-analysis.v1.md`) and schema
(`ResumeAnalysisSchema`).

## Alternatives considered

- **Two-stage pipeline (deterministic section-splitter, then LLM
  judgment per section)** — rejected. A dedicated parser would need
  significant tuning per resume format and would still fail on
  unusually-structured resumes; the LLM is already capable of
  extracting structure and judging quality in one structured-output
  call, the same shape of decision feature 002 already made for JD
  analysis. Two sequential model-touching stages would also risk
  exceeding `docs/non-functional.md`'s ~15s latency budget for no
  demonstrated reliability gain at this project's scale.
- **A dedicated resume-parsing npm package** — rejected for the same
  reason: real resumes are too inconsistently formatted for a general
  library to reliably section, and it would add a dependency this
  project doesn't otherwise need.

## Consequences

Resume analysis is exactly as swappable/testable as JD analysis — same
provider, same fake-provider testing path (generalized in this feature
to be keyed by task id), same rate limiter, same graceful-degradation
behavior on invalid or failed output. The tradeoff is that structural
parsing and quality judgment aren't independently correctable: if the
model mis-parses a section, that error can propagate into its
downstream judgment in the same call, with no deterministic
parsing stage to catch it first. Accepted as reasonable at this
project's scope; would be revisited if resume section-parsing accuracy
becomes a measured problem in eval fixtures.
