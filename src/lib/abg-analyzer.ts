export type ABGResult = {
  primary: string
  compensation: string
  isNormal: boolean
  tipAngle: number // -45 to 45 (negative left/acid, positive right/base)
  glowColor: string
}

export function analyzeABG(ph: number, pco2: number, hco3: number): ABGResult {
  if (!ph || !pco2 || !hco3) {
    return { primary: "Awaiting Values", compensation: "", isNormal: true, tipAngle: 0, glowColor: "text-slate-500" }
  }

  let phStatus = "Normal"
  if (ph < 7.35) phStatus = "Acidemia"
  else if (ph > 7.45) phStatus = "Alkalemia"

  let primary = "Normal Acid-Base"
  let compensation = ""
  let isNormal = false
  let tipAngle = 0
  let glowColor = "text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"

  if (phStatus === "Normal" && pco2 >= 35 && pco2 <= 45 && hco3 >= 22 && hco3 <= 26) {
    isNormal = true
    return { primary, compensation, isNormal, tipAngle, glowColor }
  }

  // Determine primary disorder
  if (phStatus === "Acidemia") {
    tipAngle = -((7.35 - Math.max(ph, 6.8)) / 0.55) * 45 // scale to 45 deg max
    glowColor = "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
    
    if (pco2 > 45 && hco3 < 22) {
      primary = "Mixed Acidosis"
    } else if (pco2 > 45) {
      primary = "Respiratory Acidosis"
      const expHco3Acute = 24 + ((pco2 - 40) / 10) * 1
      const expHco3Chronic = 24 + ((pco2 - 40) / 10) * 3.5
      compensation = `Expected HCO3: Acute ~${expHco3Acute.toFixed(1)}, Chronic ~${expHco3Chronic.toFixed(1)}`
    } else if (hco3 < 22) {
      primary = "Metabolic Acidosis"
      const expectedPco2 = 1.5 * hco3 + 8 // Winters
      compensation = `Winters Exp pCO2: ${expectedPco2.toFixed(1)} ± 2`
    } else {
      primary = "Uncompensated Acidemia"
    }
  } else if (phStatus === "Alkalemia") {
    tipAngle = ((Math.min(ph, 7.8) - 7.45) / 0.35) * 45
    glowColor = "text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" 
    
    if (pco2 < 35 && hco3 > 26) {
      primary = "Mixed Alkalosis"
    } else if (pco2 < 35) {
      primary = "Respiratory Alkalosis"
      const expHco3Acute = 24 - ((40 - pco2) / 10) * 2
      const expHco3Chronic = 24 - ((40 - pco2) / 10) * 4
      compensation = `Expected HCO3: Acute ~${expHco3Acute.toFixed(1)}, Chronic ~${expHco3Chronic.toFixed(1)}`
    } else if (hco3 > 26) {
      primary = "Metabolic Alkalosis"
      const expectedPco2 = 40 + 0.7 * (hco3 - 24)
      compensation = `Expected pCO2: ~${expectedPco2.toFixed(1)}`
    } else {
      primary = "Uncompensated Alkalemia"
    }
  } else {
    // Normal pH but abnormal pCO2 or hco3 -> Fully compensated
    if (pco2 > 45 && hco3 > 26) {
      if (ph < 7.4) primary = "Compensated Respiratory Acidosis"
      else primary = "Compensated Metabolic Alkalosis"
    } else if (pco2 < 35 && hco3 < 22) {
       if (ph > 7.4) primary = "Compensated Respiratory Alkalosis"
       else primary = "Compensated Metabolic Acidosis"
    }
  }

  // Ensure tip angle is clamped
  tipAngle = Math.max(-45, Math.min(45, tipAngle))

  return { primary, compensation, isNormal, tipAngle, glowColor }
}

export function generateChartNote(ph: number, pco2: number, hco3: number, result: ABGResult) {
  if (result.primary === "Awaiting Values") return ""
  return `ABG Evaluation: pH ${ph.toFixed(2)}, pCO2 ${pco2.toFixed(1)}, HCO3 ${hco3.toFixed(1)}. 
Interpretation: ${result.primary}. 
${result.compensation ? result.compensation : ''}`.trim()
}
