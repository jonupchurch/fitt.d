# Fitt'd — Design Input Worksheet

> Fill in whatever you can, in any order. `TBD` / "you pick" is a valid
> answer — flag those explicitly so I know it's an open decision rather
> than an oversight. Concrete references (hex codes, links, screenshots,
> font names) are worth more than adjectives; add both where you can.
>
> This feeds the UI/UX side of the spec and plan (Constitution Principle
> III: distinctive, accessible, every state designed). It's separate from
> your sitemap/wireframes and the extensive prompt — link those here if
> useful, but this doc is about the *visual and interaction language*,
> not the *screens*.

---

## 1. Brand personality

- Three to five adjectives this should feel like (e.g. "precise, warm,
  a little irreverent" vs. "corporate, trustworthy, calm"):
  Corporate, elegant, clam, engaging
- Adjectives it should explicitly NOT feel like (e.g. "not corporate SaaS
  blue", "not gamified/cutesy"):
  Campy, cheesy, not cutesy
- Closest comparison products/brands for overall feel (doesn't have to be
  software — could be an app, a magazine, a physical product):
  TBD
- Is there an existing personal brand (your portfolio site, resume design,
  LinkedIn banner, etc.) this should visually align with, or is Fitt'd free
  to have its own identity?
  review other documents in this folder for additional info, aside from that we're free to experiment

## 2. Color

Instead of answering these questions, I have some output from another claude I used to seed this, here it is:

 --brand: #08B6D0;
  --brand-strong: #0C7383;
  --ink: #0B1F2A;
  --coral: #FF6F61;
  --bg: #FFFFFF;
  --bg-subtle: #F7F9FA;
  --surface: #FFFFFF;
  --border: #DFE6E9;
  --text: #0B1F2A;
  --text-muted: #515D63;
  --focus: #08B6D0;
The brand guide document has extensive design guidelines


## 3. Typography

Same here, I have info from another document

Wordmark / display: Manrope, 700–800, tight tracking (~-2%). Geometric, modern, professional.
Body / UI: Inter (or system-ui fallback).
Data / mono: system monospace (ui-monospace) for scores, keywords, JSON previews.

## 4. Layout & shape language

For all of these, see the wireframes doc html file

## 5. Components & UI style direction

- Overall style lane (pick one or describe your own): minimal/clean,
  brutalist/raw, glassmorphic, neumorphic, editorial/magazine, dense
  data-tool, playful/rounded:
  Professional, clean, somewhat minimal but visually engaging
- Is shadcn/ui (restyled per the constitution) an acceptable base, or do
  you want something more custom/from-scratch for key surfaces?
  Unsure
- Any specific component behaviors you already know you want (e.g. sticky
  score/summary panel, side-by-side JD/resume view, a specific way the
  gap analysis is visualized — bars, radar chart, badges)?
  No, we can iterate on this

## 6. Iconography & imagery

- Icon set preference (Lucide, Heroicons, Phosphor, custom, no strong
  preference):
  no preference
- Illustration style for empty states, if any (line art, abstract shapes,
  none — text-only empty states, something else):
  Line art and/or abstract shapes
- Any use of photography/avatars, or is this a purely UI/typography-driven
  product with no imagery?
  Avatars if we do login, though those will come from the sso provider (google, github, etc)

## 7. Motion & interaction

- Overall motion intensity: none/instant, subtle micro-interactions,
  expressive/animated:
  Subtle interactions
- How should the LLM streaming output feel while it's generating (e.g.
  typewriter/token-by-token reveal, skeleton then fade-in, progress bar,
  something else)?
  Skeleton then fade in
- Any preferred animation approach (CSS-only, Framer Motion, no
  preference — I'll choose based on the plan)?
  Choose based on the plan

## 8. Voice & microcopy tone

- Overall copy tone: warm and encouraging, direct and efficient, witty/
  playful, formal/professional:
  Direct and efficient
- How should error states "talk" to the user (apologetic, matter-of-fact,
  reassuring-with-next-step)?
  matter of fact
- Any specific phrases, taglines, or in-voice examples you already have in
  mind (even rough ones)?
  No

## 9. Reference inspiration

- Sites/apps whose look-and-feel you'd point to as "more like this"
  (links welcome):
  **Answer:**
- Sites/apps that represent what to actively avoid looking like (e.g.
  "generic AI-wrapper SaaS landing page"):
  **Answer:** generic AI-wrapper SaaS landing page
- Any mood board, Pinterest, Figma, or screenshot references you're
  collecting? Link or note location here:
  **Answer:** The files in the ./Resources folder for sure. I'm trying to provide as robust a starting point as possible

## 10. Accessibility & responsiveness priorities

- Beyond the WCAG 2.1 AA baseline already in the constitution, any
  specific accessibility priorities (e.g. large touch targets, reduced-
  motion support, high-contrast mode)?
  **Answer:**
- Primary device/context you expect real usage in (desktop while actively
  job-hunting, mobile-casual, evenly split)? This affects what gets
  polished first.
  **Answer:**

## 11. Naming, logo & wordmark

- How should "Fitt'd" be styled/treated (e.g. lowercase "fitt'd", the
  apostrophe rendered a specific way, a wordmark vs. plain text logo)?
  **Answer:** see the doc files (svg) in the resources folder
- Do you have (or want) an actual logo/favicon, or should the identity be
  purely typographic for now?
  **Answer:** ./Resources/fittd-icon.svg

## 12. Linked resources

- Sitemap doc/link:
  **Answer:** ./Resources/Resume Analyzer Wireframes
- Wireframes doc/link:
  **Answer:** ./Resources/Resume Analyzer Wireframes
- The "extensive prompt" you mentioned — link or note it here if it lives
  outside this repo:
  **Answer:** ./Resources/fittd-charter-prompt

## 13. Anything else

- Anything not covered above that you already know you want or don't
  want:
  **Answer:** no
