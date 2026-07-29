---
target: src/App.tsx (whole app)
total_score: 27
p0_count: 1
p1_count: 3
timestamp: 2026-07-29T05-44-26Z
slug: src-app-tsx-whole-app
---
Method: dual-agent (A: whole-app design review · B: detector + browser evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Odometer-roll numbers, haptic ticks, live glow give strong feedback |
| 2 | Match System / Real World | 4/4 | Broselow tape, IV bag, balance scale are accurate domain metaphors |
| 3 | User Control and Freedom | 2/4 | No undo, no "reset to default" affordance beyond backspace-by-digit |
| 4 | Consistency and Standards | 2/4 | Paywall color system breaks the app's own One Signal Rule in 4/6 tools |
| 5 | Error Prevention | 3/4 | DangerBanner high-dose warnings, clinical disclaimer present |
| 6 | Recognition Rather Than Recall | 3/4 | Quick-pick presets, per-drug defaults reduce recall load |
| 7 | Flexibility and Efficiency | 3/4 | Numpad/slider/preset triple entry paths are fast |
| 8 | Aesthetic and Minimalist Design | 3/4 | Clean per-tool, but nested-card overuse and color noise dock a point |
| 9 | Error Recovery | 2/4 | No visible "out of range" error copy; inputs appear to silently clamp |
| 10 | Help and Documentation | 2/4 | No in-app help/tooltip layer beyond labels + disclaimer footer |
| **Total** | | **27/40** | **Acceptable — solid instrument metaphor, but color-system discipline and desktop layout need work before this reads as fully shipped** |

## Anti-Patterns Verdict

**LLM assessment**: Partial slop. The core instrument-panel identity (dark navy, blur/glow, pill nav, IBM Plex + rare serif) is genuinely distinctive — no gradient text, no 01/02/03 markers, no eyebrow-on-every-section reflex on the landing page. But every in-tool "Pro" paywall card is a textbook generic-SaaS purple-gradient unlock pattern (lock icon in a violet circle, checkmark list, gradient CTA) — the single most "AI made this" moment in the app, and it directly contradicts the app's own documented One Signal Rule.

**Deterministic scan**: CLI `detect.mjs --json src` returned exit 2, 61 findings: `design-system-color` (49, advisory), `gray-on-color` (9, warning), `design-system-radius` (2, advisory), `layout-transition` (1, warning). The 49 color hits cluster almost exactly where the LLM review independently flagged the paywall problem — ChartNinja's purple (7 hits), DripDrop's off-brand blue, NeoDose's purple+emerald gradient — strong dual-confirmation. The 9 `gray-on-color` hits are a separate, concrete accessibility bug the LLM review didn't catch: muted/gray text sitting directly on saturated color badges (`LytesOut/index.tsx:572` slate-400 on red-500, `TippingPoint/index.tsx:706` slate-300 on red-500, plus slate-950-on-cyan-300 pairs on the landing page and `ThankYou.tsx:23`).

Live browser injection (landing + `/dripdrop`, `/lytesout`, `/neodose`) surfaced a category the LLM review missed entirely: **nested-cards** — 52 instances on the landing page, 6–9 per tool screen. This is one of Impeccable's explicit absolute bans ("nested cards are always wrong") and the detector caught it at scale where a design-director read didn't. It also flagged `gpt-thin-border-wide-shadow` (15 instances across all 4 pages sampled) — the classic thin-border-plus-soft-shadow AI tell — reinforcing that the "partial slop" verdict may be generous.

**False positives worth flagging**: the 51 `low-contrast` hits on the landing page (many reported as literal "#ffffff on #ffffff, 1.0:1") look like a background-sampling artifact against this app's semi-transparent/gradient dark panels rather than real white-on-white text — needs a manual contrast check before treating as real. NeoDose's Broselow-tape color set (16 of the 49 `design-system-color` hits) is a fixed external clinical standard, not decorative drift — technically outside DESIGN.md's palette but not actionable the same way. `dark-glow` findings (28 combined across pages) are likely also false positives given DESIGN.md explicitly mandates accent-colored glow over gray shadow as the elevation system — the detector doesn't know that's intentional here.

**Visual overlays**: not applicable this run — Assessment B read structured findings via `window.impeccableScan()` rather than a persistent visible overlay; no `[Human]` tab was left open for inspection.

## Overall Impression

The physical-metaphor core (drip dial, IV bag, Broselow tape, odometer numbers) is the real thing — a design director would call this out as unusually well-executed for a clinical calculator category that's normally sterile forms. The gap between that ambition and the "Pro" paywall moments is stark: exactly where the app should feel most like a precision instrument (offering to go deeper), it instead looks like four different AI sessions each generated their own generic purple unlock card. Fix the color-system discipline on paywalls and the desktop layout gap, and this becomes a genuinely distinctive product UI rather than one with an obvious tell.

## What's Working

1. **`src/apps/DripDrop/index.tsx` + `IVBagAnimation.tsx`/`RadialDial.tsx`** — the drip-rate dial and animated IV bag are a well-executed physical metaphor that matches PRODUCT.md's "Dopamine Design" ambition better than a typical calculator UI.
2. **`src/apps/NeoDose/broselow.ts`** — Broselow-tape-accurate color banding is clinically authentic rather than decorative, a defensible physical-metaphor choice even though it technically multiplies on-screen hues (both assessments independently flagged this as a deliberate exception, not drift).
3. **`src/components/app-shell/AppShellHeader.tsx`** — the scroll-fade-masked tool switcher correctly reveals/hides edge fades based on real scroll position, verified live at true 390px width; reads as a genuine fix carried over from the prior header critique round.

## Priority Issues

**[P0] Paywall CTAs break the app's own One Signal Rule, confirmed by both review and detector**
Why it matters: `NeuroSnap/index.tsx:743-769` (purple), `ChartNinja/index.tsx:713-744` (purple, 7 static color hits), `NeoDose/index.tsx:611-637` (purple-to-emerald gradient), `DripDrop/index.tsx:505-536` (off-brand blue) each invent their own paywall color instead of the tool's own accent — only `LytesOut/index.tsx:505-538` gets it right (amber). This is the single most "AI made this" moment in the app and it's the highest-visibility monetization surface.
Fix: extract one shared `ProUpsellCard` component (none exists today — every tool hand-rolls its own) parameterized by the calling tool's accent/rgb, and delete the copy-pasted purple/blue/emerald literals.
Suggested command: `/impeccable polish`

**[P1] Muted-gray text on saturated color badges fails contrast**
Why it matters: 9 static hits from the detector, not a sampling artifact — `LytesOut/index.tsx:572` (slate-400 on red-500), `TippingPoint/index.tsx:706` (slate-300 on red-500), plus slate-950-on-cyan-300 pairs on the landing page (×3) and `ThankYou.tsx:23`. PRODUCT.md sets WCAG AA as a hard floor; light gray text on saturated color is exactly the "washed out" failure the general design rules call out by name.
Fix: swap muted text on colored badges for the background's own darker/lighter ink shade (per the "Verify contrast" rule), not the generic slate gray.
Suggested command: `/impeccable audit`

**[P1] `prefers-reduced-motion` doesn't cover the Framer Motion-driven glow/pulse effects**
Why it matters: only `LytesOut/LabVial.tsx` calls `useReducedMotion()`. The global CSS rule (`src/index.css:49-58`) zeroes CSS `animation`/`transition` durations only — it does nothing for Framer Motion's JS/WAAPI-driven `animate`/`whileTap`/`repeat: Infinity` props, e.g. NeoDose's epinephrine pulse ring (`index.tsx:70-78`) or TippingPoint's spring-rotated balance scale. This is a named PRODUCT.md accessibility requirement, and it's the kind of gap that looks fixed (a CSS block exists) but isn't for the animation engine actually in use everywhere else.
Fix: wrap shared glow/pulse animation values through one `useReducedMotion()`-gated helper, reused by all six tools instead of one.
Suggested command: `/impeccable animate`

**[P1] No desktop-specific layout — tool screens stay phone-width in a wide viewport**
Why it matters: confirmed live at 1440px — `DripDrop`, `NeoDose`, etc. render effectively phone-width content with a large unstyled black gutter to the right (`DripDrop/index.tsx:303-318` has no `max-w-*`/`mx-auto` centering). This reads as broken/unfinished to anyone reviewing on a laptop or using a workstation, undermining the "precision instrument" impression outside the phone use case.
Fix: add a centered max-width constraint on the outer container for tool routes, or an explicit desktop two-column layout.
Suggested command: `/impeccable adapt`

**[P2] Nested-card overuse across the landing page and every tool screen**
Why it matters: detector-only catch (52 instances on the landing page, 6-9 per tool page) that the design review missed entirely — this is one of Impeccable's explicit absolute bans ("nested cards are always wrong"), not a subjective call.
Fix: flatten bordered/translucent-background divs currently nested inside other card containers; use spacing/dividers instead of a card-in-a-card.
Suggested command: `/impeccable layout`

## Persona Red Flags

**Sam (Accessibility-Dependent)**: The reduced-motion gap above is a direct hit — a user with OS-level `prefers-reduced-motion: reduce` set will still see the epinephrine pulse ring animate indefinitely and the balance scale spring-rotate, exactly the "no suppressed feedback, but no unmanaged motion either" case PRODUCT.md calls out by name. Focus-ring color/behavior is present in code (`AppShellHeader.tsx:69,79` set per-tool `outline-color`) but wasn't tab-order tested live this run.

**Casey (Distracted Mobile)**: At a genuine 390px width (confirmed via iframe workaround after `resize_window` floored to 606-1280px on the first attempts), the tool-switcher's scroll-fade mask works correctly. But tapping a locked feature (e.g. NIHSS from Neuro) replaces the entire screen with a full-bleed purple modal with no tested tap-outside-to-dismiss affordance — a distracted, one-handed user who mis-taps a locked tab gets a full interruption rather than an inline, dismissible nudge.

## Minor Observations

- Landing page's 3-card "What Shiftside helps you do in seconds" section is the closest thing on the marketing page to templated feature-grid scaffolding.
- `TippingPoint`'s `BalanceScale` screen shows 4 simultaneous hues (tool orange, acidosis rose, alkalosis cyan, status green) — clinically motivated (litmus-style convention) but a hard case against the One Signal Rule as written; worth an explicit documented exception in DESIGN.md rather than a silent divergence.
- `CLAUDE.md` documents a shared `HapticSlider` component in `src/components/ui/` that doesn't exist (zero grep matches) — each tool hand-rolls its own slider/dial, risking drift. Minor docs/reality mismatch worth reconciling.
- Pricing section on the landing page (cyan CTA) is internally brand-consistent, which makes the in-tool purple paywalls look even more like a bolted-on afterthought by contrast.
- `oversized-h1`, `hero-eyebrow-chip`, `all-caps-body`, `tiny-text`, `single-font`, `cramped-padding`, and `clipped-overflow-container` each fired once or twice on individual pages — low-volume, worth a spot-check during a `/impeccable audit` pass but not independently prioritized above.

## Questions to Consider

- If the One Signal Rule is load-bearing enough to be named and documented, why does every tool's highest-visibility monetization moment break it the same way — was this copy-pasted from one template before any tool got its real design pass?
- Is the Broselow/litmus multi-hue data visualization a deliberate, documented exception to the One Signal Rule, or an accident that every future contributor will have to re-litigate?
- Was the CSS-only `prefers-reduced-motion` fallback believed to cover Framer Motion's JS-driven animations, or was this never checked against the specific engine in use?
