# Prompts

Prompts are product IP, so they're treated like code: **versioned
files, not inline strings** (Constitution Principle II).

## Rules

- One file per task, named `<task>.v<N>.md`. The current version is
  the one imported by the pipeline; older versions stay for diffing
  and eval comparison.
- Each prompt declares its `model`, `temperature`, and the **output
  schema** it targets in frontmatter — the Zod schema of the same name
  (`src/lib/llm/schemas.ts`) is the source of truth for the actual
  shape; the prompt's job is to get the model to produce it.
- A behavior change is a **new version** (`v2`), never an in-place
  edit, so evals can pin a version for reproducible scoring.
- Prompts are provider-agnostic — no vendor-specific syntax. The model
  is chosen by config (`FITTD_MODEL`, a Gateway `"provider/model"`
  string), not by anything in the prompt text.

## Tasks

| File | Purpose | Output schema |
|---|---|---|
| `jd-analysis.v1.md` | Extract structured signal from a job description | `JDAnalysis` |
