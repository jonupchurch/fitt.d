# UI Microcopy

All user-facing text, in one place, in Fitt.d's voice. Principles (from the design guide): active voice, sentence case, plain verbs, one job per element. Errors explain what happened and how to fix it — they don't apologize or go vague. Empty states invite the next action. A button's verb stays the same through its whole flow ("Analyze" → "Analyzing…" → results).

Voice: direct, encouraging, concrete. We're a sharp assistant, not a hype machine.

---

## Landing / hero
- **Headline:** See how well you fit — before you hit apply.
- **Subhead:** Paste your resume and a job description. Get a fit score, the gaps that matter, and rewrites that close them.
- **Primary CTA:** Analyze my fit
- **Secondary CTA:** Try a sample
- **Privacy reassurance (under the fold / near inputs):** Your resume stays in memory for one analysis and is never stored. No account needed.

## Inputs
- **Resume label:** Your resume
- **Resume placeholder:** Paste your resume, or drop a PDF or .txt file
- **JD label:** The job description
- **JD placeholder:** Paste the full job posting
- **Sample button:** Use a sample resume + JD
- **Submit (idle):** Analyze fit
- **Submit (working):** Analyzing…

## Empty state (before first analysis)
- **Title:** Nothing analyzed yet
- **Body:** Add a resume and a job description, then run the analysis. You'll get a fit score, matched and missing skills, and tailored rewrites.
- **Nudge:** New here? Try a sample to see the whole flow in one click.

## Loading / streaming
- **Fit score (skeleton):** Scoring your fit…
- **Skills (skeleton):** Matching skills…
- **Tailoring (streaming header):** Writing your tailored rewrites…
- **Reduced-motion note (dev):** replace shimmer with a static "Working…" label when `prefers-reduced-motion`.

## Results — section labels
- **Fit score:** Your fit
- **Fit score sublabels:** Strong fit · Solid fit · Partial fit · Early fit (map to score bands, high→low)
- **Matched skills:** What lines up
- **Missing skills:** What's missing
- **Missing skill priority tags:** Must-have · Worth adding · Minor
- **Keyword coverage:** ATS keywords
- **Keyword split:** Covered · Not yet covered
- **Rationale:** Why this score
- **Tailoring:** Tailored rewrites
- **Copy button (idle):** Copy
- **Copy button (done):** Copied

## Errors (explain + fix, never apologize)
- **Resume too long:** That resume is over the 20,000-character limit. Trim it to the most relevant experience and try again.
- **JD too long:** That job description is over the limit. Paste just the posting itself, without the company's full careers page.
- **Empty input:** Add both a resume and a job description to run an analysis.
- **Unreadable file:** We couldn't read that file. Upload a PDF or .txt, or paste the text directly.
- **Model returned unusable output:** The analysis didn't come back cleanly. Run it again — if it keeps happening, the posting may be formatted in an unusual way.
- **Rate limited:** You've run several analyses in a row. Give it a minute, then try again.
- **Network / server:** The analysis didn't reach the server. Check your connection and try again.

## Success / done
- **Toast:** Analysis ready
- **High-fit celebration line (score ≥ 80):** Strong match — focus your edits on the few gaps below.
- **Low-fit encouragement (score < 45):** Early fit. The rewrites below show where to close the distance.

## Footer / trust
- **Privacy link:** How your data is handled
- **Built-by line:** Built with Spec Kit and Next.js. See how it was made →
