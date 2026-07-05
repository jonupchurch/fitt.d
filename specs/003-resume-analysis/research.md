# Research: Resume Analysis

Phase 0 output for `specs/003-resume-analysis/plan.md`. No
`[NEEDS CLARIFICATION]` markers remained in the Technical Context.

Unlike feature 002, this feature does **not** re-decide the LLM
provider/validation/retry/rate-limit architecture — it reuses
everything `src/lib/llm/` already established. The decisions below are
specific to resume analysis.

## Structural parsing approach

- **Decision**: a single LLM call produces the entire `ResumeAnalysis`
  — parsed sections (contact, summary, experience, skills, education)
  *and* ATS checks, section feedback, strengths/weaknesses, score, and
  rewrite suggestions — rather than a two-stage pipeline (a deterministic
  resume-parsing step followed by a separate LLM judgment step).
- **Rationale**: resumes arrive in wildly inconsistent formats (no
  common schema the way a JD's prose roughly is prose); a dedicated
  deterministic parser (regex/heuristic section-splitting) would need
  significant tuning per format and still fail unusually-structured
  resumes, while the LLM is already capable of both extracting
  structure and judging quality in one structured-output call — the
  same shape of decision feature 002 already made for JD analysis.
  Keeping one call also keeps latency/cost within `docs/non-functional.md`'s
  budget (one call, one bounded retry, same as 002) instead of two
  sequential model-touching stages.
- **Alternatives considered**: a two-stage pipeline (deterministic
  section-splitting library, then LLM feedback per section) — rejected;
  meaningfully more complexity (a new parsing dependency, a two-phase
  data flow) for a benefit (marginally more reliable section boundaries)
  that isn't demonstrated to be needed at this project's scope.
- **This is a real, project-visible tradeoff** (Principle I's ADR
  trigger list is illustrative, not exhaustive) — `docs/adr/0005-resume-parsing-approach.md`
  MUST be authored during `/speckit-tasks`/implementation.

## Reused infrastructure (not re-decided)

- **Provider/Gateway, Zod validation + one-retry repair, hybrid
  stream/block delivery**: unchanged from feature 002
  (`src/lib/llm/provider.ts`). `ResumeAnalysis` is, like `JDAnalysis`,
  pure structured data — it follows the same "block until validated,
  skeleton until then" rendering rule from feature 002's `research.md`.
- **Rate limiting**: the same in-memory per-IP counter from feature 002
  is reused, and is **shared across both analysis endpoints** (JD
  analysis and resume analysis both count against the same 6
  requests/minute budget) — `docs/non-functional.md` states one
  pipeline-wide rate limit, not a separate budget per endpoint.
- **No fabrication rule**: the resume-analysis prompt adopts the same
  "return only what's supported by the text, omit rather than invent"
  instruction style as the JD-analysis prompt, directly satisfying
  spec.md FR-008.

## Fake provider generalization

- **Decision**: generalize feature 002's `src/lib/llm/fake-provider.ts`
  to be keyed by task/prompt id (e.g. `jd-analysis` vs
  `resume-analysis`) rather than hardcoded to one task's fixture shape.
- **Rationale**: without this, feature 003's tests would need a second,
  parallel fake-provider file — unnecessary duplication when one
  generalized fake already covers both, and every future analysis
  feature (004, 005).
- **Alternatives considered**: a separate `fake-provider-resume.ts` —
  rejected, duplicates the same no-network/deterministic pattern for no
  benefit.

## New route placement

- **Decision**: `/analyze/report` becomes the wizard's actual second
  step, inserted between `/analyze/upload` and `/analyze/job` — matching
  the approved wireframe's step order (Upload → Analysis → Job desc. →
  Match) exactly, the same "honor the wireframe's real routing" choice
  feature 001 already made for its own two routes.
- **Rationale**: feature 001's wizard shell (`src/app/analyze/layout.tsx`)
  was deliberately left flexible on exact step count/labels; this
  feature is what fills in the third of four known steps, keeping the
  progress bar's labels accurate rather than a placeholder.
- **Alternatives considered**: a non-wizard "detour" route reachable
  only via a link, outside the step progression — rejected, conflicts
  with the wireframe's persistent, click-back-capable progress bar
  showing this as a real step.

## Architecture Decision Records

- `docs/adr/0005-resume-parsing-approach.md` (new, per "Structural
  parsing approach" above) — the only new ADR this feature owes.
  Everything else (provider, validation/retry, delivery strategy) is
  inherited from feature 002's `0002`–`0004` and not re-litigated.
