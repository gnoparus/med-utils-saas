---
target: whole app
total_score: 27
p0_count: 1
p1_count: 3
timestamp: 2026-07-29T04-55-40Z
slug: src-app-tsx-whole-app
---
Method: dual-agent (A: general-purpose design-review sub-agent · B: general-purpose detector/browser-evidence sub-agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Odometer numbers, haptic clicks, pending states good; numpad "live" value doesn't always visibly sync until commit |
| 2 | Match System / Real World | 4 | Broselow tape, balance scale, IV drip — genuinely matches clinician mental models |
| 3 | User Control and Freedom | 3 | Reset buttons present; no undo for numpad backspace-to-clear (low stakes, instant recompute) |
| 4 | Consistency and Standards | 1 | One Signal Rule violated on nearly every tool screen (see Anti-Patterns below) |
| 5 | Error Prevention | 3 | Values clamped to valid ranges everywhere |
| 6 | Recognition Rather Than Recall | 3 | Presets/quick-picks reduce recall burden |
| 7 | Flexibility and Efficiency | 3 | Quick-pick chips + manual numpad both available |
| 8 | Aesthetic and Minimalist Design | 3 | Generally restrained; some screens stack glow+gradient+pulse and get busy |
| 9 | Error Recovery | 2 | Out-of-range values silently clamped with zero on-screen "adjusted" feedback |
| 10 | Help and Documentation | 2 | Safety disclaimers present; no inline tooltips for compensation-state jargon |
| **Total** | | **27/40** | **Acceptable — solid foundation, Consistency is the outlier** |

## Anti-Patterns Verdict

**Start here.** Does this look AI-generated? **No** — not in the generic sense. No gradient-text hero, no side-stripe cards, no hero-metric template, no numbered-eyebrow scaffolding. The dark instrument-console identity, physical metaphors (Broselow tape, balance scale, IV bag), and restrained serif-for-display/sans-for-body pairing are genuinely considered and distinctive.

**But measured against the app's own written DESIGN.md, there's a systemic violation**, and it reads less like "AI slop" and more like "shipped tool-by-tool without checking back against the system doc":

- **The One Signal Rule** ("a screen shows exactly one tool accent... never mix two tool accents on the same screen") is broken on nearly every tool screen. NeoDose (cyan) renders med cards in red/amber/blue/violet/emerald. DripDrop (sky) recolors its *entire screen* — background, dial glow, result card — per selected drug, with its own accent barely surfacing. LytesOut, NeuroSnap, TippingPoint, ChartNinja all do the same via per-item/per-category color maps.
- **Confirmed live in-browser**: the shared `Numpad` component (`src/components/ui/Numpad.tsx:57`) hardcodes `bg-cyan-500/10 border-cyan-500/30 text-cyan-400` for its primary action regardless of caller — so ABG's orange screen shows a cyan "Next · PaCO2" button. This is Dose's color bleeding into a shared primitive, not a one-off judgment call.
- **`HapticSlider`** — the primitive CLAUDE.md names as "the tactile input primitive every tool's data entry is built from" — is imported by **zero** tools. Every tool reimplemented its own slider/stepper/dial from scratch. Real, precise duplication, not a vague "could be DRY-er."

**Deterministic scan** (`detect.mjs --json src/apps src/components src/pages`, exit code 2, 114 findings):
- `design-system-color` (advisory, 103 hits) — literal colors outside the DESIGN.md palette, concentrated in DripDrop (19), NeoDose/broselow.ts (16), DripDrop/IVBagAnimation (15), NeuroSnap (15), TippingPoint (15), ChartNinja (14) — this is the detector independently corroborating Assessment A's "color proliferation" finding, file-for-file.
- `gray-on-color` (warning, 9 hits) — `DripDrop/index.tsx:548`, `LytesOut/index.tsx:538,545`, `TippingPoint/index.tsx:697,703`, `LandingPage.tsx:192,856,940`, `ThankYou.tsx:23`. Several (`text-slate-950` on light-300 backgrounds) are likely mislabeled false positives — near-black on a light chip usually reads as strong contrast, not washed-out. Two look like genuine risk: `text-slate-400`/`text-slate-300` on `bg-red-500` (mid-gray on saturated red, worth eyeballing).
- `gradient-text` (warning, 1 hit) — `HapticSlider.tsx:48`. Moot in practice since the component is unused, but it's the one instance in the codebase of the exact pattern DESIGN.md explicitly bans beyond the numeral treatment — worth deleting rather than leaving as dead code per CLAUDE.md's own no-unused-anything discipline.
- `layout-transition` (warning, 1 hit) — `DripDrop/IVBagAnimation.tsx:89`, `transition: height` — animates a layout property, flagged per the parent skill's motion guidance (don't animate layout props unless truly needed).

**Visual evidence**: no injectable browser overlay exists for this static-analysis-only detector (`detect.mjs` has no browser-side console component — confirmed by reading the script, not assumed), so no `[Human]`-tab overlay is available; this is a fallback signal, not a skipped step. Screenshots were captured at verified 1280px and true 390px (via an iframe-wrapper fallback, since `resize_window` failed to actually change the tab's `window.innerWidth` at all this run — worse than the known flooring behavior). At verified mobile width: NeoDose's Broselow color-zone ramp is visibly cut off at the right edge rather than scaled; the horizontal tool-tab strip auto-scrolls to center the active tab and leaves truncated label fragments bleeding off both screen edges (e.g. a lone "OSE" fragment on DripDrop) — consistent with prior work on this (`9d98b35`) but still visually present. Console logging surfaced a real (non-fabricated) framer-motion warning, 8 instances: `"You're attempting to animate multiple children within AnimatePresence, but its mode is set to 'wait'"`, firing on page-load/tab-switch — no console errors otherwise.

## Overall Impression

This is a genuinely well-conceived product with real design intent — the physical-metaphor tools (Broselow tape, balance scale) are the strongest work in the app and deliver on the brand brief better than most "dopamine design" attempts do. The gap isn't taste, it's discipline: the team wrote a precise, opinionated design system (One Signal Rule, No Gray Shadow Rule, a specific slate-400 contrast floor) and then didn't enforce it across six tools built independently. The biggest opportunity is closing that spec-to-shipped gap — most of what's "wrong" here is the app disagreeing with its own rulebook, which is a much cheaper fix than a redesign.

## What's Working

1. **NeoDose's Broselow tape** (`src/apps/NeoDose/index.tsx:172-198, 520-544`) — real color-banded weight zones matching the physical tape clinicians already use, with spring-animated zone transitions. The single best execution of "physical metaphor over form fields" in the app.
2. **ChartNinja's draft persistence** (`src/apps/ChartNinja/index.tsx:36-49, 520-529`) — drafts save per-template to localStorage, clear only after an actual chart-copy (not mere navigation), and correctly avoid double-firing the `first_result` analytics event on restore. Careful edge-case engineering for "don't lose a clinician's half-typed note."
3. **TippingPoint's balance-scale visualization** (`BalanceScale`, lines 161-317) — acid/alkaline driver chips appear on the physically-correct side of a rotating beam, communicating *why* a value is off, not just the number.

## Priority Issues

**[P0] Shared `Numpad` primitive hardcodes Dose's cyan, bleeding onto every other tool**
Why it matters: DESIGN.md names the One Signal Rule explicitly and repeatedly; violating it inside a *shared* component means every tool using `Numpad` (and every future tool that adopts it) inherits the bug silently. Screenshot-confirmed: ABG's "Next · PaCO2" button renders cyan on an orange screen.
Fix: add an `accent`/`accentClass` prop to `src/components/ui/Numpad.tsx`, threaded from each caller's own color token — the same pattern DripDrop/LytesOut already use for their bespoke numpads.
Suggested command: `/impeccable harden`

**[P1] Systemic per-item color proliferation contradicts the One Signal Rule across all 6 tools**
Why it matters: this is the largest gap between spec and shipped app — six tools' worth of drift, independently corroborated by the detector's 103 `design-system-color` hits concentrated in exactly these files. Undercuts the "monitor leads" metaphor DESIGN.md invokes (a real monitor's trace color is fixed per-signal, not per-value).
Fix: decide per-instance whether a color is legitimate severity signaling (traffic-light green/amber/red for clinical severity — keep, and formally carve out as an exception in DESIGN.md) versus arbitrary categorical decoration (drug cards, template chips — rework to tint/weight variations of the tool's own single accent).
Suggested command: `/impeccable audit` (triage first), then `/impeccable colorize`

**[P1] Informational text at `text-slate-600` falls to ~2.5:1 contrast, well below AA**
Why it matters: DESIGN.md itself already flags this exact risk band (rejecting slate-500 at 4.5:1) but several components use slate-600 — darker and worse than the shade the design doc already ruled out. Confirmed in NeoDose's concentration label, ChartNinja's "Required" indicator, LytesOut's clinical notes. The detector's `gray-on-color` findings (`text-slate-400`/`text-slate-300` on `bg-red-500`, `TippingPoint/index.tsx:703`, `LytesOut/index.tsx:545`) corroborate the same underlying discipline gap.
Fix: audit all `text-slate-600` usage on non-decorative text; bump to slate-400 minimum per the design doc's own stated floor.
Suggested command: `/impeccable audit`, then `/impeccable harden`

**[P1] Framer Motion animations lack `prefers-reduced-motion` fallbacks outside one component**
Why it matters: PRODUCT.md requires a reduced-motion alternative for every haptic/glow/pulse effect — not optional. Only `src/apps/LytesOut/LabVial.tsx` implements `useReducedMotion`. The global CSS rule in `src/index.css:49-58` only defeats CSS transitions/animations, not Framer Motion's JS-driven springs (odometer numbers, pulse rings, card entrances) used throughout NeoDose, DripDrop, NeuroSnap, TippingPoint, ChartNinja, and the landing page. A reduced-motion user still gets full spring/pulse treatment everywhere except LytesOut.
Fix: extract LytesOut's `useReducedMotion` pattern into a shared hook and apply it to the repeated spring/pulse/stagger patterns duplicated near-identically across the other five tools.
Suggested command: `/impeccable harden`

**[P2] Mobile header subtitle and tool-tab strip truncate on real 390px devices**
Why it matters: `AppShellHeader`'s subtitle (line 103, `truncate`) ellipsizes real content ("ACID-BASE AND BLOOD GAS ANAL…") at verified 390px — only caught via true-viewport testing, invisible at the wider width `resize_window` actually renders. Separately, the horizontal tool-tab strip auto-scrolls the active tab to center, leaving truncated label fragments bleeding off both edges (e.g. "OSE" on DripDrop) — present across DripDrop/NeoDose/LytesOut/TippingPoint. Minor but on the exact device class this product targets.
Fix: shorten subtitle copy or clamp to two lines at narrow widths; add edge-fade masking to the tab strip (matching the fade already applied to the header nav) so off-screen tabs read as "more available" rather than cut-off text.
Suggested command: `/impeccable typeset`

## Persona Red Flags

**Casey (distracted, one-handed mobile user — the primary ICU/ambulance persona for this product)**
- Header subtitle truncation and the tab-strip edge fragments both read as "unfinished instrument panel," not confident, at exactly the moment Casey is glancing quickly mid-task.
- TippingPoint's secondary preset row (DKA/COPD/Vomiting/Salicylate…) has no scroll-fade affordance, unlike the header nav — no visual cue more presets exist off-screen while scrolling one-handed.
- The cyan Numpad button bleeding onto the orange ABG screen would register, subconsciously, as "did I switch tools by accident?"

**Riley (deliberate stress-tester, extreme input values)**
- ABG fields silently clamp (pH 6.8–7.8, PaCO2 10–120, HCO3 4–50) with zero on-screen indication the value was adjusted (`parseFieldValue`, `TippingPoint/index.tsx:108-117`). Riley enters `9.9` for pH, sees `7.8` reflected back with no explanation — the exact "wrong-number-anxiety" failure mode PRODUCT.md is trying to avoid, and it's silent everywhere clamping happens (NeoDose weight, DripDrop weight, LytesOut electrolyte ranges).
- NeoDose's manual-entry numpad caps at 4 characters and silently rejects out-of-range commits with no feedback (`commit()`, lines 211-219).

**Sam (accessibility-dependent user)**
- Tool switcher nav has good `aria-label`/`aria-current` support — a genuine strength.
- Category severity is signaled by color-only dots with no text label in places (e.g. NeuroSnap's category dots) — a gap for low-vision users.
- The slate-600 contrast failure (P1 above) hurts this cohort directly, before assistive-tech concerns even apply.

## Minor Observations

- `HapticSlider.tsx` is unused dead code (confirmed via grep, zero imports) and is also the one file the detector flagged for `gradient-text` — delete rather than leave as untyped debt, per CLAUDE.md's own noUnusedLocals discipline.
- Landing page's `workflowHighlights` accent colors are close-but-not-exact matches to the documented tool tokens (e.g. `#93c5fd` vs. documented Drips Sky `#7DD3FC`) — minor drift between marketing copy and the design-system source of truth.
- `TippingPoint`'s `FIELD_META.pH.accent` (`#f97316`) doesn't match the documented ABG Orange token (`#FDBA74`).
- Pricing section (Free Essentials / Shiftside Pro) is a clean, non-manipulative two-card layout with no dark patterns — worth calling out as a positive, since paywall UI is often where slop concentrates.
- 8 real (non-fabricated) console warnings from framer-motion: `AnimatePresence` with `mode="wait"` animating multiple children — worth a quick look even though it's not user-visible breakage.
- `DripDrop/IVBagAnimation.tsx:89` animates `height` directly (a layout property) rather than a transform-based equivalent.

## Questions to Consider

- If the One Signal Rule is meant to be load-bearing brand identity, was it aspirational from day one, or did each tool ship independently without checking back against DESIGN.md? The fix path differs a lot depending on the answer.
- `HapticSlider` is the primitive CLAUDE.md calls out by name as the reach-for-first slider, and no tool uses it. Is there a reason it was abandoned worth capturing, or should it just be deleted?
- Is silent input-clamping (no "adjusted to valid range" feedback anywhere) a considered decision or an oversight — and if considered, how does that square with PRODUCT.md's own framing that "wrong-number-anxiety" is the failure mode to avoid most?
