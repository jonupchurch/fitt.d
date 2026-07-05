# Feature Specification: Resume & Job Description Input

**Feature Branch**: `001-resume-jd-input`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Feature 001: Resume and job description input. Let a candidate provide a resume (paste, or upload PDF/DOCX/TXT) and paste a job description, so the pipeline has normalized input to hand off to JD analysis (002) and resume analysis (003). Must also support a one-click \"Try a sample\" action that loads a bundled SampleFixture (resume + JD) and runs a live analysis with zero user input, per Constitution Principle IV. Entities: Resume, JobDescription, SampleFixture — already defined in docs/data-model.md, reference rather than redefine. Input limits and validation follow docs/non-functional.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provide a resume (Priority: P1)

As a candidate, I want to give the app my resume — either by uploading a file or pasting text — so the tool has something to analyze without me needing to reformat anything first.

**Why this priority**: This is the lowest-friction entry point into the entire product and the first thing every real user does. Nothing downstream (JD analysis, resume analysis, gap analysis, tailoring, export) can happen without it.

**Independent Test**: Can be fully tested by uploading a valid PDF/DOCX/TXT file (or pasting resume text) and confirming the system accepts it, extracts normalized text, and marks the input as ready to proceed — with no job description or any other feature involved yet.

**Acceptance Scenarios**:

1. **Given** the input screen, **When** the candidate uploads a PDF, DOCX, or TXT file under the size limit, **Then** the system extracts and normalizes the text and marks the resume as provided.
2. **Given** the input screen, **When** the candidate pastes resume text directly instead of uploading a file, **Then** the system accepts the pasted text as the resume with no file required.
3. **Given** no resume has been provided yet, **When** the candidate views the primary "proceed" action, **Then** it is disabled until a valid resume exists.
4. **Given** a resume has been accepted, **When** the candidate views the input screen, **Then** a visible privacy reassurance ("analyzed in-session, never stored") is shown next to the action.

---

### User Story 2 - Provide a job description (Priority: P2)

As a candidate, I want to paste the job description I'm targeting — with optional job title and company — so the tool can compare it against my resume.

**Why this priority**: This unlocks the comparison half of the product (JD analysis, gap analysis, tailoring) but only matters once a resume already exists, making it secondary to User Story 1.

**Independent Test**: Can be fully tested by pasting job description text (with and without optional title/company) and confirming the system accepts and normalizes it as ready for JD analysis, independent of resume upload or any analysis logic.

**Acceptance Scenarios**:

1. **Given** the job description input screen, **When** the candidate pastes job description text, **Then** the system accepts and normalizes it as the job description.
2. **Given** the job description input screen, **When** the candidate leaves job title and company blank, **Then** the system still accepts the submission (both fields are optional).
3. **Given** no job description has been provided yet, **When** the candidate views the primary "proceed" action, **Then** it is disabled until valid job description text exists.

---

### User Story 3 - Try a sample with zero input (Priority: P3)

As a first-time visitor who is skeptical the tool is worth the effort, I want a one-click "Try a sample" option that runs a real analysis using a built-in resume and job description, so I can see the value before typing or uploading anything of my own.

**Why this priority**: Directly serves Constitution Principle IV's requirement that value be provable within ten seconds with no signup — critical for the demo/portfolio audience, but the manual input paths (User Stories 1–2) must exist first since the sample reuses the same underlying input model.

**Independent Test**: Can be fully tested by clicking "Try a sample" from a fresh session with no resume or job description entered, and confirming the bundled sample resume and job description are loaded and marked ready for analysis with zero typed or uploaded input.

**Acceptance Scenarios**:

1. **Given** a first-time visitor with no input provided, **When** they click "Try a sample", **Then** the system loads a bundled sample resume and job description with no further action required.
2. **Given** the sample has been loaded, **When** the candidate views the input state, **Then** it is indistinguishable to downstream features from a manually-provided resume and job description (same normalized shape).

---

### Edge Cases

- What happens when an uploaded file is not a PDF, DOCX, or TXT? The system MUST reject it with a specific, actionable error naming the accepted formats — no silent failure.
- What happens when an uploaded file exceeds the size limit? The system MUST reject it with a clear error stating the limit, before attempting to extract text.
- What happens when a PDF has no extractable text layer (e.g., a scanned image)? The system MUST show a clear error suggesting the candidate paste text instead, rather than crashing or silently producing empty content.
- What happens when pasted resume or job description text exceeds the character budget (docs/non-functional.md)? The system MUST reject with a clear, actionable error — never a silent truncation.
- What happens when the candidate submits whitespace-only or empty pasted text? The system MUST treat it as no input and keep the proceed action disabled.
- What happens if the bundled sample fixture itself fails to load? The system MUST show a clear error rather than a blank or broken state, since this is a first-impression path.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST let the candidate provide a resume either by uploading a file (PDF, DOCX, or TXT) or by pasting raw text directly.
- **FR-002**: System MUST let the candidate provide a job description by pasting raw text, with optional job title and company fields.
- **FR-003**: System MUST reject uploaded resume files that are not PDF, DOCX, or TXT, or that exceed the maximum upload size, with a specific and actionable error message.
- **FR-004**: System MUST extract normalized plain text from an uploaded PDF or DOCX file before it is used by any downstream feature.
- **FR-005**: System MUST enforce the resume and job-description character-size budgets defined in `docs/non-functional.md`, rejecting over-limit pasted or extracted text with a clear, actionable error rather than truncating it silently.
- **FR-006**: System MUST keep each step's primary "proceed" action disabled until that step has valid, non-empty input.
- **FR-007**: System MUST provide a one-click "Try a sample" action that populates both the resume and job description from a bundled sample fixture, requiring no typed or uploaded input from the candidate.
- **FR-008**: The resume and job description produced via "Try a sample" MUST be usable by every downstream feature identically to manually-provided input — no separate code path or reduced feature set.
- **FR-009**: System MUST NOT persist resume or job description content beyond the active session (no database write, no server-side storage of raw text).
- **FR-010**: System MUST display a visible privacy reassurance ("analyzed in-session, never stored") adjacent to the primary input action.
- **FR-011**: System MUST validate all input (file type, file size, text length) before producing a normalized `Resume` or `JobDescription` record; invalid input MUST NOT be forwarded to JD analysis (002) or resume analysis (003).
- **FR-012**: If an uploaded file cannot be parsed into usable text, the system MUST show a clear error directing the candidate to the paste-text alternative instead of failing silently.

### Key Entities

- **Resume**: Candidate's resume, normalized to plain text regardless of source (paste, PDF, DOCX, TXT). Shape defined in `docs/data-model.md`; this feature is responsible for producing valid instances of it, not redefining its fields.
- **JobDescription**: The target job posting text, with optional title/company. Shape defined in `docs/data-model.md`.
- **SampleFixture**: A bundled `{ resume, jobDescription, expected }` triple used by both the "Try a sample" action here and the eval harness (Constitution Principle V). This feature consumes it to populate `Resume` and `JobDescription`; it does not own the fixture's authoring.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A candidate can go from arriving at the app to having a valid resume and job description ready for analysis in under 60 seconds, using either upload or paste.
- **SC-002**: A first-time visitor can reach a live sample analysis within one click and zero typed or uploaded input.
- **SC-003**: 100% of rejected inputs (wrong file type, oversized file, over-limit text, unparseable file) show a specific, actionable error message rather than a generic or silent failure.
- **SC-004**: No resume or job description content provided through this feature is ever written to persistent storage.

## Assumptions

- Maximum upload file size is 5MB, per the approved wireframe (`Resources/Resume Analyzer Wireframes.dc.html`, Screen 02 annotation); `docs/non-functional.md` governs the post-extraction character budget (20,000 chars resume / 12,000 chars job description) separately.
- The exact on-screen sequencing of resume input vs. job description input (e.g., whether resume analysis is shown before or after the job description is pasted, as in the wireframe's 4-step wizard) is a UI-composition decision left to `/speckit-plan`; this spec only requires that both inputs — and the sample shortcut — exist and are independently providable.
- JD-by-URL fetch, referenced as a "later" annotation in the wireframe, remains explicitly out of MVP scope per Constitution Principle IV; only pasted job description text is supported.
- No accounts or authentication exist in the MVP; each input session is anonymous and unauthenticated.
- The bundled `SampleFixture` content itself (the actual sample resume/JD/expected data) is authored as part of implementation, not specified here — this feature only requires that a one-click action consuming such a fixture exists.
- "Live analysis" triggered by "Try a sample" refers to the same downstream pipeline (JD analysis, resume analysis, gap analysis, tailoring) built by features 002–005; this feature's own scope ends at populating normalized input from the fixture, not at running that analysis.
