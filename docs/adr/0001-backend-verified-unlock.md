---
status: accepted
---

# Backend-verified Pro unlock via Cloudflare Worker (reverses "no backend" invariant)

CLAUDE.md, PRODUCT.md, and README.md all currently state the app has no backend and unlocks features via a client-only mechanism (`localStorage`, or per README a JWT nobody implemented). During business-model design (2026-07-29) we first chose a trust-based `localStorage` flag set by the `/thank-you` Stripe-success page, with no server ever validating the purchase, to preserve the no-backend/offline-first architecture. We reversed this: a Pro flag anyone can set by hand, with no path to revoke it on cancellation, was judged to break user trust in the product more than adding a backend does.

**Decision:** add a Cloudflare Worker + KV as the source of truth for Pro status.
- A Stripe webhook (`checkout.session.completed`) writes paid status to KV; `customer.subscription.deleted` revokes it.
- Identity/security boundary is the Stripe Checkout Session ID (already flowing through `/thank-you?plan={CHECKOUT_SESSION_ID}`, see `src/lib/billing.ts`) — the Worker confirms that session's subscription status directly against the Stripe API. No account system, no password.
- KV is also keyed by customer email (available from the webhook) purely as a *recovery* lookup for a paying user who loses their session id (cleared storage, new device) — email is not the security boundary, session id is.
- On successful verification the Worker issues a short-lived signed token containing the user's feature entitlements; the app caches it and trusts it offline for a 14-day grace window, re-verifying opportunistically whenever the app is online. This preserves "offline-first, always" for a *paid* user who loses connectivity (e.g. mid-shift in a dead zone) — the alternative (fail closed when the Worker is unreachable) was rejected for the same reason usage-based caps were rejected: it can lock a clinician out of Pro features mid-emergency.
- The calculators themselves remain fully client-side/offline regardless of Pro status; only the unlock-check needs network, and only periodically.

**Considered and rejected:**
- Trust-based `localStorage` flag, no backend (original choice, reversed — see above).
- Magic-link email auth — real auth, but requires standing up email-sending infra for a benefit (cross-device convenience) this product doesn't need yet.
- Hard-expire cached token with no grace window — rejected as equivalent to the usage-cap mid-emergency lockout problem.

**Follow-up:** CLAUDE.md ("No backend — client-only"), PRODUCT.md ("state lives in localStorage, not a backend"), and README.md ("State: No backend. Features are unlocked via localStorage JWTs") all need amending once the Worker is built — they currently describe the pre-reversal architecture.
