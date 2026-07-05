# Fitt.d — Status & Plan Review

**Purpose of this document:** a plain-language summary of every feature in the MVP — what it does for the person using it, why it's in scope, what we've planned to build, and what you'll actually see or be able to do once it ships. This is meant for a final sanity check before implementation starts, not a technical spec — the detailed specs, plans, and task breakdowns live in `specs/` if you ever want the full detail behind any of this.

**Where things stand:** the foundation (feature 000) is built and live. Everything else (features 001–005, which together make up the whole product) is fully planned but **not yet built** — this document describes what's about to be built, in the order it'll be built in.

---

## At a glance

| # | Feature | Status | One-liner |
|---|---|---|---|
| 000 | Project Foundation | ✅ Live | The app exists, is tested, and is deployed publicly. No product features yet. |
| 001 | Resume & Job Input | 📋 Planned | Candidate provides a resume and a job posting — or tries a live demo instantly. |
| 002 | Job Posting Analysis | 📋 Planned | The app reads the job posting and shows what it's really asking for. |
| 003 | Resume Analysis | 📋 Planned | The app grades the resume and gives section-by-section feedback. |
| 004 | Match & Tailoring | 📋 Planned | The app scores the resume-to-job match and rewrites bullets to close the gaps. |
| 005 | Comparison & Export | 📋 Planned | Candidate gets a shareable report, a tailored Word doc, and a side-by-side view. |

---

## Feature 000 — Project Foundation ✅ *Already live*

**What it is:** the underlying app, already built and deployed to the public URL (https://fittdprod.vercel.app/). There's no candidate-facing product yet — this was purely getting the plumbing right first: the site loads, it's on-brand, it's automatically tested and checked for accessibility problems on every change, and every code push automatically goes live within minutes.

**Why it mattered to do first:** so that every feature after this one is built on infrastructure that's already proven to work, instead of discovering basic problems (broken deploys, missing accessibility checks, etc.) partway through building the real product.

**What exists today:** a branded placeholder home page, and a fully automated pipeline behind the scenes (every change is tested and deployed automatically).

---

## Feature 001 — Resume & Job Description Input 📋 *Planned*

**What it does:** this is the front door. A candidate lands on the site and can either:
- Upload their resume as a PDF, Word document, or plain text file — or just paste the text in directly, and
- Paste in the job posting they're targeting (with optional job title/company fields).

There's also a **"Try a sample" button** on the home page — one click loads a realistic example resume and job posting with zero typing required, so a skeptical visitor can see the tool actually work before committing any effort of their own.

**Why it's in scope:** this is the entry point for everything else. It's also our first chance to prove the product's value within seconds (via the sample button), which matters a lot for a tool that's competing for a busy job-seeker's attention.

**What we're building:** two input screens matching the approved wireframes, with sensible guardrails — file type/size limits, clear error messages if something's wrong, and the "continue" button only becomes active once there's valid input. Nothing typed or uploaded here is ever saved to a database — it only exists in that browser tab for that session, which we call out directly in the product ("analyzed in-session, never stored") since privacy is part of the pitch.

**What you'll see when it's done:** a working upload-or-paste screen for the resume, a working paste screen for the job posting, and a one-click sample-data demo — all on-brand, all usable on mobile.

---

## Feature 002 — Job Description Analysis 📋 *Planned*

**What it does:** once a candidate pastes in a job posting, the app automatically reads it — no button to click — and within a couple of seconds shows a live preview of what it found: the required skills, the "nice to have" skills, and relevant keywords. If they keep editing the job posting text, the preview quietly updates to match.

**Why it's in scope:** this is the first real "wow, it actually understood that" moment in the product, and it's called out specifically in our product requirements as something that has to feel instant and automatic, not something the candidate has to trigger themselves.

**What we're building:** this is the first feature that actually calls an AI model (Claude) to do real analysis, so it's also where we're establishing how *every* future AI-powered feature in this product will work: the AI's answer is always checked against a strict template before we show it (so a garbled or incomplete AI response never reaches the screen), if the check fails we quietly ask the AI to try again once, and if it still fails we show a clear, friendly error rather than breaking the page. We're also putting a light rate limit in place so the feature can't be hammered or abused.

**What you'll see when it's done:** a live "here's what this job is really asking for" panel that appears automatically on the job-description screen as the candidate pastes text in.

---

## Feature 003 — Resume Analysis 📋 *Planned*

**What it does:** once a candidate's resume is in, they get a full breakdown — completely independent of any job posting:
- An overall grade/score, front and center.
- A pass/fail checklist for ATS and formatting issues (the kind of thing that silently gets a real resume rejected by hiring software).
- Section-by-section feedback (e.g., "Experience: strong," "Education: needs work," "no Skills section found").
- A clear strengths list and a weaknesses list.
- A few concrete "here's a stronger way to write this" bullet-rewrite examples — generic advice, not yet tailored to a specific job (that tailoring comes in feature 004).

**Why it's in scope:** the product's promise is value even before a candidate has a specific job in mind — this screen has to stand entirely on its own, and it's genuinely useful resume-improvement advice regardless of whether they ever paste a job posting at all.

**Note on this one:** while planning this feature we caught a small gap in our own documentation — our internal notes on what a "resume analysis" includes hadn't explicitly listed the rewrite-suggestion examples, even though both the product requirements and the approved wireframe clearly called for them. We corrected that during planning so it's accounted for properly, rather than being missed during the actual build.

**What we're building:** the same kind of AI-analysis approach as feature 002, applied to a resume instead of a job posting, plus a brand-new results screen to show all of the above.

**What you'll see when it's done:** a dedicated "your resume analysis" results page — score, ATS checklist, section feedback, strengths/weaknesses, and rewrite examples.

---

## Feature 004 — Match & Tailoring 📋 *Planned*

**What it does:** this is the payoff screen — once *both* the resume and the job posting have been analyzed, the app compares them directly and shows:
- A match percentage / fit score.
- Which skills from the job posting the resume clearly demonstrates, and which ones are missing or weak.
- Specific, prioritized advice on how to close the biggest gaps (not generic tips).

It then goes further and generates **tailored rewrite suggestions specific to this exact job**: rewritten bullet points, a rewritten professional summary, keywords to work in, and a cover-letter opening paragraph. The candidate can apply any single rewritten bullet with one click, which updates a "working copy" of their resume on the spot — the original stays untouched.

**Why it's in scope:** this is the single most anticipated moment in the whole product — the actual "will I get this job" answer, plus the tools to do something about it.

**What we're building:** two separate AI calls behind the scenes — one to score the match, one to generate the tailored rewrites. The tailored content is instructed never to invent skills, tools, or accomplishments the candidate didn't already claim — it can only reframe and re-emphasize what's genuinely there. The rewritten content also appears progressively on screen (like watching it get typed out) rather than all at once, so a few seconds of AI thinking time doesn't feel like a stall. If the candidate reaches this screen before the other two analyses have finished, they'll see a clear "still working on your resume/job analysis" message rather than an error.

**What you'll see when it's done:** the match screen — score, matched/missing skills, gap advice, and the tailored rewrite suggestions with working one-click "Apply" buttons.

---

## Feature 005 — Comparison & Export 📋 *Planned*

**What it does:** the final screen ties everything together:
- A **side-by-side view** of the resume and job posting, with matching content and job requirements visually highlighted, so the fit is obvious at a glance. On a phone, this becomes a tab-switcher instead of two side-by-side columns.
- **Export a report** as a PDF, or get a **shareable link** to send to someone else (a mentor, a friend, a recruiter) — no account needed on either end.
- **Download the tailored resume** as an actual, properly formatted Word document, reflecting whatever bullet rewrites were applied.
- A **"Try another job" shortcut** that jumps back to the job-description step and reruns the comparison, without needing to re-upload the resume.

**Why it's in scope:** this is where the product stops being "an interesting analysis" and becomes something the candidate actually walks away with and uses.

**What we're building:** this feature is deliberately lightweight on the backend — it needs no new AI calls, since everything it displays was already produced by the earlier features. The PDF export uses the browser's own "print to PDF" capability rather than a heavyweight new tool. The shareable link is designed to work without us storing anything on our servers at all: it packs just the essential summary (score, matched/missing skills) directly into the link itself — deliberately *not* the full resume or job text, both to keep the link a reasonable length and, just as importantly, because we don't want a candidate's full resume content sitting inside a URL that could end up in someone's browser history or a server log.

**What you'll see when it's done:** the completed match screen — side-by-side comparison, a working PDF export, a working shareable link, a working Word-document download, and a "try another job" button that actually resets the flow correctly.

---

## What happens next

Once you've reviewed this, implementation proceeds feature by feature, starting with 001. Each feature will be built against the plan described here (and in more detail in `specs/00X-*/`), tested, and demoed before moving to the next one — nothing here is meant to be a surprise by the time you see it working.
