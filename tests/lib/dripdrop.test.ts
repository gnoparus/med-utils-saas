import { describe, it, expect } from 'vitest'
import { PRESSOR_DRUGS, calculateRate, getEffectLabel } from '../../src/lib/dripdrop-calculator'

describe('DripDrop calculator', () => {
  describe('calculateRate()', () => {
    it('calculates ml/hr for norepinephrine (mcg/kg/min)', () => {
      const norepi = PRESSOR_DRUGS.find(d => d.id === 'norepinephrine')!
      const dose = 0.1 // mcg/kg/min
      const weightKg = 70
      const conc = norepi.standardConc.mcgPerML // 64 mcg/mL

      const calc = calculateRate(dose, weightKg, norepi, conc)
      // expected: (0.1 * 70 * 60) / 64 = 6.5625 mL/hr
      expect(calc.mlPerHr).toBeCloseTo(6.5625, 4)
      expect(calc.isDanger).toBe(false)
      expect(calc.dropsPerSec).toBeGreaterThanOrEqual(0.3)
      expect(calc.dropsPerSec).toBeLessThanOrEqual(25)
    })

    it('calculates ml/hr for vasopressin (units/min) using units/min branch', () => {
      const vasp = PRESSOR_DRUGS.find(d => d.id === 'vasopressin')!
      const dose = 0.03 // units/min
      const weightKg = 70 // should be ignored for units/min
      const conc = vasp.standardConc.mcgPerML // 0.2 units/mL

      const calc = calculateRate(dose, weightKg, vasp, conc)
      // expected: (0.03 * 60) / 0.2 = 9 mL/hr
      expect(calc.mlPerHr).toBeCloseTo(9, 6)
      expect(calc.isDanger).toBe(false)
    })

    it('marks high doses as danger when above dangerDose', () => {
      const epi = PRESSOR_DRUGS.find(d => d.id === 'epinephrine')!
      const dose = 0.4 // above epinephrine.dangerDose (0.3)
      const weightKg = 80
      const conc = epi.standardConc.mcgPerML

      const calc = calculateRate(dose, weightKg, epi, conc)
      expect(calc.isDanger).toBe(true)
    })

    it('clamps visual drip rate to upper bound when ml/hr is extremely large', () => {
      const norepi = PRESSOR_DRUGS.find(d => d.id === 'norepinephrine')!
      // craft values to produce a very large ml/hr by passing a tiny concentration
      const dose = 10 // mcg/kg/min
      const weightKg = 100
      const tinyConc = 0.1 // mcg/mL -> artificially small to force huge ml/hr

      const calc = calculateRate(dose, weightKg, norepi, tinyConc)
      // dropsPerSec is clamped via Math.min(25,...)
      expect(calc.dropsPerSec).toBeGreaterThanOrEqual(0.3)
      expect(calc.dropsPerSec).toBeLessThanOrEqual(25)
      // mlPerHr should be massive given tinyConc
      expect(calc.mlPerHr).toBeGreaterThan(1000)
    })
  })

  describe('getEffectLabel()', () => {
    it('returns dopamine-specific effect labels for dose ranges', () => {
      const dopamine = PRESSOR_DRUGS.find(d => d.id === 'dopamine')!
      expect(getEffectLabel(dopamine, 2)).toBe('Renal / Natriuretic')
      expect(getEffectLabel(dopamine, 7)).toBe('Inotropic (β₁)')
      expect(getEffectLabel(dopamine, 12)).toBe('Vasopressor (α₁)')
    })

    it('returns norepinephrine labels based on dose', () => {
      const norepi = PRESSOR_DRUGS.find(d => d.id === 'norepinephrine')!
      expect(getEffectLabel(norepi, 0.05)).toBe('Low — Titrate Up')
      expect(getEffectLabel(norepi, 0.15)).toBe('Moderate Vasopressor')
      expect(getEffectLabel(norepi, 0.5)).toBe('High-Dose — Check Map')
    })

    it('returns epinephrine labels based on dose', () => {
      const epi = PRESSOR_DRUGS.find(d => d.id === 'epinephrine')!
      expect(getEffectLabel(epi, 0.05)).toBe('Low Inotrope/Vasoconstriction')
      expect(getEffectLabel(epi, 0.2)).toBe('Moderate — Monitor HR')
      expect(getEffectLabel(epi, 0.5)).toBe('High-Dose — Arrhythmia Risk')
    })

    it('returns appropriate labels for vasopressin dose ranges', () => {
      const vasp = PRESSOR_DRUGS.find(d => d.id === 'vasopressin')!
      expect(getEffectLabel(vasp, 0.03)).toBe('Adjunct Dose')
      expect(getEffectLabel(vasp, 0.04)).toBe('Standard — Adjunct to NE')
      expect(getEffectLabel(vasp, 0.05)).toBe('High-Dose — Beyond Standard')
    })
  })
})
