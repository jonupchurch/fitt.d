<!--
Sync Impact Report
==================
Version change: 1.2.0 → 1.3.0
Modified principles:
  - VI. Legible History — added a MUST for CHANGELOG.md to be updated
    alongside every significant push, as the curated narrative layer on
    top of raw commit history.
Added sections: none
Removed sections: none
Other changes: none
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — no hardcoded principle names.
  ✅ .specify/templates/spec-template.md — still compatible.
  ✅ .specify/templates/tasks-template.md — still compatible.
Follow-up TODOs: none.
-->

# Fitt.d Constitution

## Core Principles

### I. Spec-Driven Development & Legible Architecture (NON-NEGOTIABLE)

The constitution, spec, plan, and tasks are first-class artifacts: they MUST
be committed to the repository (never gitignored) and MUST be kept genuinely
in sync with the code — not written once and abandoned. Every non-trivial
decision with a real tradeoff (data model, LLM output validation strategy,
streaming approach, auth-or-not, storage, error handling) MUST be captured
in a short Architecture Decision Record (ADR) before or alongside the code
that implements it. The README MUST read as a guided tour: problem → spec
excerpt → key architectural decisions (linking ADRs) → live demo → how to
run.

Rationale: this project's primary audience is a skeptical senior engineer
evaluating a hire. The repository — not just the running app — is the
deliverable, and the process must be visible, not asserted.

### II. Full-Stack Substance

This is a real full-stack application, not a front end calling one
endpoint. It MUST have a proper backend (route handlers / server actions),
a real data/validation layer, external API integration, and a considered
client. LLM calls MUST be server-side only and streamed to the client, with
the provider abstracted behind a small, swappable interface. All LLM output
MUST be validated against Zod schemas before use — raw model JSON is never
trusted; schemas are defined up front, and retry, partial-result, and
malformed-output handling are explicit, not implicit. Prompts MUST be
versioned files (one per task, e.g. `<task>.v<N>.md`), never inline
strings; a behavior change is a new version, never an in-place edit. The
system MUST enforce input size limits and rate limiting, and MUST degrade
gracefully when a model call fails or returns malformed output.

Rationale: architectural depth, not surface API calls, is what separates a
demo from evidence of full-stack capability.

### III. Designed, Accessible Experience

The UI MUST have a distinctive visual identity — not default Tailwind, not
stock component-library defaults. Typography, spacing, and color are
deliberate choices. Every state MUST be designed: empty, loading,
streaming, error, success, and mobile. The accessibility target is WCAG 2.1
AA — keyboard operability, visible focus, semantic landmarks/roles, and AA
contrast ratios — enforced with automated axe checks in CI; violations
block merge.

Rationale: "clean and elegant" is a claim a reviewer can only trust if it's
checkable. An automated accessibility gate makes the bar real instead of
aspirational.

### IV. Product Judgment & Scope Discipline (NON-NEGOTIABLE)

One vertical slice done excellently beats a broad, rough app — but the
slice itself is the full flow captured in the approved wireframes, not a
trimmed-down subset. The MVP is: upload or paste a resume (PDF, DOCX, or
TXT, plus raw paste) and paste a job description → JD analysis (with live
keyword-detection preview) → resume analysis (score, ATS/formatting
checks, section-by-section feedback, strengths/weaknesses, rewrite
suggestions) → gap analysis (fit score, matched/missing skills, ATS
keyword coverage) → tailoring output (rewritten bullets with one-click
apply into a working resume copy, rewritten summary, keywords,
cover-letter starter — all copyable) → a side-by-side resume↔JD comparison
view → export (report as PDF/share link; tailored resume as .docx). A
one-click "Try a sample" action MUST run a live analysis against bundled
sample resume/JD data, with no input required, so the value is provable in
seconds. Accounts/saved history, JD-by-URL fetch, and multiple resume
versions are explicitly out of scope for the MVP. The value proposition
MUST be obvious within ten seconds, with no signup required to try it.

Once `spec.md`'s MVP boundary is approved, it is frozen. Any new idea
surfaced mid-build MUST be logged to a Future Work section or ADR instead
of being implemented, unless the spec is formally amended.

Rationale: scope creep is the most common way a portfolio project stops
being "one slice, done excellently." A frozen boundary with an explicit
off-ramp for new ideas protects the demonstration this project is for.

### V. Test Discipline

Every non-trivial unit of business logic (Zod schema parsing, gap-analysis
scoring, prompt/response handling) MUST have Vitest unit tests before its
task is considered done. Tests and implementation may be written together;
strict write-order (test-before-code) is not enforced. One Playwright
happy-path end-to-end test MUST cover the full vertical slice. An eval
harness MUST score end-to-end pipeline output against a set of realistic
fixtures on schema validity, required-skill recall, no hallucinated
matches, and score plausibility, running against a deterministic fake
provider so it stays free and network-free; it MUST run in CI and fail the
build below its thresholds. GitHub Actions CI MUST run typecheck, lint,
test, and the eval suite on every push, and MUST be green before merge.

Rationale: coverage of the logic that can silently break (parsing,
scoring, LLM response handling) matters more here than ceremony around
write-order, given a solo, time-boxed build. An automated eval gate is a
rare signal in a portfolio project and is cheap once fixtures exist.

### VI. Legible History

Commits MUST use Conventional Commits prefixes (`feat`, `fix`, `docs`,
`test`, `chore`, `refactor`) and each commit MUST be one logical, atomic,
self-contained change, mapped to a `tasks.md` item where practical.
`CHANGELOG.md` at the repo root MUST be updated alongside every
significant push — a feature, a constitution amendment, a meaningful
resource or doc addition — summarizing what shipped in human-readable
terms and linking the relevant commit(s). Trivial pushes (typo fixes,
formatting) don't need an entry.

Rationale: a reviewer should be able to read `git log --oneline` and watch
the plan become code — the commit history is part of the legible-process
story from Principle I. `CHANGELOG.md` is the curated narrative layer on
top of that raw history, for a reader who wants the story without reading
every diff.

## Technology Constraints

Next.js (App Router) with TypeScript in strict mode; Tailwind CSS for
styling; npm as the package manager. A component layer may use shadcn/ui
only as a restyled base —
components MUST NOT ship at default appearance (see Principle III). The LLM
provider is Claude, called server-side only, behind the swappable interface
required by Principle II. Persistence defaults to stateless/ephemeral for
the MVP; any deviation MUST be an explicit, documented decision (an ADR),
never a silent default. The in-wizard working resume copy (edited via
"Apply" and downloadable as .docx) is session/client-scoped state, not
durable storage, and does not by itself count as a persistence deviation.

## Development Workflow

Spec Kit phases are worked in order: constitution → spec → plan → tasks →
implement. Clarifying questions are asked before each major artifact is
generated. Decisions with a real tradeoff are presented as 2–3 options with
pros/cons and a recommendation, rather than silently decided. Given the
MVP scope defined in Principle IV, tasks are sequenced into demoable
increments and sized realistically during `/speckit-plan` and
`/speckit-tasks` rather than against a fixed day-count target.

## Governance

This constitution supersedes all other project practices. Amendments
require a documented Sync Impact Report (prepended to this file) recording
the version change, modified/added/removed sections, and any templates
flagged for follow-up.

Constitution versioning follows semantic versioning:
- **MAJOR**: backward-incompatible governance or principle removals/
  redefinitions.
- **MINOR**: a new principle or section added, or materially expanded
  guidance.
- **PATCH**: clarifications, wording, or non-semantic refinements.

Every `/speckit-plan` run MUST include a Constitution Check gate against
the principles above, and every `tasks.md` MUST be traceable back to them.
Any complexity that appears to violate a principle — especially Principle
IV (Scope Discipline) — MUST be justified in the plan's Complexity
Tracking table or rejected.

The project is licensed MIT (public, reusable).

Externally-authored reference material (e.g. a scaffolding bundle of
draft ADRs, README, prompts, or evals produced outside this project's own
Spec Kit sessions) MAY be used as prior art and input to `/speckit-plan`,
but MUST NOT be imported verbatim as the committed artifact — per
Principle I, committed ADRs and the README are authored (or substantively
reconciled) through this project's own process so the "process produced
this" record stays genuine.

**Version**: 1.3.0 | **Ratified**: 2026-07-05 | **Last Amended**: 2026-07-05
