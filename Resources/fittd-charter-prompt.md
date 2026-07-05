# Spec Kit Starter Prompt — Resume Tailor + JD Analyzer

> **How to use this:** Fill in the `<< >>` placeholders below, then paste this into your Claude (VS Code) session at the start of your Spec Kit work — ideally right before your constitution/specify step. It's written to be handed to an AI collaborator, so it addresses "you" as that collaborator.

---

## Fill these in first

- `<<YOUR NAME>>` — Jon Upchurch
- `<<TARGET ROLE LEAN>>` — I am aiming for a job as an architect with a full-stack development focus. I want to show "hands on code" as strong as well as strong architectural experience.
- `<<PRODUCT NAME>>` — *Fitt'd*
- `<<STACK OVERRIDES>>` — "none"
- `<<LLM PROVIDER>>` — Claude in some form

---

## The prompt

I'm building a portfolio project to land a job, and I want to architect it with you using Spec Kit. Before we write any code, we're going to produce excellent Spec Kit artifacts, because **the repository itself is the deliverable** — a potential employer will read the constitution, spec, plan, tasks, and ADRs *and then* look at the code and the live site. The process being visible is the whole point.

Do not rush to implementation. Work the Spec Kit phases in order, ask me clarifying questions before generating each major artifact, and when a decision has a real tradeoff, present me 2–3 options with pros/cons and a recommendation rather than silently picking. I want the architectural reasoning to be legible in the repo.

### What this project must demonstrate (in priority order)

1. **Spec Kit discipline and sound architecture (most important).** The constitution, spec, plan, and tasks must be first-class, committed to the repo (not gitignored), and genuinely good. Every non-trivial decision with a tradeoff (data model, LLM output validation strategy, streaming approach, auth-or-not, storage, error handling) gets a short ADR. The README should read as a guided tour: problem → spec excerpt → key architectural decisions (linking ADRs) → live demo → how to run. Prefer a clean, atomic commit history that lets a reader watch the plan become code.
2. **Full-stack capability.** This is a real Next.js full-stack app: a proper backend (route handlers / server actions), a real data/validation layer, external API integration, and a considered client. Not a toy front-end calling one endpoint.
3. **Clean, elegant, visually compelling UI/UX.** A distinctive visual identity — not default Tailwind / not stock component-library defaults. Deliberate typography, spacing, and color. Every state designed: empty, loading, streaming, error, success, and mobile. Accessible (keyboard, focus, contrast, semantics). The demo should feel *designed*.
4. **Business sense — practical and clever.** The product solves a real, sharp pain and has an obvious value prop within ten seconds, no signup required to try it. Scope reflects judgment: one vertical slice done excellently over a broad, rough app.

Keep `<<TARGET ROLE LEAN>>` in mind and weight emphasis toward what that audience cares about most, while still covering all four.

### The product

`<<PRODUCT NAME>>` combines a **job-description analyzer** and a **resume tailor** into one flow. The user brings a resume and a target job description; the app tells them how well they match and helps them close the gap.

**Core flow (this is the MVP vertical slice — get this end-to-end and polished):**
1. **Input** — paste or upload a resume (start with paste + `.pdf`/`.txt`; treat `.docx` as a stretch) and paste a job description (URL fetch is a stretch).
2. **JD analysis** — extract required skills, nice-to-haves, core responsibilities, inferred seniority, key ATS keywords, and any notable signals.
3. **Resume analysis** — parse the resume into structured sections (experience, skills, etc.).
4. **Gap analysis** — a match score, matched skills, missing/weak skills, and ATS keyword coverage, presented visually and scannably.
5. **Tailoring output** — concrete, copyable suggestions: rewritten bullet points aligned to the JD, a rewritten summary, keywords to weave in, and a cover-letter starter. Everything one-click copyable.

**Explicit stretch/later (put in spec as out-of-scope-for-MVP so scoping judgment is visible):** accounts and saved history, `.docx` upload, JD-by-URL, multiple resume versions, export to PDF/Word, side-by-side diff view.

**Dogfooding angle** (call this out — it's part of the business story): I'll use this on real postings during my own job search, so the UX should reflect an actual user, and interview-wise I can say "I used this on your posting."

### Tech stack (defaults — challenge them if you disagree; apply `<<STACK OVERRIDES>>`)

- **Next.js (App Router) + TypeScript in strict mode.** Tailwind for styling. A component layer you can theme distinctively (shadcn/ui is fine as a *base* only if we restyle it so it doesn't look default).
- **LLM:** `<<LLM PROVIDER>>`, called server-side only, with **streaming** to the client. Keep the provider swappable behind a small interface.
- **Structured LLM output validated with Zod** — no trusting raw model JSON. Define schemas up front; this is a key architectural decision worth an ADR (validation, retries, partial/failure handling).
- **Persistence:** default to keeping MVP stateless/ephemeral unless we decide history is in scope — make this an explicit, documented decision, not a default.
- **Quality bar:** Vitest for unit tests (schema parsing, gap-analysis logic, prompt/response handling), one Playwright happy-path E2E, GitHub Actions CI (typecheck + lint + test), deployed to Vercel with a public URL.
- **Cost/robustness:** input size limits, rate limiting, graceful degradation when the model call fails or returns malformed output, and sensible prompt/version management.

### How I want you to work with me

- Start by asking me any clarifying questions you need, then propose the **constitution** for my review.
- Then the **spec** (with MVP vs. later clearly separated), then the **plan** (architecture, data flow, module boundaries, the tradeoff decisions each flagged for an ADR), then **tasks** sized so I can execute the vertical slice in roughly 3–5 focused days.
- Flag anything that threatens scope, and protect the "one slice, done excellently" principle over breadth.
- Assume the reader of every artifact is a skeptical senior engineer evaluating whether to hire me. Write accordingly.

Let's begin with your clarifying questions and a proposed constitution.
