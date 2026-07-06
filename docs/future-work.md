# Future Work

Ideas that surfaced during a feature's build but are out of that
feature's (or the MVP's) frozen scope. Per Constitution Principle IV,
a new idea found mid-build gets logged here instead of implemented on
the spot — this is the list to work from once the core MVP (features
000–005) is complete, not a queue to pull from early.

Each entry: what it is, which feature it came up during, and why it
was deferred rather than folded in.

## Downloadable resume/CV on the About page

Surfaced during: feature 008 (About Page Bio & Journey), 2026-07-06.

The About page's contact column lists email/LinkedIn/GitHub/repo
links, but no way to download an actual resume/CV document. Explicitly
scoped out of feature 008 (spec.md FR-005) — the page ships with no
placeholder or "coming soon" control for it at all, rather than a
broken or disabled button.

Deferred rather than built now: needs an actual resume file to link to
(and a decision on format — PDF vs. the app's own `.docx` tailoring
output), neither of which existed yet when feature 008 shipped.

## ~~Block progression until resume analysis finishes~~ — Resolved 2026-07-06

Surfaced during: post-MVP dogfooding of the full flow (all of
000–005 live), 2026-07-06.

Uploading a resume kicked off its analysis (feature 003) in the
background, but the wizard let the candidate move straight on to the
job-description step before that analysis had finished, surfacing the
wait later at the match screen instead of up front.

What shipped: `specs/003-resume-analysis/spec.md` FR-011 was amended
(see `docs/adr/0009-block-navigation-until-resume-analysis-completes.md`)
to hard-gate navigation — uploading now lands on `/analyze/report`
directly, and the "Job desc."/"fitt.d" progress-bar steps and direct
navigation to `/analyze/job` or `/analyze/match` are blocked (bounced
back to the analysis screen) until the analysis resolves, success or
failure. A failed analysis now shows its own "Continue to job
description" CTA so it isn't a dead end.

## ~~Clearer analysis-status signal + next-step CTA after JD input~~ — Resolved 2026-07-06

Surfaced during: post-MVP dogfooding of the full flow (all of
000–005 live), 2026-07-06.

After a candidate saved their job description, the "Job description
ready" screen (`src/app/analyze/job/page.tsx`) confirmed the JD was
captured but didn't make clear it was actually *analyzed*, or what to
do next; the progress bar's "Match" step also showed done as soon as
both analyses existed, not once the fit was actually viewed.

What shipped: the wizard progress bar's steps were renamed to
"Resume analyzed" and "fitt.d" (from "Analysis"/"Match"), with "Resume
analyzed" now tied to the analysis actually resolving rather than just
a resume existing. The JD "ready" screen's stale copy ("Analysis and
matching land in the next features...") was replaced with accurate
copy plus an explicit "Next: see your fitt.d match →" CTA. "fitt.d"'s
checkmark still means "ready to view," not "already viewed" — a true
"fit actually computed" signal would need `GapAnalysis` persisted to
wizard state, which wasn't in scope here; noted as a possible future
follow-up if it comes up again.

## ~~Edit/replace resume and job description mid-flow~~ — Resolved 2026-07-05

Surfaced during: feature 001 (Resume & JD Input), post-implementation.
Resolved during feature 002's implementation once it became a real
blocker (the sample-JD "stuck" state) rather than a hypothetical.

What shipped: both `/analyze/upload` and `/analyze/job` now show a
"ready" summary with an explicit "Replace resume" / "Change job
description" button once a value is saved, reopening the form
(pre-filled with the current value for the JD; the resume form starts
blank since raw files aren't retained) with a "Cancel" option to back
out without resubmitting. The wizard progress bar's steps were also
made into real clickable links (they were rendered but never wired to
navigate — a leftover gap from feature 001), so moving between Upload
and Job desc. no longer requires re-submitting a step to advance past
it. Feature 005's "Try another job" reset is still a separate,
additional mechanic (resets JD-side analysis state specifically) and
remains planned as before.
