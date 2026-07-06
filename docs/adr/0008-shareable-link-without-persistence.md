# ADR-0008: Shareable report link as a URL-encoded trimmed summary, no server-side storage

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Jon Upchurch

## Context

Spec.md FR-004/FR-005 require a shareable link that a third party can
open without an account and without the original candidate's session
being active — while FR-010 and the Constitution's Technology
Constraints require exports to introduce no new durable server-side
storage of resume/JD/analysis content. A link that's viewable by
anyone, with no session, naturally implies *some* persistence unless
the payload itself carries everything needed to render the view.

## Decision

`encodeShareLink()`/`decodeShareLink()`
(`src/lib/share/report-link.ts`) encode a **trimmed summary** —
`fitScore`, `matchedSkills[]`, `missingSkills[]` (names only, not
evidence/priority detail), and `rationale` — as compact JSON,
base64url-encoded directly into the URL's `d` query parameter. The
public `/share` route (a Server Component) decodes and renders it
read-only. There is no database row per share, no share ID, no
lookup — the entire payload lives in the link itself.

The base64url codec is hand-rolled from `TextEncoder`/`TextDecoder` and
a manual bit-packing loop, deliberately avoiding both `btoa`/`atob`
(browser-only) and `Buffer` (not guaranteed identical across the
browser bundle and Node), since `decodeShareLink` must run correctly
in both the client (`encodeShareLink`, called from `/analyze/match`)
and the server (`/share`'s Server Component, which decodes at request
time with no client JS required for the read path).

## Alternatives considered

- **A database row keyed by a short share ID** — rejected. The
  Constitution's Technology Constraints treat persistence as an
  explicit, ADR-documented deviation from the project's stateless/
  ephemeral default, and nothing about this requirement justifies
  taking on a database for one feature of a portfolio MVP.
- **Encoding the full report, including raw resume/JD text** —
  rejected on privacy grounds, not just size. URLs get logged in
  browser history, server access logs, and `Referer` headers; encoding
  a candidate's actual resume/JD content into one would leak
  considerably more than a candidate sharing a *score summary* likely
  intends. Trimming to score + skill names + rationale keeps the
  shared surface intentionally narrow.
- **`btoa`/`atob` with the classic `unescape(encodeURIComponent(...))`
  UTF-8 workaround** — rejected; those are browser-only globals, and
  `/share`'s Server Component needs to decode server-side too. A
  `Buffer`-based encoder was also considered and rejected for the same
  cross-environment reason — bundler behavior for `Buffer` in
  browser-targeted code isn't as reliably universal as `TextEncoder`/
  `TextDecoder`, which are standard in both environments.

## Consequences

Share links have no expiry, revocation, or access-tracking mechanism —
by design, since there's no server-side record to revoke against; the
link *is* the data. This also means a candidate cannot "unshare" a link
once distributed (mitigated by only ever encoding the trimmed summary,
never raw resume/JD text). Payload size is self-limiting: `research.md`
notes that if a future summary shape risks exceeding a safe URL length,
the fix is trimming the payload further, not introducing server-side
storage as a silent persistence deviation.
