// LytesOut: Electrolyte Repletion Calculator
// Clinical references: MDCalc, ACCP, institutional pharmacy protocols, Harrison's Principles

export type ElectrolyteId = 'k' | 'mg' | 'po4' | 'ca' | 'na'

export type SeverityTier =
  | 'critical_low'
  | 'severe_low'
  | 'moderate_low'
  | 'mild_low'
  | 'normal'
  | 'mild_high'
  | 'moderate_high'
  | 'severe_high'
  | 'critical_high'

export type GlowState = 'green' | 'amber' | 'orange' | 'red'

export interface RepleteOption {
  id: string
  routeLabel: string
  routeIcon: 'pill' | 'drip' | 'bolt'
  product: string
  dose: string
  rate: string
  notes: string[]
  locked?: boolean
  isUrgent?: boolean
}

export interface ElectrolyteMeta {
  id: ElectrolyteId
  name: string
  fullName: string
  unit: string
  normalLow: number
  normalHigh: number
  defaultValue: number
  inputMin: number
  inputMax: number
  allowDecimal: boolean
  maxLength: number
  accentColor: string
  accentRgb: string
  accentBg: string
  accentBorder: string
}

export interface ElectrolyteAnalysis {
  electrolyte: ElectrolyteId
  value: number
  tier: SeverityTier
  severityLabel: string
  severityNote: string
  urgencyLabel: string
  glowState: GlowState
  deficitNote?: string
  options: RepleteOption[]
  warnings: string[]
  chartNote: string
}

// ─── Electrolyte metadata ─────────────────────────────────────────────────────

export const LYTES: ElectrolyteMeta[] = [
  {
    id: 'k',
    name: 'K⁺',
    fullName: 'Potassium',
    unit: 'mEq/L',
    normalLow: 3.5,
    normalHigh: 5.0,
    defaultValue: 3.0,
    inputMin: 1.0,
    inputMax: 8.0,
    allowDecimal: true,
    maxLength: 3,
    accentColor: '#f59e0b',
    accentRgb: '245,158,11',
    accentBg: 'rgba(245,158,11,0.12)',
    accentBorder: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'mg',
    name: 'Mg²⁺',
    fullName: 'Magnesium',
    unit: 'mg/dL',
    normalLow: 1.7,
    normalHigh: 2.2,
    defaultValue: 1.4,
    inputMin: 0.3,
    inputMax: 5.0,
    allowDecimal: true,
    maxLength: 3,
    accentColor: '#14b8a6',
    accentRgb: '20,184,166',
    accentBg: 'rgba(20,184,166,0.12)',
    accentBorder: 'rgba(20,184,166,0.3)',
  },
  {
    id: 'po4',
    name: 'PO₄',
    fullName: 'Phosphate',
    unit: 'mg/dL',
    normalLow: 2.5,
    normalHigh: 4.5,
    defaultValue: 1.8,
    inputMin: 0.5,
    inputMax: 8.0,
    allowDecimal: true,
    maxLength: 3,
    accentColor: '#a855f7',
    accentRgb: '168,85,247',
    accentBg: 'rgba(168,85,247,0.12)',
    accentBorder: 'rgba(168,85,247,0.3)',
  },
  {
    id: 'ca',
    name: 'Ca²⁺',
    fullName: 'Calcium',
    unit: 'mg/dL',
    normalLow: 8.5,
    normalHigh: 10.5,
    defaultValue: 7.8,
    inputMin: 4.0,
    inputMax: 16.0,
    allowDecimal: true,
    maxLength: 4,
    accentColor: '#38bdf8',
    accentRgb: '56,189,248',
    accentBg: 'rgba(56,189,248,0.12)',
    accentBorder: 'rgba(56,189,248,0.3)',
  },
  {
    id: 'na',
    name: 'Na⁺',
    fullName: 'Sodium',
    unit: 'mEq/L',
    normalLow: 136,
    normalHigh: 145,
    defaultValue: 128,
    inputMin: 100,
    inputMax: 175,
    allowDecimal: false,
    maxLength: 3,
    accentColor: '#f97316',
    accentRgb: '249,115,22',
    accentBg: 'rgba(249,115,22,0.12)',
    accentBorder: 'rgba(249,115,22,0.3)',
  },
]

export const LYTE_PRESETS: Record<ElectrolyteId, { label: string; value: number }[]> = {
  k:   [{ label: 'K 2.1', value: 2.1 }, { label: 'K 2.7', value: 2.7 }, { label: 'K 3.2', value: 3.2 }, { label: 'K 4.0', value: 4.0 }, { label: 'K 6.2', value: 6.2 }],
  mg:  [{ label: 'Mg 0.7', value: 0.7 }, { label: 'Mg 1.1', value: 1.1 }, { label: 'Mg 1.5', value: 1.5 }, { label: 'Mg 1.9', value: 1.9 }, { label: 'Mg 3.2', value: 3.2 }],
  po4: [{ label: 'PO4 0.8', value: 0.8 }, { label: 'PO4 1.2', value: 1.2 }, { label: 'PO4 1.8', value: 1.8 }, { label: 'PO4 3.5', value: 3.5 }, { label: 'PO4 5.8', value: 5.8 }],
  ca:  [{ label: 'Ca 6.5', value: 6.5 }, { label: 'Ca 7.3', value: 7.3 }, { label: 'Ca 8.0', value: 8.0 }, { label: 'Ca 9.5', value: 9.5 }, { label: 'Ca 12.5', value: 12.5 }],
  na:  [{ label: 'Na 115', value: 115 }, { label: 'Na 122', value: 122 }, { label: 'Na 130', value: 130 }, { label: 'Na 140', value: 140 }, { label: 'Na 158', value: 158 }],
}

export const GLOW_COLORS: Record<GlowState, { accent: string; rgb: string; panel: string; border: string }> = {
  green:  { accent: '#10b981', rgb: '16,185,129',  panel: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.28)'  },
  amber:  { accent: '#f59e0b', rgb: '245,158,11',  panel: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.28)'  },
  orange: { accent: '#f97316', rgb: '249,115,22',  panel: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.28)'  },
  red:    { accent: '#fb7185', rgb: '251,113,133', panel: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.28)' },
}

export function getLyteMeta(id: ElectrolyteId): ElectrolyteMeta {
  return LYTES.find(l => l.id === id)!
}

export function getSeverityGlowState(tier: SeverityTier): GlowState {
  switch (tier) {
    case 'normal': return 'green'
    case 'mild_low':
    case 'mild_high': return 'amber'
    case 'moderate_low':
    case 'moderate_high': return 'orange'
    case 'severe_low':
    case 'severe_high':
    case 'critical_low':
    case 'critical_high': return 'red'
  }
}

// ─── Chart note builder ───────────────────────────────────────────────────────

function buildChartNote(
  name: string,
  unit: string,
  value: number,
  severityLabel: string,
  urgencyLabel: string,
  options: RepleteOption[],
  warnings: string[],
): string {
  const actionable = options.filter(o => !o.id.endsWith('-normal') && o.dose !== '—')
  const lines: string[] = [
    `ELECTROLYTE NOTE — ${name.toUpperCase()} REPLETION`,
    `Serum ${name}: ${value} ${unit}  [${severityLabel}]  —  Priority: ${urgencyLabel}`,
    '',
  ]
  if (actionable.length > 0) {
    lines.push('Plan:')
    for (const opt of actionable) {
      lines.push(`• ${opt.routeLabel}: ${opt.product}`)
      lines.push(`  Dose: ${opt.dose}  |  Rate: ${opt.rate}`)
      for (const note of opt.notes) lines.push(`  – ${note}`)
    }
  } else {
    lines.push('No immediate repletion indicated. Routine monitoring.')
  }
  if (warnings.length > 0) {
    lines.push('')
    lines.push('Warnings:')
    for (const w of warnings) lines.push(`⚠  ${w}`)
  }
  lines.push('')
  lines.push('Generated by Shiftside Lytes. Verify all orders per institutional protocol.')
  return lines.join('\n')
}

// ─── K+ analysis ──────────────────────────────────────────────────────────────

function analyzeK(k: number): ElectrolyteAnalysis {
  let tier: SeverityTier
  let severityLabel: string
  let severityNote: string
  let urgencyLabel: string
  let deficitNote: string | undefined
  const options: RepleteOption[] = []
  const warnings: string[] = []

  if (k < 2.5) {
    tier = 'critical_low'; severityLabel = 'Critical Hypokalemia'; urgencyLabel = 'STAT'
    severityNote = 'Life-threatening arrhythmia risk. Continuous telemetry. Aggressive IV repletion.'
    deficitNote = '≈ 300–700 mEq total body deficit'
    options.push({
      id: 'k-iv-central', routeLabel: 'IV Central (Preferred)', routeIcon: 'drip',
      product: 'KCl 40 mEq / 100 mL NS',
      dose: '40 mEq per infusion',
      rate: '20 mEq/hr via central × 2–3 bags',
      notes: ['Continuous cardiac monitoring mandatory', 'Recheck K after every 40 mEq replaced', 'Co-replete Mg²⁺ if < 1.8 mg/dL'],
      isUrgent: true,
    })
    options.push({
      id: 'k-iv-peripheral-critical', routeLabel: 'IV Peripheral (if no central)', routeIcon: 'drip',
      product: 'KCl 20 mEq / 100 mL NS',
      dose: '20 mEq per infusion',
      rate: 'Max 10 mEq/hr × 4–6 bags',
      notes: ['Maximum peripheral concentration: 10 mEq/100 mL', 'Pain and phlebitis common at infusion site', 'Upgrade to central line as soon as available'],
    })
    warnings.push('NEVER give IV KCl undiluted — fatal cardiac arrest risk.')
    warnings.push('Hypomagnesemia causes K⁺ wasting and repletion resistance — check and replete Mg²⁺.')
    warnings.push('ECG: U waves, T-wave flattening, prolonged QU interval, PVCs.')
  } else if (k < 3.0) {
    tier = 'severe_low'; severityLabel = 'Severe Hypokalemia'; urgencyLabel = 'Urgent'
    severityNote = 'Significant cardiac arrhythmia risk. IV or high-dose oral repletion.'
    deficitNote = '≈ 200–400 mEq total body deficit'
    options.push({
      id: 'k-iv-severe', routeLabel: 'IV Peripheral', routeIcon: 'drip',
      product: 'KCl 20 mEq / 100 mL NS',
      dose: '20 mEq per infusion',
      rate: '10 mEq/hr × 3–4 bags',
      notes: ['Cardiac monitoring recommended', 'Recheck K after 40–80 mEq replaced', 'Central line preferred if available'],
    })
    options.push({
      id: 'k-oral-severe', routeLabel: 'Oral (if tolerating PO)', routeIcon: 'pill',
      product: 'KCl Extended-Release (K-Dur, Klor-Con M20)',
      dose: '40–60 mEq per dose',
      rate: 'q6h × 3 doses, then reassess',
      notes: ['Only if not vomiting and able to swallow', 'Take with full glass of water to prevent esophageal ulceration', 'Do not crush extended-release tablets'],
      locked: true,
    })
    warnings.push('Check ECG: U waves, widened QRS, or PVCs warrant escalation.')
    warnings.push('Concurrent hypomagnesemia causes refractory hypokalemia — replete Mg²⁺ first or together.')
  } else if (k < 3.5) {
    tier = 'mild_low'; severityLabel = 'Mild Hypokalemia'; urgencyLabel = 'Routine'
    severityNote = 'Oral repletion preferred. IV if NPO or failed oral therapy.'
    deficitNote = '≈ 100–200 mEq total body deficit'
    options.push({
      id: 'k-oral-mild', routeLabel: 'Oral (Preferred)', routeIcon: 'pill',
      product: 'KCl oral solution / extended-release tabs',
      dose: '40–60 mEq per dose',
      rate: 'q8h × 2–3 doses, then reassess',
      notes: ['Dilute liquid form in 4 oz water or juice', 'Dietary K: bananas, OJ, sweet potato, spinach, legumes', 'Recheck serum K in 24–48 hr'],
    })
    options.push({
      id: 'k-iv-mild', routeLabel: 'IV Peripheral (if NPO)', routeIcon: 'drip',
      product: 'KCl 20 mEq / 100 mL NS',
      dose: '20 mEq per infusion',
      rate: '10 mEq/hr (2-hr infusion)',
      notes: ['Only if oral route not feasible', 'Recheck K after each 40 mEq replaced'],
      locked: true,
    })
  } else if (k <= 5.0) {
    tier = 'normal'; severityLabel = 'Normal Range'; urgencyLabel = 'Normal'
    severityNote = 'No repletion indicated. Maintain dietary intake.'
    options.push({
      id: 'k-normal', routeLabel: 'No Repletion Needed', routeIcon: 'pill',
      product: '—', dose: '—', rate: 'Routine labs per clinical plan',
      notes: ['Encourage dietary K on diuretics, corticosteroids, or amphotericin', 'Reassess with next scheduled BMP/CMP'],
    })
  } else if (k <= 6.0) {
    tier = 'mild_high'; severityLabel = 'Mild Hyperkalemia'; urgencyLabel = 'Monitor'
    severityNote = 'Address cause. Dietary restriction. Confirm true value (rule out hemolysis).'
    options.push({
      id: 'k-hyper-mild', routeLabel: 'Conservative Measures', routeIcon: 'pill',
      product: 'Dietary restriction + Cause workup',
      dose: '—', rate: 'Recheck serum K in 2–4 hr',
      notes: ['Rule out pseudohyperkalemia from hemolyzed specimen', 'Stop K-sparing agents (ACEi, ARBs, spironolactone, trimethoprim)', 'Kayexalate 15–30g PO or sodium zirconium (Lokelma) 10g PO if confirmed', 'Sodium bicarbonate if metabolic acidosis co-exists'],
    })
    warnings.push('Confirm specimen integrity — hemolyzed sample causes falsely elevated K⁺.')
  } else if (k <= 7.0) {
    tier = 'moderate_high'; severityLabel = 'Moderate Hyperkalemia'; urgencyLabel = 'Urgent'
    severityNote = 'ECG monitoring essential. Sequential medical management.'
    options.push({
      id: 'k-hyper-mod', routeLabel: 'Emergent Medical Management', routeIcon: 'drip',
      product: 'Ca Gluconate → Insulin/Glucose → Kayexalate/Lokelma',
      dose: 'Per sequential protocol (see notes)',
      rate: 'Emergent management',
      notes: [
        '① Ca gluconate 1g IV over 2–3 min (membrane stabilization)',
        '② Regular insulin 10U IV + D50W 50mL (shifts K into cells, ↓ 0.5–1.5 mEq/L)',
        '③ NaHCO3 50 mEq IV if HCO3 < 20 mEq/L',
        '④ Albuterol 10–20mg neb (lowers K by 0.5–1 mEq/L)',
        '⑤ Kayexalate 30–60g PO or Lokelma 10g PO (elimination)',
      ],
      isUrgent: true,
    })
    warnings.push('ECG mandatory: peaked T-waves, widened QRS, PR prolongation → escalate immediately.')
    warnings.push('Do NOT co-infuse calcium and bicarbonate in the same IV line — precipitates.')
  } else {
    tier = 'critical_high'; severityLabel = 'Critical Hyperkalemia'; urgencyLabel = 'STAT'
    severityNote = 'Life-threatening. VF / PEA risk. Emergency escalation.'
    options.push({
      id: 'k-hyper-critical', routeLabel: 'Emergency Protocol', routeIcon: 'bolt',
      product: 'STAT ECG + CaCl → Insulin/Dextrose → Dialysis',
      dose: 'Per ACLS emergent hyperkalemia protocol',
      rate: 'Immediate',
      notes: [
        '① Calcium chloride 1g IV over 3 min (central preferred — 3× elemental Ca vs gluconate)',
        '② Insulin 10U IV + D50W 25–50g (shift K intracellularly)',
        '③ NaHCO3 100 mEq IV if acidosis',
        '④ Albuterol 20mg neb (fastest non-IV adjunct)',
        '⑤ Hemodialysis if K > 7 with EKG changes or anuric renal failure',
      ],
      isUrgent: true,
    })
    warnings.push('IMMEDIATE ECG — sine wave or VF pattern = code blue risk.')
    warnings.push('Nephrology for emergent dialysis if refractory or anuric.')
  }

  return {
    electrolyte: 'k', value: k, tier, severityLabel, severityNote, urgencyLabel,
    glowState: getSeverityGlowState(tier), deficitNote, options, warnings,
    chartNote: buildChartNote('Potassium', 'mEq/L', k, severityLabel, urgencyLabel, options, warnings),
  }
}

// ─── Mg²⁺ analysis ────────────────────────────────────────────────────────────

function analyzeMg(mg: number): ElectrolyteAnalysis {
  let tier: SeverityTier
  let severityLabel: string
  let severityNote: string
  let urgencyLabel: string
  let deficitNote: string | undefined
  const options: RepleteOption[] = []
  const warnings: string[] = []

  if (mg < 0.8) {
    tier = 'critical_low'; severityLabel = 'Critical Hypomagnesemia'; urgencyLabel = 'STAT'
    severityNote = 'High risk for seizures, torsades de pointes, and ventricular arrhythmias.'
    options.push({
      id: 'mg-iv-critical', routeLabel: 'IV (Urgent)', routeIcon: 'drip',
      product: 'MgSO4 50% solution (500 mg/mL)',
      dose: '8–16g total (renal dosing: see notes)',
      rate: '4g/100 mL NS over 2–3 hr, then reassess',
      notes: [
        '1g MgSO4 = 8.12 mEq = 98.6 mg elemental Mg',
        'Recheck serum Mg after each 4g infused',
        'Renal impairment (CrCl < 30): halve dose, monitor DTRs hourly',
        'Monitor for toxicity: loss of DTRs > respiratory depression > cardiac arrest',
      ],
      isUrgent: true,
    })
    warnings.push('Torsades de pointes: 2g MgSO4 IV push over 5–10 min regardless of serum Mg.')
    warnings.push('Seizures: 4g MgSO4 IV over 15–20 min, then 1g/hr maintenance infusion.')
    warnings.push('Loss of patellar reflex is the earliest sign of Mg toxicity — check hourly.')
  } else if (mg < 1.2) {
    tier = 'severe_low'; severityLabel = 'Severe Hypomagnesemia'; urgencyLabel = 'Urgent'
    severityNote = 'Refractory hypokalemia, hypocalcemia risk. IV repletion indicated.'
    options.push({
      id: 'mg-iv-severe', routeLabel: 'IV', routeIcon: 'drip',
      product: 'MgSO4 2g / 50 mL NS',
      dose: '4–8g total',
      rate: '2g/hr for first 2g, then 1g/hr × 4–6 hr',
      notes: ['Can also dilute 4g in 100 mL NS and run over 4 hr', 'Renal adjustment: CrCl < 30 → halve dose, monitor', 'Recheck Mg 4–6 hr after completion'],
    })
    warnings.push('Refractory hypokalemia: Mg depletion impairs renal K retention — replete Mg first.')
    warnings.push('Hypocalcemia: Mg deficiency impairs PTH secretion and target organ response.')
  } else if (mg < 1.7) {
    tier = 'mild_low'; severityLabel = 'Mild Hypomagnesemia'; urgencyLabel = 'Routine'
    severityNote = 'Oral repletion preferred. IV if symptomatic or GI malabsorption.'
    deficitNote = 'Mild depletion — oral supplementation effective'
    options.push({
      id: 'mg-oral-mild', routeLabel: 'Oral (Preferred)', routeIcon: 'pill',
      product: 'Magnesium oxide 400 mg or Mg gluconate 500 mg',
      dose: '400–800 mg elemental Mg/day',
      rate: 'Once daily or BID × 5–7 days, then reassess',
      notes: ['MgOxide 400mg ≈ 240mg elemental Mg (60% bioavailable)', 'Mg glycinate or gluconate: better tolerated (less diarrhea)', 'MgOxide 400mg PO BID is a common empirical regimen'],
    })
    options.push({
      id: 'mg-iv-mild', routeLabel: 'IV (if NPO/malabsorption)', routeIcon: 'drip',
      product: 'MgSO4 2g / 50 mL NS',
      dose: '2g per infusion',
      rate: '1–2g/hr (1–2 hr infusion)',
      notes: ['Use if oral not tolerated, NPO, or known malabsorption (e.g. Crohn\'s, short gut)', 'Single 2g infusion usually sufficient for mild depletion'],
      locked: true,
    })
  } else if (mg <= 2.2) {
    tier = 'normal'; severityLabel = 'Normal Range'; urgencyLabel = 'Normal'
    severityNote = 'No repletion indicated.'
    options.push({
      id: 'mg-normal', routeLabel: 'No Repletion Needed', routeIcon: 'pill',
      product: '—', dose: '—', rate: 'Routine monitoring',
      notes: ['Dietary sources: nuts, seeds, dark leafy greens, legumes, whole grains', 'Monitor if on PPIs, loop diuretics, cisplatin, or amphotericin B (renal Mg wasting)'],
    })
  } else if (mg <= 3.0) {
    tier = 'mild_high'; severityLabel = 'Mild Hypermagnesemia'; urgencyLabel = 'Monitor'
    severityNote = 'Usually asymptomatic. Identify cause (CKD, antacid overuse, laxatives).'
    options.push({
      id: 'mg-hyper-mild', routeLabel: 'Remove Offending Agent', routeIcon: 'pill',
      product: 'Discontinue Mg-containing products',
      dose: '—', rate: 'Recheck in 12–24 hr',
      notes: ['Stop Mg-containing antacids (Maalox, Mylanta), laxatives (MOM), enemas', 'IV NS + furosemide to enhance renal Mg excretion if symptomatic', 'Dialysis for severe or symptomatic hypermagnesemia with CKD'],
    })
  } else {
    tier = 'severe_high'; severityLabel = 'Significant Hypermagnesemia'; urgencyLabel = 'Urgent'
    severityNote = 'Risk of hyporeflexia, respiratory paralysis, cardiac arrest. IV calcium to antagonize.'
    options.push({
      id: 'mg-hyper-severe', routeLabel: 'IV Calcium + Hydration', routeIcon: 'drip',
      product: 'Calcium gluconate 1g IV over 3 min (repeat × 2 prn)',
      dose: '1–2g calcium gluconate',
      rate: 'Over 3–5 min emergent; or 1g/hr maintenance',
      notes: ['Calcium directly antagonizes Mg neuromuscular blockade', 'IV NS 200 mL/hr + furosemide 20–40mg IV to enhance Mg excretion', 'Hemodialysis if CKD or refractory'],
      isUrgent: true,
    })
    warnings.push('Loss of patellar reflex (Mg ≈ 6–9 mg/dL) precedes respiratory depression (> 12 mg/dL).')
    warnings.push('Respiratory support on standby; bag-mask ventilation if respiratory rate declines.')
  }

  return {
    electrolyte: 'mg', value: mg, tier, severityLabel, severityNote, urgencyLabel,
    glowState: getSeverityGlowState(tier), deficitNote, options, warnings,
    chartNote: buildChartNote('Magnesium', 'mg/dL', mg, severityLabel, urgencyLabel, options, warnings),
  }
}

// ─── PO₄ analysis ────────────────────────────────────────────────────────────

function analyzePO4(po4: number): ElectrolyteAnalysis {
  let tier: SeverityTier
  let severityLabel: string
  let severityNote: string
  let urgencyLabel: string
  let deficitNote: string | undefined
  const options: RepleteOption[] = []
  const warnings: string[] = []

  if (po4 < 1.0) {
    tier = 'critical_low'; severityLabel = 'Critical Hypophosphatemia'; urgencyLabel = 'STAT'
    severityNote = 'Risk of respiratory failure, hemolysis, cardiac dysfunction, rhabdomyolysis.'
    options.push({
      id: 'po4-iv-critical', routeLabel: 'IV (Urgent)', routeIcon: 'drip',
      product: 'Sodium or Potassium Phosphate (3 mmol PO₄/mL)',
      dose: '0.32–0.64 mmol/kg  (for 70 kg: 22–45 mmol)',
      rate: 'Over 8–12 hr; max rate 0.1 mmol/kg/hr',
      notes: [
        'Use Na-phosphate if hyperkalemia present; K-phosphate otherwise',
        'Each mL K-phosphate = 3 mmol PO4 + 4.4 mEq K (monitor K!)',
        'Each mL Na-phosphate = 3 mmol PO4 + 4 mEq Na',
        'NEVER mix phosphate with calcium in same IV line — precipitates',
        'Monitor iCa, K, and Mg q4–6h during repletion',
        'Recheck serum PO4 4 hr after infusion',
      ],
      isUrgent: true,
    })
    warnings.push('Rapid IV phosphate → acute hypocalcemia (seizures, tetany) — monitor iCa.')
    warnings.push('Never co-infuse phosphate and calcium — calcium phosphate precipitate risk.')
    warnings.push('Refeeding syndrome: PO4 drops sharply when feeding starts in malnourished patients.')
  } else if (po4 < 1.5) {
    tier = 'severe_low'; severityLabel = 'Severe Hypophosphatemia'; urgencyLabel = 'Urgent'
    severityNote = 'IV repletion strongly preferred. Risk of hemolysis and neuromuscular dysfunction.'
    options.push({
      id: 'po4-iv-severe', routeLabel: 'IV', routeIcon: 'drip',
      product: 'Sodium Phosphate IV (3 mmol PO₄/mL)',
      dose: '0.16–0.32 mmol/kg  (for 70 kg: 11–22 mmol)',
      rate: 'Over 6 hr; max 0.1 mmol/kg/hr',
      notes: ['Preferred product: Na-phosphate (avoids K loading)', 'Monitor Ca²⁺, Mg²⁺, K during repletion', 'Recheck serum PO4 4–6 hr post-infusion'],
    })
    warnings.push('IV phosphate can precipitate symptomatic hypocalcemia with rapid infusion.')
    warnings.push('Refeeding syndrome: check PO4, K, Mg daily when restarting nutrition after starvation.')
  } else if (po4 < 2.5) {
    tier = 'mild_low'; severityLabel = 'Mild–Moderate Hypophosphatemia'; urgencyLabel = 'Routine'
    severityNote = 'Oral repletion first-line if tolerating PO. IV if NPO or malabsorption.'
    deficitNote = 'Mild–moderate depletion — oral preferred'
    options.push({
      id: 'po4-oral-mild', routeLabel: 'Oral (Preferred)', routeIcon: 'pill',
      product: 'Neutra-Phos / K-Phos Neutral  (250 mg = 8 mmol PO₄)',
      dose: '250–500 mg (8–16 mmol) per dose',
      rate: 'q6–8h × 4–8 doses, then reassess',
      notes: ['Mix powder packet in 75–240 mL of water', 'Take with food to reduce GI upset (diarrhea, nausea)', 'Recheck serum PO4 in 24–48 hr'],
    })
    options.push({
      id: 'po4-iv-moderate', routeLabel: 'IV (if NPO/malabsorption)', routeIcon: 'drip',
      product: 'Sodium Phosphate 15 mmol in 250 mL NS',
      dose: '15 mmol sodium phosphate',
      rate: 'Over 4–6 hr',
      notes: ['Use if oral contraindicated, NPO, Crohn\'s, or short gut', 'Monitor ionized calcium during infusion'],
      locked: true,
    })
  } else if (po4 <= 4.5) {
    tier = 'normal'; severityLabel = 'Normal Range'; urgencyLabel = 'Normal'
    severityNote = 'No repletion indicated.'
    options.push({
      id: 'po4-normal', routeLabel: 'No Repletion Needed', routeIcon: 'pill',
      product: '—', dose: '—', rate: 'Routine monitoring',
      notes: ['Dietary: dairy, meat, fish, nuts, legumes, whole grains', 'Monitor if on phosphate binders, antacids, or malnourished'],
    })
  } else if (po4 <= 6.0) {
    tier = 'mild_high'; severityLabel = 'Mild Hyperphosphatemia'; urgencyLabel = 'Monitor'
    severityNote = 'Common in CKD. Phosphate binders with meals. Dietary restriction.'
    options.push({
      id: 'po4-hyper-mild', routeLabel: 'Dietary Restriction + Binders', routeIcon: 'pill',
      product: 'Calcium carbonate / Sevelamer / Lanthanum carbonate',
      dose: '—', rate: 'With each meal',
      notes: ['Restrict dietary phosphate: processed foods, dairy in excess, colas', 'Sevelamer preferred if Ca²⁺ > 9.5 (avoids calcium loading)', 'CaCO3 500–1500 mg with meals if Ca normal (< 10.5)', 'Calcium × Phosphate product goal: < 55 mg²/dL²'],
    })
  } else {
    tier = 'severe_high'; severityLabel = 'Significant Hyperphosphatemia'; urgencyLabel = 'Urgent'
    severityNote = 'Ca × PO4 product risk (> 55). Vascular calcification. Nephrology review.'
    options.push({
      id: 'po4-hyper-severe', routeLabel: 'Aggressive Binders + Nephrology', routeIcon: 'drip',
      product: 'IV NS + Aggressive phosphate binders',
      dose: '—', rate: 'Individualized per nephrology',
      notes: ['Calculate Ca × PO4 product (target < 55 mg²/dL²)', 'Emergent dialysis if tetany or severe symptomatic hypocalcemia from reciprocal drop in Ca', 'Nephrology consult strongly recommended'],
      isUrgent: true,
    })
    warnings.push('Elevated Ca × PO4 product (> 55 mg²/dL²): risk of soft tissue and vascular calcification.')
  }

  return {
    electrolyte: 'po4', value: po4, tier, severityLabel, severityNote, urgencyLabel,
    glowState: getSeverityGlowState(tier), deficitNote, options, warnings,
    chartNote: buildChartNote('Phosphate', 'mg/dL', po4, severityLabel, urgencyLabel, options, warnings),
  }
}

// ─── Ca²⁺ analysis ────────────────────────────────────────────────────────────

function analyzeCa(ca: number): ElectrolyteAnalysis {
  let tier: SeverityTier
  let severityLabel: string
  let severityNote: string
  let urgencyLabel: string
  let deficitNote: string | undefined
  const options: RepleteOption[] = []
  const warnings: string[] = []

  if (ca < 7.0) {
    tier = 'critical_low'; severityLabel = 'Critical Hypocalcemia'; urgencyLabel = 'STAT'
    severityNote = 'Seizure / tetany / cardiac arrest risk. Immediate IV calcium.'
    options.push({
      id: 'ca-iv-critical', routeLabel: 'IV (Emergent)', routeIcon: 'drip',
      product: 'Calcium gluconate 10%  (93 mg elemental Ca / g)',
      dose: '2–3g calcium gluconate',
      rate: '1g over 10–20 min (emergent), then 1g/hr continuous infusion',
      notes: [
        'Ca gluconate preferred peripherally — less vesicant than CaCl',
        'Cardiac monitoring during rapid infusion (bradycardia, QT shortening)',
        'Calcium chloride 1g = 3× elemental Ca — reserve for cardiac arrest (central line)',
        'Correct hypomagnesemia concurrently — Mg deficiency impairs PTH release',
      ],
      isUrgent: true,
    })
    warnings.push('Check and correct hypomagnesemia — Mg depletion makes hypocalcemia refractory.')
    warnings.push('Do NOT co-infuse with sodium bicarbonate or phosphate — precipitates.')
    warnings.push('Trousseau sign (carpal spasm with BP cuff) + Chvostek sign (facial twitch with tap).')
  } else if (ca < 7.5) {
    tier = 'severe_low'; severityLabel = 'Severe Hypocalcemia'; urgencyLabel = 'Urgent'
    severityNote = 'Symptomatic risk (paresthesias, muscle cramps, tetany). IV calcium indicated.'
    options.push({
      id: 'ca-iv-severe', routeLabel: 'IV Peripheral', routeIcon: 'drip',
      product: 'Calcium gluconate 10%  (1g / 10 mL)',
      dose: '1–2g calcium gluconate',
      rate: '1g in 100 mL NS over 1–2 hr',
      notes: ['Can repeat if still symptomatic or Ca remains < 7.5', 'Continuous infusion 0.5–1.5 mg/kg/hr elemental Ca if frequently symptomatic', 'Correct Vitamin D deficiency if chronic cause', 'Recheck iCa 30–60 min after each infusion'],
    })
    warnings.push('Correct hypomagnesemia first or concurrently — otherwise Ca correction will fail.')
    warnings.push('Vitamin D deficiency: check 25-OH-D, PTH, and phosphate to determine etiology.')
  } else if (ca < 8.5) {
    tier = 'mild_low'; severityLabel = 'Mild Hypocalcemia'; urgencyLabel = 'Routine'
    severityNote = 'Oral supplementation for asymptomatic patients. IV if symptomatic or NPO.'
    deficitNote = 'Correct for albumin: Corrected Ca = measured Ca + 0.8 × (4.0 − albumin)'
    options.push({
      id: 'ca-oral-mild', routeLabel: 'Oral (Preferred)', routeIcon: 'pill',
      product: 'Calcium carbonate 1500 mg or calcium citrate 1000 mg/day',
      dose: '500–600 mg elemental Ca per dose',
      rate: 'TID with meals × 1–4 weeks, then recheck',
      notes: ['CaCO3 = 40% elemental Ca → 1500 mg CaCO3 = 600 mg elemental Ca (take with food)', 'Calcium citrate = 21% elemental Ca, better absorbed, can take without food', 'Add Vitamin D3 1000–2000 IU/day for long-term management', 'Correct the corrected calcium before treating: Ca + 0.8×(4.0 − albumin)'],
    })
    options.push({
      id: 'ca-iv-mild', routeLabel: 'IV (if symptomatic/NPO)', routeIcon: 'drip',
      product: 'Calcium gluconate 1g / 100 mL NS',
      dose: '1g calcium gluconate',
      rate: 'Over 1–2 hr',
      notes: ['Indicate if symptomatic (paresthesias, cramps) or unable to take oral Ca', 'Recheck iCa 1–2 hr after infusion'],
      locked: true,
    })
  } else if (ca <= 10.5) {
    tier = 'normal'; severityLabel = 'Normal Range'; urgencyLabel = 'Normal'
    severityNote = 'No repletion indicated.'
    options.push({
      id: 'ca-normal', routeLabel: 'No Repletion Needed', routeIcon: 'pill',
      product: '—', dose: '—', rate: 'Routine monitoring',
      notes: ['Dietary: dairy products, fortified OJ, leafy greens, almonds', 'Ensure adequate Vitamin D intake for calcium absorption'],
    })
  } else if (ca <= 12.0) {
    tier = 'mild_high'; severityLabel = 'Mild Hypercalcemia'; urgencyLabel = 'Monitor'
    severityNote = 'Investigate cause (PTH, malignancy, vitamin D). IV hydration if symptomatic.'
    options.push({
      id: 'ca-hyper-mild', routeLabel: 'IV Hydration + Cause Workup', routeIcon: 'drip',
      product: 'NS 200–500 mL/hr (isotonic hydration)',
      dose: '—', rate: '200–500 mL/hr (if symptomatic / Ca > 11)',
      notes: ['Identify cause: PTH↑ (PHPT), PTHrP (malignancy), vitamin D toxicity, sarcoid', 'Loop diuretic (furosemide 20–40mg IV) after adequate hydration', 'Bisphosphonates (zoledronic acid 4mg IV) for malignancy-associated hypercalcemia', 'Calcitonin 4 IU/kg SC q12h for rapid initial correction (tachyphylaxis after 48h)'],
    })
    warnings.push('Avoid thiazide diuretics — they increase Ca²⁺ reabsorption.')
    warnings.push('"Bones, Groans, Stones, Psychic Moans" — systematically assess for symptoms.')
  } else {
    tier = 'critical_high'; severityLabel = 'Severe Hypercalcemia'; urgencyLabel = 'STAT'
    severityNote = 'Hypercalcemic crisis. Aggressive IV hydration, bisphosphonates, calcitonin.'
    options.push({
      id: 'ca-hyper-critical', routeLabel: 'Emergent IV Protocol', routeIcon: 'bolt',
      product: 'NS + Furosemide + Zoledronic acid + Calcitonin',
      dose: 'Per sequential protocol (see notes)',
      rate: 'Emergent management',
      notes: [
        '① NS 500 mL/hr IV (aggressive volume expansion first)',
        '② Furosemide 20–40mg IV q2–4h once euvolemic (promote Ca excretion)',
        '③ Zoledronic acid 4mg IV over 15–30 min (onset 24–72h, peak at 4–7 days)',
        '④ Calcitonin 4 IU/kg SC q12h (rapid onset < 4h, tachyphylaxis after 48h)',
        '⑤ Glucocorticoids if sarcoid, lymphoma, or vitamin D toxicity',
        '⑥ Hemodialysis if Ca > 18 or renal failure',
      ],
      isUrgent: true,
    })
    warnings.push('Ca > 14 mg/dL → hypercalcemic crisis: altered mentation, renal failure, arrhythmias.')
    warnings.push('ECG: short QT, bradycardia, J-wave → risk of cardiac arrest with rapid changes.')
  }

  return {
    electrolyte: 'ca', value: ca, tier, severityLabel, severityNote, urgencyLabel,
    glowState: getSeverityGlowState(tier), deficitNote, options, warnings,
    chartNote: buildChartNote('Calcium', 'mg/dL', ca, severityLabel, urgencyLabel, options, warnings),
  }
}

// ─── Na⁺ analysis ─────────────────────────────────────────────────────────────

function analyzeNa(na: number): ElectrolyteAnalysis {
  let tier: SeverityTier
  let severityLabel: string
  let severityNote: string
  let urgencyLabel: string
  let deficitNote: string | undefined
  const options: RepleteOption[] = []
  const warnings: string[] = []

  if (na < 120) {
    tier = 'critical_low'; severityLabel = 'Critical Hyponatremia'; urgencyLabel = 'STAT'
    severityNote = 'Cerebral edema / herniation risk. Symptomatic: 3% NaCl bolus immediately.'
    options.push({
      id: 'na-hypo-critical', routeLabel: 'IV 3% NaCl (Emergent)', routeIcon: 'drip',
      product: '3% NaCl  (513 mEq Na / L)',
      dose: '100–150 mL bolus (can repeat × 2 for persistent symptoms)',
      rate: 'Over 20 min; then 0.5–1 mEq/L/hr target correction rate',
      notes: [
        'Goal: raise Na by 4–6 mEq/L in first 6 hr to control symptoms',
        'MAX correction: 8–10 mEq/L in first 24 hr (ODS risk)',
        'Simplified: 1 mL/kg of 3% NaCl ≈ raises Na by ~1 mEq/L',
        'Adrogue-Madias: ΔNa = (513 − Na) ÷ (TBW + 1)',
        'TBW: 0.6 × wt kg (male), 0.5 × wt kg (female), 0.45 × wt (elderly ♀)',
        'Endocrinology / nephrology consult strongly recommended',
      ],
      isUrgent: true,
    })
    warnings.push('Osmotic demyelination (ODS/CPM): MAX 8–10 mEq/L per 24 hr — no faster.')
    warnings.push('DDAVP 2–4 mcg IV/SC can be used to halt accidental overcorrection.')
    warnings.push('Check urine sodium, urine osmolality, serum osm, TSH, cortisol to classify.')
  } else if (na < 125) {
    tier = 'severe_low'; severityLabel = 'Severe Hyponatremia'; urgencyLabel = 'Urgent'
    severityNote = 'Consider 3% NaCl if symptomatic. Identify cause before aggressive correction.'
    options.push({
      id: 'na-hypo-severe', routeLabel: 'IV 3% NaCl (if symptomatic)', routeIcon: 'drip',
      product: '3% NaCl or 0.9% NaCl based on volume status',
      dose: 'Tailored to symptom severity and cause',
      rate: 'Correct 1–2 mEq/L/hr until symptoms resolve; then 0.5 mEq/L/hr',
      notes: [
        'Asymptomatic: fluid restriction ± modest 3% NaCl',
        'Symptomatic (nausea, lethargy): 3% NaCl 100 mL bolus over 20 min',
        'Max 8–10 mEq/L correction per 24 hr',
        'Classify: hypovolemic (urine Na < 20) vs SIADH (urine Na > 40)',
        'Tolvaptan (Samsca) for refractory SIADH — specialist supervision only',
      ],
    })
    warnings.push('MAX correction 8–10 mEq/L per 24 hr — osmotic demyelination is irreversible.')
    warnings.push('Identify and treat underlying cause: CHF, cirrhosis, hypothyroidism, SIADH, Addison\'s.')
  } else if (na < 136) {
    tier = 'mild_low'; severityLabel = 'Mild Hyponatremia'; urgencyLabel = 'Routine'
    severityNote = 'Identify and treat underlying cause. Fluid restriction if SIADH.'
    deficitNote = 'Mild — address etiology (SIADH, hypovolemia, hypothyroidism)'
    options.push({
      id: 'na-hypo-mild', routeLabel: 'Cause-Directed Therapy', routeIcon: 'pill',
      product: 'Fluid restriction / Isotonic saline / Hormone replacement',
      dose: '—', rate: 'As clinically directed; check Na q12–24 hr',
      notes: [
        'Hypovolemic hyponatremia: 0.9% NS at 1–1.5 mL/kg/hr to restore volume',
        'SIADH: fluid restriction 1–1.5 L/day (most common cause in hospitalized pts)',
        'Hypothyroidism or adrenal insufficiency: hormone replacement corrects Na',
        'Na tablets 1–2g TID for salt-wasting nephropathy or CSW (rare)',
        'Check urine osm + urine Na to differentiate cause before treating',
      ],
    })
  } else if (na <= 145) {
    tier = 'normal'; severityLabel = 'Normal Range'; urgencyLabel = 'Normal'
    severityNote = 'No correction indicated.'
    options.push({
      id: 'na-normal', routeLabel: 'No Action Required', routeIcon: 'pill',
      product: '—', dose: '—', rate: 'Routine monitoring',
      notes: ['Maintain adequate oral fluid intake', 'Monitor if on diuretics or at high risk for dysnatremia'],
    })
  } else if (na <= 155) {
    tier = 'mild_high'; severityLabel = 'Mild Hypernatremia'; urgencyLabel = 'Monitor'
    severityNote = 'Free water deficit. Identify etiology. Oral hydration or D5W/0.45% NaCl IV.'
    deficitNote = 'Free Water Deficit ≈ TBW × (Na / 140 − 1)'
    options.push({
      id: 'na-hyper-mild', routeLabel: 'Free Water Replacement', routeIcon: 'pill',
      product: 'PO free water / D5W / 0.45% NaCl IV',
      dose: 'Free Water Deficit = TBW × (Na/140 − 1)',
      rate: 'Correct at 0.5 mEq/L/hr; max 10–12 mEq/L per 24 hr',
      notes: [
        'TBW = 0.6 × wt kg (male), 0.5 × wt kg (female), 0.45 × wt (elderly ♀)',
        'Example 70kg male Na 152: FWD = 42 × (152/140 − 1) = 3.6 L',
        'Oral free water preferred if alert and tolerating PO',
        'IV: D5W for pure water deficit; 0.45% NaCl for mild hypernatremia (provides some electrolytes)',
        'Include ongoing insensible losses (~600–800 mL/day) in total fluid plan',
      ],
    })
    warnings.push('Correct hypernatremia slowly — too-rapid correction → cerebral edema (brain re-swells).')
    warnings.push('Identify cause: inadequate intake, diabetes insipidus, osmotic diuresis (hyperglycemia), GI losses.')
  } else {
    tier = 'critical_high'; severityLabel = 'Severe Hypernatremia'; urgencyLabel = 'STAT'
    severityNote = 'Significant free water deficit. Risk of cerebral hemorrhage from brain shrinkage.'
    options.push({
      id: 'na-hyper-critical', routeLabel: 'Aggressive Free Water Replacement', routeIcon: 'drip',
      product: 'D5W IV + TBW deficit correction protocol',
      dose: 'Free Water Deficit = TBW × (Na / 140 − 1)',
      rate: 'Correct at max 10–12 mEq/L per 24 hr; ICU monitoring',
      notes: [
        'Calculate TBW: 0.6 × kg (male), 0.5 × kg (female)',
        'Run D5W at rate needed to lower Na at ≤ 0.5 mEq/L/hr',
        'Add maintenance fluids for ongoing daily insensible losses',
        'Central diabetes insipidus: DDAVP (desmopressin) 1–4 mcg SC/IV q12–24h',
        'Nephrogenic DI: thiazide + amiloride ± indomethacin (outpatient)',
        'ICU-level monitoring strongly recommended',
      ],
      isUrgent: true,
    })
    warnings.push('Rapid correction → acute cerebral edema — target MAX 10–12 mEq/L per 24 hr.')
    warnings.push('Central DI: urine very dilute + hypernatremia → DDAVP trial.')
    warnings.push('Consider ICU-level hourly Na checks and strict I&Os.')
  }

  return {
    electrolyte: 'na', value: na, tier, severityLabel, severityNote, urgencyLabel,
    glowState: getSeverityGlowState(tier), deficitNote, options, warnings,
    chartNote: buildChartNote('Sodium', 'mEq/L', na, severityLabel, urgencyLabel, options, warnings),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function analyzeLyte(id: ElectrolyteId, value: number): ElectrolyteAnalysis {
  switch (id) {
    case 'k':   return analyzeK(value)
    case 'mg':  return analyzeMg(value)
    case 'po4': return analyzePO4(value)
    case 'ca':  return analyzeCa(value)
    case 'na':  return analyzeNa(value)
  }
}
