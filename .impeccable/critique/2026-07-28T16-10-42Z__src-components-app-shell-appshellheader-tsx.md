---
target: whole app / app-shell (AppShellHeader.tsx)
total_score: 20
p0_count: 0
p1_count: 2
timestamp: 2026-07-28T16-10-42Z
slug: src-components-app-shell-appshellheader-tsx
---
Method: dual-agent (A: design-review-agent · B: detector-browser-evidence-agent)

## Design Health Score

Target is chrome/navigation only (no destructive actions, no error states, no help surface live here), so 3 heuristics are n/a.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | On real mobile widths, deep-linking to a tool near the end of the switcher (Neuro/Notes) shows **zero active-state signal** — nothing scrolls the active pill into view |
| 2 | Match System / Real World | 4 | Icon-per-tool mapping (droplet=Drips, baby=Dose, brain=Neuro, flask=ABG) matches clinical mental models cleanly |
| 3 | User Control and Freedom | 3 | Home is one tap from anywhere; no "previous tool" affordance, minor given the flat 6-sibling IA |
| 4 | Consistency and Standards | 2 | The header's own One Signal Rule is broken through its own `rightSlot` escape hatch — verified live: ChartNinja injects a blue `CompletionRing` into the coral Notes header |
| 5 | Error Prevention | n/a | Chrome only — no destructive/input actions live here |
| 6 | Recognition Rather Than Recall | 4 | Persistent identity (name+icon+color+active pill) is always visible; zero memory burden |
| 7 | Flexibility and Efficiency | 2 | Tap-only; no keyboard shortcuts or gesture beyond native scroll for a nav a clinician may hit 50x/shift |
| 8 | Aesthetic and Minimalist Design | 3 | Clean instrument-panel read, but 3 persistent chrome rows stack on every screen; subtitle largely duplicates icon+color+name |
| 9 | Error Recovery | n/a | No error states in navigation chrome |
| 10 | Help and Documentation | n/a | Chrome doesn't need inline help; reasonable omission |
| **Total (applicable)** | | **20/28 (~71%)** | **Good foundation; two new mobile-specific findings this run outweigh last run's fixes** |

## Anti-Patterns Verdict

**LLM assessment (Assessment A)**: Clean. No gradient text, no decorative glassmorphism, no side-stripe borders, no hero-metric template, no eyebrow scaffolding, no numbered section markers. The uppercase micro-label subtitle is a documented DESIGN.md system pattern (§3, structural chrome), not slop scaffolding. Reads as a bespoke instrument-panel nav.

**Deterministic scan (Assessment B)**: `detect.mjs --json src/components/app-shell` → **exit 0, 0 findings** — a real improvement over the prior run, which flagged 2 `design-system-color` findings on the inactive nav-pill text/dot. Those appear resolved or now covered by the documented palette.

Browser-injected detector (full `/neodose` page, 24 total findings page-wide) mapped 6 findings to header elements: `dark-glow` + `ai-color-palette` on the active icon badge and active switcher pill, `gpt-thin-border-wide-shadow` on the pill, and a new one this run — `call-caps-body` on the subtitle ("uppercase on 33 chars of body text"). Cross-checked against DESIGN.md: the glow/color/border findings are **false positives** — DESIGN.md explicitly prescribes accent-colored glow (`0 0 20-24px rgba(accent,0.12-0.3)`, "The No Gray Shadow Rule") and per-tool accent color ("The One Signal Rule") as the deliberate system, not generic AI neon. `call-caps-body` is also likely a false positive against the documented Label type role, though Assessment A independently flagged the subtitle's actual *content* value (not its casing) as questionable — see Minor Observations.

**Visual overlays**: Browser mutation + injection succeeded; live-server ran and was stopped cleanly. At a **verified** true 390px viewport (via iframe-wrapper fallback — `resize_window` floored to 606×701 on two separate attempts, matching the known tool limitation), both assessments independently confirmed: the header title clips to **"Shiftside …"**, and the tool switcher shows only 4 of 6 pills without scrolling. Assessment B additionally verified — via a real scroll gesture, not a programmatic one — that the scroll-fade mechanism itself works correctly (mask flips from right-fade to left-fade as the user scrolls, and the 6th pill does become reachable). Assessment A's deeper finding: **nothing auto-scrolls the active pill into view**, so a direct link to Notes or Neuro on a phone shows an apparently unhighlighted nav strip until the user manually scrolls. These two findings are complementary, not contradictory: the fade cue works once the user scrolls, but there's no cue telling them they need to.

## Overall Impression

The two P1s fixed after the last critique — the generic blue focus ring and the sub-AA subtitle contrast — are confirmed resolved in the current source (`outlineColor: tool.accent` on every pill, subtitle at `text-slate-400` ≈7.4:1). That's real progress. But this run's deeper mobile and cross-file testing surfaced two new, more consequential problems: the header's own identity-check (title + active state) fails at exactly the moment — one-handed, on a phone, mid-shift — that PRODUCT.md says matters most, and the component's own `rightSlot` escape hatch lets a consumer (ChartNinja) violate the One Signal Rule from day one. The score reads as a regression, but it's really the critique getting sharper, not the component getting worse.

## What's Working

- **Fixes from the last critique are real and verified.** Focus rings are accent-colored (`outlineColor: tool.accent`) and subtitle contrast is fixed (`slate-400`, ~7.4:1) — both hold up under direct inspection of current source.
- **Scroll-aware edge fade is a genuine, non-generic affordance.** `NAV_FADE` keyed off live `scrollLeft`/`scrollWidth` correctly flips between `none`/`right`/`both`/`left` — verified via a real scroll gesture, not just code-reading.
- **Non-color-only active-state encoding.** Filled dot + border + glow + `aria-current="page"` + bold accent text together give colorblind and screen-reader users an unambiguous "you are here" signal without relying on hue alone — when it's visible at all (see P1 below).

## Priority Issues

**[P1] Tool name truncates to "Shiftside …" at real mobile widths**
- **Why it matters**: Verified independently by both assessments at a confirmed true 390px viewport. The fixed `grid-cols-[6rem_1fr_6rem]` layout leaves too little center width for the full tool name once the icon is added. This is the fastest identity check a one-handed, time-pressured clinician makes, and it fails on the device this product is built for.
- **Fix**: Replace the fixed `6rem` side tracks with content-sized (`auto`) columns, or collapse "Home" to icon-only below a mobile breakpoint to free center width. Consider letting the title wrap instead of truncating.
- **Suggested command**: `/impeccable adapt`

**[P1] Active tool pill isn't scrolled into view on mount or deep-link**
- **Why it matters**: Confirmed live: opening `/chartninja` (Notes, last item) at mobile width shows Dose/ABG/Drips/Lytes with no active state visible anywhere until the user manually scrolls. The existing `useEffect` computes fade state but never scrolls `[aria-current="page"]` into view.
- **Fix**: After `updateFade()`, scroll the active pill into view (`inline: 'center'`) on mount and on `toolId` change.
- **Suggested command**: `/impeccable polish`

**[P2] `rightSlot` has no contract enforcing the One Signal Rule**
- **Why it matters**: Verified live — `ChartNinja` passes a blue `CompletionRing` into the coral Notes header, putting two tool accents on one screen, which DESIGN.md explicitly bans outside the switcher itself. The header doesn't hand its own accent down to the slot, so this drift was structurally invited, not a one-off mistake.
- **Fix**: Pass `activeTool.accent`/`.rgb` into slot content via a render-prop, or type/document that `rightSlot` content must consume the active accent.
- **Suggested command**: `/impeccable harden`

**[P2] `scrollbar-none` isn't a real utility in this build**
- **Why it matters**: Computed style on the live nav shows `scrollbar-width: auto` — no plugin or `@utility` defines `scrollbar-none` anywhere in the repo. On any environment that shows OS scrollbars by default, a native gray scrollbar renders under the pill row, undermining the frosted-instrument aesthetic this component otherwise protects carefully.
- **Fix**: Add a real `scrollbar-width: none` plus `::-webkit-scrollbar{display:none}` rule.
- **Suggested command**: `/impeccable polish`

**[P3] No skip link; header remounts every navigation**
- **Why it matters**: Each tool screen mounts its own header rather than sharing a persistent layout route, so keyboard/screen-reader users re-tab through Home + 6 pills (7 stops) before reaching content on every single navigation.
- **Fix**: Add a visually-hidden skip-to-content link as the first focusable element, or hoist the header into a shared layout route.
- **Suggested command**: `/impeccable harden`

## Persona Red Flags

**Alex (Power User)**: Hits the truncated title on every phone screen and must trust icon/color alone to confirm a switch landed. No shortcut or swipe path exists beyond tapping one of 6 same-sized pills — switching tools 50x/shift is exactly as slow as a first visit. Deep-linking near the end of the list shows no active-state feedback until manually scrolled.

**Sam (Accessibility-Dependent)**: 7 tab stops before content, repeated on every navigation, no skip link. On the positive side, `aria-current="page"` is wired correctly and focus rings are already accent-colored from the prior fix pass.

**Casey (Distracted Mobile)**: Both P1s land squarely here — the exact glance meant to confirm "right tool, right patient math" is cut off, and a shared or bookmarked link to Notes/Neuro shows an apparently un-highlighted nav strip. Home and the switcher both sit outside comfortable one-handed thumb reach on a large phone — an inherent header-nav tradeoff worth naming given PRODUCT.md's explicit one-handed-use requirement.

## Minor Observations

- 6 pills exceed the ≤4 chunking guideline; scroll+fade mitigates discoverability cost but doesn't eliminate it.
- The subtitle line duplicates information already carried by icon+color+name and forces a 2-line wrap on mobile — worth asking whether it earns its vertical-space cost on every screen.
- Home's focus ring is plain white while tool pills use accent-colored rings — defensible (Home has no natural tool color) but worth a deliberate call-out rather than an implicit inconsistency.
- The empty `rightSlot` placeholder reserves a full 96px column on 5 of 6 tool screens, directly narrowing the center column where the truncation bug lives.

## Questions to Consider

- If the switcher's job is "primary cross-tool nav, thumbed one-handed" per DESIGN.md, why does nothing guarantee the active tool is ever visible in that scrollable strip?
- Is the subtitle pulling its weight, or is it structural decoration costing vertical space without adding information the icon+color+name doesn't already give?
- Should `rightSlot` stay an arbitrary `ReactNode`, given its one real consumer already broke the One Signal Rule with it?
