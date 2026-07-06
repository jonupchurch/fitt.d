# Feature Specification: Site Chrome (Header, Footer, About Page)

**Feature Branch**: `006-site-chrome`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Feature 006: Site chrome (header, footer, about page). Add a sitewide header with: the Fitt.d logo linking to the home page ("/"), a single nav item for "the wizard" that represents the whole multi-step analyze flow (/analyze/upload, /analyze/job, /analyze/report, /analyze/match) as one nav entry despite spanning multiple routes/pages, and a nav item linking to a new "/about" page. The About page is content-only (no interactive/product functionality) — copy to be filled in later. Add a sitewide footer containing a copyright notice only, for now. This header/footer must appear consistently across all routes (home, the /analyze wizard, /about, /share), without disrupting the existing wizard progress bar inside /analyze."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Get around the site from anywhere (Priority: P1)

As a visitor on any page of the product — the home page, any step of the
analyze wizard, the About page, or a shared report — I want a consistent
header with the Fitt.d logo and clear navigation, so I always know how to
get back home or jump into the product without hunting for a link or
using the browser's back button.

**Why this priority**: Without this, the site has no consistent way to
navigate except the wizard's own internal progress bar (which only
exists inside `/analyze`) and the browser back button — a visitor
landing on `/share` or `/about` has no way back into the product at all
today. This is the foundational piece everything else in this feature
builds on.

**Independent Test**: Can be fully tested by loading each of the site's
routes (home, each wizard step, About, a shared report) and confirming
the same header (logo + nav) appears on every one, with the logo
returning to the home page from anywhere.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page of the site, **When** the page
   loads, **Then** a header is visible containing the Fitt.d logo and
   navigation items for the wizard and About.
2. **Given** a visitor is on any non-home page, **When** they click the
   logo, **Then** they land on the home page.
3. **Given** a visitor is on the home page, the About page, or a shared
   report, **When** they click the wizard nav item, **Then** they enter
   the analyze wizard.
4. **Given** a visitor is on any step of the analyze wizard
   (`/analyze/upload`, `/analyze/job`, `/analyze/report`,
   `/analyze/match`), **When** they view the header, **Then** the
   single "wizard" nav item is shown as the current/active section
   (not as four separate items), and the wizard's own step-by-step
   progress bar is still visible and unaffected below the header.

---

### User Story 2 - Learn what Fitt.d is (Priority: P2)

As a visitor who wants context before (or instead of) trying the
product, I want an About page I can reach from the header, so I can
read about Fitt.d without being dropped into the analyze flow.

**Why this priority**: Secondary to being able to navigate at all
(User Story 1), but it's the one genuinely new page this feature adds,
and gives the header's second nav item somewhere real to go.

**Independent Test**: Can be fully tested by navigating to the About
page directly or via the header nav and confirming it renders
read-only content with no forms, uploads, or analysis actions.

**Acceptance Scenarios**:

1. **Given** a visitor clicks the About nav item from any page, **When**
   the About page loads, **Then** it displays informational content
   only — no file upload, text input, or analysis controls of any kind.
2. **Given** a visitor is on the About page, **When** they view the
   header, **Then** About is shown as the current/active section.

---

### User Story 3 - See who owns this (Priority: P3)

As a visitor on any page, I want a simple copyright notice in a
footer, so the site reads as a complete, real product rather than an
unfinished page.

**Why this priority**: Lowest-risk, lowest-effort piece — purely
informational, no navigation or interaction depends on it.

**Independent Test**: Can be fully tested by loading any route and
confirming a footer with a copyright notice is present.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page of the site, **When** the page
   loads, **Then** a footer is visible containing a copyright notice.

---

### Edge Cases

- What happens on the analyze wizard's own steps, where a step-level
  progress bar already exists? The sitewide header's single "wizard"
  nav item and the wizard's own internal progress bar are two
  different, non-conflicting things — the header identifies the
  section, the wizard's progress bar (existing, per feature 001)
  identifies the sub-step. Both are visible at once, header above.
- What happens if a visitor clicks the "wizard" nav item partway
  through an existing session (e.g., they've already uploaded a resume
  and started analysis)? They land on the wizard's entry point
  (`/analyze/upload`), where existing behavior already shows their
  saved resume as "ready" rather than an empty form — this feature
  does not change that existing behavior or add step-memory logic.
- What happens on narrow (mobile) viewports? The header and footer
  MUST remain legible and usable — see FR-008.
- What happens on the `/share` route, which today has no header/footer
  and is reached by a link, not by direct site navigation? It gets the
  same sitewide header/footer as every other route, per the feature
  description's explicit scope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a consistent header on every route
  in the application (home, all four analyze-wizard steps, About,
  Share) containing the Fitt.d logo and two navigation items: one
  representing the analyze wizard, one linking to the About page.
- **FR-002**: The Fitt.d logo in the header MUST link to the home page
  from every route, including the home page itself.
- **FR-003**: The wizard navigation item MUST be a single, consistent
  element regardless of which of the four analyze-wizard routes the
  visitor is currently on — it MUST NOT be rendered as four separate
  items, and MUST visually indicate that the wizard section is
  currently active whenever the visitor is on any analyze-wizard route.
- **FR-004**: The About navigation item MUST link to a new `/about`
  route and MUST visually indicate it is the active section when the
  visitor is on that route.
- **FR-005**: The existing wizard step-progress indicator (introduced
  in feature 001, extended in features 003/004) MUST continue to
  render exactly as it does today, unaffected by the new sitewide
  header.
- **FR-006**: The About page MUST be read-only/informational — it MUST
  NOT contain any resume/job-description input, file upload, or
  analysis-triggering functionality.
- **FR-007**: System MUST display a consistent footer on every route
  containing a copyright notice.
- **FR-008**: The header and footer MUST remain legible and usable at
  mobile viewport widths, consistent with the accessibility/responsive
  bar already established for the rest of the product (Constitution
  Principle III).
- **FR-009**: The header and footer MUST meet the same WCAG 2.1 AA
  accessibility bar as the rest of the product (semantic landmarks,
  keyboard operability, visible focus, AA contrast).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From any page in the product, a visitor can reach the
  home page, the analyze wizard, and the About page in a single click.
- **SC-002**: 100% of the site's routes (home, each wizard step, About,
  Share) render the same header and footer.
- **SC-003**: A visitor can correctly identify, from the header alone
  (without reading the URL), whether they are currently in the analyze
  wizard or on the About page.
- **SC-004**: The About page fully renders its content with zero
  interactive product controls present.

## Assumptions

- The wizard nav item always links to `/analyze/upload`, the wizard's
  existing entry point — it does not attempt to resume a visitor at
  whatever step they last reached. This matches how the logo's single
  destination (home) works, and keeps this feature's scope to
  navigation/chrome rather than new wizard-state-aware routing logic.
- The About page's actual copy is not yet provided (per the feature
  description, "copy to be filled in later"). This feature builds the
  route, layout, and header/footer wiring with reasonable on-brand
  placeholder copy; the real copy is a content update, not a
  follow-on feature.
- The footer's copyright notice uses the current year, computed at
  render time, and a generic "Fitt.d" attribution — no company/legal
  entity name has been specified.
- No additional footer content (links, social icons, legal pages) is
  in scope — the feature description explicitly says "copyright only,
  for now."
- The existing `/share` route (feature 005), which is reached via a
  generated link rather than site navigation, gains the same
  header/footer as every other route, per the feature description's
  explicit route list.
