# Fitt.d — Brand & Color System

Working brand for **Fitt.d**, a resume-tailoring / JD-matching app. Direction: clean, professional, trustworthy SaaS. Cyan is the brand spark; a deep ink grounds it for readability; a warm coral is the sparing accent (scores, key moments). The "." in *Fitt.d* is the brand motif — a small cyan dot that recurs as the icon accent and as active/selected states.

---

## Palette

### Cyan — primary / brand
| Token | Hex | Use |
|---|---|---|
| cyan-50 | `#E6FAFD` | tints, hover backgrounds |
| cyan-100 | `#C3F2F9` | subtle fills, badges |
| cyan-200 | `#8FE7F1` | borders on dark, chart fills |
| cyan-300 | `#52D6E6` | decorative, gradients |
| cyan-400 | `#1FC2D6` | bright accents |
| **cyan-500** | **`#08B6D0`** | **brand color, highlights, focus rings** |
| cyan-600 | `#0A8FA6` | hover on bright cyan |
| cyan-700 | `#0C7383` | **solid buttons w/ white text (AA-safe)** |
| cyan-800 | `#105C69` | pressed states |
| cyan-900 | `#124B56` | deep accents on light |

### Ink — secondary 1 (text + dark surfaces)
| Token | Hex | Use |
|---|---|---|
| **ink** | **`#0B1F2A`** | **primary text, headings, dark hero/footer** |
| ink-700 | `#1B3743` | dark surface layering |
| ink-600 | `#2E4753` | borders on dark |

### Coral — secondary 2 (warm accent)
| Token | Hex | Use |
|---|---|---|
| coral-400 | `#FF8A7E` | soft highlight |
| **coral-500** | **`#FF6F61`** | **accent: emphasis, key CTA, low-score end of gauge** |
| coral-600 | `#E85A4C` | coral text on light (better contrast) |

### Neutrals — slate ramp
| Token | Hex | Use |
|---|---|---|
| n-50 | `#F7F9FA` | page background (subtle) |
| n-100 | `#EEF2F4` | muted surfaces, hover rows |
| n-200 | `#DFE6E9` | default borders / dividers |
| n-300 | `#C7D0D4` | strong borders, disabled |
| n-400 | `#9DA9AE` | placeholder text, icons-muted |
| n-500 | `#717D83` | subtle text |
| n-600 | `#515D63` | secondary/body-muted text |
| n-700 | `#3A454B` | strong secondary text |
| n-800 | `#232D33` | near-ink surfaces |
| n-900 | `#0F1A20` | deepest neutral |

---

## Semantic mapping (what to actually wire up)

| Role | Value |
|---|---|
| Background | `#FFFFFF` (base) / `#F7F9FA` (subtle) |
| Surface / card | `#FFFFFF`, border `#DFE6E9` |
| Text | `#0B1F2A` (ink) |
| Text muted | `#515D63` |
| Text subtle | `#717D83` |
| Border | `#DFE6E9`, strong `#C7D0D4` |
| Brand / link / focus ring | `#08B6D0` |
| **Primary button (solid)** | bg `#0C7383`, text `#FFFFFF` — *or* ink `#0B1F2A` bg with cyan hover |
| Primary button hover | `#105C69` |
| Accent (sparing) | `#FF6F61`, text-on-light `#E85A4C` |
| Success | `#12B886` |
| Warning | `#F5A524` |
| Danger | `#E5484D` |

### One deliberate contrast rule
Bright cyan `#08B6D0` is **light** — white text on it fails WCAG AA. So: use **cyan-500 for accents, fills, focus rings, and highlights paired with ink text**, and use **cyan-700 `#0C7383`** (or ink) for **solid buttons that carry white text**. This is a defensible design-system decision worth a one-line note in your README / an ADR — it demonstrates UX judgment, not just taste.

### Match-score gauge (brand-specific)
The core "how well do you fit?" number reads naturally as coral → cyan:
`#E5484D` (poor) → `#FF6F61` → `#F5A524` → `#12B886` → `#08B6D0` (great).
Or a simpler two-stop for minimal UI: `#FF6F61` (low) → `#08B6D0` (high).

---

## Typography
- **Wordmark / display:** Manrope, 700–800, tight tracking (~-2%). Geometric, modern, professional.
- **Body / UI:** Inter (or system-ui fallback).
- **Data / mono:** system monospace (`ui-monospace`) for scores, keywords, JSON previews.

---

## Logo usage
- **Files:** `fittd-logo-horizontal.svg` (primary), `fittd-logo-reversed.svg` (dark backgrounds), `fittd-icon.svg` (app tile / favicon source).
- **Clear space:** keep at least the height of the icon's corner radius clear on all sides.
- **Min size:** icon no smaller than 24px; horizontal lockup no smaller than ~120px wide.
- **Don't:** recolor the wordmark outside ink/white, stretch, add shadows, or place the color icon on a busy photo without a solid backing.
- **The dot** (`#08B6D0` on light, `#12C6DE` on dark) is the one fixed brand element — keep it.
- The wordmark uses live text set in **Manrope 700**. Install/host Manrope so it renders identically; otherwise outline it to paths before shipping.

---

## Paste-ready tokens

### Tailwind v4 (`@theme` in your CSS)
```css
@theme {
  --color-brand: #08B6D0;
  --color-brand-strong: #0C7383;
  --color-brand-hover: #105C69;

  --color-cyan-50: #E6FAFD;
  --color-cyan-100: #C3F2F9;
  --color-cyan-200: #8FE7F1;
  --color-cyan-300: #52D6E6;
  --color-cyan-400: #1FC2D6;
  --color-cyan-500: #08B6D0;
  --color-cyan-600: #0A8FA6;
  --color-cyan-700: #0C7383;
  --color-cyan-800: #105C69;
  --color-cyan-900: #124B56;

  --color-ink: #0B1F2A;
  --color-ink-700: #1B3743;
  --color-ink-600: #2E4753;

  --color-coral-400: #FF8A7E;
  --color-coral-500: #FF6F61;
  --color-coral-600: #E85A4C;

  --color-n-50: #F7F9FA;
  --color-n-100: #EEF2F4;
  --color-n-200: #DFE6E9;
  --color-n-300: #C7D0D4;
  --color-n-400: #9DA9AE;
  --color-n-500: #717D83;
  --color-n-600: #515D63;
  --color-n-700: #3A454B;
  --color-n-800: #232D33;
  --color-n-900: #0F1A20;

  --color-success: #12B886;
  --color-warning: #F5A524;
  --color-danger:  #E5484D;
}
```

### Plain CSS variables (framework-agnostic)
```css
:root {
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
}
```

### Context line for Claude in Code
> Brand: **Fitt.d**, a clean professional resume/JD-matching SaaS. Primary `#08B6D0` (cyan) is brand/accent/focus only; solid primary buttons use `#0C7383` or ink `#0B1F2A` with white text for AA contrast. Secondaries: ink `#0B1F2A` (text + dark surfaces) and coral `#FF6F61` (sparing accent, match-score low end). Neutrals are a cool slate ramp (`#F7F9FA`→`#0F1A20`). Type: Manrope for display/wordmark, Inter for body, system mono for scores/keywords. The cyan "." is the brand motif — reuse it for active/selected states. Use the tokens above verbatim.
