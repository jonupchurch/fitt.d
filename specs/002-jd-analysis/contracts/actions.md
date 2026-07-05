# Contracts: JD Analysis

## `analyzeJobDescription(jobDescription: JobDescription) => Promise<Result<JDAnalysis>>`

A Server Action, called from the `/analyze/job` client component. Reuses
the `Result<T>` / error-code pattern established in feature 001
(`specs/001-resume-jd-input/contracts/actions.md`), extended with
analysis-specific error codes.

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: AnalysisErrorCode; message: string } };

type AnalysisErrorCode =
  | "rate_limited"
  | "invalid_model_output"   // failed schema validation, retry exhausted
  | "provider_unavailable"   // network/provider error
  | "empty_input";
```

- **Input**: a normalized `JobDescription` (feature 001's output — this
  action does not re-validate its shape, only that it's non-empty).
- **Behavior**:
  1. Check the per-IP rate limit (`docs/non-functional.md`); if
     exceeded, return `rate_limited` immediately without calling the
     model.
  2. Call the analysis prompt (`prompts/jd-analysis.v1.md`) via the
     provider layer (`src/lib/llm/analyze-jd.ts`), requesting output
     matching the `JDAnalysis` schema.
  3. Validate the result with `JDAnalysis.safeParse`. On failure, retry
     once, feeding the validation error back to the model. On a second
     failure, return `invalid_model_output`.
  4. On success, return the validated `JDAnalysis`.
- **Called repeatedly**: per spec.md FR-004, this action is called again
  — debounced client-side, not on every keystroke — whenever the
  candidate materially changes the pasted job description after a prior
  call. Each call is independent; there is no cross-call state on the
  server (Technology Constraints: stateless/ephemeral).
- **Errors**: `rate_limited`, `invalid_model_output`,
  `provider_unavailable`, `empty_input`.

## Internal interface: `src/lib/llm/analyze-jd.ts`

Not exposed to the client directly — this is the "small, swappable
interface" Constitution Principle II requires between application logic
and the model provider, so the Server Action above stays provider-
agnostic.

```ts
function analyzeJobDescription(text: string): Promise<
  { ok: true; data: JDAnalysis } | { ok: false; reason: "invalid_output" | "provider_error" }
>;
```

Internally wraps the AI SDK's Gateway-routed structured-generation call
(model string from `FITTD_MODEL`) plus the one-retry repair loop from
`research.md`. Swapping providers/models is a `FITTD_MODEL`/Gateway
config change, not a call-site change, satisfying FR-010.
