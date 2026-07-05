# Fitt.d

**Paste a resume and a job description. See exactly how well you fit — and get the rewrites to close the gap.**

🔗 **Live:** https://fittdprod.vercel.app/ (currently the session-0 placeholder — the real product ships as features 001–005 are implemented) · 📋 **[Plan review](status.md)** · 📐 **[Specs](specs/)**

> Built as a portfolio project to demonstrate spec-driven architecture, full-stack Next.js/TypeScript with a real AI pipeline, and product judgment. The repo is meant to be *read*, not just run — the constitution, specs, plans, and (once implementation starts) ADRs are as much the deliverable as the running app.

---

## The problem

Applicants guess at whether they're a fit for a role and rewrite their resume blind. Fitt.d turns that into a measured, guided flow: analyze the job description, analyze the resume, quantify the gap, and generate tailored, copy-ready rewrites — in one session, no signup, nothing saved.

## How it works

1. **Bring inputs** — upload or paste a resume (PDF/DOCX/TXT), paste a job description. Or hit "Try a sample" for an instant, zero-input demo.
2. **Job description analysis** — required vs. nice-to-have skills, responsibilities, inferred seniority, ATS keywords — shown live while pasting.
3. **Resume analysis** — an overall score, ATS/formatting checks, section-by-section feedback, strengths/weaknesses, and rewrite suggestions. Useful on its own, no job description required.
4. **Match & tailor** — a fit score, matched/missing skills, gap-closing advice, and tailored bullet/summary/cover-letter rewrites, with one-click apply into a working copy of the resume.
5. **Compare & export** — a side-by-side resume↔JD view, a shareable report link, and a downloadable tailored `.docx`.

## Project status

- **Feature 000 (project foundation)** — done and live: Next.js app, branded placeholder, full test/CI/deploy pipeline.
- **Features 001–005 (the product above)** — fully specified, planned, and tasked, not yet implemented. See [`status.md`](status.md) for a plain-language walkthrough of each, or [`specs/`](specs/) for the full spec/plan/tasks behind them.

## Tech stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · Zod · Vercel AI SDK / AI Gateway (Claude, swappable) · Vitest · Playwright · GitHub Actions · Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in your model provider credentials
npm run dev
```

## Testing & quality

```bash
npm run typecheck && npm run lint && npm run test   # unit
npm run test:e2e                                     # Playwright happy path
npm run eval                                         # score AI output against fixtures
```

GitHub Actions (`.github/workflows/ci.yml`) runs typecheck, lint, unit tests, eval, and an automated accessibility check on every push.

## Architecture decisions

Every non-trivial tradeoff gets a short ADR in [`docs/adr/`](docs/adr) — captured before or alongside the code that implements it, not after the fact. That directory is currently just the index and template; real entries land as each feature is implemented (the reasoning already locked in during planning lives in each feature's `specs/00X-*/research.md` in the meantime).

## Privacy

Stateless and ephemeral by design — resumes and job descriptions are analyzed in memory for the current session only; nothing is written to a database, and there are no accounts. See [`docs/non-functional.md`](docs/non-functional.md).

## License

MIT.
