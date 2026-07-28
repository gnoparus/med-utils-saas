# Product

## Register

product

## Users

Physicians, nurses, EMTs, and medical students, using the tools at the bedside or in transport — often mid-shift, under time pressure, sometimes in a genuine emergency (Code Blue dosing, acute ABG interpretation). Low tolerance for friction: they need a fast, trustworthy answer, not a form to fill out. Frequently one-handed or interrupted; may be offline (ambulance, basement radiology, spotty hospital wifi).

## Product Purpose

MedUtils is a suite of 6 offline-first clinical calculators (pediatric resuscitation dosing, ABG/acid-base analysis, IV pressor rate conversion, electrolyte repletion, GCS/NIHSS scoring, EHR snippet generation) that replace error-prone manual math and paper/app lookup tables with fast, visual, tactile tools. Success = the clinician reaches a correct number faster and with more confidence than a lookup table or MDCalc, at the bedside, without needing connectivity.

## Brand Personality

Tactile, kinetic, clinically confident — README calls this "Dopamine Design": haptic clicks on interaction, glow/pulse feedback on valid states, physical metaphors (a balancing scale for acid-base, a dripping IV bag for infusion rate, odometer-rolling numbers for dosing) instead of bare form fields. The voice is expert and terse, not clinical-form dry and not consumer-wellness soft. Confidence comes from the interface behaving like a precision instrument, not from friendly copy.

## Anti-references

Not generic med-SaaS: no sterile Epic/EHR blue-and-white corporate forms, no dense radio-button lists, no boring clinical intake-form aesthetic. Also not a soft consumer-health app (Apple Health / Calm-style wellness pastels) — this is a high-stakes bedside instrument, not a wellness companion.

## Design Principles

- **Speed over ceremony.** No screen a clinician hits under time pressure should require navigation, menus, or multi-step forms before showing the number.
- **Tactile confirmation over trust-me numbers.** Every meaningful input gets a physical-feeling response (haptic, glow, snap, odometer roll) so the clinician can trust the output without re-deriving it by hand.
- **Physical metaphor over raw form fields.** Where the domain has a natural physical analog (balance, drip rate, dial, slider), render that instead of dropdowns and text inputs.
- **Free core, paywall depth.** The free tier must be genuinely fast and complete for the common/critical case; monetization gates advanced or edge-case modes, never the critical-path answer.
- **Offline-first, always.** No feature may depend on network connectivity; state lives in localStorage, not a backend.

## Accessibility & Inclusion

WCAG AA contrast minimum throughout. Every haptic/glow/pulse feedback effect needs a `prefers-reduced-motion` alternative (crossfade or instant state change, not suppressed feedback). No strobing or flashing above safe thresholds — glow/pulse effects should be brightness shifts, not rapid on/off flicker.
