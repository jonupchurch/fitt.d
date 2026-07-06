# ADR-0012: Eval harness scoring approach — fake-provider default, `--live` mode

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Jon Upchurch

## Context

Constitution Principle V requires an eval harness that scores
end-to-end pipeline output on schema validity, required-skill recall,
no hallucinated matches, and score plausibility, running against a
deterministic fake provider, and that it fail CI below its thresholds.
`evals/run-evals.ts`/`scorers.ts` were stubbed at session 0 with a
"wire this up once features 004/005 exist" TODO — those features
shipped weeks ago, but the stub was never revisited. `SCORERS` was a
literal empty array and `run-evals.ts` printed
`"EVAL FAILED: fixtures exist but the pipeline is not implemented yet."`
whenever a fixture had an `expected.json` — meaning CI's `npm run eval`
step had been silently no-op'ing (0 scorable fixtures, since no
fixture had ever gotten an `expected.json`) since the stub was
written. This surfaced during a repo-wide stale-artifact review.

A real design question this stub never had to answer: the app's
existing `devFakeAnalysis`/`devFakeGapAnalysis` fake-provider path
(used by e2e tests) ignores its input text entirely and always returns
the same canned fixture, regardless of which resume/JD pair is fed
in. A naive eval harness scoring fake-mode output against
fixture-specific "realistic" ground truth would then be scoring the
same constant output against every fixture's expectations — not a
meaningful gate.

## Decision

Chain the four real analysis functions directly
(`analyzeJobDescription` -> `analyzeResume` -> `analyzeGap` ->
`tailorResumeResponse`, in `evals/pipeline.ts`) — the exact functions
the app's own Server Actions and Route Handler call, not a parallel
reimplementation. `scorers.ts` implements the four named criteria
against `evals/fixtures/<name>/expected.json`, an intentionally loose
ground-truth format (`requiredSkillsMustInclude: string[]`,
`fitScoreRange: [number, number]`) rather than exact-match assertions,
so the same `expected.json` holds for both modes:

- **Default (`npm run eval`, what CI runs)**: forces
  `FITTD_FAKE_PROVIDER=true` regardless of the caller's shell/`.env`,
  so it's free, network-free, and fully deterministic — satisfying
  Principle V's "running against a deterministic fake provider" clause.
  `sample-1/expected.json`'s assertions were written to hold for both
  the fake provider's canned fixtures *and* what a competent real model
  should produce given the real fixture text (React/TypeScript are
  unambiguously both required by the JD and present on the resume) —
  resolving the tension above without needing a second, content-aware
  fake analyzer.
- **`--live` (`npm run eval -- --live`)**: does not force the fake
  provider; calls the real Gateway with whatever credentials are
  already in the environment, against the actual fixture text. Not run
  in CI — real token cost and non-determinism make it unsuitable as a
  merge gate — but validates prompt/schema changes against a genuine
  model before a release, matching the original docstring's intent.

`schemaValidity` is scored as a hard, binary criterion (1.0 only if
all four stages completed with schema-valid output, 0.0 and named
failure stage otherwise) rather than a graded metric, since a schema
failure isn't a matter of degree. The other three criteria are graded
0..1 against a per-scorer threshold (recall 0.8, the other two 1.0),
printed in a table, with the overall run failing if any fixture falls
below any threshold.

## Alternatives considered

- **Build a second, content-aware fake analyzer for eval purposes**
  (simple keyword-matching NLP standing in for the model) — rejected:
  a second implementation of "AI logic" to test the first is disproportionate
  complexity for what this project needs, and the loose-assertion
  `expected.json` format achieves the same goal (meaningful default-mode
  scoring) without it.
- **Score self-consistency only** (e.g., matched skills are a subset of
  whatever `analyzeResume` claims, with no external ground truth at
  all) — rejected as the sole approach because it can't catch a case
  where `analyzeJobDescription` itself fails to recognize an
  obviously-required skill; kept as part of `noHallucinatedMatches`'s
  design (it checks against the run's *own* resume-analysis output,
  which is a genuine invariant) but not used for `requiredSkillRecall`,
  which needs the external `expected.json` ground truth to be meaningful.
- **Skip `--live` entirely, fake-provider-only** — rejected: the
  original docstring already committed to a live validation path for
  prompt changes before release, and losing it would mean no
  automated way to sanity-check a prompt edit against a real model at
  all before shipping it.

## Consequences

`npm run eval` (CI's gate) now does real work — it will catch a
schema-breaking change, a prompt regression that stops detecting
React/TypeScript as required skills, a gap-analysis hallucination, or
a wildly implausible fit score, using the sample-1 fixture. Adding a
second fixture means adding a `resume.txt`/`job-description.txt`/`expected.json`
triple; no other wiring changes. `--live` is a real, usable path for
validating prompt changes against the actual model, but isn't and
shouldn't be part of CI.
