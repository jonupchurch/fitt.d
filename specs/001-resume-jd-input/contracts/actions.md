# Contracts: Server Actions

This feature's only external interface is a small set of Next.js Server
Actions called from the `/analyze` wizard's client components. All three
return the same `Result<T>` shape so callers (this feature's UI, and
later features reading the accepted `Resume`/`JobDescription`) handle
success/failure uniformly.

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: InputErrorCode; message: string } };

type InputErrorCode =
  | "unsupported_file_type"
  | "file_too_large"
  | "unparseable_file"
  | "text_too_long"
  | "empty_input"
  | "sample_fixture_unavailable";
```

## `submitResume(input: FormData) => Promise<Result<Resume>>`

- **Input**: either a `file` field (PDF/DOCX/TXT, ≤ 5MB) or a `text`
  field (pasted resume text). Exactly one is expected.
- **Behavior**: validates format/size (file path) or presence/length
  (text path) against `docs/non-functional.md` budgets, extracts plain
  text for PDF/DOCX via the libraries chosen in `research.md`, and
  returns a normalized `Resume` (shape: `docs/data-model.md`) on
  success.
- **Errors**: `unsupported_file_type`, `file_too_large`,
  `unparseable_file`, `text_too_long`, `empty_input`.

## `submitJobDescription(input: FormData) => Promise<Result<JobDescription>>`

- **Input**: `text` field (pasted job description), optional `title`
  and `company` fields.
- **Behavior**: validates presence/length against
  `docs/non-functional.md`'s job-description budget, returns a
  normalized `JobDescription` on success.
- **Errors**: `text_too_long`, `empty_input`.

## `loadSampleFixture() => Promise<Result<{ resume: Resume; jobDescription: JobDescription }>>`

- **Input**: none — this is the "Try a sample" one-click action.
- **Behavior**: reads the bundled sample fixture (`evals/fixtures/`)
  and returns its `resume`/`jobDescription` content already normalized,
  identical in shape to what `submitResume`/`submitJobDescription`
  would produce (FR-008).
- **Errors**: `sample_fixture_unavailable` (fixture missing/corrupt at
  build time — should not happen in practice, but must degrade to a
  typed error rather than a crash, per the Edge Cases in `spec.md`).
