# Contracts: Gap Analysis & Tailoring Output

## `analyzeGap(jdAnalysis: JDAnalysis, resumeAnalysis: ResumeAnalysis) => Promise<Result<GapAnalysis>>`

A Server Action, called from `/analyze/match` once both prerequisite
analyses exist client-side. Same `Result<T>`/error-code pattern as
features 002/003.

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: AnalysisErrorCode; message: string } };

type AnalysisErrorCode =
  | "rate_limited"
  | "invalid_model_output"
  | "provider_unavailable"
  | "missing_prerequisite"; // JDAnalysis or ResumeAnalysis not present
```

- **Behavior**: shared rate-limit check → blocking schema-validated call
  (`generateText` + `Output.object`, per `research.md`) → one repair
  retry on validation failure → return `GapAnalysis` or a typed error.
- **Errors**: `rate_limited`, `invalid_model_output`,
  `provider_unavailable`, `missing_prerequisite`.

## `tailorResume(gapAnalysis: GapAnalysis, resumeAnalysis: ResumeAnalysis, jdAnalysis: JDAnalysis) => Promise<StreamResult<TailoringOutput>>`

A Server Action returning a streaming response.

```ts
type StreamResult<T> =
  | { ok: true; stream: ReadableStream; final: Promise<Result<T>> }
  | { ok: false; error: { code: AnalysisErrorCode; message: string } };
```

- **Behavior**: shared rate-limit check → `streamText` +
  `Output.object({ schema: TailoringOutput })` (per `research.md`) →
  client renders content as it streams → once complete, the object is
  schema-validated. On validation failure, the whole streamed call
  restarts once (not a partial repair); on a second failure, `final`
  resolves to `invalid_model_output`.
- **Errors**: `rate_limited`, `invalid_model_output`,
  `provider_unavailable`.

## Internal interfaces: `src/lib/llm/analyze-gap.ts`, `src/lib/llm/tailor-resume.ts`

Mirror `analyze-jd.ts`/`analyze-resume.ts`'s shape — same provider
wrapper, same repair-retry ceiling — `tailor-resume.ts` uses the new
streamed variant of `provider.ts` introduced by this feature.

## Client-side: `src/lib/resume/working-copy.ts`

Not a Server Action — pure client state, per `research.md`.

```ts
type WorkingResumeCopy = {
  sections: ResumeAnalysis["sections"]; // mutable copy
  appliedBulletIds: string[]; // which TailoringOutput.rewrittenBullets[] entries are applied
};

function applyBullet(bulletIndex: number): void; // mutates sessionStorage-backed state
function isApplied(bulletIndex: number): boolean;
```
