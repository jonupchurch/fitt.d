# Future Work

Ideas that surfaced during a feature's build but are out of that
feature's (or the MVP's) frozen scope. Per Constitution Principle IV,
a new idea found mid-build gets logged here instead of implemented on
the spot — this is the list to work from once the core MVP (features
000–005) is complete, not a queue to pull from early.

Each entry: what it is, which feature it came up during, and why it
was deferred rather than folded in.

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
