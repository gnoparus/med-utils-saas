# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

MedUtils (branded "Shiftside") — offline-first PWA of 6 clinical calculators for bedside clinicians (pediatric dosing, ABG/acid-base, IV pressor rates, electrolyte repletion, GCS/NIHSS, EHR snippet generation). No backend — client-only React SPA with SSR-prerendered SEO pages. Full product/design context lives in `PRODUCT.md` (users, monetization philosophy, accessibility rules) and `DESIGN.md` (color/type/component spec — read before touching any UI). Read both before design or product-facing work; don't duplicate their content here.

## Commands

```bash
npm run dev          # vite dev server
npm run lint          # eslint .
npm run typecheck     # tsc --noEmit
npm test              # vitest (watch)
npm run test:ci        # vitest --run --reporter=dot --coverage
npm run build          # full prod build: tsc -b && vite build && SSR build && prerender
npm run build:client   # tsc -b && vite build only (skip SSR/prerender)
```

Single test file: `npx vitest run tests/lib/dripdrop.test.ts`. Test files live both in `tests/` (by mirrored path) and co-located as `src/**/*.test.{ts,tsx}` — `vitest.config.ts` includes both.

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test:ci on Node 18.x and 20.x on every PR/push to main. Vercel handles preview deploys automatically (no explicit deploy step in CI).

## Architecture

**Per-tool structure**: each of the 6 tools is a self-contained folder under `src/apps/<ToolName>/index.tsx` (plus any tool-local subcomponents, e.g. `DripDrop/IVBagAnimation.tsx`, `NeoDose/broselow.ts`), routed directly in `src/App.tsx`. Adding a tool = new folder in `src/apps/` + a route registration in `App.tsx`.

**Calculation logic is decoupled from UI**: all clinical formulas live in `src/lib/<tool>-calculator.ts` as pure, typed functions/data (drug tables, dose ranges, conversion math) — no React, fully unit-testable. When changing dosing/conversion logic, edit the `src/lib/*-calculator.ts` file, not the component. Formulas are meant to be verified against MDCalc/ACLS/UpToDate — treat any calculator change as clinically sensitive, not a routine refactor.

**Shared UI primitives**: `src/components/ui/` (`HapticSlider`, `Numpad`) — the tactile input primitives every tool's data entry is built from. Reach for these before building a new slider/keypad.

**App shell**: `src/components/app-shell/` (`AppShellHeader`) — the sticky frosted-glass header used across tool screens.

**Landing/marketing**: `src/components/landing/` — the root `/` route (`LandingPage`), separate from the 6 tool apps.

**SEO pages** (`src/pages/seo/*`, e.g. `DripRateCalculator`, `GcsCalculator`): standalone marketing/SEO landing pages targeting specific search queries, lazy-loaded in the client router (`App.tsx`) but rendered eagerly (non-lazy) in `src/entry-server.tsx` for SSR. **If you add, rename, or remove an SEO route, update it in three places that must stay in sync**: the route list in `App.tsx`, the `PAGE_MAP` in `src/entry-server.tsx`, and `SEO_ROUTES` in `scripts/prerender.js`.

**Build pipeline** (`npm run build`): `tsc -b` → `vite build` (client bundle) → `vite build --ssr src/entry-server.tsx --outDir .ssr` (SSR bundle) → `node scripts/prerender.js` (renders each `SEO_ROUTES` entry via the SSR bundle and writes static `dist/<route>/index.html` for crawlers). PWA service worker/manifest config is in `vite.config.ts` (`vite-plugin-pwa`).

**Monetization**: no backend/auth — Stripe Payment Links only (`src/lib/billing.ts` holds the (currently placeholder) checkout URLs and pricing constants). Per-tool paywall gating (free tier vs. paid unlock) is a product requirement described in `PRODUCT.md`/`README.md` but not yet wired to any persisted unlock state in code — don't assume a `localStorage`/JWT unlock mechanism exists until you find it implemented.

**Analytics**: `src/lib/analytics.ts` wraps `window.gtag` behind a typed event catalog (`trackToolOpened`, `trackPaywallViewed`, `trackCheckoutStarted`, etc.) with an SSR-safe guard. Add new events as new typed functions here rather than calling `gtag` directly from components.

## Conventions

- Path alias `@/` → `src/` is configured in `vitest.config.ts` for tests only; app source uses relative imports (no alias in `tsconfig.app.json`/`vite.config.ts`).
- Styling is Tailwind v4 via `@tailwindcss/vite`, theme tokens defined as CSS `@theme` variables in `src/index.css` — match `DESIGN.md`'s color/elevation/typography rules (no gray drop-shadows, one accent color per tool screen, etc.) rather than inventing new values.
- Haptic feedback (`navigator.vibrate`) and glow/pulse states must always have a `prefers-reduced-motion` fallback — this is a PRODUCT.md accessibility requirement, not optional polish.
- `eslint.config.js` is flat-config (`typescript-eslint` + `react-hooks` + `react-refresh`); `tsconfig.app.json` has `noUnusedLocals`/`noUnusedParameters` on, so unused-anything fails typecheck, not just lint.
