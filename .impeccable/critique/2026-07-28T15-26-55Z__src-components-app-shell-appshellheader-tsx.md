---
target: whole app / app-shell (AppShellHeader.tsx)
total_score: 22
p0_count: 0
p1_count: 2
timestamp: 2026-07-28T15-26-55Z
slug: src-components-app-shell-appshellheader-tsx
---
Method: dual-agent (A: design-review-agent · B: detector-browser-evidence-agent)

## Design Health Score

Target is chrome/navigation only (no destructive actions, no error states, no help surface live here), so 3 heuristics are marked n/a rather than force-scored.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active tool clearly marked (icon, name, glow, `aria-current`); nothing signals offline/connectivity state despite this being an offline-first product |
| 2 | Match System / Real World | 3 | Most icons map cleanly (droplet=Drips, baby=Dose); "Zap" for electrolytes is a generic-energy metaphor, not domain-specific |
| 3 | User Control and Freedom | 4 | Home pill is a clear, always-present escape hatch |
| 4 | Consistency and Standards | 2 | Active-pill shadow (`0 10px 24px`, directional) breaks from icon-badge shadow (`0 0 24px`, ambient) — same "Accent Glow" token used two different ways; focus ring is the browser-default blue outline, contradicting DESIGN.md's own no-generic-blue-focus rule |
| 5 | Error Prevention | n/a | Chrome only — no destructive/input actions live here |
| 6 | Recognition Rather Than Recall | 4 | Persistent labeled nav + always-visible active state |
| 7 | Flexibility and Efficiency | 2 | Tap-only; 6th switcher item requires an undiscoverable scroll with zero affordance |
| 8 | Aesthetic and Minimalist Design | 4 | Genuinely restrained — dark base, one accent, no clutter |
| 9 | Error Recovery | n/a | No error states in navigation chrome |
| 10 | Help and Documentation | n/a | Chrome doesn't need inline help; reasonable omission |
| **Total (applicable)** | | **22/28 (~79%)** | **Good — solid foundation, dragged down by consistency + flexibility gaps** |

## Anti-Patterns Verdict

**LLM assessment (Assessment A)**: No AI slop. No gradient text, no side-stripe borders, no glassmorphism-as-decoration (the header's `backdrop-blur-xl` does real work separating scrolled content from chrome), no hero-metric template, no card grid. The uppercase micro-label under the tool name reads at first glance like a generic "eyebrow" cliché, but it's a documented, consistently-applied type role used identically across all 6 tools — a real system, not a templated one-off. Verified programmatically that the active accent color is sourced from the shared `shiftsideTools[].rgb` config, not hardcoded per instance.

**Deterministic scan (Assessment B)**: `detect.mjs --json src/components/app-shell` → exit code 2, 2 findings, both the same rule (`design-system-color`): the inactive nav-pill text (`#94a3b8`) and dot (`rgba(148,163,184,0.55)`) aren't in DESIGN.md's documented palette. Advisory severity, not a hard violation — likely just an undocumented muted-neutral state that was never added to the token list.

Browser-injected detector (full `/dripdrop` page, 51 total findings page-wide) mapped 5 findings specifically to header elements: `dark-glow` + `ai-color-palette` on the tool-icon badge and the active nav pill ("cyan neon text on dark background") — these are **false positives** given DESIGN.md's deliberate one-signal-color-per-tool system, not generic AI neon. But one header finding is a **real, convergent signal**: `gpt-thin-border-wide-shadow` on the active nav pill (1px border + 24px shadow blur) — this independently corroborates Assessment A's Consistency finding on the same element (the offset `0 10px 24px` pill shadow breaking from the ambient-glow formula used everywhere else). Two independent methods flagging the same element from different angles is the strongest signal in this critique.

**Visual overlays**: Browser mutation + injection succeeded; live-server ran and was stopped cleanly afterward. Desktop (606px — `resize_window` floored below the requested 1280px, a known tool limitation) showed the full header intact. Mobile (390px, captured via local iframe-wrapper fallback since `resize_window` also floored the 390px request) directly confirmed: the header title clips to **"Shiftside ..."** at true mobile width, and the tool switcher visibly cuts off after 4 of 6 pills (Neuro/Notes scrolled out of view) with a stray native scrollbar rendering under the `scrollbar-none` row on both widths.

## Overall Impression

This is a well-built, intentional design system, not a generic AI shell — the per-tool accent-color sourcing, semantic ARIA wiring, and restrained dark-instrument aesthetic are all real and correctly implemented. But two of its own explicitly-documented rules (accent-colored focus states, WCAG AA contrast) are violated in the one component every single screen depends on, and the 6-item tool switcher — this product's primary cross-tool navigation — visibly loses items off-screen on real phones with no cue that there's more to find. The biggest opportunity: this header is used on every screen, so any fix here compounds across all 6 tools at once.

## What's Working

- **Single-sourced accent color, not decorative.** The header pulls `rgb`/`accent` directly from `shiftsideTools[]` — the "One Signal Rule" is enforced structurally, so it can't silently drift per-tool.
- **Real semantic navigation.** `aria-current="page"`, per-link `aria-label`s ("Open ABG"), and a labeled `nav` landmark are all correct — better screen-reader hygiene than most bespoke nav bars ship with.
- **Layout math protects against overflow breakage.** Fixed `6rem` side columns plus `truncate` keep the header's shape stable across all 6 routes regardless of tool-name length.

## Priority Issues

**[P1] Focus ring is the generic browser-default blue outline, not an accent glow**
- **Why it matters**: Confirmed via computed styles — keyboard/switch-access users get a plain blue ring, directly contradicting DESIGN.md: *"Focus: accent-colored glow, not a generic blue focus ring."* Breaks the accent-language contract at the exact moment accessibility-dependent users interact with it.
- **Fix**: `focus-visible:outline-none` + a `focus-visible:ring-2` styled in the current tool's accent (or `currentColor`, since active-pill text is already accent-tinted), with adequate offset.
- **Suggested command**: `/impeccable harden`

**[P1] Subtitle text fails WCAG AA contrast**
- **Why it matters**: Measured contrast of the slate-500 subtitle (`#64748b`) against the header background ≈ 4.0:1 — below the 4.5:1 AA minimum for normal-size text (10px uppercase doesn't qualify for the large-text exemption). Directly violates PRODUCT.md's accessibility requirement.
- **Fix**: Step the subtitle color up to slate-400 (`#94a3b8`, verified ≈7.4:1 against the same background) or increase weight/size.
- **Suggested command**: `/impeccable harden`

**[P2] Active nav-pill shadow breaks the system's own glow formula — confirmed two independent ways**
- **Why it matters**: The active pill uses a directional `box-shadow: 0 10px 24px rgba(...)` while every other glow in the system (icon badge) is symmetric/ambient (`0 0 24px`). This reads as a conventional drop-shadow smuggled back in under an accent hue — exactly what "The No Gray Shadow Rule" exists to prevent, even with the right color. The automated detector independently flagged the same element as `gpt-thin-border-wide-shadow` (1px border + wide shadow blur), a known AI-slop shadow pattern — two unrelated methods converging on one element is strong evidence this is a real inconsistency, not a nitpick.
- **Fix**: Change the pill's active shadow to `0 0 20px rgba(...)` to match the icon badge's ambient formula.
- **Suggested command**: `/impeccable typeset`

**[P2] Tool switcher loses items off-screen on real phones with zero affordance, and uses undocumented gray tokens**
- **Why it matters**: Directly observed at mobile width (390px): only 4 of 6 tools stay visible, Neuro and Notes scroll off with no fade mask, arrow, or count cue — `scrollbar-none` removes the one native hint a browser gives for free. Separately, the CLI detector flagged the inactive-pill text/dot colors (`#94a3b8`, `rgba(148,163,184,0.55)`) as not present anywhere in DESIGN.md's documented palette — a real, if minor, design-system drift.
- **Fix**: Add a directional edge-fade mask (or trailing arrow glyph) when `scrollWidth > clientWidth`; separately, add the inactive-state gray as a named Neutral token in DESIGN.md so it stops being undocumented drift.
- **Suggested command**: `/impeccable clarify`

**[P3] Zero `prefers-reduced-motion` handling anywhere in `src`**
- **Why it matters**: A repo-wide grep for `prefers-reduced-motion` returns nothing, despite PRODUCT.md mandating a reduced-motion alternative for every glow/pulse/haptic effect. Low severity in the header specifically (its own transition is a one-shot 200ms state change, not a loop), but this is a documented, universal product requirement with zero implementation anywhere, header included.
- **Fix**: Add a project-wide `@media (prefers-reduced-motion: reduce)` block that disables/shortens transitions and glow animations.
- **Suggested command**: `/impeccable adapt`

## Persona Red Flags

**Jordan (First-Timer)**: Six pills render nearly edge-to-edge with the scrollbar hidden and no fade/arrow cue — nothing tells Jordan that "Notes" exists off to the right. First contact with the nav may leave two of six tools undiscovered.

**Sam (Accessibility-Dependent)**: Keyboard reachability and ARIA wiring are genuinely solid — but the moment Sam tabs into the header, the focus indicator is a plain default blue ring instead of the promised accent glow, and the subtitle line beneath the tool name falls just under AA contrast, so a low-vision pass loses that context line first.

**Casey (Distracted Mobile User)**: The switcher sits at the very top of a tall phone screen — the hardest one-handed thumb-reach zone — in direct tension with PRODUCT.md's "frequently one-handed" clinician profile. Every tool change costs a hand-shift or stretch.

## Minor Observations

- The empty right-slot placeholder (`h-10 w-10` div when no `rightSlot` is passed) correctly preserves the 3-column grid's balance when nothing is passed — intentional, not dead code.
- The icon-badge glow is the single best "alive" moment in the header, implemented per-spec (ambient, symmetric, accent-colored) — treat it as the reference implementation when fixing the pill shadow above.
- The filled/muted dot inside each pill duplicates color information already carried by text and background — redundant but harmless.
- Two `ai-color-palette` / `dark-glow` detector flags on the icon badge and active pill ("cyan neon text on dark background") are false positives given DESIGN.md's deliberate one-signal-color-per-tool system — worth noting so future scans aren't second-guessed on this by design.

## Questions to Consider

1. If DESIGN.md calls the switcher "the primary cross-tool nav," why does the redundant centered title (which only ever names the tool you're already looking at) get equal vertical real estate — could that space instead make the switcher itself bigger and more thumb-friendly?
2. Both the accent-colored-focus rule and the `prefers-reduced-motion` requirement are explicitly written into this project's own DESIGN.md/PRODUCT.md, and neither is implemented anywhere in the header. Is the design system a contract the team checks builds against, or a document nobody re-opens after the first pass?
3. At 6 tools the switcher already overflows on a real phone with zero affordance. Given "free core, paywall depth" implies more tools over time, what's the plan at 8–10 — does this flat unchunked row survive, or does it quietly become an unusable horizontal-scroll junk drawer?
