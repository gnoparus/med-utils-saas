export interface AbgInput {
  pH: number
  pco2: number
  hco3: number
}

export type AcidBaseState = 'acidemia' | 'alkalemia' | 'near-normal'
export type DriverTone = 'acid' | 'alkaline' | 'neutral'
export type CompensationKind =
  | 'appropriate'
  | 'acute'
  | 'chronic'
  | 'intermediate'
  | 'mixed'
  | 'indeterminate'

export interface InputStatus {
  value: number
  normalLow: number
  normalHigh: number
  direction: DriverTone
  deltaFromSetPoint: number
}

export interface CompensationSummary {
  kind: CompensationKind
  label: string
  formula: string
  expectedLow: number
  expectedHigh: number
  measured: number
  note: string
}

export interface AbgAnalysis {
  input: AbgInput
  acidBaseState: AcidBaseState
  title: string
  subtitle: string
  summary: string
  pHStatus: InputStatus
  respiratoryStatus: InputStatus
  metabolicStatus: InputStatus
  compensation: CompensationSummary
  netImbalance: number
  scaleAngle: number
  glowState: 'green' | 'red' | 'cyan' | 'amber'
  chartNote: string
}

const NORMALS = {
  pH: { low: 7.35, high: 7.45, setPoint: 7.4 },
  pco2: { low: 35, high: 45, setPoint: 40 },
  hco3: { low: 22, high: 26, setPoint: 24 },
} as const

function round(value: number, digits = 1) {
  return Number(value.toFixed(digits))
}

function inRange(value: number, low: number, high: number) {
  return value >= low && value <= high
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function buildInputStatus(value: number, normalLow: number, normalHigh: number, setPoint: number, inverse = false): InputStatus {
  let direction: DriverTone = 'neutral'

  if (!inverse) {
    if (value < normalLow) direction = 'acid'
    if (value > normalHigh) direction = 'alkaline'
  } else {
    if (value > normalHigh) direction = 'acid'
    if (value < normalLow) direction = 'alkaline'
  }

  return {
    value,
    normalLow,
    normalHigh,
    direction,
    deltaFromSetPoint: round(value - setPoint, 2),
  }
}

function classifyAcidBaseState(pH: number): AcidBaseState {
  if (pH < NORMALS.pH.low) return 'acidemia'
  if (pH > NORMALS.pH.high) return 'alkalemia'
  return 'near-normal'
}

function compensationForMetabolicAcidosis(hco3: number, measuredPco2: number): CompensationSummary {
  const predicted = 1.5 * hco3 + 8
  const low = round(predicted - 2, 1)
  const high = round(predicted + 2, 1)

  if (measuredPco2 > high) {
    return {
      kind: 'mixed',
      label: 'Above Winters range',
      formula: "Winter's formula",
      expectedLow: low,
      expectedHigh: high,
      measured: measuredPco2,
      note: 'PaCO2 is higher than expected, suggesting concomitant respiratory acidosis.',
    }
  }

  if (measuredPco2 < low) {
    return {
      kind: 'mixed',
      label: 'Below Winters range',
      formula: "Winter's formula",
      expectedLow: low,
      expectedHigh: high,
      measured: measuredPco2,
      note: 'PaCO2 is lower than expected, suggesting concomitant respiratory alkalosis.',
    }
  }

  return {
    kind: 'appropriate',
    label: 'Appropriate respiratory compensation',
    formula: "Winter's formula",
    expectedLow: low,
    expectedHigh: high,
    measured: measuredPco2,
    note: 'Measured PaCO2 falls within the expected compensatory range.',
  }
}

function compensationForMetabolicAlkalosis(hco3: number, measuredPco2: number): CompensationSummary {
  const rise = hco3 - NORMALS.hco3.setPoint
  const low = round(40 + 0.6 * rise, 1)
  const high = round(Math.min(55, 40 + 0.75 * rise), 1)

  if (measuredPco2 > high) {
    return {
      kind: 'mixed',
      label: 'Above expected PaCO2',
      formula: 'Metabolic alkalosis compensation',
      expectedLow: low,
      expectedHigh: high,
      measured: measuredPco2,
      note: 'PaCO2 is higher than expected, suggesting concomitant respiratory acidosis.',
    }
  }

  if (measuredPco2 < low) {
    return {
      kind: 'mixed',
      label: 'Below expected PaCO2',
      formula: 'Metabolic alkalosis compensation',
      expectedLow: low,
      expectedHigh: high,
      measured: measuredPco2,
      note: 'PaCO2 is lower than expected, suggesting concomitant respiratory alkalosis.',
    }
  }

  return {
    kind: 'appropriate',
    label: 'Appropriate respiratory compensation',
    formula: 'Metabolic alkalosis compensation',
    expectedLow: low,
    expectedHigh: high,
    measured: measuredPco2,
    note: 'Measured PaCO2 fits the expected compensatory range.',
  }
}

function compensationForRespiratoryAcidosis(pco2: number, measuredHco3: number): CompensationSummary {
  const delta = (pco2 - NORMALS.pco2.setPoint) / 10
  const acuteLow = round(24 + 1 * delta, 1)
  const acuteHigh = round(24 + 2 * delta, 1)
  const chronicLow = round(24 + 3 * delta, 1)
  const chronicHigh = round(24 + 4 * delta, 1)

  if (inRange(measuredHco3, acuteLow, acuteHigh)) {
    return {
      kind: 'acute',
      label: 'Acute respiratory acidosis',
      formula: 'Acute renal compensation',
      expectedLow: acuteLow,
      expectedHigh: acuteHigh,
      measured: measuredHco3,
      note: 'Bicarbonate rise fits acute renal compensation.',
    }
  }

  if (inRange(measuredHco3, chronicLow, chronicHigh)) {
    return {
      kind: 'chronic',
      label: 'Chronic respiratory acidosis',
      formula: 'Chronic renal compensation',
      expectedLow: chronicLow,
      expectedHigh: chronicHigh,
      measured: measuredHco3,
      note: 'Bicarbonate rise fits chronic renal compensation.',
    }
  }

  if (measuredHco3 < acuteLow) {
    return {
      kind: 'mixed',
      label: 'Less bicarbonate than expected',
      formula: 'Respiratory acidosis compensation',
      expectedLow: acuteLow,
      expectedHigh: chronicHigh,
      measured: measuredHco3,
      note: 'Bicarbonate is lower than expected, suggesting concomitant metabolic acidosis.',
    }
  }

  if (measuredHco3 > chronicHigh) {
    return {
      kind: 'mixed',
      label: 'More bicarbonate than expected',
      formula: 'Respiratory acidosis compensation',
      expectedLow: acuteLow,
      expectedHigh: chronicHigh,
      measured: measuredHco3,
      note: 'Bicarbonate is higher than expected, suggesting concomitant metabolic alkalosis.',
    }
  }

  return {
    kind: 'intermediate',
    label: 'Between acute and chronic patterns',
    formula: 'Respiratory acidosis compensation',
    expectedLow: acuteLow,
    expectedHigh: chronicHigh,
    measured: measuredHco3,
    note: 'Values sit between acute and chronic patterns, which can reflect evolving compensation.',
  }
}

function compensationForRespiratoryAlkalosis(pco2: number, measuredHco3: number): CompensationSummary {
  const delta = (NORMALS.pco2.setPoint - pco2) / 10
  const acuteLow = round(24 - 2 * delta, 1)
  const acuteHigh = round(24 - 1 * delta, 1)
  const chronicLow = round(24 - 5 * delta, 1)
  const chronicHigh = round(24 - 4 * delta, 1)

  if (inRange(measuredHco3, acuteLow, acuteHigh)) {
    return {
      kind: 'acute',
      label: 'Acute respiratory alkalosis',
      formula: 'Acute renal compensation',
      expectedLow: acuteLow,
      expectedHigh: acuteHigh,
      measured: measuredHco3,
      note: 'Bicarbonate drop fits acute renal compensation.',
    }
  }

  if (inRange(measuredHco3, chronicLow, chronicHigh)) {
    return {
      kind: 'chronic',
      label: 'Chronic respiratory alkalosis',
      formula: 'Chronic renal compensation',
      expectedLow: chronicLow,
      expectedHigh: chronicHigh,
      measured: measuredHco3,
      note: 'Bicarbonate drop fits chronic renal compensation.',
    }
  }

  if (measuredHco3 > acuteHigh) {
    return {
      kind: 'mixed',
      label: 'Less bicarbonate drop than expected',
      formula: 'Respiratory alkalosis compensation',
      expectedLow: chronicLow,
      expectedHigh: acuteHigh,
      measured: measuredHco3,
      note: 'Bicarbonate is higher than expected, suggesting concomitant metabolic alkalosis.',
    }
  }

  if (measuredHco3 < chronicLow) {
    return {
      kind: 'mixed',
      label: 'More bicarbonate drop than expected',
      formula: 'Respiratory alkalosis compensation',
      expectedLow: chronicLow,
      expectedHigh: acuteHigh,
      measured: measuredHco3,
      note: 'Bicarbonate is lower than expected, suggesting concomitant metabolic acidosis.',
    }
  }

  return {
    kind: 'intermediate',
    label: 'Between acute and chronic patterns',
    formula: 'Respiratory alkalosis compensation',
    expectedLow: chronicLow,
    expectedHigh: acuteHigh,
    measured: measuredHco3,
    note: 'Values sit between acute and chronic patterns, which can reflect evolving compensation.',
  }
}

function chooseNearNormalLabel(
  pH: number,
  metabolicTone: DriverTone,
  respiratoryTone: DriverTone,
  metabolicComp: CompensationSummary | null,
  respiratoryComp: CompensationSummary | null
) {
  if (metabolicTone === 'acid' && respiratoryTone === 'alkaline') {
    if (metabolicComp?.kind === 'appropriate' && respiratoryComp && (respiratoryComp.kind === 'acute' || respiratoryComp.kind === 'chronic')) {
      return pH <= NORMALS.pH.setPoint ? 'Compensated metabolic acidosis' : 'Compensated respiratory alkalosis'
    }
    if (metabolicComp?.kind === 'appropriate') return 'Compensated metabolic acidosis'
    if (respiratoryComp && (respiratoryComp.kind === 'acute' || respiratoryComp.kind === 'chronic')) return 'Compensated respiratory alkalosis'
    return 'Mixed metabolic acidosis + respiratory alkalosis'
  }

  if (metabolicTone === 'alkaline' && respiratoryTone === 'acid') {
    if (metabolicComp?.kind === 'appropriate' && respiratoryComp && (respiratoryComp.kind === 'acute' || respiratoryComp.kind === 'chronic')) {
      return pH >= NORMALS.pH.setPoint ? 'Compensated metabolic alkalosis' : 'Compensated respiratory acidosis'
    }
    if (metabolicComp?.kind === 'appropriate') return 'Compensated metabolic alkalosis'
    if (respiratoryComp && (respiratoryComp.kind === 'acute' || respiratoryComp.kind === 'chronic')) return 'Compensated respiratory acidosis'
    return 'Mixed metabolic alkalosis + respiratory acidosis'
  }

  if (metabolicTone === 'neutral' && respiratoryTone === 'neutral') {
    return 'Near-normal ABG'
  }

  return 'Compensated or mixed disorder'
}

function buildSummary(title: string, compensation: CompensationSummary): string {
  if (compensation.kind === 'appropriate' || compensation.kind === 'acute' || compensation.kind === 'chronic') {
    return `${title}. ${compensation.note}`
  }

  if (compensation.kind === 'intermediate') {
    return `${title}. ${compensation.note}`
  }

  if (compensation.kind === 'mixed') {
    return `${title}. ${compensation.note}`
  }

  return `${title}. Compensation is not clearly classifiable from these values alone.`
}

export function analyzeAbg(input: AbgInput): AbgAnalysis {
  const pHStatus = buildInputStatus(input.pH, NORMALS.pH.low, NORMALS.pH.high, NORMALS.pH.setPoint)
  const respiratoryStatus = buildInputStatus(input.pco2, NORMALS.pco2.low, NORMALS.pco2.high, NORMALS.pco2.setPoint, true)
  const metabolicStatus = buildInputStatus(input.hco3, NORMALS.hco3.low, NORMALS.hco3.high, NORMALS.hco3.setPoint)

  const acidBaseState = classifyAcidBaseState(input.pH)
  const metabolicTone = metabolicStatus.direction
  const respiratoryTone = respiratoryStatus.direction

  let title = 'Near-normal ABG'
  let subtitle = 'Inputs sit close to the physiologic set point.'
  let compensation: CompensationSummary = {
    kind: 'indeterminate',
    label: 'No major compensation needed',
    formula: 'Reference range check',
    expectedLow: NORMALS.pco2.low,
    expectedHigh: NORMALS.pco2.high,
    measured: input.pco2,
    note: 'No dominant primary acid-base disturbance is obvious from these values alone.',
  }

  if (acidBaseState === 'acidemia') {
    if (metabolicTone === 'acid' && respiratoryTone === 'acid') {
      title = 'Mixed metabolic + respiratory acidosis'
      subtitle = 'Both HCO3 and PaCO2 are pushing the pH acidic.'
      compensation = {
        kind: 'mixed',
        label: 'Two primary acidifying processes',
        formula: 'Pattern recognition',
        expectedLow: 0,
        expectedHigh: 0,
        measured: input.pco2,
        note: 'Low bicarbonate and elevated PaCO2 point to dual primary acidosis rather than compensation.',
      }
    } else if (metabolicTone === 'acid') {
      title = 'Primary metabolic acidosis'
      subtitle = 'Bicarbonate is the dominant acidic driver.'
      compensation = compensationForMetabolicAcidosis(input.hco3, input.pco2)
    } else if (respiratoryTone === 'acid') {
      title = 'Primary respiratory acidosis'
      subtitle = 'Carbon dioxide retention is the dominant acidic driver.'
      compensation = compensationForRespiratoryAcidosis(input.pco2, input.hco3)
    }
  } else if (acidBaseState === 'alkalemia') {
    if (metabolicTone === 'alkaline' && respiratoryTone === 'alkaline') {
      title = 'Mixed metabolic + respiratory alkalosis'
      subtitle = 'Both HCO3 and PaCO2 are pushing the pH alkaline.'
      compensation = {
        kind: 'mixed',
        label: 'Two primary alkalinizing processes',
        formula: 'Pattern recognition',
        expectedLow: 0,
        expectedHigh: 0,
        measured: input.pco2,
        note: 'Elevated bicarbonate plus low PaCO2 point to dual primary alkalosis rather than compensation.',
      }
    } else if (metabolicTone === 'alkaline') {
      title = 'Primary metabolic alkalosis'
      subtitle = 'Bicarbonate excess is the dominant alkaline driver.'
      compensation = compensationForMetabolicAlkalosis(input.hco3, input.pco2)
    } else if (respiratoryTone === 'alkaline') {
      title = 'Primary respiratory alkalosis'
      subtitle = 'Carbon dioxide deficit is the dominant alkaline driver.'
      compensation = compensationForRespiratoryAlkalosis(input.pco2, input.hco3)
    }
  } else {
    const metabolicComp =
      metabolicTone === 'acid'
        ? compensationForMetabolicAcidosis(input.hco3, input.pco2)
        : metabolicTone === 'alkaline'
          ? compensationForMetabolicAlkalosis(input.hco3, input.pco2)
          : null

    const respiratoryComp =
      respiratoryTone === 'acid'
        ? compensationForRespiratoryAcidosis(input.pco2, input.hco3)
        : respiratoryTone === 'alkaline'
          ? compensationForRespiratoryAlkalosis(input.pco2, input.hco3)
          : null

    title = chooseNearNormalLabel(input.pH, metabolicTone, respiratoryTone, metabolicComp, respiratoryComp)
    subtitle = 'Normal-range pH can still hide compensation or competing primary processes.'
    compensation = metabolicComp?.kind === 'appropriate'
      ? metabolicComp
      : respiratoryComp ?? metabolicComp ?? compensation
  }

  const acidPull = Math.max(0, (NORMALS.hco3.setPoint - input.hco3) / 4) + Math.max(0, (input.pco2 - NORMALS.pco2.setPoint) / 10)
  const alkalinePull = Math.max(0, (input.hco3 - NORMALS.hco3.setPoint) / 4) + Math.max(0, (NORMALS.pco2.setPoint - input.pco2) / 10)
  const pHPull = (input.pH - NORMALS.pH.setPoint) / 0.05
  const netImbalance = round((alkalinePull - acidPull) + pHPull * 0.35, 2)
  const scaleAngle = round(clamp(netImbalance * 4.2, -18, 18), 1)

  const glowState =
    compensation.kind === 'appropriate' || compensation.kind === 'acute' || compensation.kind === 'chronic'
      ? 'green'
      : compensation.kind === 'mixed'
        ? 'amber'
        : acidBaseState === 'acidemia'
          ? 'red'
          : acidBaseState === 'alkalemia'
            ? 'cyan'
            : 'green'

  const summary = buildSummary(title, compensation)
  const chartNote = generateTippingPointNote({
    input,
    title,
    compensation,
  })

  return {
    input,
    acidBaseState,
    title,
    subtitle,
    summary,
    pHStatus,
    respiratoryStatus,
    metabolicStatus,
    compensation,
    netImbalance,
    scaleAngle,
    glowState,
    chartNote,
  }
}

export function generateTippingPointNote(analysis: Pick<AbgAnalysis, 'input' | 'title' | 'compensation'>) {
  const expectedText =
    analysis.compensation.expectedLow === 0 && analysis.compensation.expectedHigh === 0
      ? analysis.compensation.label
      : `${analysis.compensation.formula} expected ${analysis.compensation.expectedLow.toFixed(1)}-${analysis.compensation.expectedHigh.toFixed(1)}`

  return [
    `ABG: pH ${analysis.input.pH.toFixed(2)} / PaCO2 ${analysis.input.pco2.toFixed(0)} / HCO3 ${analysis.input.hco3.toFixed(1)}.`,
    `Impression: ${analysis.title}.`,
    `${expectedText}; measured ${analysis.compensation.measured.toFixed(1)}.`,
    analysis.compensation.note,
  ].join(' ')
}

export const TIPPING_POINT_PRESETS = [
  { id: 'dka', label: 'DKA', values: { pH: 7.12, pco2: 22, hco3: 7 } },
  { id: 'copd', label: 'COPD', values: { pH: 7.31, pco2: 60, hco3: 30 } },
  { id: 'vomit', label: 'Vomiting', values: { pH: 7.53, pco2: 48, hco3: 38 } },
  { id: 'salicylate', label: 'Salicylate', values: { pH: 7.48, pco2: 19, hco3: 14 } },
] as const
