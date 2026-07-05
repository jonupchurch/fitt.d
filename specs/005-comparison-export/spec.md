# Feature Specification: Side-by-Side Comparison & Export

**Feature Branch**: `005-comparison-export`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Feature 005: Side-by-side comparison and export. Render a side-by-side resume↔job-description comparison (highlighting matched content and JD requirements), reusing the WorkingResumeCopy from feature 004. Let the candidate export a report (PDF or shareable link) and download their tailored resume as .docx. Let the candidate restart from the job-description step ('Try another job') without re-uploading their resume. This is the final MVP feature (docs/data-model.md); no new entities, only composing Resume/JobDescription/WorkingResumeCopy/GapAnalysis into export artifacts. Exports must not introduce new durable server-side persistence, consistent with the project's stateless/ephemeral default."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the side-by-side comparison (Priority: P1)

As a candidate who has been through analysis and tailoring, I want to see my resume and the job description side by side, with matches and gaps visually highlighted, so I can see at a glance how well they line up.

**Why this priority**: This is the wireframe's visual centerpiece of the "payoff screen" and the most direct way to see the whole pipeline's work in one view — the minimum slice that makes this feature real.

**Independent Test**: Can be fully tested by reaching this feature's view with a completed gap analysis and confirming the resume and job description render side by side, with matched content and JD requirements visually distinguished — independent of export or the "try another job" reset.

**Acceptance Scenarios**:

1. **Given** a completed gap analysis, **When** the candidate views the comparison, **Then** their resume and the job description are shown side by side, with matched content and corresponding JD requirements visually highlighted.
2. **Given** the candidate has applied one or more tailored bullets, **When** the comparison renders, **Then** it reflects the current working resume copy (including applied edits), not the originally uploaded resume.
3. **Given** a narrow/mobile viewport, **When** the candidate views the comparison, **Then** it presents as a tabbed single view (Resume ⇄ Job Description) rather than two columns.

---

### User Story 2 - Export a report (Priority: P2)

As a candidate, I want to export my analysis as a PDF or a shareable link, so I can save it or send it to someone else (like a mentor or recruiter) outside the app.

**Why this priority**: Turns the in-session analysis into something the candidate can keep or share — real value, but secondary to actually seeing the comparison (US1) first.

**Independent Test**: Can be fully tested by triggering the export action and confirming a downloadable PDF or a working shareable link is produced, viewable without needing the candidate's original session.

**Acceptance Scenarios**:

1. **Given** a completed analysis, **When** the candidate exports a report, **Then** a PDF download or a shareable link is produced in one action, with no additional input required.
2. **Given** a shareable link, **When** someone else opens it, **Then** they can view the report without an account and without the original candidate's session being active.

---

### User Story 3 - Download the tailored resume (Priority: P3)

As a candidate, I want to download my tailored resume as a properly formatted .docx file, so I have a usable document to actually submit.

**Why this priority**: This is the tangible end deliverable of the whole tailoring flow, but it depends on the working resume copy already existing from feature 004 and is naturally the last "artifact" a candidate reaches for.

**Independent Test**: Can be fully tested by triggering the download action and confirming a properly formatted .docx file is produced reflecting the candidate's current working resume copy (including any applied edits).

**Acceptance Scenarios**:

1. **Given** a working resume copy with at least one applied edit, **When** the candidate downloads the tailored resume, **Then** a .docx file reflecting that edit is produced.
2. **Given** no tailored edits have been applied yet, **When** the candidate downloads the tailored resume, **Then** a .docx file reflecting the originally analyzed resume content is still produced — not an error.

---

### User Story 4 - Try another job without re-uploading (Priority: P4)

As a candidate, I want to restart the flow from the job-description step, so I can compare my same resume against a different job without re-uploading or re-parsing it.

**Why this priority**: Real efficiency value for a candidate evaluating multiple postings, but it's a convenience on top of a flow that's already fully valuable after US1–US3.

**Independent Test**: Can be fully tested by triggering "Try another job" and confirming the candidate lands back at the job-description step with their resume and its analysis still intact, requiring only a new job description to proceed.

**Acceptance Scenarios**:

1. **Given** a completed comparison, **When** the candidate selects "Try another job," **Then** they return to the job-description input step with their resume and resume analysis unchanged.
2. **Given** the candidate previously applied tailored edits, **When** they restart with a new job description, **Then** those already-applied edits to their working resume copy are preserved, while any not-yet-applied tailoring suggestions from the prior job are cleared (they were specific to a job description no longer in use).

---

### Edge Cases

- What happens if the candidate exports a report or downloads a resume with a very long list of skills/bullets? The PDF/document MUST paginate or wrap sensibly rather than clipping or overlapping content.
- What happens if the underlying report data is too large for a shareable link to reasonably encode? The system MUST degrade to a summarized shareable report rather than failing outright or silently truncating critical information.
- What happens if the candidate tries to export or download before a gap analysis exists? The relevant action MUST be unavailable or clearly disabled rather than producing a broken or empty artifact.
- What happens if someone opens an expired or malformed shareable link? A clear message MUST be shown rather than a raw error or blank page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a side-by-side comparison of the candidate's current working resume copy and the job description, with matched content in the resume and corresponding requirements in the job description visually highlighted.
- **FR-002**: On narrow/mobile viewports, the comparison MUST present as a tabbed single view (Resume ⇄ Job Description) instead of two columns.
- **FR-003**: The comparison MUST always reflect the current working resume copy, including any tailored edits already applied (feature 004) — never the originally uploaded resume once edits exist.
- **FR-004**: System MUST let the candidate export a report of their analysis as a downloadable PDF or a shareable link, in one action.
- **FR-005**: A shareable report link MUST be viewable by a third party without an account and without the original candidate's session being active.
- **FR-006**: System MUST let the candidate download their tailored resume as a properly formatted .docx file reflecting their current working resume copy.
- **FR-007**: A .docx download MUST be produced even if no tailored edits have been applied yet, reflecting the originally analyzed resume content.
- **FR-008**: System MUST let the candidate restart the flow from the job-description step ("Try another job") without re-providing or re-analyzing their resume.
- **FR-009**: Restarting via "Try another job" MUST preserve already-applied working-copy edits while clearing not-yet-applied tailoring suggestions tied to the prior job description.
- **FR-010**: Export and share mechanisms MUST NOT introduce new durable server-side storage of resume, job-description, or analysis content beyond what's strictly necessary to render the artifact at request time — consistent with the project's stateless/ephemeral default (Constitution Technology Constraints).
- **FR-011**: Export actions MUST work from the candidate's current session state alone — no new model/analysis call is required to produce an export.
- **FR-012**: Export/download/share actions MUST be unavailable or clearly disabled if a gap analysis does not yet exist, rather than producing a broken or empty artifact.

### Key Entities

- No new entities — this is the final MVP feature and is purely compositional. It renders and exports data already produced by prior features: **Resume**, **JobDescription** (both feature 001), **WorkingResumeCopy** (feature 004, including its applied edits), and **GapAnalysis** (feature 004, for match/gap highlighting). See `docs/data-model.md`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A candidate can view a side-by-side comparison with matches and gaps visually distinguishable at a glance, immediately after gap analysis completes.
- **SC-002**: A candidate can obtain an exported report (PDF or link) in a single action, with no additional typing or waiting on new analysis.
- **SC-003**: A candidate can download a properly formatted tailored resume as .docx in a single action.
- **SC-004**: 100% of exports and the comparison view reflect the candidate's current working resume copy, including any applied edits.
- **SC-005**: A candidate can begin comparing against a different job description without re-providing their resume, in under a few seconds.
- **SC-006**: No export, share, or comparison mechanism ever results in resume or job-description content being found in durable server-side storage.

## Assumptions

- This is the final MVP feature per `docs/data-model.md`'s feature-number mapping — no new domain entities, purely compositional over Resume/JobDescription/WorkingResumeCopy/GapAnalysis.
- A shareable link is expected to avoid new server-side persistence (e.g., by encoding report state directly rather than a database row per share) to stay consistent with the Constitution's stateless/ephemeral default; if a genuine need for server-side storage emerges during planning, that would be an explicit, ADR-documented deviation per Technology Constraints, not a silent default.
- The exact PDF-generation and .docx-generation approaches are implementation details for `/speckit-plan`, not spec-level requirements beyond "properly formatted" (FR-007) and "paginates sensibly" (Edge Cases).
- "Try another job" resets only the job-description-and-beyond state (JD, JDAnalysis, GapAnalysis, not-yet-applied TailoringOutput suggestions); the resume, its analysis, and already-applied working-copy edits are untouched, per feature 004's own Assumptions about preserving genuine edits.
