# Research: Site Chrome (Header, Footer, About Page)

No `[NEEDS CLARIFICATION]` markers remained after `/speckit-specify`
(placement/behavior questions were resolved directly with the user
before drafting spec.md). The decisions below are small implementation
choices worth recording, not open unknowns.

## Where header/footer are composed

- **Decision**: Compose `<SiteHeader/>` and `<SiteFooter/>` once in
  `src/app/layout.tsx` (the root layout), wrapping `{children}`.
- **Rationale**: The root layout already wraps every route in the app,
  including `/analyze/*` (via its own nested `analyze/layout.tsx`),
  `/share`, and the new `/about`. Composing once here satisfies FR-001/
  FR-007 (every route) with zero per-route wiring and zero risk of a
  route accidentally missing the chrome.
- **Alternatives considered**: Adding the header/footer inside each
  route's own page component — rejected as pure duplication with a
  real risk of drift (a future new route forgetting to include it);
  the root layout is exactly what App Router's nesting model is for.

## How the wizard nav item's "active" state is determined across four routes

- **Decision**: A tiny pure function,
  `isWizardRoute(pathname: string): boolean`, returning
  `pathname.startsWith("/analyze")`. `SiteHeader` calls this with
  `usePathname()`'s value to decide the active-state styling for the
  single wizard nav item, and a parallel check for `pathname === "/about"`
  for the About item.
- **Rationale**: `wizard-progress.tsx` already uses direct
  `pathname === step.href` comparisons for the same kind of active-state
  styling — this reuses that established pattern, just generalized to a
  route *prefix* since one nav item now represents four routes instead
  of one. Extracting it as a named, exported function (rather than an
  inline conditional in JSX) makes it independently unit-testable per
  Constitution Principle V, and gives Phase 1 a natural seam for
  `data-model.md`-style documentation even though there's no data entity
  here — just a small pure mapping.
- **Alternatives considered**: An inline `pathname.startsWith(...)`
  check directly in `SiteHeader`'s JSX — rejected only because it would
  be untested by the letter of Principle V; the logic itself is
  identical either way. A route-group/layout-based "am I inside the
  wizard" context — rejected as unnecessary indirection for a one-line
  string check.

## Logo rendering

- **Decision**: Render the logo in the header as live text (the same
  "Fitt`.`d" wordmark pattern already used on the home page,
  `src/app/page.tsx`), at a smaller size appropriate to a header, not
  as an imported SVG asset.
- **Rationale**: `Resources/fittd-brand-guide.md`'s Logo Usage section
  states the wordmark "uses live text set in Manrope 700" — the brand
  guide's own preferred approach, and the home page already implements
  it this way (`Fitt<span className="text-brand">.</span>d`). Reusing
  the same pattern keeps one source of truth for the wordmark's markup
  instead of introducing an SVG import alongside it.
- **Alternatives considered**: Importing `Resources/fittd-logo-horizontal.svg`
  directly — rejected; the brand guide explicitly prefers live text
  when the brand font is available (it already is, via `next/font`),
  reserving the SVG files for contexts without font control (e.g. the
  app icon/favicon, already wired via `src/app/icon.svg`).

## About page content

- **Decision**: Ship the `/about` route with short, honest, on-brand
  placeholder copy (what Fitt.d is, one or two sentences, no specific
  claims that would need to be walked back) rather than lorem ipsum or
  an empty shell.
- **Rationale**: Per spec.md's Assumptions, real copy isn't provided
  yet ("to be filled in later") — but an empty or lorem-ipsum page
  would fail Principle III's "every state MUST be designed" bar and
  give the axe/Playwright checks nothing real to render against.
  Placeholder copy that's actually true (not filler nonsense) can ship
  as-is if never revisited, and is a trivial content edit later.
- **Alternatives considered**: Leaving the route unbuilt until copy is
  final — rejected; the nav item would then link to nothing, failing
  FR-004/US2 entirely.
