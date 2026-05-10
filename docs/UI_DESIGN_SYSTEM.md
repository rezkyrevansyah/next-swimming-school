# UI_DESIGN_SYSTEM.md

> **Foundation design tokens & components for Next Swimming School Web App.**
> Read this BEFORE building any UI. All visual decisions inherit from here.
>
> Style direction: **Sport-tech** (bold, dynamic, energetic — like Nike Run Club, Strava) with **premium ocean palette** (deep navy, white, muted gray — no bright accents)
> Mode: **Light only** (Phase 1)
> Font: **Inter**
> Radius: **Rounded medium** (8-12px)

---

## 1. Brand Identity

### 1.1 Brand Personality

Next Swimming School = **modern, energetic, professional, trustworthy**.

The visual language should evoke:
- **Movement & flow** (water, swimming dynamics)
- **Athletic energy** (sport performance)
- **Clean professionalism** (trust, structure)
- **Approachable warmth** (welcoming families & kids)

NOT:
- Generic corporate blue (boring)
- Cute/playful kids-only (we serve adults too)
- Aggressive sports masculine (alienates)
- Overly minimal (lacks energy)
- Bright neon/cyan accents (too digital, kills premium feel)

### 1.2 Logo Usage

**Primary logo:** "Next Swimming School" with swimmer mark (per uploaded logo).

**Clear space:** minimum padding around logo = 1/4 of logo height.
**Minimum size:** 32px height.
**Backgrounds:** prefer white or `--neutral-50`. Avoid placing on `--primary` directly.

---

## 2. Color System

**Design decision:** Deep ocean navy dominant palette, inspired by the reference design. No bright cyan accents — replaced with dark muted tones that feel premium and cohesive with real water photography.

### 2.1 Brand Colors

```css
/* Primary — Deep Ocean Navy
   Darker and richer than before. Dominant color for everything. */
--primary-50:  #EEF2F7;   /* lightest tint, barely visible bg */
--primary-100: #D1DCEA;   /* light tint for hover states, tags */
--primary-200: #A8BDD4;   /* muted tint for disabled states */
--primary-300: #6F93B5;   /* medium tint */
--primary-400: #3D6B93;   /* medium */
--primary-500: #1A4A72;   /* medium-strong */
--primary-600: #1E5DB8;   /* Logo navy (keep for brand accuracy) */
--primary-700: #1A3A5C;   /* Strong, used for hover */
--primary-800: #112840;   /* Very strong, headings */
--primary-900: #0B1F3A;   /* Deepest — dominant background color */
--primary-950: #06111F;   /* Near black navy */

/* Water — Muted Teal (replaces bright cyan)
   NOT a bright accent. Subtle, desaturated, premium. Used very sparingly. */
--water-50:  #EFF6F9;
--water-100: #D0E8EF;
--water-200: #A3CDD9;
--water-300: #6DAFC0;
--water-400: #3D90A8;   /* Muted, darkened cyan — only for subtle highlights */
--water-500: #1B7A9A;   /* Used sparingly: active indicators, subtle accents */
--water-600: #116180;
--water-700: #0D4A63;
--water-800: #093646;
--water-900: #052330;
```

**Usage — STRICT rules:**
- `--primary-900` = hero backgrounds, dark sections, sidebar (deep navy)
- `--primary-800` = headings, high-emphasis text on white
- `--primary-700` = hover states for primary buttons
- `--primary-600` = primary CTA buttons (matches logo)
- `--water-500` = live indicators, active tab underlines, subtle icons (use sparingly)
- `--water-400` = never use as a bright accent. Only for subtle backgrounds behind water-themed elements

**REMOVED:** `--accent-400` (#3DBEEC bright cyan) — no longer in system. Replace all uses with `--water-500` if needed, or just `--primary-600`.

### 2.2 Neutral Colors

```css
/* Neutrals — warm-neutral (slightly warm gray, not cold blue-gray)
   Warmer grays feel more premium alongside deep navy. */
--neutral-0:   #FFFFFF;
--neutral-50:  #F5F5F3;   /* page background — slightly warm */
--neutral-100: #EBEBEA;   /* card backgrounds, hover states */
--neutral-200: #D4D4D2;   /* borders, dividers */
--neutral-300: #B8B8B6;   /* disabled borders */
--neutral-400: #8C8C8A;   /* placeholder text, icons */
--neutral-500: #636361;   /* secondary text */
--neutral-600: #4A4A48;   /* body text */
--neutral-700: #333332;   /* strong text */
--neutral-800: #1F1F1E;   /* headings on white */
--neutral-900: #111110;   /* near black */
```

**Why warm neutrals?** Deep navy + warm gray creates a sophisticated, premium feel like high-end publications. Cold blue-gray + bright cyan creates a "digital SaaS" feel. We want premium sport, not tech startup.

### 2.3 Semantic Colors

Semantic colors (success/warning/danger/info) remain the same — these are functional, not aesthetic.

```css
/* Success — muted green (attendance present, paid status) */
--success-50:  #F0FDF4;
--success-100: #DCFCE7;
--success-500: #22C55E;
--success-600: #16A34A;
--success-700: #15803D;

/* Warning — amber (late, pending, attention needed) */
--warning-50:  #FFFBEB;
--warning-100: #FEF3C7;
--warning-500: #F59E0B;
--warning-600: #D97706;
--warning-700: #B45309;

/* Danger — red (errors, overdue, absent) */
--danger-50:  #FEF2F2;
--danger-100: #FEE2E2;
--danger-500: #EF4444;
--danger-600: #DC2626;
--danger-700: #B91C1C;

/* Info — muted blue (informational, neutral notifications) */
--info-50:  #EFF6FF;
--info-500: #3B82F6;
--info-600: #2563EB;
```

### 2.4 Surface & Background

```css
--background:        var(--neutral-50);    /* main page bg: warm off-white #F5F5F3 */
--surface:           var(--neutral-0);     /* card bg: pure white */
--surface-hover:     var(--neutral-100);   /* card hover: #EBEBEA */
--surface-elevated:  var(--neutral-0);     /* modal, popover bg */
--surface-dark:      var(--primary-900);   /* dark sections: #0B1F3A */
--overlay:           rgba(11, 31, 58, 0.65); /* modal backdrop — navy tinted */
```

### 2.5 Color Usage Rules (UPDATED)

✅ DO:
- Use `--primary-600` for primary CTA buttons (matches logo)
- Use `--primary-900` for hero/dark section backgrounds (deep ocean feel)
- Use `--primary-800` for all major headings
- Use `--water-500` sparingly for live indicators and active states
- Use warm `--neutral-50` (#F5F5F3) as page background, NOT cold blue-gray
- Let photography carry the visual energy — palette supports, not competes

❌ DON'T:
- Use `--water-400` or `--water-300` as decorative accents (too bright, breaks premium feel)
- Use old `--accent-400` (#3DBEEC) anywhere — it's removed
- Use `--primary-100` or `--primary-50` as backgrounds (too blue, looks cold)
- Use `--neutral-50` from old system (#F8FAFC, cold blue-gray) — use new warm value
- Use bright blue (#3B82F6 info) for decorative purposes

### 2.6 Color Application Map

| UI Element | Color |
|---|---|
| Page background | `--neutral-50` (#F5F5F3 warm) |
| Card background | white (`--neutral-0`) |
| Card border | `--neutral-200` (#D4D4D2) |
| Primary button | `--primary-600` (#1E5DB8) |
| Primary button hover | `--primary-700` (#1A3A5C) |
| Primary button active | `--primary-900` (#0B1F3A) |
| Secondary button border | `--neutral-300` |
| Body text | `--neutral-600` (#4A4A48) |
| Heading text | `--primary-800` (#112840) |
| Muted text | `--neutral-500` (#636361) |
| Sidebar / dark header | `--primary-900` (#0B1F3A) |
| Sidebar active item bg | `rgba(255,255,255,0.08)` |
| Sidebar active item text | white |
| Active tab indicator | `--water-500` (#1B7A9A) |
| Live pulsing dot | `--success-500` (green) |
| QR page background | white |
| Hero photo overlay | `rgba(11,31,58,0.7)` navy |
| Stat card number | `--primary-900` (#0B1F3A) |
| Input focus ring | `--primary-500` (#1A4A72) |

---

## 3. Typography

### 3.1 Font Families

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-display: 'Inter', system-ui, sans-serif; /* same family, different weight/size */
--font-mono: 'JetBrains Mono', 'Courier New', monospace; /* for codes, IDs */
```

Load Inter via `next/font/google`:
```typescript
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800", "900"],
});
```

### 3.2 Type Scale

Sport-tech style = **bold, large headings, tight tracking on big text**.

```css
/* Display — hero headlines, marketing */
--text-display-xl:  72px / 80px / 900 / -0.04em;  /* hero on landing */
--text-display-lg:  60px / 68px / 900 / -0.04em;  /* big headlines */
--text-display-md:  48px / 56px / 800 / -0.03em;  /* section headers public */
--text-display-sm:  36px / 44px / 800 / -0.02em;  /* page titles app */

/* Heading — content hierarchy */
--text-heading-xl:  30px / 40px / 700 / -0.02em;  /* h1 in app */
--text-heading-lg:  24px / 32px / 700 / -0.01em;  /* h2 */
--text-heading-md:  20px / 28px / 600 / -0.01em;  /* h3, card titles */
--text-heading-sm:  18px / 26px / 600 / 0;        /* h4, small card titles */

/* Body — content */
--text-body-lg:     18px / 28px / 400 / 0;        /* lead paragraph */
--text-body-md:     16px / 24px / 400 / 0;        /* default body */
--text-body-sm:     14px / 20px / 400 / 0;        /* small text, helper */
--text-body-xs:     12px / 16px / 500 / 0;        /* tiny, meta */

/* Label — UI elements */
--text-label-lg:    16px / 24px / 600 / 0;        /* button text, prominent labels */
--text-label-md:    14px / 20px / 600 / 0.01em;   /* form labels, badges */
--text-label-sm:    12px / 16px / 600 / 0.02em;   /* small labels, tab labels */
--text-label-xs:    10px / 14px / 700 / 0.05em;   /* uppercase micro labels */
```

Format: `font-size / line-height / font-weight / letter-spacing`

### 3.3 Sport-Tech Typography Patterns

**Numbers prominent (stats, scores):**
```css
.stat-number {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -0.03em;
  font-feature-settings: 'tnum' 1; /* tabular numbers */
}
```

**Uppercase labels for energy:**
```css
.energy-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent-500);
}
/* Use for: section dividers, badge labels, stat captions */
```

**Bold large headlines:**
- Always use weight 700-900 for display text
- Tight letter-spacing (-0.02em to -0.04em) for big sizes
- Normal/looser tracking on body text

### 3.4 Text Color Hierarchy

```css
.text-primary    { color: var(--neutral-800); } /* headings */
.text-default    { color: var(--neutral-700); } /* body */
.text-secondary  { color: var(--neutral-500); } /* helper, captions */
.text-disabled   { color: var(--neutral-400); }
.text-inverse    { color: var(--neutral-0); }   /* on dark bg */
.text-brand      { color: var(--primary-600); }
.text-accent     { color: var(--accent-500); }
```

---

## 4. Spacing System

8px-based grid. Stick to this scale — no arbitrary values.

```css
--space-0:   0;
--space-1:   4px;   /* tight gaps inside components */
--space-2:   8px;   /* small gaps */
--space-3:   12px;  /* default small */
--space-4:   16px;  /* default medium */
--space-5:   20px;
--space-6:   24px;  /* card padding */
--space-7:   28px;
--space-8:   32px;  /* section gap */
--space-10:  40px;
--space-12:  48px;  /* large section gap */
--space-16:  64px;  /* hero spacing */
--space-20:  80px;  /* major section break */
--space-24:  96px;  /* hero padding desktop */
--space-32:  128px; /* extreme spacing */
```

### 4.1 Spacing Patterns

- **Component internal padding:** `--space-4` to `--space-6`
- **Card padding:** `--space-6` (24px)
- **Section padding (mobile):** `--space-8` vertical
- **Section padding (desktop):** `--space-16` to `--space-24` vertical
- **Element gap (small):** `--space-2` to `--space-3`
- **Element gap (medium):** `--space-4` to `--space-6`
- **Section gap:** `--space-12` to `--space-16`

---

## 5. Border Radius

```css
--radius-none: 0;
--radius-xs:   4px;   /* tags, micro elements */
--radius-sm:   6px;   /* small buttons, badges */
--radius-md:   8px;   /* DEFAULT — buttons, inputs */
--radius-lg:   12px;  /* cards, modals */
--radius-xl:   16px;  /* large cards, hero elements */
--radius-2xl:  24px;  /* feature cards */
--radius-full: 9999px; /* pills, avatars */
```

**Default:** `--radius-md` (8px) for most UI elements.
**Cards:** `--radius-lg` (12px).
**Pills/avatars/badges:** `--radius-full`.

---

## 6. Shadows (Elevation)

Sport-tech style = subtle but defined shadows. No heavy drop-shadows.

```css
--shadow-xs:   0 1px 2px rgba(11, 31, 58, 0.05);
--shadow-sm:   0 2px 4px rgba(11, 31, 58, 0.06), 0 1px 2px rgba(11, 31, 58, 0.04);
--shadow-md:   0 4px 8px rgba(11, 31, 58, 0.07), 0 2px 4px rgba(11, 31, 58, 0.04);
--shadow-lg:   0 12px 24px rgba(11, 31, 58, 0.09), 0 4px 8px rgba(11, 31, 58, 0.05);
--shadow-xl:   0 24px 48px rgba(11, 31, 58, 0.12), 0 8px 16px rgba(11, 31, 58, 0.06);
--shadow-2xl:  0 32px 64px rgba(11, 31, 58, 0.18);

/* Brand-tinted shadows for primary elements (dark navy tint) */
--shadow-brand-sm: 0 4px 12px rgba(11, 31, 58, 0.18);
--shadow-brand-md: 0 8px 24px rgba(11, 31, 58, 0.22);

/* NOTE: --glow-accent REMOVED (no bright cyan glow) */
```

**Elevation hierarchy:**
- Level 0 (flat): `--shadow-none` — backgrounds, dividers
- Level 1 (resting): `--shadow-sm` — cards
- Level 2 (raised): `--shadow-md` — hovered cards, dropdowns
- Level 3 (overlay): `--shadow-lg` — modals, popovers
- Level 4 (high): `--shadow-xl` — hero elements, prominent CTAs
- Level 5 (max): `--shadow-2xl` — full-screen overlays

---

## 7. Animation & Motion

### 7.1 Duration

```css
--duration-instant: 50ms;   /* hover state immediate feedback */
--duration-fast:    150ms;  /* default — most interactions */
--duration-base:    250ms;  /* card lifts, page transitions */
--duration-slow:    400ms;  /* modals, complex transitions */
--duration-slower:  600ms;  /* hero animations */
```

### 7.2 Easing

```css
--ease-linear:    cubic-bezier(0, 0, 1, 1);
--ease-out:       cubic-bezier(0, 0, 0.2, 1);     /* DEFAULT — natural deceleration */
--ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);   /* smooth both ways */
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1); /* bouncy, energetic */
```

### 7.3 Animation Patterns

```css
/* Hover lift (cards) */
.hover-lift {
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Press effect (buttons) */
.press-effect:active {
  transform: scale(0.98);
}

/* Fade in (page mount) */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Pulse (live indicator) */
@keyframes pulse-accent {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 8. Layout & Grid

### 8.1 Breakpoints

```css
--breakpoint-sm: 640px;   /* small tablets */
--breakpoint-md: 768px;   /* tablets */
--breakpoint-lg: 1024px;  /* small laptops */
--breakpoint-xl: 1280px;  /* desktops */
--breakpoint-2xl: 1536px; /* large desktops */
```

### 8.2 Container Widths

```css
.container-sm: max-width: 640px;   /* narrow content (forms, articles) */
.container-md: max-width: 768px;   /* moderate */
.container-lg: max-width: 1024px;  /* default app */
.container-xl: max-width: 1280px;  /* wide layouts */
.container-2xl: max-width: 1536px; /* full marketing */

/* App admin/coach/member panel: 1280px max */
/* Public marketing: 1280px max */
```

### 8.3 Padding Patterns

```css
/* Page padding (responsive) */
.page-padding {
  padding-left: 16px;
  padding-right: 16px;
}
@media (min-width: 768px) {
  .page-padding { padding-left: 32px; padding-right: 32px; }
}
@media (min-width: 1024px) {
  .page-padding { padding-left: 48px; padding-right: 48px; }
}
```

### 8.4 App Panel Layout (Admin/Coach/Member)

**Desktop (≥1024px):**
- Sidebar (240px fixed) + main content (fluid)
- Top header (64px) full width or content-aligned
- Main content max-width: 1280px

**Mobile (<1024px):**
- Top header (56px) with hamburger
- Main content full width
- Bottom navigation (64px) for member/coach (NOT admin — admin uses drawer)

---

## 9. Components

### 9.1 Button

**Variants:** primary, secondary, accent, ghost, outline, danger
**Sizes:** sm (32px), md (40px), lg (48px), xl (56px)

```css
/* Base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  height: 40px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.01em;
  transition: all var(--duration-fast) var(--ease-out);
  cursor: pointer;
  border: none;
  white-space: nowrap;
}

.btn:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

**Primary (default CTA):**
| State | Background | Text | Border |
|---|---|---|---|
| Default | `--primary-600` (#1E5DB8) | white | none |
| Hover | `--primary-700` (#1A3A5C) | white | none |
| Active | `--primary-900` (#0B1F3A) | white | none |
| Disabled | `--primary-200` | white | none |
| Focus | `--primary-600` + outline ring | white | none |

**Dark (hero sections, dark bg variant):**
| State | Background | Text | Border |
|---|---|---|---|
| Default | `--primary-900` (#0B1F3A) | white | none |
| Hover | `--primary-800` (#112840) | white | none |
| Active | black | white | none |

**Outline:**
| State | Background | Text | Border |
|---|---|---|---|
| Default | transparent | `--primary-800` | 1.5px `--neutral-300` |
| Hover | `--neutral-100` | `--primary-900` | 1.5px `--neutral-400` |
| Active | `--neutral-200` | `--primary-900` | 1.5px `--neutral-500` |

**Ghost (subtle):**
| State | Background | Text | Border |
|---|---|---|---|
| Default | transparent | `--neutral-600` | none |
| Hover | `--neutral-100` | `--neutral-800` | none |
| Active | `--neutral-200` | `--neutral-900` | none |

**Outline on dark bg (for hero, sidebar):**
| State | Background | Text | Border |
|---|---|---|---|
| Default | transparent | white | 1.5px `rgba(255,255,255,0.45)` |
| Hover | `rgba(255,255,255,0.10)` | white | 1.5px `rgba(255,255,255,0.65)` |
| Active | `rgba(255,255,255,0.18)` | white | 1.5px white |

**Danger:**
| State | Background | Text | Border |
|---|---|---|---|
| Default | `--danger-600` | white | none |
| Hover | `--danger-700` | white | none |

> **NOTE:** "Accent" button (bright cyan) is REMOVED from system. Use "Dark" variant for high-emphasis secondary CTAs.

**Sizes:**
- `sm`: height 32px, px 12px, text 13px
- `md`: height 40px, px 16px, text 14px (default)
- `lg`: height 48px, px 20px, text 16px
- `xl`: height 56px, px 24px, text 18px (hero CTAs)

### 9.2 Input

```css
.input {
  display: block;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid var(--neutral-200);
  border-radius: var(--radius-md);
  background: var(--neutral-0);
  font-size: 16px; /* prevent iOS zoom */
  color: var(--neutral-800);
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
}

.input::placeholder {
  color: var(--neutral-400);
}
```

| State | Border | Background |
|---|---|---|
| Default | `--neutral-200` | white |
| Hover | `--neutral-300` | white |
| Focus | `--primary-500` + 4px ring `rgba(30, 93, 184, 0.12)` | white |
| Disabled | `--neutral-200` | `--neutral-100` |
| Error | `--danger-500` + 4px ring `rgba(239, 68, 68, 0.12)` | white |
| Success | `--success-500` | white |

**Variants:**
- Default (single line)
- Textarea (min-height 96px, resize-y)
- Search (with leading icon)
- Password (with eye toggle)
- With prefix/suffix (e.g. "@", "Rp", units)

### 9.3 Card

```css
.card {
  background: var(--surface);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg); /* 12px */
  padding: 24px;
  transition: all var(--duration-base) var(--ease-out);
}

.card-interactive:hover {
  border-color: var(--neutral-300);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

**Variants:**
- `card-default` — standard
- `card-elevated` — has shadow always
- `card-interactive` — hoverable (links/clickable)
- `card-accent` — 4px left border `--water-500` (muted teal, subtle — not bright)
- `card-stat` — for stats display (large numbers)
- `card-dark` — bg `--primary-900`, white text (for dark sections)

### 9.4 Badge / Pill

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1.2;
}
```

**Variants:**
- `badge-neutral` — bg `--neutral-100`, text `--neutral-700`
- `badge-primary` — bg `--primary-100`, text `--primary-800`
- `badge-water` — bg `--water-100`, text `--water-700` (replaces old accent badge)
- `badge-success` — bg `--success-100`, text `--success-700`
- `badge-warning` — bg `--warning-100`, text `--warning-700`
- `badge-danger` — bg `--danger-100`, text `--danger-700`
- `badge-dark` — bg `--primary-900`, text white (for dark bg contexts)

**Status badges (specific):**
- Active: success
- Pending Payment: warning
- Inactive: neutral
- Overdue: danger
- Hadir: success
- Late: warning
- Izin: info (blue)
- Sakit: neutral
- Alpha: danger

### 9.5 Avatar

```css
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--primary-100);   /* warm navy tint */
  color: var(--primary-800);        /* dark navy text */
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}
```

**Sizes:**
- `xs`: 24px, text 10px
- `sm`: 32px, text 12px
- `md`: 40px, text 14px (default)
- `lg`: 56px, text 18px
- `xl`: 80px, text 24px
- `2xl`: 120px, text 36px

**With status indicator:** small circle (8-12px) absolute bottom-right, white border 2px.

### 9.6 Tabs

```css
.tabs-list {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--neutral-200);
  overflow-x: auto;
}

.tab {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--neutral-500);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.tab:hover {
  color: var(--neutral-700);
}

.tab[data-state="active"] {
  color: var(--primary-800);
  border-bottom-color: var(--water-500);  /* muted teal indicator, not bright cyan */
}
```

### 9.7 Dialog / Modal

```css
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  animation: fade-in var(--duration-fast);
}

.dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--surface);
  border-radius: var(--radius-xl); /* 16px */
  padding: 32px;
  max-width: 500px;
  width: calc(100% - 32px);
  box-shadow: var(--shadow-2xl);
  animation: dialog-slide-in var(--duration-base) var(--ease-out);
}

/* Mobile: full-width sheet from bottom */
@media (max-width: 640px) {
  .dialog-content {
    top: auto;
    bottom: 0;
    left: 0;
    transform: none;
    width: 100%;
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    padding: 24px;
  }
}
```

### 9.8 Form Field Layout

```
┌─────────────────────────────┐
│ Label *                     │  <- label-md weight 600
│ ┌─────────────────────────┐ │
│ │ Input                   │ │  <- 44px height
│ └─────────────────────────┘ │
│ Helper text or error        │  <- text-body-sm color secondary OR danger
└─────────────────────────────┘
```

**Spacing:**
- Label to input: 8px
- Input to helper: 6px
- Field to next field: 20px

### 9.9 Toast / Notification

```css
.toast {
  background: var(--neutral-800);
  color: white;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: 480px;
}
```

**Variants:**
- `toast-success` — left border 4px `--success-500`, icon CheckCircle
- `toast-error` — bg `--danger-700`, icon XCircle
- `toast-warning` — left border 4px `--warning-500`, icon AlertTriangle
- `toast-info` — left border 4px `--info-500`, icon Info

**Position:** top-right desktop, top-center mobile.
**Duration:** 4 seconds default, 6 sec for errors.

### 9.10 Empty State

Pattern when list/data is empty:

```
┌─────────────────────────────┐
│                             │
│         [Icon, 64px]        │  <- color: --neutral-300
│                             │
│      Heading text           │  <- text-heading-md color primary
│   Helper description text   │  <- text-body-md color secondary
│                             │
│      [Action Button]        │  <- primary or accent button
│                             │
└─────────────────────────────┘
```

### 9.11 Loading State

**Skeleton loaders** (preferred over spinners):
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--neutral-100) 0%,
    var(--neutral-200) 50%,
    var(--neutral-100) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Use spinners only** for inline button loading and short waits (<2 sec).

### 9.12 Stat Card (Sport-Tech Signature)

Critical component for dashboards. Visual emphasis on numbers.

```
┌─────────────────────────────┐
│ MEMBER AKTIF       [↑ 12%]  │  <- label uppercase + trend pill
│                             │
│ 248                         │  <- huge number, weight 900
│                             │
│ +24 dari bulan lalu         │  <- caption secondary
└─────────────────────────────┘
```

**Spec:**
- Card: white, radius-lg, padding 24px, shadow-sm
- Label: text-label-sm uppercase, color `--neutral-500`
- Trend pill: top-right, `badge-success` or `badge-danger`, with arrow icon
- Number: 48px, weight 900, letter-spacing -0.03em, color `--primary-900`, tabular-nums
- Caption: text-body-sm, color `--neutral-500`
- Optional left accent: 4px border `--water-500` for primary highlighted metric (subtle)

**Optional accent variant:** Add 4px left border `--accent-400` for highlighted metrics.

---

## 10. Iconography

**Library:** Lucide React (`lucide-react`).

**Sizes:**
- `xs`: 14px (inside small badges)
- `sm`: 16px (inside buttons, inline)
- `md`: 20px (default in lists, navigation)
- `lg`: 24px (page headers, prominent actions)
- `xl`: 32px (feature cards)
- `2xl`: 48px (hero, empty states)

**Stroke width:** 2 (default Lucide). Use 1.5 for large decorative icons.

**Color:** inherit from parent text color by default. Use `--primary-600` for emphasis, `--neutral-500` for muted.

**Common icons mapping:**
- Dashboard: `LayoutDashboard`
- Member: `Users`
- Coach: `UserCheck`
- Class: `Calendar` or `BookOpen`
- Attendance: `ClipboardCheck`
- Report Card: `FileText`
- Finance: `Wallet`
- QR Code: `QrCode`
- Camera: `Camera`
- Location: `MapPin`
- Search: `Search`
- Filter: `SlidersHorizontal`
- Add: `Plus`
- Edit: `Pencil`
- Delete: `Trash2`
- View: `Eye`
- Download: `Download`
- Upload: `Upload`
- WhatsApp: `MessageCircle` (no native WA icon in Lucide; use this)
- Logout: `LogOut`
- Settings: `Settings`
- Notification: `Bell`
- Success: `CheckCircle2`
- Error: `XCircle`
- Warning: `AlertTriangle`
- Info: `Info`

---

## 11. Imagery & Photography

**Style guidance:**
- Action shots of swimming (motion blur, water splashes, dynamic angles)
- Coaches teaching kids (warm, candid, real moments)
- Modern facility shots (clean, professional)
- Avoid stock-photo cliches (smiling forced poses)

**Treatment:**
- Deep navy overlay for hero images (cohesive with `--primary-900` dark sections)
- Let real photography breathe — minimal color treatment on non-hero images
- Crop ratio: 16:9 hero, 4:3 cards, 1:1 avatars/squares
- Format: WebP with JPEG fallback, lazy loaded

**Placeholder/empty image:**
- Use warm neutral gradient: `--neutral-100` to `--neutral-50`
- Or subtle navy tint: `--primary-100` to `--neutral-50`

---

## 12. Tailwind Config (Copy-Paste Ready)

`tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", md: "2rem", lg: "3rem" },
    },
    extend: {
      colors: {
        primary: {
          50: "#EEF2F7",   100: "#D1DCEA",  200: "#A8BDD4",  300: "#6F93B5",
          400: "#3D6B93",  500: "#1A4A72",  600: "#1E5DB8",  700: "#1A3A5C",
          800: "#112840",  900: "#0B1F3A",  950: "#06111F",
        },
        water: {
          /* Muted teal — replaces old bright cyan accent. Use SPARINGLY. */
          50: "#EFF6F9",   100: "#D0E8EF",  200: "#A3CDD9",  300: "#6DAFC0",
          400: "#3D90A8",  500: "#1B7A9A",  600: "#116180",  700: "#0D4A63",
          800: "#093646",  900: "#052330",
        },
        neutral: {
          /* Warm-neutral grays — premium, not cold blue-gray */
          0: "#FFFFFF",    50: "#F5F5F3",   100: "#EBEBEA",  200: "#D4D4D2",
          300: "#B8B8B6",  400: "#8C8C8A",  500: "#636361",  600: "#4A4A48",
          700: "#333332",  800: "#1F1F1E",  900: "#111110",
        },
        success: { 50: "#F0FDF4", 100: "#DCFCE7", 500: "#22C55E", 600: "#16A34A", 700: "#15803D" },
        warning: { 50: "#FFFBEB", 100: "#FEF3C7", 500: "#F59E0B", 600: "#D97706", 700: "#B45309" },
        danger:  { 50: "#FEF2F2", 100: "#FEE2E2", 500: "#EF4444", 600: "#DC2626", 700: "#B91C1C" },
        info:    { 50: "#EFF6FF", 500: "#3B82F6", 600: "#2563EB" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["72px", { lineHeight: "80px", letterSpacing: "-0.04em", fontWeight: "900" }],
        "display-lg": ["60px", { lineHeight: "68px", letterSpacing: "-0.04em", fontWeight: "900" }],
        "display-md": ["48px", { lineHeight: "56px", letterSpacing: "-0.03em", fontWeight: "800" }],
        "display-sm": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "heading-xl": ["30px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "heading-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "heading-md": ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "heading-sm": ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-xs": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "label-lg": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "600", letterSpacing: "0.02em" }],
        "label-xs": ["10px", { lineHeight: "14px", fontWeight: "700", letterSpacing: "0.05em" }],
      },
      borderRadius: {
        xs: "4px", sm: "6px", md: "8px", lg: "12px", xl: "16px", "2xl": "24px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(11, 31, 58, 0.05)",
        sm: "0 2px 4px rgba(11, 31, 58, 0.06), 0 1px 2px rgba(11, 31, 58, 0.04)",
        md: "0 4px 8px rgba(11, 31, 58, 0.07), 0 2px 4px rgba(11, 31, 58, 0.04)",
        lg: "0 12px 24px rgba(11, 31, 58, 0.09), 0 4px 8px rgba(11, 31, 58, 0.05)",
        xl: "0 24px 48px rgba(11, 31, 58, 0.12), 0 8px 16px rgba(11, 31, 58, 0.06)",
        "2xl": "0 32px 64px rgba(11, 31, 58, 0.18)",
        "brand-sm": "0 4px 12px rgba(11, 31, 58, 0.18)",
        "brand-md": "0 8px 24px rgba(11, 31, 58, 0.22)",
      },
      animation: {
        "fade-in": "fadeIn 250ms ease-out",
        "slide-up": "slideUp 300ms cubic-bezier(0, 0, 0.2, 1)",
        shimmer: "shimmer 1.5s infinite linear",
        "pulse-accent": "pulseAccent 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseAccent: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

## 13. shadcn/ui Theme (CSS Variables)

`app/globals.css`:

```css
@import "tailwindcss";

@layer base {
  :root {
    /* Brand — Deep Ocean Navy */
    --primary: 30 93 184;             /* primary-600 RGB (logo match) */
    --primary-foreground: 255 255 255;

    /* Water — Muted teal (replaces accent, use sparingly) */
    --water: 27 122 154;              /* water-500 RGB */
    --water-foreground: 255 255 255;

    /* Surfaces */
    --background: 245 245 243;        /* neutral-50: warm off-white */
    --foreground: 17 40 64;           /* primary-800: deep navy for text */

    --card: 255 255 255;
    --card-foreground: 17 40 64;

    --popover: 255 255 255;
    --popover-foreground: 17 40 64;

    /* Secondary (subtle UI) */
    --secondary: 235 235 234;         /* neutral-100: warm hover */
    --secondary-foreground: 51 51 50; /* neutral-700 */

    /* Muted */
    --muted: 235 235 234;
    --muted-foreground: 99 99 97;     /* neutral-500 */

    /* Border & input */
    --border: 212 212 210;            /* neutral-200: warm gray */
    --input: 212 212 210;
    --ring: 26 74 114;                /* primary-500: focus ring */

    /* Destructive */
    --destructive: 239 68 68;
    --destructive-foreground: 255 255 255;

    /* Radius */
    --radius: 0.5rem;                 /* 8px = radius-md */
  }

  body {
    background: rgb(var(--background));
    color: rgb(var(--foreground));
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* Tabular nums for stats and IDs */
  .tabular-nums {
    font-feature-settings: "tnum" 1;
  }

  /* Focus visible default */
  :focus-visible {
    outline: 2px solid rgb(var(--ring));
    outline-offset: 2px;
  }
}
```

---

## 14. Visual Hierarchy Principles

When designing any page, apply this hierarchy:

1. **Primary action** = `--primary-600` filled button, biggest size for context
2. **Secondary action** = outline button or ghost button
3. **Energetic moments** = `--accent-400` for highlights, badges, active states
4. **Status communication** = semantic colors (success/warning/danger)
5. **Text hierarchy** = size + weight, not color (use neutral-800/700/500/400)
6. **Spatial hierarchy** = generous whitespace > heavy borders/dividers
7. **Numbers prominence** = large, bold, tabular for stats
8. **Icons functional** = always paired with text label (except universal icons in obvious context)

---

## 15. Sport-Tech Signature Patterns

These patterns reinforce the sport-tech aesthetic across the app:

### 15.1 Energy Dividers

Section dividers with accent color uppercase labels:

```html
<div class="flex items-center gap-3">
  <span class="h-0.5 flex-1 bg-neutral-200"></span>
  <span class="text-label-xs uppercase tracking-widest text-accent-500">
    Hari Ini
  </span>
  <span class="h-0.5 flex-1 bg-neutral-200"></span>
</div>
```

### 15.2 Big Number Stats

Always feature big numbers when stats are the focus. See StatCard component.

### 15.3 Live Indicators

Pulsing dot for live/active states — use **green** (success), not cyan:

```html
<span class="inline-flex items-center gap-2">
  <span class="relative flex h-2 w-2">
    <span class="animate-ping absolute inset-0 rounded-full bg-success-500 opacity-75"></span>
    <span class="relative rounded-full h-2 w-2 bg-success-500"></span>
  </span>
  <span class="text-label-sm text-success-700">Sedang Berlangsung</span>
</span>
```

For water/location-related live indicators (GPS distance), use `--water-500` (muted teal).

### 15.4 Progress Indicators

Always show progress for multi-step or long actions:
- Progress bars: `--primary-600` fill on `--neutral-200` track (not cyan)
- Active session progress: `--water-500` fill (the one allowed use of muted teal)
- Step indicators with active/completed/upcoming states
- Percentages prominently displayed

### 15.5 Diagonal Accents (Decorative)

Hero sections can use subtle geometric patterns — thin lines or grid overlay at very low opacity on dark backgrounds. Use `rgba(255,255,255,0.04)` for decoration on `--primary-900` backgrounds.

NO diagonal cyan gradients. Keep it dark, clean, and premium.

### 15.6 Hero Overlays

```css
/* Standard hero — dark navy overlay over photo */
.hero-overlay {
  background: linear-gradient(
    150deg,
    rgba(11, 31, 58, 0.85) 0%,
    rgba(17, 40, 64, 0.65) 60%,
    rgba(26, 58, 92, 0.40) 100%
  );
}

/* Light hero variant — for sections with white bg */
.hero-overlay-light {
  background: linear-gradient(
    180deg,
    rgba(245, 245, 243, 0) 0%,
    rgba(245, 245, 243, 1) 100%
  );
}
```

NO cyan-to-navy gradients. Navy-to-navy gradients only — creates depth without color clash.

### 15.7 Bold CTAs

Large CTAs (height 56px+) with brand shadow for primary actions:

```html
<button class="btn-primary h-14 px-8 text-lg shadow-brand-md hover:shadow-brand-lg">
  Daftar Sekarang
  <ArrowRight />
</button>
```

On dark hero backgrounds, use `btn-outline-dark` variant (white border, white text).

---

## 16. Accessibility Checklist

- [ ] All text meets WCAG AA contrast (4.5:1 normal, 3:1 large)
- [ ] All interactive elements have visible focus state
- [ ] All form inputs have associated labels
- [ ] All images have meaningful alt text (or empty alt for decorative)
- [ ] Touch targets minimum 44×44px on mobile
- [ ] Color not the only indicator (e.g. error state has icon + text + color, not just color)
- [ ] Heading hierarchy semantic (h1 → h2 → h3, no skipping)
- [ ] Modal traps focus, Escape to close
- [ ] Skip-to-content link on public pages

---

## 17. Mobile Considerations

- **Bottom nav** for member & coach panels (NOT admin — admin uses drawer/hamburger)
- **Safe areas** respected (env(safe-area-inset-bottom) for iOS notch)
- **Tap feedback** — active state visible on touch
- **Pull-to-refresh** considered for lists (Phase 2 PWA)
- **Sticky headers** for long lists
- **Bottom sheet modals** instead of center modals on mobile (<640px)
- **Larger tap targets** for primary actions (min 48×48px)
- **Floating action button (FAB)** for primary action when relevant (e.g. "Tambah" on member list)

---

**Document version:** 1.0
**Last updated:** Phase 1 design system kickoff

Next: see `UI_DESIGN_INSTRUCTIONS.md` for per-page specifications.
