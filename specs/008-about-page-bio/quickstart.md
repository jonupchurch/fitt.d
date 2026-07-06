# Quickstart: About Page Bio & Journey

Validation guide for this feature once implemented. See `spec.md` for
the requirements each scenario traces to.

## Prerequisites

- No new dependencies, no new environment variables — pure UI content
  built on existing `next/image`.

## Automated checks

```sh
npm run typecheck
npm run lint
npm run test:e2e     # Playwright: about-page.spec.ts, plus the existing
                     # site-chrome.spec.ts About-page tests (still valid —
                     # this feature's content has no interactive controls,
                     # so that "content-only" assertion still holds)
```

All MUST pass. No Vitest changes expected — this feature adds no
non-trivial business logic.

## Manual validation scenarios

Run `npm run dev` and check `/about` directly in the browser:

1. **Framed photo (FR-001, SC-001)**: confirm the photo appears
   upper-left, roughly 150px wide, with a white mat and a thin black
   frame around it — clean, not visually heavy.
2. **Photo/contact split (FR-002)**: confirm the photo column takes
   roughly a quarter of the page width on desktop, with the contact
   column filling the rest.
3. **Contact links (FR-003, FR-004, SC-002)**: confirm email, LinkedIn,
   GitHub, and the Fitt.d repo link are all present, labeled, and
   actually navigate correctly (external links open in a new tab); confirm
   no phone number and no resume/CV control of any kind appear anywhere
   on the page (FR-005).
4. **Mobile stacking (FR-009, SC-004)**: at a narrow viewport, confirm
   the photo and contact column stack into one legible column with no
   horizontal scrolling, and the timeline remains a legible single
   column too.
5. **Timeline content (FR-006, FR-007, FR-008, SC-003)**: read the full
   timeline and confirm it's a real chronological account (constitution
   → foundational scaffold → each MVP feature planned-then-built →
   post-launch bug-finding/fixing round → the latest features/tuning),
   written in plain, non-jargon language throughout.
6. **Accessibility (FR-010, SC-005)**: `npm run test:e2e` includes the
   existing axe check for `/about` — confirm zero violations, including
   a meaningful `alt` on the photo.
