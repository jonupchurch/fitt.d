# Feature Specification: Resume Analysis

**Feature Branch**: `003-resume-analysis`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Feature 003: Resume analysis. Given the normalized Resume captured by feature 001, analyze it with the LLM provider to produce a ResumeAnalysis: parsed sections (contact, summary, experience, skills, education), ATS/formatting pass-fail checks, section-by-section feedback, strengths/weaknesses, an overall score, and generic (JD-independent) rewrite suggestions — docs/data-model.md defines this entity, reference don't redefine. Surfaced on a new results screen per the approved wireframe (Screen 03: score ring, ATS checks, section feedback, strengths/weaknesses, a rewrite-suggestion sample), reachable and valuable on its own before any job description is pasted. Reuses the LLM provider/validation/retry/rate-limit infrastructure established in feature 002 rather than re-deciding it."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See an overall score and ATS check results (Priority: P1)

As a candidate who just uploaded or pasted my resume, I want to immediately see an overall grade and a pass/fail breakdown of ATS/formatting checks, so I get the single most important verdict on my resume without reading anything else first.

**Why this priority**: Per the approved wireframe, the score ring is "the single most glanceable output" and ATS checks are the headline reason candidates use a resume tool — this is the minimum slice that makes the feature real and valuable standalone, before any job description exists.

**Independent Test**: Can be fully tested by providing a resume (no job description) and confirming an overall score/grade and a list of pass/fail ATS/formatting checks appear — independent of job description analysis, gap analysis, or tailoring.

**Acceptance Scenarios**:

1. **Given** a candidate has provided a valid resume, **When** analysis completes, **Then** an overall score/grade and a pass/fail list of ATS/formatting checks are displayed.
2. **Given** no job description has been provided yet, **When** the candidate views the resume analysis, **Then** it is fully populated and meaningful on its own — nothing is blocked on or waiting for a job description.
3. **Given** a resume with formatting problems (e.g., missing contact info, an unparseable section), **When** analysis completes, **Then** the relevant ATS/formatting checks show as failing rather than being silently skipped.

---

### User Story 2 - See section-by-section feedback and strengths/weaknesses (Priority: P2)

As a candidate, I want to see how each section of my resume (summary, experience, skills, education) is doing, plus a clear list of strengths and weaknesses, so I know specifically what to keep and what to fix.

**Why this priority**: Deepens the value established by User Story 1 with actionable detail, but the headline score/ATS verdict (US1) is the more critical first impression.

**Independent Test**: Can be fully tested by providing a resume and confirming the analysis includes a status (e.g., strong/needs-work/review) and note for each parsed section, plus separate strengths and weaknesses lists.

**Acceptance Scenarios**:

1. **Given** a completed analysis, **When** the candidate reviews it, **Then** each identifiable resume section (summary, experience, skills, education) shows a status and a short explanatory note.
2. **Given** a completed analysis, **When** the candidate reviews it, **Then** distinct strengths and weaknesses lists are present and specific to that resume (not generic filler).

---

### User Story 3 - See generic rewrite suggestions (Priority: P3)

As a candidate, I want a few concrete before/after rewrite suggestions for weak bullets in my resume, so I have actionable advice even before comparing against any specific job.

**Why this priority**: This is the "advice payoff" the wireframe calls out, but it builds on and is secondary to the scoring and section feedback (US1/US2) already giving most of the standalone value.

**Independent Test**: Can be fully tested by providing a resume with at least one weak bullet and confirming the analysis includes at least one before/after rewrite suggestion with a reason it's stronger — independent of any job description or gap-driven tailoring.

**Acceptance Scenarios**:

1. **Given** a resume with identifiably weak bullets (e.g., vague, unquantified), **When** analysis completes, **Then** at least one rewrite suggestion is shown as a before/after pair with a brief reason.
2. **Given** a resume with no clearly weak bullets, **When** analysis completes, **Then** the system does not fabricate a suggestion just to fill the section — it may show fewer or none.

---

### Edge Cases

- What happens when the resume is missing an entire expected section (e.g., no education listed)? The system MUST reflect this in section feedback (e.g., "not found") rather than erroring or fabricating content.
- What happens when the model call fails or returns output that doesn't match the expected structure? Same as feature 002: one bounded repair retry, then a clear, non-blocking degraded message — no crash, no silent fabrication.
- What happens when the candidate triggers analysis requests faster than the configured rate limit? Same shared limit and clear message as feature 002 (`docs/non-functional.md`).
- What happens when the resume text is very short or sparse (e.g., a one-page stub with only contact info)? The system MUST still return a result — likely a low score and mostly "not found"/"needs-work" statuses — rather than treating it as an error.
- What happens if the candidate attempts to proceed to the job-description step (or Match) before resume analysis has resolved? **Amended 2026-07-06 — see ADR-0009.** The system MUST block that progression — the candidate is kept on (or redirected back to) the resume-analysis screen, including on direct navigation, until the analysis resolves (succeeds or fails). Once it resolves, navigation is unblocked even on failure, so a model error is not a permanent dead end.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST analyze a candidate's normalized resume (produced by feature 001) to produce: parsed sections (contact, summary, experience, skills, education), ATS/formatting pass-fail checks, section-by-section feedback, strengths, weaknesses, an overall score, and generic (job-independent) rewrite suggestions.
- **FR-002**: The analysis and its results MUST be fully available and meaningful without any job description having been provided — this feature has no dependency on feature 002's output.
- **FR-003**: System MUST display an overall score/grade as the most prominent element of the results.
- **FR-004**: System MUST display ATS/formatting checks as a pass/fail list, with failing checks visually distinguished from passing ones.
- **FR-005**: System MUST provide a status and a short note for each identifiable resume section; a section that cannot be found in the resume MUST be reflected as such, not silently omitted.
- **FR-006**: System MUST provide distinct strengths and weaknesses lists specific to the analyzed resume.
- **FR-007**: System MUST provide rewrite suggestions as before/after pairs with a brief reason each is stronger, based only on general resume-writing quality — not tailored to any specific job description (that is feature 004's `TailoringOutput`, a separate entity).
- **FR-008**: System MUST NOT fabricate a rewrite suggestion, a strength, or a weakness that isn't supported by the actual resume content.
- **FR-009**: The analysis call MUST run entirely server-side, reusing the same provider abstraction, Zod-validated output, one-bounded-retry repair, and rate-limit enforcement established in feature 002 — this feature does not redefine that infrastructure.
- **FR-010**: The system MUST NOT persist the resume text or its analysis output beyond the active session.
- **FR-011**: **Amended 2026-07-06 — see ADR-0009.** The system MUST block the candidate from reaching the job-description step or Match while resume analysis has neither succeeded nor failed yet, redirecting back to the resume-analysis screen on any attempt (progress-bar link, direct URL, back/forward navigation). The system MUST unblock progression once the analysis resolves, whether it succeeds or fails.

### Key Entities

- **Resume**: The candidate's resume input, produced and validated by feature 001. This feature consumes it; it does not redefine its shape.
- **ResumeAnalysis**: The structured output of analyzing a `Resume` — parsed sections, ATS/formatting checks, section feedback, strengths, weaknesses, overall score, and generic rewrite suggestions. Shape defined in `docs/data-model.md` (updated during this feature's planning to add the previously-missing `rewriteSuggestions` field — see Assumptions).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A candidate sees a complete resume analysis (score, ATS checks, section feedback, strengths/weaknesses, rewrite suggestions) within roughly 15 seconds of providing a resume, consistent with the pipeline-wide budget in `docs/non-functional.md`.
- **SC-002**: 100% of failed or malformed model responses result in a clear, visible message — never a blank result, an indefinite spinner, or a crash.
- **SC-003**: A candidate can get a complete, useful resume analysis without ever providing a job description, in every case.
- **SC-004**: No resume text or analysis output is ever found in persistent storage during or after a session.
- **SC-005**: Every rewrite suggestion, strength, and weakness shown is traceable to actual content in the analyzed resume (no fabricated advice), in manual spot-checks against eval fixtures.

## Assumptions

- **Data model correction made during this spec**: `docs/data-model.md`'s `ResumeAnalysis` entity was missing a rewrite-suggestions field, even though Constitution Principle IV explicitly lists "rewrite suggestions" as part of resume analysis and the approved wireframe (Screen 03) shows one. Added `rewriteSuggestions[]` to `docs/data-model.md` as part of this feature's planning, distinct from `TailoringOutput.rewrittenBullets` (feature 004, JD-tailored and gap-driven).
- This feature reuses, and does not redecide, the LLM provider abstraction, Zod-validation/repair-retry pattern, rate limiting, and no-persistence stance established in feature 002 — no new ADRs are expected for that infrastructure itself; any resume-analysis-specific tradeoff (e.g., the parsing-into-sections approach) is evaluated for an ADR at `/speckit-plan` time.
- The results screen (approved wireframe Screen 03, `/analyze/report`) is a new route not built by any prior feature — feature 001 built `/analyze/upload` and `/analyze/job` only.
- Gap analysis and JD-tailored rewritten bullets (feature 004) are explicitly out of scope here, even though they will consume this feature's `ResumeAnalysis` output alongside feature 002's `JDAnalysis`.
- The exact model/prompt behavior for judging "weak" bullets or assigning scores is an implementation detail for `/speckit-plan` and the eval harness fixtures, not a spec-level requirement beyond FR-008's no-fabrication rule.
