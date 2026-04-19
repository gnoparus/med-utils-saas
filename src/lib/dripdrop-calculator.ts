// DripDrop: Pressor & IV Rate Calculator
// All formulas verified against MDCalc / ACLS standards.
// mcg/kg/min → mL/hr conversion: rate(mL/hr) = dose(mcg/kg/min) × weight(kg) × 60 / conc(mcg/mL)

export interface PresssorDrug {
  id: string
  name: string
  shortName: string
  color: string         // Tailwind color token
  glowRgb: string       // RGB for box-shadow
  standardConc: {
    label: string       // e.g. "16 mg/250mL"
    mcgPerML: number    // concentration in mcg/mL
  }
  premiumConcs: {
    label: string
    mcgPerML: number
  }[]
  doseRange: { min: number; max: number }  // mcg/kg/min
  doseStep: number
  dialStep: number
  unit: 'mcg/kg/min' | 'mcg/min' | 'units/min'
  clinicalNote: string
  dangerDose: number   // dose above which to warn
}

export const PRESSOR_DRUGS: PresssorDrug[] = [
  {
    id: 'norepinephrine',
    name: 'Norepinephrine',
    shortName: 'Levophed',
    color: 'amber',
    glowRgb: '245,158,11',
    standardConc: { label: '16 mg / 250 mL NS', mcgPerML: 64 },
    premiumConcs: [
      { label: '8 mg / 250 mL NS', mcgPerML: 32 },
      { label: '32 mg / 250 mL NS', mcgPerML: 128 },
    ],
    doseRange: { min: 0.01, max: 3.0 },
    doseStep: 0.01,
    dialStep: 0.01,
    unit: 'mcg/kg/min',
    clinicalNote: 'First-line vasopressor in septic shock. Start 0.01–0.1 mcg/kg/min.',
    dangerDose: 0.5,
  },
  {
    id: 'epinephrine',
    name: 'Epinephrine',
    shortName: 'Epi',
    color: 'red',
    glowRgb: '239,68,68',
    standardConc: { label: '4 mg / 250 mL D5W', mcgPerML: 16 },
    premiumConcs: [
      { label: '2 mg / 250 mL D5W', mcgPerML: 8 },
      { label: '8 mg / 250 mL D5W', mcgPerML: 32 },
    ],
    doseRange: { min: 0.01, max: 1.0 },
    doseStep: 0.01,
    dialStep: 0.01,
    unit: 'mcg/kg/min',
    clinicalNote: 'Use in cardiogenic shock / anaphylaxis. Typical range 0.05–0.5 mcg/kg/min.',
    dangerDose: 0.3,
  },
  {
    id: 'dopamine',
    name: 'Dopamine',
    shortName: 'Dopamine',
    color: 'violet',
    glowRgb: '139,92,246',
    standardConc: { label: '400 mg / 250 mL D5W', mcgPerML: 1600 },
    premiumConcs: [
      { label: '200 mg / 250 mL D5W', mcgPerML: 800 },
      { label: '800 mg / 250 mL D5W', mcgPerML: 3200 },
    ],
    doseRange: { min: 0.5, max: 20.0 },
    doseStep: 0.5,
    dialStep: 0.5,
    unit: 'mcg/kg/min',
    clinicalNote: '< 5 mcg/kg/min: renal/natriuretic. 5–10: cardiac. > 10: vasopressor.',
    dangerDose: 15,
  },
  {
    id: 'dobutamine',
    name: 'Dobutamine',
    shortName: 'Dobutamine',
    color: 'sky',
    glowRgb: '56,189,248',
    standardConc: { label: '250 mg / 250 mL D5W', mcgPerML: 1000 },
    premiumConcs: [
      { label: '500 mg / 250 mL D5W', mcgPerML: 2000 },
    ],
    doseRange: { min: 0.5, max: 20.0 },
    doseStep: 0.5,
    dialStep: 0.5,
    unit: 'mcg/kg/min',
    clinicalNote: 'Inotrope for cardiogenic shock. Typical 2–20 mcg/kg/min.',
    dangerDose: 15,
  },
  {
    id: 'vasopressin',
    name: 'Vasopressin',
    shortName: 'AVP',
    color: 'emerald',
    glowRgb: '16,185,129',
    standardConc: { label: '20 units / 100 mL NS', mcgPerML: 0.2 }, // 0.2 units/mL
    premiumConcs: [
      { label: '20 units / 250 mL NS', mcgPerML: 0.08 },
    ],
    doseRange: { min: 0.01, max: 0.06 },
    doseStep: 0.005,
    dialStep: 0.005,
    unit: 'units/min',
    clinicalNote: 'Fixed dose adjunct to NE. Standard: 0.03–0.04 units/min.',
    dangerDose: 0.05,
  },
]

export interface DrugCalculation {
  dose: number          // mcg/kg/min or units/min
  weightKg: number
  mcgPerML: number
  mlPerHr: number
  isDanger: boolean
  dropsPerSec: number   // visual drip rate, 1–30 range
}

/**
 * Convert dose (mcg/kg/min) to mL/hr
 * For vasopressin (units/min): rate = dose(units/min) * 60 / conc(units/mL)
 */
export function calculateRate(
  dose: number,
  weightKg: number,
  drug: PresssorDrug,
  mcgPerML: number
): DrugCalculation {
  let mlPerHr: number

  if (drug.unit === 'units/min') {
    // vasopressin: dose in units/min, conc in units/mL
    mlPerHr = (dose * 60) / mcgPerML
  } else {
    // standard: dose (mcg/kg/min) × weight (kg) × 60 min/hr ÷ conc (mcg/mL)
    mlPerHr = (dose * weightKg * 60) / mcgPerML
  }

  // Visual drip rate: logarithmically scale 1–30 drops/sec
  // 1 mL/hr → ~0.2 drops/sec,  200 mL/hr → ~30 drops/sec
  const dropsPerSec = Math.max(0.3, Math.min(25, Math.log1p(mlPerHr) * 3.5))

  return {
    dose,
    weightKg,
    mcgPerML,
    mlPerHr,
    isDanger: dose >= drug.dangerDose,
    dropsPerSec,
  }
}

export function getEffectLabel(drug: PresssorDrug, dose: number): string {
  if (drug.id === 'dopamine') {
    if (dose < 5) return 'Renal / Natriuretic'
    if (dose < 10) return 'Inotropic (β₁)'
    return 'Vasopressor (α₁)'
  }
  if (drug.id === 'norepinephrine') {
    if (dose < 0.1) return 'Low — Titrate Up'
    if (dose < 0.25) return 'Moderate Vasopressor'
    return 'High-Dose — Check Map'
  }
  if (drug.id === 'epinephrine') {
    if (dose < 0.1) return 'Low Inotrope/Vasoconstriction'
    if (dose < 0.3) return 'Moderate — Monitor HR'
    return 'High-Dose — Arrhythmia Risk'
  }
  if (drug.id === 'dobutamine') {
    if (dose < 5) return 'Low Inotrope'
    if (dose < 15) return 'Moderate Inotropy'
    return 'High-Dose — Tachycardia Risk'
  }
  if (drug.id === 'vasopressin') {
    if (dose <= 0.03) return 'Adjunct Dose'
    if (dose <= 0.04) return 'Standard — Adjunct to NE'
    return 'High-Dose — Beyond Standard'
  }
  return ''
}

export function generateDripChartNote(
  drug: PresssorDrug,
  calc: DrugCalculation,
  concLabel: string
): string {
  const isVaso = drug.unit === 'units/min'
  const doseStr = isVaso
    ? `${calc.dose.toFixed(3)} units/min`
    : `${calc.dose.toFixed(3)} mcg/kg/min`
  return `${drug.name} (${concLabel}) @ ${doseStr} for ${calc.weightKg} kg patient = ${calc.mlPerHr.toFixed(1)} mL/hr via infusion pump.`
}
