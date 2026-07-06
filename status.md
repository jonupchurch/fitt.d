# Fitt.d — Status & Plan Review

**Purpose of this document:** a plain-language summary of every MVP feature — what it does for the person using it, why it was in scope, what we planned to build, and what you can actually see or do now that it's shipped. Originally written as a pre-implementation sanity check; now kept as a plain-language companion to the technical specs, which live in `specs/` if you want the full detail behind any of this.

**Where things stand:** the entire MVP (features 000–005) is built, tested, and live at the URL in the README — every feature below actually works as described, not just as planned. Three more features shipped after the MVP the same disciplined way (spec → plan → tasks → implement); see [Post-MVP](#post-mvp-features-006-008) at the bottom, or [`CHANGELOG.md`](CHANGELOG.md) for the full history.

---

## At a glance

| # | Feature | Status | One-liner |
|---|---|---|---|
| 000 | Project Foundation | ✅ Shipped | The app exists, is tested, and is deployed publicly. |
| 001 | Resume & Job Input | ✅ Shipped | Candidate provides a resume and a job posting — or tries a live demo instantly. |
| 002 | Job Posting Analysis | ✅ Shipped | The app reads the job posting and shows what it's really asking for. |
| 003 | Resume Analysis | ✅ Shipped | The app grades the resume and gives section-by-section feedback. |
| 004 | Match & Tailoring | ✅ Shipped | The app scores the resume-to-job match and rewrites bullets to close the gaps. |
| 005 | Comparison & Export | ✅ Shipped | Candidate gets a shareable report, a tailored Word doc, and a side-by-side view. |

---

## Feature 000 — Project Foundation ✅ *Already live*

**What it is:** the underlying app, deployed to the public URL (https://fittdprod.vercel.app/). This step had no product features of its own — it was purely getting the plumbing right first: the site loads, it's on-brand, it's automatically tested and checked for accessibility problems on every change, and every code push automatically goes live within minutes.

**Why it mattered to do first:** so that every feature after this one is built on infrastructure that's already proven to work, instead of discovering basic problems (broken deploys, missing accessibility checks, etc.) partway through building the real product.

**What exists today:** a branded placeholder home page, and a fully automated pipeline behind the scenes (every change is tested and deployed automatically).

---

## Feature 001 — Resume & Job Description Input ✅ *Shipped*

**What it does:** this is the front door. A candidate lands on the site and can either:
- Upload their resume as a PDF, Word document, or plain text file — or just paste the text in directly, and
- Paste in the job posting they're targeting (with optional job title/company fields).

There's also a **"Try a sample" button** on the home page — one click loads a realistic example resume and job posting with zero typing required, so a skeptical visitor can see the tool actually work before committing any effort of their own.

**Why it's in scope:** this is the entry point for everything else. It's also our first chance to prove the product's value within seconds (via the sample button), which matters a lot for a tool that's competing for a busy job-seeker's attention.

**What we built:** two input screens matching the approved wireframes, with sensible guardrails — file type/size limits, clear error messages if something's wrong, and the "continue" button only becomes active once there's valid input. Nothing typed or uploaded here is ever saved to a database — it only exists in that browser tab for that session, which we call out directly in the product ("analyzed in-session, never stored") since privacy is part of the pitch.

**What you can do now:** a working upload-or-paste screen for the resume, a working paste screen for the job posting, and a one-click sample-data demo — all on-brand, all usable on mobile.

---

## Feature 002 — Job Description Analysis ✅ *Shipped*

**What it does:** once a candidate pastes in a job posting, the app automatically reads it — no button to click — and within a couple of seconds shows a live preview of what it found: the required skills, the "nice to have" skills, and relevant keywords. If they keep editing the job posting text, the preview quietly updates to match.

**Why it's in scope:** this is the first real "wow, it actually understood that" moment in the product, and it's called out specifically in our product requirements as something that has to feel instant and automatic, not something the candidate has to trigger themselves.

**What we built:** this is the first feature that actually calls an AI model (Claude) to do real analysis, so it's also where we established how *every* AI-powered feature in this product works: the AI's answer is always checked against a strict template before we show it (so a garbled or incomplete AI response never reaches the screen), if the check fails we quietly ask the AI to try again once, and if it still fails we show a clear, friendly error rather than breaking the page. There's also a light rate limit in place so the feature can't be hammered or abused.

**What you can do now:** a live "here's what this job is really asking for" panel that appears automatically on the job-description screen as the candidate pastes text in.

---

## Feature 003 — Resume Analysis ✅ *Shipped*

**What it does:** once a candidate's resume is in, they get a full breakdown — completely independent of any job posting:
- An overall grade/score, front and center.
- A pass/fail checklist for ATS and formatting issues (the kind of thing that silently gets a real resume rejected by hiring software).
- Section-by-section feedback (e.g., "Experience: strong," "Education: needs work," "no Skills section found").
- A clear strengths list and a weaknesses list.
- A few concrete "here's a stronger way to write this" bullet-rewrite examples — generic advice, not yet tailored to a specific job (that tailoring comes in feature 004).

**Why it's in scope:** the product's promise is value even before a candidate has a specific job in mind — this screen has to stand entirely on its own, and it's genuinely useful resume-improvement advice regardless of whether they ever paste a job posting at all.

**Note on this one:** while planning this feature we caught a small gap in our own documentation — our internal notes on what a "resume analysis" includes hadn't explicitly listed the rewrite-suggestion examples, even though both the product requirements and the approved wireframe clearly called for them. We corrected that during planning so it's accounted for properly, rather than being missed during the actual build.

**What we built:** the same kind of AI-analysis approach as feature 002, applied to a resume instead of a job posting, plus a brand-new results screen to show all of the above.

**What you can do now:** a dedicated "your resume analysis" results page — score, ATS checklist, section feedback, strengths/weaknesses, and rewrite examples.

---

## Feature 004 — Match & Tailoring ✅ *Shipped*

**What it does:** this is the payoff screen — once *both* the resume and the job posting have been analyzed, the app compares them directly and shows:
- A match percentage / fit score.
- Which skills from the job posting the resume clearly demonstrates, and which ones are missing or weak.
- Specific, prioritized advice on how to close the biggest gaps (not generic tips).

It then goes further and generates **tailored rewrite suggestions specific to this exact job**: rewritten bullet points, a rewritten professional summary, keywords to work in, and a cover-letter opening paragraph. The candidate can apply any single rewritten bullet with one click, which updates a "working copy" of their resume on the spot — the original stays untouched.

**Why it's in scope:** this is the single most anticipated moment in the whole product — the actual "will I get this job" answer, plus the tools to do something about it.

**What we built:** two separate AI calls behind the scenes — one to score the match, one to generate the tailored rewrites. The tailored content is instructed never to invent skills, tools, or accomplishments the candidate didn't already claim — it can only reframe and re-emphasize what's genuinely there. The rewritten content also appears progressively on screen (like watching it get typed out) rather than all at once, so a few seconds of AI thinking time doesn't feel like a stall. If the candidate reaches this screen before the other two analyses have finished, they'll see a clear "still working on your resume/job analysis" message rather than an error.

**What you can do now:** the match screen — score, matched/missing skills, gap advice, and the tailored rewrite suggestions with working one-click "Apply" buttons.

---

## Feature 005 — Comparison & Export ✅ *Shipped*

**What it does:** the final screen ties everything together:
- A **side-by-side view** of the resume and job posting, with matching content and job requirements visually highlighted, so the fit is obvious at a glance. On a phone, this becomes a tab-switcher instead of two side-by-side columns.
- **Export a report** as a PDF, or get a **shareable link** to send to someone else (a mentor, a friend, a recruiter) — no account needed on either end.
- **Download the tailored resume** as an actual, properly formatted Word document, reflecting whatever bullet rewrites were applied.
- A **"Try another job" shortcut** that jumps back to the job-description step and reruns the comparison, without needing to re-upload the resume.

**Why it's in scope:** this is where the product stops being "an interesting analysis" and becomes something the candidate actually walks away with and uses.

**What we built:** this feature is deliberately lightweight on the backend — it needs no new AI calls, since everything it displays was already produced by the earlier features. The PDF export uses the browser's own "print to PDF" capability rather than a heavyweight new tool. The shareable link is designed to work without us storing anything on our servers at all: it packs just the essential summary (score, matched/missing skills) directly into the link itself — deliberately *not* the full resume or job text, both to keep the link a reasonable length and, just as importantly, because we don't want a candidate's full resume content sitting inside a URL that could end up in someone's browser history or a server log.

**What you can do now:** the completed match screen — side-by-side comparison, a working PDF export, a working shareable link, a working Word-document download, and a "try another job" button that actually resets the flow correctly.

---

## Post-MVP features (006-008)

Once the MVP above was live, three more features shipped through the
same spec → plan → tasks → implement pipeline, plus a round of
dogfooding that found and fixed three real bugs along the way. Full
detail lives in `specs/006-*`–`specs/008-*` and
[`CHANGELOG.md`](CHANGELOG.md); in brief:

| # | Feature | Status | One-liner |
|---|---|---|---|
| 006 | Site Chrome | ✅ Shipped | A sitewide header, footer, and About-page placeholder tie every screen together. |
| 007 | Wizard Status Panel | ✅ Shipped | A persistent 4-checkpoint status panel (independent of the top progress bar), plus a "start over" reset. |
| 008 | About Page Bio & Journey | ✅ Shipped | Replaces the feature 006 placeholder with a real bio page — photo, contact links, and a plain-language timeline of how this project actually got built. |

Also since the MVP: a UX pass that hard-gated navigation until resume
analysis finishes, fixed a caching bug that silently re-ran paid model
calls on every page revisit, and swapped the default model to a
cheaper one backed by real Gateway pricing data — see `CHANGELOG.md`
for the full narrative.
