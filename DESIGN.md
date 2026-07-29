---
name: MedUtils (Shiftside)
description: Offline-first clinical calculator suite for bedside decisions, styled as a dark instrument console with per-tool signal colors.
colors:
  page-bg: "#07111D"
  surface-panel: "#090F1CBD"
  surface-border: "#FFFFFF17"
  slate-900: "#0F172A"
  slate-950: "#020617"
  chrome-muted: "#94A3B8"
  neon-blue: "#00F0FF"
  neon-pink: "#FF0055"
  dose-cyan: "#67E8F9"
  abg-orange: "#FDBA74"
  drips-sky: "#7DD3FC"
  lytes-amber: "#FCD34D"
  neuro-green: "#86EFAC"
  notes-coral: "#FCA5A5"
typography:
  display:
    fontFamily: "Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif"
    fontSize: "clamp(2rem, 6vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "IBM Plex Sans, Avenir Next, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans, Avenir Next, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Sans, Avenir Next, Segoe UI, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.22em"
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "10px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "rgba(6,182,212,0.1)"
    textColor: "{colors.dose-cyan}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
  button-primary-active:
    backgroundColor: "rgba(6,182,212,0.2)"
    textColor: "{colors.dose-cyan}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
  button-ghost:
    backgroundColor: "rgba(255,255,255,0.05)"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "16px 12px"
  nav-pill-active:
    backgroundColor: "rgba(103,232,249,0.16)"
    textColor: "{colors.dose-cyan}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  nav-pill-inactive:
    backgroundColor: "rgba(255,255,255,0.03)"
    textColor: "#94A3B8"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
---

# Design System: MedUtils (Shiftside)

## 1. Overview

**Creative North Star: "The Trauma Bay Console"**

MedUtils reads as an instrument panel, not a form. A near-black base (`#07111D`) with a faint cyan radial glow at the top holds the whole app in a low-light register — built for a shift where the room lights are already dimmed. Against that base, each of the six tools carries its own signal color (dose = cyan, ABG = orange, drips = sky-blue, lytes = amber, neuro = green, notes = coral), the way leads on a monitor each get their own trace color. Depth comes from glow and blur, never from a drop shadow — a `panel-surface` sits behind frosted glass (`backdrop-filter: blur`), and active elements get a soft `box-shadow` bloom in their own accent color rather than a gray shadow. Every touch target answers back: a haptic click, a scale-down on tap, a glow when a value is live.

This explicitly rejects the generic med-SaaS look: no white card grids, no dense radio-button forms, no Epic-blue corporate chrome. It's equally not a soft consumer-wellness app — there's no pastel calm here, the palette is closer to monitor-LED neon than spa-app teal.

**Key Characteristics:**
- Deep navy-black base, never pure black, never light mode
- One signal accent per tool, applied with intent (glow, active state, icon), never blanket-colored
- Depth via blur + glow, not shadows
- Pill-shaped nav and CTAs; rounded-2xl for tactile surfaces (keys, cards)
- Uppercase, wide-tracked micro-labels for structural chrome (nav, eyebrow subtitles) — never for body copy

## 2. Colors

Dark, desaturated navy carries the frame; each tool injects one saturated signal color that never leaks into another tool's screen.

### Primary
- **Dose Cyan** (`#67E8F9`): Shiftside Dose (pediatric/resus). Header icon glow, active nav pill, primary slider thumb default.

### Secondary
- **ABG Orange** (`#FDBA74`): Shiftside ABG (acid-base). Same treatment as Dose Cyan, scoped to that tool's screens only.
- **Drips Sky** (`#7DD3FC`): Shiftside Drips (IV/pressor rates).
- **Lytes Amber** (`#FCD34D`): Shiftside Lytes (electrolyte repletion).
- **Neuro Green** (`#86EFAC`): Shiftside Neuro (GCS/NIHSS).
- **Notes Coral** (`#FCA5A5`): Shiftside Notes (chart snippets). Also doubles as the universal destructive/backspace color (`bg-red-500/10`) — coral and "delete" share one visual language, be deliberate if reusing it as a signal color.

### Neutral
- **Page Base** (`#07111D`): the `<body>` background, under a faint radial cyan bloom and a vertical dark gradient down to `#04070F`.
- **Surface Panel** (`rgba(9,15,28,0.74)` / `#090F1CBD`): the `panel-surface` utility — frosted glass containers.
- **Surface Border** (`rgba(255,255,255,0.09)` / `#FFFFFF17`): hairline borders on panels, header, glass cards.
- **Ink** (`text-slate-50`): primary body/heading text on dark.
- **Muted** (`text-slate-300` / `text-slate-400`): secondary labels, subtitles, helper text. Kept at slate-400 (`#94A3B8`) rather than slate-500 — slate-500 falls below the 4.5:1 AA contrast minimum against this background.
- **Chrome Muted** (`#94A3B8`): the inactive-state color for tool-switcher pills (text + dot) when a tool isn't the active one. Same value as Muted text above — one gray, two names, because the roles read differently (body helper text vs. an unselected nav state) even though the hex is identical.

### Named Rules
**The One Signal Rule.** A screen shows exactly one tool accent at a time (its own), plus neutral chrome. Never mix two tool accents on the same screen outside the tool switcher itself.

**Status-color exception.** Clinical severity/status readouts (e.g. Shiftside ABG's "balanced" vs. acidosis/alkalosis states) use a fixed semantic vocabulary — green/amber/red — independent of the tool's own signal accent, the same way a monitor's alarm colors don't follow the lead trace color. This is the one deliberate exception to the One Signal Rule: a status color is reporting a clinical state, not tool identity, and should never be repainted to match the tool accent.

## 3. Typography

**Display Font:** Iowan Old Style (with Palatino Linotype, Book Antiqua, Georgia, serif fallback)
**Body Font:** IBM Plex Sans (with Avenir Next, Segoe UI, sans-serif fallback)

**Character:** A humanist serif for rare display moments against a technical, neutral sans for everything functional — the pairing reads as "clinical precision with one warm, human accent," not two competing technical voices.

### Hierarchy
- **Display** (400, `clamp(2rem, 6vw, 3.5rem)`, 1.05 line-height, `-0.04em` tracking, `.font-display`): landing/hero moments only. Rare — most screens never use it.
- **Headline** (900, `text-lg`–`text-xl`, tight tracking): active tool name in the app header, big result numbers (paired with odometer-roll motion).
- **Body** (500–700, `text-base`–`text-xl`, slate-300/50): slider labels, input values, result copy.
- **Label** (700, `10–11px`, `0.2–0.26em` tracking, uppercase): nav pill text, header subtitle, "Home" button — the structural micro-type that holds the chrome together.

### Named Rules
**The Rare Display Rule.** `.font-display` is reserved for landing/marketing headlines. Inside the tools themselves, headline weight (not a font swap) carries emphasis — switching typefaces mid-tool would break the instrument-panel read.

## 4. Elevation

Flat panels, glow for state. There is no traditional gray drop-shadow anywhere in the system; elevation reads through two mechanisms instead: `backdrop-filter: blur` (frosted glass separating a panel from the page behind it) and a colored `box-shadow` bloom (`0 0 20-24px rgba(accent, 0.12-0.3)`) that signals "this is live/active," in the element's own accent color, not gray.

### Shadow Vocabulary
- **Glass separation** (`backdrop-filter: blur(18px)` + 1px `rgba(255,255,255,0.09)` border): panel-surface, sticky header. Structural, not interactive.
- **Accent glow** (`box-shadow: 0 0 20-24px rgba({tool-rgb}, 0.12-0.3)`): active nav pill, active tool icon badge, slider thumb, "live value" states. Always the current tool's own color.

### Named Rules
**The No Gray Shadow Rule.** If a shadow is needed, it either separates glass from background (blur) or signals liveness (accent-colored glow). A neutral gray drop-shadow doesn't appear anywhere in this system — don't introduce one.

## 5. Components

### Buttons
- **Shape:** pill (`rounded-full`) for primary CTAs and nav; `rounded-2xl` (16px) for tactile grid buttons (Numpad keys).
- **Primary:** tool-accent-tinted background at 10% opacity, full accent-color text, accent border at 30% opacity (e.g. cyan Numpad "Next Field" button: `bg-cyan-500/10 border-cyan-500/30 text-cyan-400`).
- **Hover / Active:** background opacity steps up (10% → 20%), `whileTap={{ scale: 0.9 }}` via Framer Motion — every press visibly compresses.
- **Ghost:** `bg-white/5 border-white/10`, used for neutral actions (Numpad digit keys).
- **Destructive:** red-tinted (`bg-red-500/10 border-red-500/30 text-red-400`), reserved for backspace/delete only.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (16px) to `rounded-3xl` (24px) depending on size; larger surfaces get the larger radius.
- **Background:** `panel-surface` (frosted glass) or flat `bg-slate-900` for recessed elements (slider track).
- **Shadow Strategy:** see Elevation — blur separation, no gray shadow.
- **Border:** 1px, `rgba(255,255,255,0.05-0.1)` — always a hairline, never a heavy stroke.

### Inputs / Sliders
- **HapticSlider:** a recessed pill track (`bg-slate-900 rounded-3xl`) with a filled progress region at 20% opacity in the tool's accent, and a floating thumb (`h-12 w-12 rounded-full`, accent-colored, glow shadow, `scale: 1.1` while dragging). Fires `navigator.vibrate(10)` on every whole-unit change while dragging — the haptic click IS the primary feedback, the visual glow is secondary confirmation.
- **Numpad:** a custom 3-column numeric grid replacing the OS keyboard — every key is a tactile glass button with its own haptic tick on press.
- **Focus:** accent-colored glow, not a generic blue focus ring — but must still meet a visible-focus-indicator bar for keyboard/switch-access users (see Do's and Don'ts).

### Navigation
- **App header:** sticky, frosted-glass, safe-area-aware top padding. Three-column grid: Home pill (left) / active tool name + icon badge (center) / optional right-slot action (right).
- **Tool switcher:** horizontal scroll of pill tabs below the header, active tab gets accent glow + accent border + filled dot, inactive tabs are neutral gray.
- **Mobile:** the switcher is the primary cross-tool nav; it's built to be thumbed one-handed while scrolling horizontally.

### Odometer Numbers (signature component)
Big result values (dosing, rates) animate in with a vertical slide-and-fade (Framer Motion `initial={{y:-10,opacity:0}}`) each time the value changes, reinforcing "the number just moved because you moved the input."

## 6. Do's and Don'ts

### Do:
- **Do** give each tool exactly one accent color, sourced from `shiftsideTools[].accent` / `.rgb` — never hardcode a different hex for the same tool elsewhere.
- **Do** use glow (`box-shadow` in the accent color) and blur for depth, never a gray drop-shadow.
- **Do** pair every haptic/glow feedback moment with a `prefers-reduced-motion` fallback (instant state change or crossfade), per PRODUCT.md's accessibility requirement.
- **Do** keep uppercase wide-tracked labels (`0.2em`+) to structural chrome only — nav, eyebrows, subtitles.

### Don't:
- **Don't** ship a sterile, white, Epic/EHR-style form screen — flat white cards, dense radio-button lists, and corporate blue chrome are the explicit anti-reference in PRODUCT.md.
- **Don't** default to a soft consumer-wellness palette (pastel calm, spa-app teal) — this is a bedside instrument, not a wellness app.
- **Don't** mix two tools' accent colors on one screen outside the tool switcher itself (The One Signal Rule).
- **Don't** use a plain gray `box-shadow` anywhere — if elevation is needed, it's blur (structural) or accent glow (state), never neutral gray (The No Gray Shadow Rule).
- **Don't** use `background-clip: text` gradients for anything beyond the existing white→slate-400 numeral treatment; don't extend gradient text to headings or new colored gradients.
- **Don't** reuse Notes Coral as a generic "danger" color outside its own tool screens — it currently overlaps visually with the destructive red used for backspace; keep that overlap in mind rather than expanding it.
