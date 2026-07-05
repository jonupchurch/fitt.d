# Future Work

Ideas that surfaced during a feature's build but are out of that
feature's (or the MVP's) frozen scope. Per Constitution Principle IV,
a new idea found mid-build gets logged here instead of implemented on
the spot — this is the list to work from once the core MVP (features
000–005) is complete, not a queue to pull from early.

Each entry: what it is, which feature it came up during, and why it
was deferred rather than folded in.

## Edit/replace resume and job description mid-flow

Surfaced during: feature 001 (Resume & JD Input), post-implementation.

Right now `/analyze/upload` always shows the empty form regardless of
whether a resume already exists in session — resubmitting silently
overwrites it, with no confirmation or indication. `/analyze/job` does
the opposite: once a job description is submitted, the page locks into
a read-only "ready" state with no way to go back and edit or replace
it.

**Why deferred**: feature 001's spec scoped a forward-only entry flow;
editing/replacing wasn't a stated requirement. Feature 005 already
plans a scoped reset ("Try another job" — clears job-description-side
state while preserving the resume, its analysis, and any applied
tailored edits), which may cover most of the real need. Revisit once
the core MVP is built: decide whether a lighter, symmetric "replace"
affordance on both input screens is still wanted independently of
feature 005's reset, or whether that reset is sufficient on its own.
