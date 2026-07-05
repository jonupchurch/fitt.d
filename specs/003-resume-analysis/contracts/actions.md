# Contracts: Resume Analysis

## `analyzeResume(resume: Resume) => Promise<Result<ResumeAnalysis>>`

A Server Action, called from the `/analyze/report` page once a `Resume`
exists (from feature 001). Reuses the `Result<T>` pattern from features
001/002.

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: AnalysisErrorCode; message: string } };

// Same error union as feature 002's analyzeJobDescription — this
// endpoint shares the rate limiter and provider layer, so it can fail
// the same ways.
type AnalysisErrorCode =
  | "rate_limited"
  | "invalid_model_output"
  | "provider_unavailable"
  | "empty_input";
```

- **Input**: a normalized `Resume` (feature 001's output).
- **Behavior**:
  1. Check the shared per-IP rate limit (same counter as
     `analyzeJobDescription` — see `research.md`); if exceeded, return
     `rate_limited`.
  2. Call the analysis prompt (`prompts/resume-analysis.v1.md`) via
     `src/lib/llm/provider.ts`, requesting output matching the
     `ResumeAnalysis` schema.
  3. Validate with `ResumeAnalysis.safeParse`; on failure, one repair
     retry; on a second failure, return `invalid_model_output`.
  4. On success, return the validated `ResumeAnalysis`.
- **Independent of `JobDescription`**: this action never reads or
  requires job-description state — spec.md FR-002.
- **Errors**: `rate_limited`, `invalid_model_output`,
  `provider_unavailable`, `empty_input`.

## Internal interface: `src/lib/llm/analyze-resume.ts`

```ts
function analyzeResume(text: string): Promise<
  { ok: true; data: ResumeAnalysis } | { ok: false; reason: "invalid_output" | "provider_error" }
>;
```

Mirrors `analyze-jd.ts`'s shape exactly (same provider wrapper, same
repair-retry loop) — the only difference is the prompt file and output
schema, per `research.md`'s "reused infrastructure" decision.
