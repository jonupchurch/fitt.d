# Shared Domain Model

A living reference for the entities that flow through the Fitt.d
pipeline. This exists because the MVP is split across multiple Spec Kit
features (`specs/001` through `specs/005`) that all operate on the same
handful of nouns — this doc is the single source of truth for their
shape, so each feature's spec/plan **references** these entities instead
of redefining them. Field-level detail gets refined here as each feature
is planned; it starts intentionally light.

Update this file whenever a feature's `/speckit-plan` step settles a
shape that isn't captured yet — don't let a feature's own `data-model.md`
silently diverge from what's written here.

## Pipeline flow

```
Resume ──┐
         ├──► ResumeAnalysis ──┐
JobDescription ──► JDAnalysis ─┴──► GapAnalysis ──► TailoringOutput ──► WorkingResumeCopy ──► exports
                                                                              │
                                                                        (diff view, .docx)
```

## Entities

### `Resume`
Raw candidate input, normalized to text regardless of source.
- `rawText` — normalized plain text
- `sourceFormat` — `paste | pdf | docx | txt`
- `sizeChars` — for input-limit enforcement (see `docs/non-functional.md`)

### `JobDescription`
Raw JD input.
- `rawText` — normalized plain text
- `title`, `company` — optional, user-supplied
- `sizeChars`

### `JDAnalysis`
Output of analyzing a `JobDescription` (feature 002).
- `requiredSkills[]`, `niceToHaveSkills[]`
- `responsibilities[]`
- `inferredSeniority`
- `atsKeywords[]`
- `notableSignals[]` — anything else worth surfacing (e.g. unusual requirements)

### `ResumeAnalysis`
Output of parsing/analyzing a `Resume` (feature 003).
- `sections` — parsed structure: contact info, summary, experience[]
  (role, company, dates, bullets[]), skills[], education[]
- `atsChecks[]` — formatting/parseability pass-fail checks
- `sectionFeedback[]` — per-section status (`strong | needs-work | review | not-found`) + notes
- `strengths[]`, `weaknesses[]`
- `overallScore` — resume-quality score/grade, independent of any JD
- `rewriteSuggestions[]` — `{ section, original, suggested, whyStronger }`,
  generic bullet/phrasing advice independent of any job description.
  Added during feature 003 planning: Constitution Principle IV lists
  "rewrite suggestions" as part of resume analysis and the approved
  wireframe (Screen 03) shows a before/after suggestion on this screen,
  but this field was missing until now. Distinct from
  `TailoringOutput.rewrittenBullets` (feature 004), which is JD-tailored
  and gap-driven rather than generic.

### `GapAnalysis`
Output of comparing `JDAnalysis` + `ResumeAnalysis` (feature 004).
- `fitScore` — 0–100
- `matchedSkills[]` — `{ skill, evidence }`
- `missingSkills[]` — `{ skill, priority: must-have | worth-adding | minor }`
- `keywordCoverage` — `{ covered[], missing[] }`
- `rationale` — why this score
- `closingAdvice[]` — `{ skill, suggestion }[]`, prioritized (most
  impactful first), each tied to a specific missing/weak skill. Added
  during feature 004 implementation: spec.md FR-006 requires
  "prioritized, specific gap-closing advice" as its own deliverable,
  distinct from `rationale` (a single explanatory string) — this field
  was missing until now, the same class of correction as feature 003's
  `rewriteSuggestions` addition.

### `TailoringOutput`
Generated from `GapAnalysis` (feature 004).
- `rewrittenBullets[]` — `{ original, rewritten, whyStronger }`
- `rewrittenSummary`
- `keywordsToWeave[]`
- `coverLetterOpener`

### `WorkingResumeCopy`
Session/client-scoped editable resume state (Constitution Technology
Constraints — not durable storage). Created from `Resume` +
`ResumeAnalysis`, mutated when the user "Applies" a tailored bullet.
Feeds the side-by-side diff view and the `.docx` export (feature 005).

### `SampleFixture`
A bundled `{ resume, jobDescription, expected }` triple used for both the
"Try a sample" one-click demo (feature 001) and the eval harness
(Constitution Principle V). One fixture set, two consumers — keep them
the same data so the demo and the evals never drift apart.
