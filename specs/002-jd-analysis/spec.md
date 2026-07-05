# Feature Specification: Job Description Analysis

**Feature Branch**: `002-jd-analysis`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Feature 002: Job description analysis. Given the normalized JobDescription captured by feature 001, analyze it with the LLM provider to produce a JDAnalysis: required skills, nice-to-have skills, responsibilities, inferred seniority, ATS keywords, and notable signals (docs/data-model.md already defines this entity — reference, don't redefine). Must surface as the \"live keyword-detection preview\" panel on the JD input screen per Constitution Principle IV and the approved wireframe (Screen 04), populated automatically shortly after the candidate stops editing the pasted JD, not on every keystroke. This is the first feature that calls the LLM provider, so it must establish: the swappable provider interface, server-side-only streamed calls, versioned prompt files, Zod-validated output with graceful degradation on malformed/failed responses, and enforcement of the rate limit from docs/non-functional.md. No persistence of raw JD or analysis beyond the session."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See detected skills and keywords while pasting (Priority: P1)

As a candidate who just pasted a job description, I want to see the required skills, nice-to-have skills, and ATS keywords it contains appear automatically, so I immediately understand what the job is asking for without doing that reading myself.

**Why this priority**: This is the exact "live keyword-detection preview" value Constitution Principle IV calls out by name as part of the MVP flow, and the wireframe's only visible manifestation of this feature (Screen 04) — it's the minimum slice that makes this feature real to a candidate.

**Independent Test**: Can be fully tested by pasting a real job description at the JD input step and confirming a live preview of detected required skills, nice-to-have skills, and ATS keywords appears shortly after — independent of resume analysis, gap analysis, or any other downstream feature.

**Acceptance Scenarios**:

1. **Given** a candidate has pasted a complete job description and stopped typing, **When** a short pause elapses, **Then** the system automatically analyzes it and displays detected required skills, nice-to-have skills, and ATS keywords — with no manual "analyze" action required.
2. **Given** the candidate is still actively typing or pasting, **When** each keystroke occurs, **Then** the system does NOT re-run analysis on every keystroke — only after the candidate pauses.
3. **Given** a job description with very few identifiable skills, **When** analysis completes, **Then** the preview shows whatever was found (including an empty or sparse result) rather than an error.

---

### User Story 2 - Understand the fuller picture (Priority: P2)

As a candidate, I want to see the job's inferred seniority level, its core responsibilities, and any other notable signals the analysis picked up, so I can gauge fit and tone before I even get to a resume comparison.

**Why this priority**: This deepens the value established by User Story 1 and is what downstream resume analysis (003) and gap analysis (004) will consume, but the keyword preview alone (US1) already delivers the headline value Principle IV requires — this is additive richness, not the core slice.

**Independent Test**: Can be fully tested by pasting a job description and confirming the analysis result includes inferred seniority, a responsibilities list, and any notable signals, independent of whether a resume has been provided yet.

**Acceptance Scenarios**:

1. **Given** a completed analysis, **When** the candidate reviews it, **Then** an inferred seniority level and a list of core responsibilities are present.
2. **Given** a job description with an unusual requirement (e.g., an atypical certification or an unusual work arrangement), **When** analysis completes, **Then** it appears as a notable signal rather than being silently dropped.

---

### User Story 3 - Preview stays accurate after edits (Priority: P3)

As a candidate, I want the detected-skills preview to update if I change or replace the job description text, so I'm never looking at a stale analysis of a job I've already edited away.

**Why this priority**: Builds directly on User Story 1's freshness guarantee; valuable but secondary to getting a first analysis to appear at all.

**Independent Test**: Can be fully tested by pasting one job description, letting analysis complete, then replacing the text with a different job description and confirming the preview updates to match the new text rather than showing the first result.

**Acceptance Scenarios**:

1. **Given** a completed analysis for one job description, **When** the candidate replaces the pasted text with a different job description and pauses, **Then** the system re-runs analysis and the preview updates to reflect the new text.
2. **Given** analysis is still in progress, **When** the candidate makes another edit before it finishes, **Then** the in-flight analysis's result is superseded by a fresh one for the latest text, not shown after the fact as if current.

---

### Edge Cases

- What happens when the model call fails outright (provider/network error)? The system MUST show a clear, non-blocking message in place of the preview — never a crash or an indefinitely spinning state.
- What happens when the model returns output that doesn't match the expected structure? The system MUST NOT display it as if valid; it MUST retry a bounded number of times, then degrade to a clear message if still unsuccessful.
- What happens when the candidate triggers analysis requests faster than the configured rate limit (docs/non-functional.md)? The system MUST show a clear rate-limit message rather than silently dropping or queuing indefinitely.
- What happens when the job description is very short or generic (e.g., a one-line stub)? The system MUST still return a (possibly sparse) result rather than treating it as an error.
- What happens if the candidate proceeds to the next step before analysis finishes? The system MUST NOT block progression — the candidate can proceed on valid job-description text alone (per feature 001); this feature's own scope ends at producing the analysis when ready, not gating navigation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST analyze a candidate's normalized job description (produced by feature 001) to identify required skills, nice-to-have skills, responsibilities, inferred seniority, ATS keywords, and notable signals.
- **FR-002**: Analysis MUST begin automatically a short pause after the candidate stops actively editing the pasted job description — not on every keystroke, and not requiring a separate manual "analyze" action.
- **FR-003**: The required skills, nice-to-have skills, and ATS keywords MUST be visibly surfaced to the candidate as a live preview while they are still on the job-description input step.
- **FR-004**: If the candidate edits or replaces the job description after an analysis has already completed or is in progress, the system MUST re-run analysis against the latest text and supersede any prior or in-flight result.
- **FR-005**: The analysis call MUST run entirely server-side; no model credentials, prompts, or raw provider requests/responses are ever exposed to the client.
- **FR-006**: The system MUST validate the model's output against a defined structure before using it; output that fails validation MUST NOT be surfaced to the candidate as if it were a valid analysis.
- **FR-007**: On a failed or invalid model response, the system MUST retry a bounded number of times and, if still unsuccessful, degrade to a clear, non-blocking message rather than crashing or hanging indefinitely.
- **FR-008**: The system MUST enforce the request rate limit defined in `docs/non-functional.md`, showing a clear message when a candidate exceeds it rather than silently dropping the request.
- **FR-009**: The system MUST NOT persist the job description text or its analysis output beyond the active session.
- **FR-010**: The underlying model-provider integration MUST be swappable for a different provider without changing this feature's own logic or the shape of its output.
- **FR-011**: Each distinct prompt used to produce the analysis MUST be a versioned, identifiable artifact; a change in analysis behavior MUST result in a new version rather than a silent edit to the existing one.
- **FR-012**: The candidate MUST be able to proceed to the next step using valid job-description text alone; this feature MUST NOT block progression on analysis completion.

### Key Entities

- **JobDescription**: The candidate's job posting input, produced and validated by feature 001. This feature consumes it; it does not redefine or revalidate its shape.
- **JDAnalysis**: The structured output of analyzing a `JobDescription` — required skills, nice-to-have skills, responsibilities, inferred seniority, ATS keywords, notable signals. Shape defined in `docs/data-model.md`; this feature is responsible for producing valid instances of it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For a typical job description, candidates see the first detected skills/keywords appear within 2 seconds (p50) of pausing after pasting, per the pipeline-wide latency budget in `docs/non-functional.md`.
- **SC-002**: A full analysis (all fields) completes within roughly 15 seconds for 90% of requests, per `docs/non-functional.md`.
- **SC-003**: 100% of failed or malformed model responses result in a clear, visible message to the candidate — never a blank preview, an indefinite spinner, or a crash.
- **SC-004**: Replacing a pasted job description with a different one always results in the preview reflecting the new text, never the prior one, on every attempt.
- **SC-005**: No job description text or analysis output is ever found in persistent storage during or after a session.

## Assumptions

- The model provider is Claude, called server-side only, per the Constitution's Technology Constraints — not an open question for this spec.
- The exact debounce duration ("a short pause") and retry count ("a bounded number of times") are implementation details left to `/speckit-plan`; the business requirements are "not on every keystroke" and "bounded so cost/latency can't multiply," respectively, both already stated in the Constitution.
- The request rate limit's specific value (6/minute) is already fixed in `docs/non-functional.md` and not re-litigated here.
- This feature does not introduce a new screen — the wireframe (Screen 04) shows the live keyword-detection preview embedded in the job-description input screen that feature 001 already built; this feature populates that panel, it doesn't restructure the screen around it.
- Resume analysis (003) and gap analysis (004) are separate features and out of scope here, even though they will consume this feature's `JDAnalysis` output.
- "Notable signals" is an open-ended list (e.g., unusual requirements or work arrangements) rather than a fixed enumeration — the model surfaces whatever it judges worth flagging, per `docs/data-model.md`'s definition of the field.
