---
target: src/components/app-shell/AppShellHeader.tsx
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-07-28T19-00-38Z
slug: src-components-app-shell-appshellheader-tsx
---
Method: dual-agent (A: general-purpose design-review-agent · B: general-purpose detector-browser-evidence-agent)

## Design Health Score

9 of 10 heuristics are genuinely applicable this round (Assessment A specifically checked, rather than assumed, that Error Prevention and Error Recovery apply — the tool-switcher is a destructive action with no recovery path, so both score low instead of n/a). Only Help & Documentation is correctly n/a for nav chrome.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active tool always clear (glow+dot+`aria-current`), scroll-fade signals more content; no signal that switching is destructive |
| 2 | Match System / Real World | 4 | Clinical terms, familiar iconography, correct register |
| 3 | User Control and Freedom | 2 | Home escape hatch works, but no undo/confirm before a destructive tool switch |
| 4 | Consistency and Standards | 3 | Same component across all 6 tools, but header height varies per-tool (subtitle wrap on 5/6), and controls fall short of the row's own implied 40px tap-target floor |
| 5 | Error Prevention | 1 | Tool switcher can silently discard in-progress work with zero prevention — verified: no autosave, no confirm |
| 6 | Recognition Rather Than Recall | 4 | Switcher always visible, labeled, colored — zero memorization required |
| 7 | Flexibility and Efficiency | 3 | Scroll+fade+auto-center works once learned; no accelerator for a user switching 30+ times/shift |
| 8 | Aesthetic and Minimalist Design | 4 | Restrained, single accent, no clutter — confirmed via live inspection across 3 tools |
| 9 | Error Recovery | 1 | Genuinely applicable and failing: the destructive route switch has no after-the-fact recovery or even acknowledgment |
| 10 | Help and Documentation | n/a | Correctly not applicable to nav chrome for a domain-expert clinical tool |
| **Total (applicable)** | | **25/36 (~69%)** | **Good foundation; the score is dragged down entirely by one root cause — destructive nav with no safety net** |

## Anti-Patterns Verdict

**LLM assessment (Assessment A)**: Not slop, judged against this product's own register. No over-decorated buttons, no invented affordances, no gratuitous motion. The uppercase/wide-tracked micro-labels are one structural-chrome role applied identically system-wide (nav pills + subtitle), not a one-off decorative "eyebrow." The One Signal Rule is genuinely honored in the header — verified live on Dose/Drips/ABG/Notes that icon glow, active-pill glow, and the status dot all pull from a single `tool.accent`/`tool.rgb`, with zero cross-tool color bleed.

**Deterministic scan (Assessment B)**: `detect.mjs --json src/components/app-shell` → **exit 0, zero findings** — corroborated by calling `detectText()` directly on the file, bypassing the CLI, with the same zero-finding result. The header genuinely triggers none of the static regex rules.

Browser-injected detector (3 routes: `/neodose` 24 findings, `/chartninja` 10, `/neurosnap` 22, page-wide) mapped several findings to header elements — `dark-glow` + `ai-color-palette` on the icon badge and active nav pill, `gpt-thin-border-wide-shadow` on the active pill, `call-caps-body` on the subtitle. Both assessments independently converge that these are **false positives**: DESIGN.md explicitly documents accent-colored glow (not gray shadow) as the intended elevation mechanism, one signal accent per tool as deliberate, and uppercase micro-labels as a sanctioned structural-chrome role including "header subtitle" by name. Assessment B additionally caught a likely **detector bug**: a `low-contrast "1.0:1 — #ffffff on #ffffff"` flag on the header `h1` fired on one route (`/chartninja`) but not an identical DOM structure on another (`/neurosnap`) — consistent with a background-sampling race rather than a real rendering defect (screenshots confirm clear white-on-near-black contrast on every route checked).

One real, non-header finding worth relaying: `clipped-overflow-container` on `NeoDose/index.tsx:394`'s page-root wrapper (`overflow-hidden` on a `h-screen w-screen` div) — outside the critiqued file, but worth a look since `overflow-hidden` on an ancestor can interact with the header's `position: sticky`.

**Visual overlays**: Browser mutation + injection succeeded on both assessments; each correctly detected that `resize_window` floored the requested 390px down to 606-701px, and both independently fell back to the iframe-wrapper technique, verifying true 390×844 via `getBoundingClientRect()`/`window.innerWidth` before trusting any mobile-width finding. At verified 390px: **no title truncation** on any of the three routes checked (Dose/Notes/Neuro all render on one line) — a confirmed fix since the last critique round. The switcher shows 3 full + 1 partial of 6 pills without scrolling, with a working directional fade-mask, and — independently confirmed by both assessments — the active pill auto-scrolls into view on mount/deep-link (verified on the Notes and Neuro routes, both later items in the list), so the previously-flagged "active tab invisible on deep link" bug is also confirmed fixed.

## Overall Impression

The header has genuinely improved since the last two critique rounds: the generic blue focus ring and sub-AA subtitle contrast (fixed round 2) and the mobile title truncation plus invisible-active-pill-on-deep-link bugs (targeted by the most recent merged fix) are all independently reconfirmed resolved by both assessments this round, using live measurement rather than reading the changelog. But this round's deeper review surfaced a more consequential class of issue that neither prior round caught: this nav is a **destructive action with zero safety net**. Every tool is an independently-mounted route with no persistence, so any tap — including a mis-tap by a distracted, one-handed, gloved, or interrupted clinician, the exact PRODUCT.md persona — silently discards whatever was half-entered in the tool being left. That risk, plus a subtitle that wraps to 2 lines on 5 of 6 tools (making the header a different height depending which tool you're in) and touch targets that undercut the row's own implied 40px floor, are the real remaining work here. The header's own craft — accent-glow discipline, semantic ARIA, working auto-scroll/fade-mask — is genuinely solid; the gaps are all about what happens *around* a tool switch, not the switcher's visual design.

## What's Working

- **Auto-center + directional fade-mask for the 6-pill switcher is a real, working fix, not a paper claim.** Both assessments independently verified live that the active pill is always visible on load (including deep-links to the 5th/6th items) and the CSS mask correctly flips fade direction as the user scrolls.
- **One Signal Rule discipline, verified not assumed.** Icon glow, active-pill glow/border, and the status dot all derive from the same `tool.rgb`/`tool.accent` pair with zero cross-tool bleed, confirmed across 4+ tool routes by two independent methods (LLM read + browser detector).
- **Accessibility foundation done right the first time.** Correct `aria-current="page"`, per-link `aria-label`s, a working skip-link to a confirmed `#main-content` target in all 6 apps, and a properly responsive `sr-only` label swap on Home — better-built than most production nav headers ship.

## Priority Issues

**[P1] Tool switch silently discards in-progress work, with zero warning**
- **Why it matters**: Confirmed via source: each tool is an independent top-level route (full unmount/remount on switch), and `ChartNinja` has no `localStorage`/`sessionStorage`/`beforeunload` handling anywhere. A half-built chart note or any unsaved input is discarded the instant a nav pill is tapped, no confirmation, no toast. This is the switcher's own core job causing the damage, for the exact "distracted, interrupted, one-handed" persona PRODUCT.md names as primary.
- **Fix**: Either autosave tool state to `localStorage` so switching is safe by design (preferred — no dialog needed, matches this product's offline-first philosophy), or have the header/router prompt before navigating away from a tool with unsaved state via a `hasUnsavedChanges` flag passed up from each tool.
- **Suggested command**: `/impeccable harden`

**[P1] Subtitle wraps to 2 lines on 5 of 6 tools at mobile widths, making header height inconsistent per-tool**
- **Why it matters**: Verified live at true 390px on `/neodose`, `/dripdrop`, `/tippingpoint` — all wrap because the subtitle `<p>` has no `truncate`/`whitespace-nowrap`, unlike the `h1` right above it which does. Only the short Notes subtitle happens to fit on one line. Result: the sticky header is a different height depending which tool you're in, so switching tools produces a visible chrome jump — and it eats vertical space on the smallest screens where this instrument-panel layout can least afford it.
- **Fix**: Add `truncate` to the subtitle `<p>` (matching the h1's existing pattern), or reduce tracking/size at the mobile breakpoint so it reliably fits on one line.
- **Suggested command**: `/impeccable typeset`

**[P2] Nav pills and Home fall under the row's own implied touch-target floor**
- **Why it matters**: Pills (`px-3.5 py-2`, `text-[11px]`) and Home compute to roughly 32-34px tall, under the WCAG 2.5.5 / Apple HIG 44px guideline — and notably under the 40px the component's own `rightSlot` spacer (`h-10 w-10`) already implies as this row's intended floor. A real one-handed, thumb-reach mis-tap risk, compounded by the P1 above: a mis-tap here doesn't just annoy, it silently loses work.
- **Fix**: Increase vertical padding on pills/Home toward ~40-44px hit height (padding or invisible hit-slop, either preserves the current visual chip size).
- **Suggested command**: `/impeccable shape`

**[P3] Focus-ring color inconsistency between tool-specific and tool-agnostic controls**
- **Why it matters**: Nav pills correctly draw `focus-visible:outline` from the active tool's own accent (verified live: focusing the ABG pill produces an orange ring), but Home and the skip-link hardcode `focus-visible:outline-white` instead of using `activeTool.accent`, which is already in scope. Minor — Home has no single natural tool color — but breaks full consistency in an otherwise disciplined accent-driven focus system.
- **Fix**: Use `activeTool.accent` for the Home/skip-link focus ring too.
- **Suggested command**: `/impeccable colorize`

## Persona Red Flags

**Alex (Power User)**: The scroll+fade switcher is fast enough for repeat use, but there's no accelerator for someone switching tools 30+ times a shift. More seriously, Alex is the persona who hits the data-loss bug (P1) most often — frequent switching between tools mid-patient is exactly Alex's workflow, so every switch is a small gamble on whatever's unsaved in the tool being left.

**Sam (Accessibility-Dependent)**: Semantics are genuinely solid — `aria-current`, `aria-label`s, working skip-link, responsive Home label, all confirmed correct in source. Real keyboard Tab-order and 200% zoom could not be fully exercised this round (a browser-automation tooling limitation, disclosed by Assessment A rather than silently skipped) — flag as unverified, not failing; reasoning from the confirmed 2-line subtitle wrap at 390px, a 3rd line at 200% zoom is a plausible risk worth a follow-up check, not a confirmed defect.

**Casey (Distracted Mobile)**: Two concrete, named-element issues converge on Casey specifically: ~32px pill/Home tap targets (P2) raise mis-tap odds one-handed, and a mis-tap triggers the silent state-discard (P1) — so Casey's most likely failure mode is thumb-slip → wrong tool → lost note, with no warning before or after. The 2-line subtitle wrap (P1) also costs Casey vertical screen space at exactly the moment (small phone, mid-task) she can least afford it.

## Minor Observations

- Three previously-flagged bugs are now confirmed fixed by live measurement, not assumption: the generic blue focus ring, sub-AA subtitle contrast, mobile title truncation, and the invisible-active-pill-on-deep-link issue. Genuine progress across three critique rounds.
- Detector likely has a self-matching contrast bug: a `low-contrast "1.0:1 — #ffffff on #ffffff"` finding on the header `h1` fired on one route and not an identical DOM structure on another — worth relaying to whoever maintains the detector rather than treating as a component defect.
- `clipped-overflow-container` on `NeoDose/index.tsx:394`'s page-root wrapper (`overflow-hidden` on `h-screen w-screen`) is outside the critiqued file but worth a look, since an `overflow-hidden` ancestor can interact with the header's `position: sticky`.
- `isShiftsideToolRoute` does exact `pathname === tool.route` matching — fine today with no nested tool routes, but will silently stop marking a pill active if any tool grows a sub-route. Worth a one-line comment for future maintainers.
- Contrast overall is genuinely clean, not the risk a near-black theme might suggest: subtitle text measured ~8:1, inactive pill text ~8.2:1 against their backgrounds, both comfortably above AA. The subtitle's real problem is physical size/wrapping, not contrast.

## Questions to Consider

1. Should tool-switching gain a confirmation dialog, or should the underlying tools autosave everything so the nav becomes safe by design — which fits an "offline-first, bedside, high-interruption" product better than a dialog would?
2. Is a 6-item horizontal-scroll switcher still the right pattern at 390px, or is this the moment to decide the ceiling (bottom tab bar? overflow menu?) before a 7th tool forces the question under worse conditions?
3. Given clinicians may be gloved or one-handed under stress, should 44px touch targets be a hard product-specific floor here rather than a best-practice suggestion the header currently falls short of?
