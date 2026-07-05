# Feature Specification: Gap Analysis & Tailoring Output

**Feature Branch**: `004-gap-analysis-tailoring`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Feature 004: Gap analysis and tailoring output. Given the JDAnalysis (002) and ResumeAnalysis (003) for a candidate's session, compare them to produce a GapAnalysis (fit score, matched/missing skills with evidence and priority, ATS keyword coverage, rationale), then generate a TailoringOutput (rewritten bullets with one-click apply into a working resume copy, rewritten summary, keywords to weave in, cover-letter opener) — docs/data-model.md defines both entities, reference don't redefine. Surfaced on the approved wireframe's Match & comparison screen (Screen 05), alongside — but excluding — the side-by-side diff view and export, which are feature 005's scope. Reuses feature 002's provider/validation/retry/rate-limit infrastructure. Tailoring output must never invent experience the candidate didn't claim, and must be schema-validated even though it streams for perceived speed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the fit score and matched/missing skills (Priority: P1)

As a candidate who has analyzed both my resume and a job description, I want to see how well I match — a fit score, which skills I clearly have, and which ones I'm missing — so I immediately know where I stand.

**Why this priority**: This is the wireframe's explicit "payoff screen" headline — the single most anticipated result in the whole product, and the minimum slice that makes this feature real.

**Independent Test**: Can be fully tested by providing a resume and job description that have both already been analyzed (features 002/003), and confirming a fit score, matched skills (with evidence), missing skills (with priority), and ATS keyword coverage all appear — independent of tailoring output or export.

**Acceptance Scenarios**:

1. **Given** completed job-description and resume analyses, **When** the candidate reaches this feature's results, **Then** a fit score, matched skills list, missing skills list, and keyword coverage are displayed.
2. **Given** a resume missing several core required skills, **When** the fit score is computed, **Then** it is NOT a high score — required skills are weighted more heavily than nice-to-haves.
3. **Given** the analysis result, **When** the candidate reviews it, **Then** no skill appears in both the matched and missing lists.
4. **Given** weak or absent evidence for a skill in the resume, **When** the analysis is computed, **Then** that skill is reported as missing (or low-priority) rather than as an inflated match.

---

### User Story 2 - Read gap analysis advice (Priority: P2)

As a candidate, I want a plain-language explanation of my score and specific, prioritized advice on how to close the gaps, so I know exactly what to do next.

**Why this priority**: Deepens User Story 1's headline number into something actionable, but the score/matched-missing lists (US1) are the more critical first read.

**Independent Test**: Can be fully tested by confirming the analysis includes a short rationale for the score and a prioritized list of specific (not generic) suggestions for closing the biggest gaps.

**Acceptance Scenarios**:

1. **Given** a completed gap analysis, **When** the candidate reviews it, **Then** a plain-language rationale for the fit score is present.
2. **Given** a completed gap analysis, **When** the candidate reviews the advice, **Then** each suggestion is specific to the candidate's actual gaps (e.g., naming the missing skill and a concrete way to demonstrate it), not generic filler.

---

### User Story 3 - Get tailored rewrite suggestions and apply them (Priority: P3)

As a candidate, I want tailored rewrites of my weakest bullets, a rewritten summary, keywords to weave in, and a cover-letter opener — all specific to this job — and I want to apply any single rewritten bullet into my resume with one click.

**Why this priority**: This is the deepest, most valuable "advice payoff," but it depends on the gap analysis (US1/US2) already existing, and a candidate can get real value from the score and advice alone even before this exists.

**Independent Test**: Can be fully tested by confirming tailored bullet rewrites (as original/rewritten pairs with a reason), a rewritten summary, keywords, and a cover-letter opener all appear, and that applying one rewritten bullet updates a working copy of the resume without altering the originally analyzed resume.

**Acceptance Scenarios**:

1. **Given** a completed gap analysis, **When** tailoring completes, **Then** at least one rewritten bullet (original/rewritten pair with a reason it's stronger), a rewritten summary, a list of keywords to weave in, and a cover-letter opener are all shown.
2. **Given** a tailored bullet rewrite, **When** the candidate applies it, **Then** the working copy of their resume reflects the change immediately, and the original analyzed resume is unaffected.
3. **Given** an applied suggestion, **When** the candidate views the tailoring panel, **Then** it's visibly distinguishable from suggestions not yet applied.
4. **Given** a candidate's actual resume content, **When** tailored content is generated, **Then** it never claims experience, tools, or results the candidate didn't already state.

---

### Edge Cases

- What happens if the candidate reaches this feature's screen before job-description analysis (002) or resume analysis (003) has finished? The system MUST show a clear waiting/pending state naming what's still in progress — never an error or a broken partial result.
- What happens when the model call (gap analysis or tailoring) fails or returns output that doesn't match the expected structure? Same bounded-retry-then-clear-message pattern as features 002/003 — no crash, no silent gap.
- What happens when the candidate triggers more analysis requests than the shared rate limit allows? A clear rate-limit message, same shared budget as features 002/003 (`docs/non-functional.md`).
- What happens when the resume and job description are a near-perfect match? Missing skills MAY be empty; the system MUST NOT fabricate gaps to fill the section.
- What happens when the match is very poor? The fit score MUST reflect that honestly — no forced positivity — and advice should still be genuinely actionable, not generic.
- What happens if the candidate applies a bullet, then changes the job description and re-runs the analysis? Previously-applied edits to the working resume copy are preserved (they're real improvements to the resume); new tailoring suggestions are computed fresh against the (possibly already-edited) resume for the new job.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compare a candidate's `JDAnalysis` (feature 002) and `ResumeAnalysis` (feature 003) to produce a `GapAnalysis`: a fit score, matched skills (each with supporting evidence from the resume), missing/weak skills (each with a priority), and ATS keyword coverage.
- **FR-002**: The fit score MUST weight required skills more heavily than nice-to-have skills; a resume missing multiple core required skills MUST NOT receive a high score.
- **FR-003**: A skill MUST NOT be reported as both matched and missing in the same result.
- **FR-004**: A skill MUST NOT be reported as matched unless the resume provides genuine supporting evidence; weak or absent evidence MUST result in it being reported as missing (or low-priority) instead.
- **FR-005**: System MUST provide a plain-language rationale for the fit score.
- **FR-006**: System MUST provide prioritized, specific gap-closing advice tied to the candidate's actual gaps, not generic tips.
- **FR-007**: Given a `GapAnalysis`, system MUST generate a `TailoringOutput`: rewritten bullets (each an original/rewritten pair with a reason it's stronger), a rewritten professional summary, keywords to weave in, and a cover-letter opener, all tailored to the specific job description.
- **FR-008**: Tailored content MUST NOT invent experience, tools, skills, or results the candidate did not already state in their resume.
- **FR-009**: The candidate MUST be able to apply any single rewritten bullet with one action, updating a working copy of their resume without altering the originally analyzed resume.
- **FR-010**: An applied suggestion MUST be visibly distinguishable from a not-yet-applied one.
- **FR-011**: If either prerequisite analysis (JD or resume) has not completed when the candidate reaches this feature, the system MUST show a clear waiting/pending state rather than an error or partial/broken result.
- **FR-012**: Both the gap-analysis and tailoring calls MUST run entirely server-side, reusing the established provider abstraction, Zod-validated output, and rate limiting (a single shared budget across all analysis endpoints — JD, resume, gap, tailoring).
- **FR-013**: Tailoring output MUST be schema-validated before being treated as complete, even though it is delivered as a streaming response for perceived speed — streaming is a delivery detail, not an exemption from validation.
- **FR-014**: On a failed or invalid model response for either call, the system MUST retry a bounded number of times and, if still unsuccessful, degrade to a clear, non-blocking message.
- **FR-015**: System MUST NOT persist the gap analysis, tailoring output, or working resume copy beyond the active session.

### Key Entities

- **JDAnalysis**, **ResumeAnalysis**: consumed inputs, produced by features 002 and 003 respectively; not redefined here.
- **GapAnalysis**: the structured comparison of `JDAnalysis` + `ResumeAnalysis` — fit score, matched/missing skills, keyword coverage, rationale. Shape defined in `docs/data-model.md`.
- **TailoringOutput**: generated from `GapAnalysis` — rewritten bullets, rewritten summary, keywords to weave in, cover-letter opener. Shape defined in `docs/data-model.md`.
- **WorkingResumeCopy**: session/client-scoped editable resume state, created from `Resume` + `ResumeAnalysis` and mutated when the candidate applies a tailored bullet. This feature creates and mutates it; the visual side-by-side diff view and export are feature 005's scope (see Assumptions).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A candidate sees a complete gap analysis (fit score, matched/missing skills, keyword coverage, rationale, advice) within roughly 15 seconds of both prerequisite analyses being ready, per `docs/non-functional.md`.
- **SC-002**: Tailored content begins appearing within about 2 seconds of tailoring starting (this is the pipeline's first feature where the "first streamed token" budget is exercised as literal token-by-token streaming, per `docs/non-functional.md`).
- **SC-003**: 100% of failed or malformed model responses (gap analysis or tailoring) result in a clear, visible message — never a crash or an indefinitely broken state.
- **SC-004**: No fit score is ever "high" when a resume is missing multiple core required skills, verified against eval fixtures.
- **SC-005**: Applying a tailored bullet updates the working resume copy immediately and visibly, with no full page reload.
- **SC-006**: No resume, job-description, gap-analysis, tailoring, or working-resume-copy content is ever found in persistent storage.

## Assumptions

- This is the first feature with a real cross-feature dependency — it needs both feature 002's and feature 003's output to exist. A clear waiting state (FR-011) is the answer, not blocking the candidate from navigating elsewhere.
- The approved wireframe (Screen 05, "Match & comparison") shows the fit score, matched/missing skills, gap advice, tailoring suggestions with Apply, a side-by-side resume↔JD comparison, and export buttons all on one screen. Per `docs/data-model.md`'s entity ownership, this feature's scope stops at `GapAnalysis`, `TailoringOutput`, and the Apply mechanic; the visual side-by-side diff, "Export report," "Download tailored resume," and "Try another job" reset are feature 005's scope.
- Reuses feature 002's provider abstraction, Zod-validation/retry pattern, and rate limiter wholesale; the rate limit is one shared budget across all analysis endpoints, per `docs/non-functional.md`'s single stated limit — not a separate budget per feature.
- Tailoring output's streamed delivery is schema-validated once complete, a deliberate refinement of the project's response-delivery pattern (Constitution Principle II is unconditional about Zod validation) rather than raw, unvalidated prose streaming.
- The exact recomputation trigger when a candidate changes the job description after already applying edits (see Edge Cases) is a reasonable default, not a hard requirement beyond "don't discard prior genuine edits" — finer behavior is a `/speckit-plan` detail.
