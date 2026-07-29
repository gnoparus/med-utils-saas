# Context

## Glossary

### Shiftside Pro
Single flat subscription ($14.99/mo or $119/yr) that unlocks premium features across all 6 tools. Replaces the per-tool à la carte pricing described in README.md, which is stale and does not reflect the actual model.

### Feature-depth gate
The monetization model: each tool's core/critical-path calculation is always free and unlimited. Only advanced/edge-case modes sit behind Shiftside Pro. Rejected alternative: usage-based caps (N free calcs/day) — risks blocking a clinician mid-emergency.

### Unlock
Whether a user currently has Shiftside Pro. Verified server-side (see [[0001-backend-verified-unlock]]) rather than trusted from local device state alone.

### Locked card
The gated-feature presentation: a plain locked card (icon + feature name + benefit + upgrade CTA), no blurred preview. Deliberate deviation from the common "blurred preview" SaaS convention — a blurred clinical number was judged to undercut the product's precision-instrument trust signal.
