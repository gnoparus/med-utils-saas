# 🚀 MedUtils: Micro-SaaS for Clinicians

> **Keywords:** medical calculators, pediatric dosing, ABG analyzer, IV rate calculator, electrolyte repletion, GCS NIHSS scale, clinical decision support, EHR snippets, medical PWA, offline medical tools.

MedUtils is a high-performance suite of 6 clinician utilities designed for speed, offline reliability, and tactical bedside feedback. Built with **React 18**, **Tailwind CSS v4**, and **Framer Motion**.

---

## 🤖 Agent-Friendly Context
- **Design Pattern:** All tools are under `src/apps/[AppName]`. Shared UI components are in `src/components/ui`.
- **Pure Logic:** Clinical calculations are decoupled into `src/lib/` as pure, testable functions.
- **State:** No backend. Features are unlocked via `localStorage` JWTs.
- **Feedback:** Uses `navigator.vibrate` (Haptics) and standard CSS animations for interaction feedback.

---

---

## 🧸 1. NeoDose / PediFast (Pediatric Resuscitation Board)

**Problem:** Stressful weight-based medication math in high-stakes situations.
**Solution:** A 1-page visual dashboard with a massive weight slider (kg). Dragging recalculates doses for 20+ critical meds (Epinephrine, Amiodarone, fluids, shock joules) in real-time.

- **Dopamine Design:** Odometer-style numbers, haptic "clicks" via `navigator.vibrate()`, and color-coded Broselow zones.
- **Monetization:** Free for top 5 Code Blue meds. **$14.99 unlock** for the full pharmacy (antibiotics, sedatives, etc.).
- **Tech:** React, Framer Motion, PWA, License in `localStorage`.

---

## 🩸 2. TippingPoint (Visual ABG & Acid-Base Analyzer)

**Problem:** ABG interpretations (Winters, Delta gap) are mathematically annoying and hard to visualize.
**Solution:** A visual balance scale. Input pH, pCO2, and HCO3 via a custom numpad. The scale "tips" toward Acidosis or Alkalosis.

- **Dopamine Design:** Physical animation of balancing scales, "glow" effect for perfect diagnosis, huge green "Copy for Chart" button.
- **Monetization:** Basic ABG free. **$9.99 unlock** for advanced "Triple Dagger" mode (Anion Gap, Osmolar Gap, Delta-Delta).

---

## 💧 3. DripDrop (Visual Pressor & IV Rate Configurator)

**Problem:** Converting mcg/kg/min to mL/hr for pumps (Epi, Levo) is a headache.
**Solution:** Select drug/concentration, input weight, and move a dial. An animated IV bag "drips" faster/slower based on the rate.

- **Dopamine Design:** Fluid animations, "plip-plop" sound effects, and radial dial UI.
- **Monetization:** Standard concentration free. **$4.99/mo or $29 lifetime** for custom concentrations and saved profiles.

---

## ⚡️ 4. LytesOut (Electrolyte Repletion Guide)

**Problem:** Repletion protocols (e.g., K 3.1, Mg 1.4) are inconsistent and manual.
**Solution:** Input lab values and get instant, color-coded order text (e.g., "Give 40 mEq KCl PO").

- **Dopamine Design:** Soft red pulsing for dangerous rates, green glow for success, "Copy as EHR Note" with medico-legal logic.
- **Monetization:** K and Mg free. **$5/mo** for "Endocrinologist Mode" (Sodium correction, Calcium, Phos).

---

## 🧠 5. NeuroSnap (Visual GCS & NIHSS)

**Problem:** Calculating GCS or NIHSS requires clicking complex radio button lists.
**Solution:** Interactive 3D/Vector body silhouette. Tap eyes, mouth, or arms to score.

- **Dopamine Design:** Body parts glow on tap, radar charts for deficit visualization, Apple Health-style micro-interactions.
- **Monetization:** GCS free. **$19.99 unlock** for NIHSS, Hunt & Hess, and charting export.

---

## 📝 6. ChartNinja (Smart Medical Snippet Generator)

**Problem:** Calculators don't help with note-writing (e.g., "WELLS score of 2, PE low risk").
**Solution:** Master list of 10 clinical rules (HEART, PERC, Wells). Sliding dials generate perfect, copy-pasteable EHR text.

- **Dopamine Design:** Typewriter-style building of text in real-time, satisfying "Stamp" animation on copy.
- **Monetization:** Free with watermark. **$10/year** to remove watermark and unlock custom templates.

---

## 🛠️ Development & Deployment

### ⚡ Quick Start
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production (PWA ready)
npm run build
```

### 🤝 Strategic Contributing (Agent Guide)
- **Adding a Tool:** Create a new folder in `src/apps/`, export a main component, and register the route in `src/App.tsx`.
- **Haptics:** Use the `HapticSlider` component or trigger `navigator.vibrate(10)` for discrete success events.
- **Styling:** Adhere to Tailwind v4 `@theme` variables defined in `src/index.css`.
- **Math:** Ensure all medical formulas in `src/lib/` are double-indexed against MDCalc or UpToDate standards.

---

## 📈 SEO & Discovery
- **Title:** MedUtils | Professional Clinician Utility Suite
- **Description:** Fast, haptic-rich, and offline-first medical calculators for pediatric dosing, ABG, and electrolyte repletion. 
- **Audience:** Physicians, Nurses, EMTs, Medical Students.
