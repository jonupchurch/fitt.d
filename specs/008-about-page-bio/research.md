# Research: About Page Bio & Journey

No `[NEEDS CLARIFICATION]` markers remained after `/speckit-specify`
(layout ratio, phone/resume exclusion, narrative structure, and
contact URLs were all resolved directly with the user before drafting
spec.md). The decisions below are the small implementation choices
worth recording.

## Photo delivery

- **Decision**: Render the photo via `next/image` with explicit
  `width`/`height` matching the source's real aspect ratio (1024:1536,
  i.e. 2:3), displayed at roughly 150px wide via CSS, not the
  component's intrinsic size.
- **Rationale**: The source file is 2.3MB — reasonable for a
  print-quality original, but far too large to ship to a browser
  displaying it at ~150px wide. `next/image` automatically resizes and
  serves a modern format (WebP/AVIF where supported) at the size
  actually rendered, with zero extra dependency or manual image
  pipeline. A plain `<img>` tag would ship the full 2.3MB to every
  visitor.
- **Alternatives considered**: Manually pre-resizing the source PNG
  and committing a second, smaller file — rejected; `next/image`
  already solves this at request time without maintaining a duplicate
  asset that could drift out of sync with the original.

## Framed-photo styling

- **Decision**: Two nested containers — an outer element with a thin
  black border, an inner element with a white background and padding
  (the "mat"), wrapping the `next/image`. Both use existing brand
  tokens (`border-ink` or similar, `bg-white`) rather than new
  one-off colors.
- **Rationale**: Matches the "framed photo" description literally
  (mat, then frame) using the same nested-border pattern already used
  elsewhere in the app (e.g., card components throughout `/analyze`
  use a white background + border treatment), rather than introducing
  a new visual language.
- **Alternatives considered**: A single element with a thick
  multi-color `box-shadow` trick to fake a mat+frame in one layer —
  rejected as a less legible, harder-to-adjust implementation for a
  simple two-layer visual the user described plainly.

## Timeline component

- **Decision**: A single presentational `Timeline` component
  (`timeline.tsx`) rendering an ordered list of entries (each with a
  title + body), with a connecting vertical line reusing the existing
  n-200/brand-strong token pattern already established for
  `wizard-progress.tsx`'s step connectors. Content lives separately in
  `timeline-data.ts` as a plain array.
- **Rationale**: Keeps the real, factual copy (which will need
  occasional edits as the project continues) separate from rendering
  logic, and reuses an existing visual pattern (connector lines,
  brand-token markers) rather than inventing new timeline-specific
  styling from scratch.
- **Alternatives considered**: Inlining the milestone copy directly in
  `page.tsx` — rejected; splitting content into its own module makes
  future edits (adding a new milestone) a content-only change, not a
  component-code change.

## Contact links

- **Decision**: A plain list of labeled `<a>` elements. External links
  (LinkedIn, GitHub, repo) use `target="_blank" rel="noopener noreferrer"`;
  the email link uses `mailto:`.
- **Rationale**: Standard, unambiguous pattern — no new dependency, no
  interactive JS needed (no "copy to clipboard" button was requested).
- **Alternatives considered**: A "copy email to clipboard" affordance
  (used elsewhere in the app, e.g. the shareable-link feature) —
  not requested for this feature; a plain `mailto:` link is the
  simpler, sufficient default per spec.md's actual FR-003 wording.
