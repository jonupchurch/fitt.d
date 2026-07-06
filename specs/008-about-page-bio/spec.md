# Feature Specification: About Page Bio & Journey

**Feature Branch**: `008-about-page-bio`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Redesign the /about page (currently placeholder copy from feature 006) into a personal bio page for Jon Upchurch, the builder. Layout: a photo in the upper-left inside a white 'matting' border like a framed photo, then a thin black frame border around that — clean, not obtrusive — displayed at roughly 150px wide (aspect ratio preserved), sitting in a column that takes about 1/4 of the page's width. To the right, a 'vital statistics' column with contact links: email, LinkedIn, GitHub, and the Fitt.d repo itself — explicitly no phone number. A resume/CV download is a planned fast-follow, not built now. Below the photo+stats row, a full-width narrative section written for a non-developer audience: a chronological timeline of the actual journey building this project with an AI pairing partner, showing off thoroughness and process to a non-technical reader without being jargon-heavy."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find out who built this and how to reach them (Priority: P1)

As a visitor evaluating Fitt.d (a recruiter, hiring manager, or fellow engineer), I want to immediately see who built it, a real photo, and clear ways to contact or look them up, so I can identify a real person behind the project and follow up without hunting for contact details.

**Why this priority**: This is the fundamental purpose of an About/bio page — without a clear identity and a way to make contact, nothing else on the page matters. It must work standalone, before any narrative content loads or is read.

**Independent Test**: Can be fully tested by loading `/about` and confirming a photo, name, and working email/LinkedIn/GitHub/repo links are all present and functional, independent of the narrative section below.

**Acceptance Scenarios**:

1. **Given** a visitor loads `/about`, **When** the page renders, **Then** a photo appears in the upper-left area, presented in a clean framed style (a white mat bordered by a thin black frame), sized to roughly a quarter of the page's width on desktop.
2. **Given** a visitor loads `/about`, **When** they look to the right of the photo, **Then** they see an email address, a LinkedIn profile link, a GitHub profile link, and a link to the Fitt.d repository — each clearly labeled and each one actually working.
3. **Given** a visitor is on a narrow (mobile) viewport, **When** they load `/about`, **Then** the photo and contact links remain fully legible and usable, stacked in a single readable column rather than being squeezed illegibly narrow.
4. **Given** a visitor loads `/about`, **When** they look for a phone number or a resume download, **Then** neither is present — contact is via email/LinkedIn/GitHub only, and no broken or placeholder resume control appears.
5. **Given** a visitor scrolls just past the photo/contact row, **When** the "Mission" section renders, **Then** they see a short professional bio establishing the author's experience level and what the project is meant to demonstrate.

---

### User Story 2 - Understand the journey behind the build (Priority: P2)

As a visitor curious about how Fitt.d was actually built, I want a clear, non-technical narrative of the real process — from the very first planning step through to today — so I come away understanding the thoroughness and discipline behind the work, without needing to know what any of the underlying technical terms mean.

**Why this priority**: This is what turns the page from a simple contact card into a genuine showcase of capability and process — but it's secondary to the page fulfilling its baseline identity/contact purpose (User Story 1) first.

**Independent Test**: Can be fully tested by reading the narrative section alone and confirming a non-technical reader can follow the chronological story end-to-end and describe, in their own words, that the project was planned carefully and improved through real iteration.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls below the photo/contact row, **When** the narrative section renders, **Then** it presents a chronological timeline of real milestones in the project's actual build history, not generic or fabricated claims.
2. **Given** a visitor with no technical background reads the narrative, **When** they finish it, **Then** they understand — in plain language — that the project was planned before it was built, that it was built incrementally, and that real problems were found and fixed along the way, without the copy relying on unexplained jargon.
3. **Given** a visitor reads the narrative, **When** they reach the end, **Then** it reflects where the project actually stands today, not a stale or incomplete snapshot.

---

### Edge Cases

- What happens if the photo fails to load? A meaningful text alternative (identifying who the photo is of) must still be present, per the existing accessibility bar.
- What happens on a very narrow viewport? The photo+contact row must stack into a single legible column instead of compressing into an unusably narrow layout (see User Story 1, Acceptance 3).
- What happens if a visitor doesn't recognize a technical term the timeline references (e.g., a "spec" or a "regression test")? The narrative must convey the real-world meaning/benefit in plain language rather than assuming the reader already knows it.
- What happens to feature 006's original product-description copy on `/about`? It is superseded by this personal bio framing — the home page already carries the "what is Fitt.d" pitch, and the journey narrative itself conveys what the product does as part of telling the real story.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The About page MUST display a photo of the builder in the upper-left area of the page, presented in a framed style — a white "matting" border around the photo, with a thin black frame border around that — sized to roughly 150px wide on desktop with its original aspect ratio preserved.
- **FR-002**: The photo (with its frame) MUST sit in a column occupying roughly one quarter of the page's width on desktop viewports, alongside a contact column occupying the remaining width.
- **FR-003**: The contact column MUST list: an email address, a LinkedIn profile link, a GitHub profile link, and a link to the Fitt.d project's own repository — each clearly labeled and each a working link.
- **FR-004**: The contact column MUST NOT include a phone number.
- **FR-005**: This feature MUST NOT include a resume/CV download control of any kind (button, link, or placeholder) — a downloadable resume is explicitly out of scope, planned separately.
- **FR-006**: Below the photo/contact row, the page MUST present a brief "Mission" section — a short professional bio and statement of the project's purpose — followed by a full-width narrative section structured as a chronological timeline of the project's real build history.
- **FR-007**: The narrative content MUST be written for a non-technical reader — plain language throughout, with any necessarily-technical concept translated into its real-world meaning or benefit rather than left unexplained.
- **FR-008**: The narrative MUST reflect the project's actual, real history (not fabricated or generic claims), including: establishing project principles before writing code, planning each feature before implementing it, the initial set of core features, and a later round of real post-launch improvements including bugs that were found and fixed.
- **FR-009**: The photo/contact row and the timeline section MUST both remain fully legible and usable at mobile viewport widths, stacking into single-column layouts rather than compressing illegibly.
- **FR-010**: The page MUST meet the same accessibility bar as the rest of the product (WCAG 2.1 AA) — including a meaningful text alternative for the photo and sufficient color contrast throughout.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can identify who built Fitt.d and locate at least one working way to contact them within 5 seconds of the page loading.
- **SC-002**: 100% of the contact links (email, LinkedIn, GitHub, repo) are present and functional.
- **SC-003**: A reader with no technical background can read the narrative section and correctly describe, afterward, that the project was planned before it was built and improved through real iteration — without needing any term explained to them first.
- **SC-004**: The page requires zero horizontal scrolling of the page body at mobile viewport widths.
- **SC-005**: The page has zero automated accessibility violations, consistent with every other route in the product.

## Assumptions

- The photo asset already exists in the project (`public/img/jonupchurchbiopicture.png`, portrait orientation) and needs no further cropping or retouching beyond the framing treatment described in FR-001.
- No phone number is included, confirmed directly with the user.
- A resume/CV download is a planned fast-follow, not part of this feature — tracked in `docs/future-work.md` rather than represented on the page in any form (no placeholder or "coming soon" control).
- The narrative section is a chronological timeline (not topic-grouped cards), confirmed directly with the user.
- External contact links (LinkedIn, GitHub, repo) open in a new tab; the email link uses a standard `mailto:` handler.
- This feature fully supersedes feature 006's placeholder "what is Fitt.d" product-description copy on `/about` — that page's purpose shifts from product description to personal bio, since the home page already carries the product pitch.
- The timeline stays to real, verifiable major milestones (project principles, each planned feature, the post-launch improvement round) rather than an exhaustive, commit-by-commit account.
