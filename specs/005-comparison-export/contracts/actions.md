# Contracts: Comparison & Export

Unlike features 002–004, this feature introduces **no Server Actions**
— everything below is either a pure client-side function or a public,
read-only page route. See `research.md` for why.

## Client utility: `src/lib/compare/highlight.ts`

```ts
function highlightMatches(
  text: string,
  terms: string[] // GapAnalysis.matchedSkills[].skill or missingSkills[].skill
): HighlightedSegment[]; // [{ text, highlighted: boolean }]
```

Pure function, no I/O — used to render both the resume and job
description panes with matched/missing terms visually distinguished.

## Client utility: `src/lib/export/build-docx.ts`

```ts
function buildTailoredResumeDocx(workingCopy: WorkingResumeCopy): Blob;
```

Runs entirely in the browser using the `docx` package; the caller
triggers a download from the returned `Blob` — no network request.

## Client utility: `src/lib/share/report-link.ts`

```ts
type ShareSummary = {
  fitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  rationale: string;
};

function encodeShareLink(summary: ShareSummary): string; // full URL, no server round-trip
function decodeShareLink(encoded: string): Result<ShareSummary>;

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: "malformed_link"; message: string } };
```

`encodeShareLink` deliberately accepts only the trimmed `ShareSummary`
shape — never raw `Resume`/`JobDescription` text — per `research.md`'s
privacy rationale.

## Route: `/share` (public, read-only)

- **Input**: the encoded payload from `encodeShareLink`, as a URL query
  parameter (e.g. `/share?d=<encoded>`).
- **Behavior**: decodes via `decodeShareLink`; on success, renders a
  read-only summary report (no edit/export actions, no session
  requirement). On `malformed_link`, renders a clear message (spec.md
  Edge Cases) rather than a raw error.
- **No authentication, no database lookup** — the entire payload lives
  in the URL.
