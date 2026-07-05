# Feature Specification: Project Setup (Session 0)

**Feature Branch**: `000-project-setup`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Project setup and engineering infrastructure (session 0): Next.js App Router + TypeScript strict scaffold, Tailwind with Fitt.d brand tokens, Vitest, Playwright, eval harness skeleton, GitHub Actions CI, Vercel deploy, ESLint, env var scaffolding."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Verified infrastructure before feature work begins (Priority: P1)

As the developer building Fitt.d, I need a working, fully-wired application skeleton — framework, styling, tests, CI, and deployment — so that every subsequent feature (001–005) is built on infrastructure that's already proven to work, rather than discovering scaffolding problems mid-feature.

**Why this priority**: This is a single-purpose infrastructure feature and the only priority in it — it unblocks all following product work. Constitution Principle I requires committed, working artifacts from the start; if the skeleton doesn't build, test, and deploy cleanly, no later feature's plan or tasks can be trusted either.

**Independent Test**: Can be fully tested by cloning the repo fresh, running the full quality-bar command sequence (install, dev, typecheck, lint, test, test:e2e, eval, build), and confirming a green GitHub Actions run and a live Vercel URL — all with zero product features implemented yet.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repo, **When** the developer runs the install and dev commands, **Then** a Fitt.d-branded placeholder page loads locally with no errors.
2. **Given** the scaffolded project, **When** the developer runs typecheck, lint, unit test, e2e test, and eval commands, **Then** all five complete successfully.
3. **Given** a push to the repository, **When** the CI workflow runs, **Then** typecheck, lint, unit test, and eval all complete and the run is reported green.
4. **Given** the repository connected to a deployment provider, **When** a push lands on the main branch, **Then** the app deploys and is reachable at a public URL.
5. **Given** the placeholder home route, **When** it renders, **Then** it uses the Fitt.d brand tokens (brand typography and color palette) rather than framework/component-library defaults.

---

### Edge Cases

- What happens when the eval command runs with zero fixtures present (true at this stage, since no product feature has added any yet)? It MUST exit successfully as a no-op, not fail the build.
- What happens when a required runtime environment variable (e.g. the model provider API key) is missing at build time? The build MUST still succeed, since no feature calls the model yet — the variable is only needed once a feature that uses it exists.
- What happens if the deployment provider hasn't been connected yet by the time this feature's other work is otherwise complete? The repository MUST still be deploy-ready (correct build output, no provider-specific code missing); connecting the actual deployment project is a one-time manual account-linking step, not a code deliverable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST be a web application using a modern React framework with file-based routing, written in TypeScript with strict type-checking enabled.
- **FR-002**: The project MUST use a single, consistently-documented package manager, with a committed lockfile.
- **FR-003**: The project MUST include a utility-first CSS system configured with the Fitt.d brand design tokens (color palette, typography) as first-class theme values, not left at framework defaults.
- **FR-004**: The project MUST render a placeholder home route using the brand tokens, proving the design system is wired end-to-end before any real feature UI exists.
- **FR-005**: The project MUST include a unit-testing framework, with at least one passing smoke test.
- **FR-006**: The project MUST include an end-to-end testing framework, with at least one passing smoke test that loads the placeholder home route.
- **FR-007**: The project MUST include an evaluation-harness skeleton (runner, scoring module, fixtures location) that runs via a single command and exits successfully when zero fixtures are present.
- **FR-008**: The project MUST include a continuous-integration workflow that runs typecheck, lint, unit tests, and the eval command on every push, and fails the build if any step fails.
- **FR-009**: The project MUST be connected to a deployment provider such that pushes to the main branch produce a live deployment at a public URL.
- **FR-010**: The project MUST include linting configuration enforcing the strict-mode type-checking quality bar.
- **FR-011**: The project MUST include an example environment-variable file documenting every variable the MVP is already known to need (model provider credential, model selection, input-size limits, rate limit, usage-logging flag), without committing real secret values.
- **FR-012**: The project MUST define standard scripts for running the app in development, building it for production, and running each quality-bar check (typecheck, lint, unit test, e2e test, eval) individually.
- **FR-013**: The project MUST NOT include product-specific business logic (model-provider interface, output-validation schemas, analysis pipeline code) or any authentication system — those are explicitly out of scope for this feature.
- **FR-014**: The continuous-integration workflow MUST include an automated accessibility check against the placeholder route and fail the build on violations, so the accessibility gate exists from the first commit rather than being retrofitted once real UI exists.

### Key Entities

*(None — this is an infrastructure feature with no product data entities. See `docs/data-model.md` for the entities introduced by features 001–005.)*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can go from a fresh clone to a running local dev server in under 5 minutes, with zero manual configuration beyond installing dependencies and copying the example environment file.
- **SC-002**: All quality-bar checks (typecheck, lint, unit test, e2e test, eval, accessibility) complete successfully on the scaffolded project with zero product features implemented.
- **SC-003**: Every push to the repository produces a pass/fail CI result with no manual step required to trigger it.
- **SC-004**: The application is reachable at a public URL within minutes of a push to the main branch, with no manual deploy step required per push (initial provider connection is a one-time setup action).

## Assumptions

- Node.js version: the latest active LTS release at setup time, pinned in the project so all environments (local, CI) match.
- Component-library installation/restyling (e.g. shadcn/ui) is deferred to the features that need actual UI components (001+); this feature only establishes the design tokens those components will consume.
- Connecting the deployment provider to the repository is a one-time manual step performed by the account owner; this feature's deliverable is a repository that is deploy-ready, not the act of account linking itself.
- The eval harness has no real fixtures yet (those arrive with features 004/005); its skeleton is considered successful if it runs and exits cleanly with zero fixtures.
- No environment secrets are committed; the example environment file documents variable names and shapes only.
- Per the ratified constitution, the framework is Next.js (App Router), the package manager is npm, the unit/e2e frameworks are Vitest/Playwright, CI runs on GitHub Actions, and the deployment provider is Vercel — this spec states requirements in technology-agnostic terms per Spec Kit convention, but these specific choices are already committed decisions, not open questions for `/speckit-plan`.
