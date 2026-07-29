import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Lock, AlertTriangle, Zap, BadgeAlert } from 'lucide-react'
import { AppShellHeader } from '../../components/app-shell'
import {
  PRESSOR_DRUGS,
  calculateRate,
  getEffectLabel,
  generateDripChartNote,
  type PresssorDrug,
} from '../../lib/dripdrop-calculator'
import { IVBagAnimation } from './IVBagAnimation'
import { RadialDial } from './RadialDial'
import { trackToolOpened, trackFirstResultCompleted, trackPaywallViewed, trackCheckoutStarted } from '../../lib/analytics'
import { STRIPE_MONTHLY_URL } from '../../lib/billing'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function triggerHaptic(pattern: number | number[] = 8) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}

// ─── Config ───────────────────────────────────────────────────────────────────

const WEIGHT_MIN = 30
const WEIGHT_MAX = 200
const WEIGHT_PRESETS = [50, 60, 70, 80, 90, 100]

const DRUG_DOSE_PRESETS: Record<string, number[]> = {
  norepinephrine: [0.05, 0.1, 0.2, 0.3, 0.5],
  epinephrine:    [0.05, 0.1, 0.2, 0.3],
  dopamine:       [3, 5, 10, 15, 20],
  dobutamine:     [2.5, 5, 10, 15, 20],
  vasopressin:    [0.01, 0.02, 0.03, 0.04, 0.05],
}

// ─── Per-drug style map (inline styles — avoids dynamic Tailwind class names) ─
//
// ponytail: every drug shares drips-sky (DESIGN.md One Signal Rule) — the map
// keys (amber/red/violet/sky/emerald) are kept because they're also the drug
// identity keys read elsewhere (IVBagAnimation's BAG_COLORS, SVG clipPath id).
// Differentiation between drugs is container alpha only, never hue.

interface DrugStyle {
  accent: string
  rgb: string
  panel: string
  border: string
  bgGradient: string
}

const SKY_ACCENT = '#7DD3FC'
const SKY_RGB = '125,211,252'

function skyTint(panelAlpha: number): DrugStyle {
  return {
    accent: SKY_ACCENT,
    rgb: SKY_RGB,
    panel: `rgba(${SKY_RGB},${panelAlpha})`,
    border: `rgba(${SKY_RGB},${(panelAlpha + 0.16).toFixed(2)})`,
    bgGradient:
      `radial-gradient(circle at 14% 10%, rgba(${SKY_RGB},${(panelAlpha + 0.01).toFixed(2)}), transparent 38%), radial-gradient(circle at 82% 88%, rgba(${SKY_RGB},${Math.max(panelAlpha - 0.04, 0.02).toFixed(2)}), transparent 38%)`,
  }
}

const DRUG_STYLES: Record<string, DrugStyle> = {
  amber: skyTint(0.09),
  red: skyTint(0.12),
  violet: skyTint(0.15),
  sky: skyTint(0.18),
  emerald: skyTint(0.21),
}

// ─── DrugSelector ─────────────────────────────────────────────────────────────

function DrugSelector({
  drugs,
  selected,
  onSelect,
}: {
  drugs: PresssorDrug[]
  selected: PresssorDrug
  onSelect: (d: PresssorDrug) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 px-4 scrollbar-none snap-x snap-mandatory">
      {drugs.map((d) => {
        const s = DRUG_STYLES[d.color] ?? DRUG_STYLES.amber
        const isActive = selected.id === d.id
        return (
          <motion.button
            key={d.id}
            id={`drug-${d.id}`}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect(d)}
            className="shrink-0 snap-start px-4 py-2.5 rounded-2xl text-sm font-black tracking-wide border"
            style={
              isActive
                ? { background: s.panel, borderColor: s.border, color: s.accent, boxShadow: `0 0 16px rgba(${s.rgb},0.2)` }
                : { background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(255,255,255,0.08)', color: '#94A3B8' }
            }
          >
            {d.shortName}
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── WeightStepper ────────────────────────────────────────────────────────────

function WeightStepper({
  weight,
  onChange,
  s,
}: {
  weight: number
  onChange: (w: number) => void
  s: DrugStyle
}) {
  const bump = (delta: number) => {
    onChange(clamp(weight + delta, WEIGHT_MIN, WEIGHT_MAX))
    triggerHaptic()
  }

  return (
    <div className="space-y-2.5">
      {/* Quick presets */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {WEIGHT_PRESETS.map((w) => (
          <motion.button
            key={w}
            whileTap={{ scale: 0.92 }}
            onClick={() => { onChange(w); triggerHaptic() }}
            className="shrink-0 rounded-xl px-3 py-1.5 text-sm font-black border"
            style={
              weight === w
                ? { background: s.panel, borderColor: s.border, color: s.accent }
                : { background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(255,255,255,0.08)', color: '#94A3B8' }
            }
          >
            {w}
          </motion.button>
        ))}
      </div>
      {/* Fine tune */}
      <div className="flex items-center gap-2">
        <button onClick={() => bump(-5)} className="glass border-white/10 px-3 py-2 rounded-xl text-slate-400 font-bold text-sm active:scale-95 transition-transform">−5</button>
        <button onClick={() => bump(-1)} className="glass border-white/10 px-3 py-2 rounded-xl text-slate-400 font-bold text-sm active:scale-95 transition-transform">−1</button>
        <div className="flex-1 rounded-xl text-center py-2.5" style={{ background: s.panel, border: `1px solid ${s.border}` }}>
          <motion.span
            key={weight}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl font-black tabular-nums"
            style={{ color: s.accent }}
          >
            {weight}
          </motion.span>
          <span className="text-slate-500 text-xs font-semibold ml-1">kg</span>
        </div>
        <button onClick={() => bump(1)}  className="glass border-white/10 px-3 py-2 rounded-xl text-slate-400 font-bold text-sm active:scale-95 transition-transform">+1</button>
        <button onClick={() => bump(5)}  className="glass border-white/10 px-3 py-2 rounded-xl text-slate-400 font-bold text-sm active:scale-95 transition-transform">+5</button>
      </div>
    </div>
  )
}

// ─── DoseQuickPicks ───────────────────────────────────────────────────────────

function DoseQuickPicks({
  drug,
  current,
  s,
  onPick,
}: {
  drug: PresssorDrug
  current: number
  s: DrugStyle
  onPick: (dose: number) => void
}) {
  const presets = DRUG_DOSE_PRESETS[drug.id] ?? []
  if (presets.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
      {presets.map((p) => {
        const isActive = Math.abs(current - p) < drug.dialStep * 0.6
        return (
          <motion.button
            key={p}
            whileTap={{ scale: 0.92 }}
            onClick={() => { onPick(p); triggerHaptic() }}
            className="shrink-0 rounded-xl px-3 py-2 text-xs font-black border"
            style={
              isActive
                ? { background: s.panel, borderColor: s.border, color: s.accent, boxShadow: `0 0 10px rgba(${s.rgb},0.22)` }
                : { background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(255,255,255,0.08)', color: '#94A3B8' }
            }
          >
            {p < 0.1 ? p.toFixed(3) : p < 1 ? p.toFixed(2) : p.toFixed(0)}
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── DangerBanner ─────────────────────────────────────────────────────────────

function DangerBanner({ drug, dose }: { drug: PresssorDrug; dose: number }) {
  return (
    <AnimatePresence>
      {dose >= drug.dangerDose && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="overflow-hidden px-4 mt-2"
        >
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-300 text-xs font-semibold leading-tight">
              High-dose territory — verify MAP, reassess fluid status and source control.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DripDrop({ embedded }: { embedded?: boolean } = {}) {
  const ContentTag = embedded ? 'div' : 'main'
  const [activeDrug, setActiveDrug] = useState<PresssorDrug>(PRESSOR_DRUGS[0])
  const [dose, setDose] = useState(activeDrug.doseRange.min)
  const [weightKg, setWeightKg] = useState(70)
  const [copied, setCopied] = useState(false)
  const paywallRef = useRef<HTMLDivElement>(null)
  const firstResultFired = useRef(false)

  useEffect(() => { trackToolOpened('drips') }, [])

  useEffect(() => {
    if (!firstResultFired.current) {
      firstResultFired.current = true
      trackFirstResultCompleted('drips')
    }
  }, [dose, weightKg])

  useEffect(() => {
    const el = paywallRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackPaywallViewed('drips', 'custom_concentrations')
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleDrugChange = (d: PresssorDrug) => {
    setActiveDrug(d)
    setDose(d.doseRange.min)
    triggerHaptic(12)
  }

  const s = DRUG_STYLES[activeDrug.color] ?? DRUG_STYLES.amber
  const concLabel = activeDrug.standardConc.label
  const mcgPerML = activeDrug.standardConc.mcgPerML

  const calc = useMemo(
    () => calculateRate(dose, weightKg, activeDrug, mcgPerML),
    [dose, weightKg, activeDrug, mcgPerML]
  )

  const effectLabel = useMemo(() => getEffectLabel(activeDrug, dose), [activeDrug, dose])

  const handleCopy = async () => {
    const note = generateDripChartNote(activeDrug, calc, concLabel)
    try {
      await navigator.clipboard.writeText(note)
      setCopied(true)
      triggerHaptic([20, 40, 20])
      setTimeout(() => setCopied(false), 2500)
    } catch {
      triggerHaptic([40, 20, 40])
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* ── Ambient gradient per drug ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDrug.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: s.bgGradient }}
        />
      </AnimatePresence>

      <div className={embedded ? 'relative flex h-full w-full flex-col' : 'relative mx-auto flex h-full w-full max-w-md flex-col lg:max-w-lg'}>
        {!embedded && <AppShellHeader toolId="drips" />}

        <ContentTag id={embedded ? undefined : 'main-content'} tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">
        {/* ── Drug Selector strip ── */}
        <div className="shrink-0 mb-3">
          <DrugSelector drugs={PRESSOR_DRUGS} selected={activeDrug} onSelect={handleDrugChange} />
        </div>

        {/* ── Drug info card ── */}
        <div className="shrink-0 px-4 mb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDrug.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-[1.6rem] border p-4"
              style={{ background: 'rgba(2,6,23,0.82)', borderColor: s.border }}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.accent}60, transparent)` }} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-black text-white leading-tight">{activeDrug.name}</div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">{concLabel}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={effectLabel}
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
                      style={{ background: s.panel, border: `1px solid ${s.border}`, color: s.accent, boxShadow: `0 0 14px rgba(${s.rgb},0.22)` }}
                    >
                      <Zap className="w-2.5 h-2.5" />
                      {effectLabel}
                    </motion.div>
                  </AnimatePresence>
                  <p className="text-[10px] text-slate-400 max-w-[150px] text-right leading-tight">
                    {activeDrug.clinicalNote}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Danger Banner ── */}
        <DangerBanner drug={activeDrug} dose={dose} />

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto pb-8 px-4">

          {/* ── Dial + IV Bag ── */}
          <div className="flex items-start justify-center gap-4 mt-4">
            {/* Radial Dial */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 mb-1.5">Dose Rate</div>
              <RadialDial
                value={dose}
                min={activeDrug.doseRange.min}
                max={activeDrug.doseRange.max}
                step={activeDrug.dialStep}
                glowRgb={SKY_RGB}
                unit={activeDrug.unit}
                onChange={setDose}
              />
              <div className="flex gap-2 mt-2">
                <motion.button
                  whileTap={{ scale: 0.90 }}
                  onClick={() => { setDose(v => Math.max(activeDrug.doseRange.min, parseFloat((v - activeDrug.dialStep).toFixed(4)))); triggerHaptic() }}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border border-white/10 bg-slate-900/60 text-slate-300"
                >
                  −
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.90 }}
                  onClick={() => { setDose(v => Math.min(activeDrug.doseRange.max, parseFloat((v + activeDrug.dialStep).toFixed(4)))); triggerHaptic() }}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border border-white/10 bg-slate-900/60 text-slate-300"
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* IV Bag */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 mb-1.5">IV Pump</div>
              <IVBagAnimation
                mlPerHr={calc.mlPerHr}
                dropsPerSec={calc.dropsPerSec}
                color={activeDrug.color}
                glowRgb={SKY_RGB}
                isActive={dose > activeDrug.doseRange.min || calc.mlPerHr > 0.1}
              />
            </div>
          </div>

          {/* ── Dose Quick Picks ── */}
          <div className="mt-5">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 mb-2">Quick Picks</div>
            <DoseQuickPicks drug={activeDrug} current={dose} s={s} onPick={setDose} />
          </div>

          {/* ── Patient Weight ── */}
          <div className="mt-5">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 mb-2">Patient Weight</div>
            <WeightStepper weight={weightKg} onChange={setWeightKg} s={s} />
          </div>

          {/* ── Result card ── */}
          <div
            className="relative overflow-hidden rounded-[2rem] border mt-5 p-5"
            style={{ background: 'rgba(2,6,23,0.82)', borderColor: s.border, boxShadow: `0 0 40px rgba(${s.rgb},0.08)` }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 80% 0%, rgba(${s.rgb},0.12), transparent 50%)` }} />
            {/* Dose/Weight/Rate readouts — dividers instead of individually
                bordered stat tiles inside the result card (nested-cards). */}
            <div className="relative grid grid-cols-3 divide-x divide-white/10 text-center">
              <div className="px-3">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Dose</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={dose.toFixed(4)}
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-lg font-black text-white mt-1 tabular-nums"
                  >
                    {activeDrug.unit === 'units/min'
                      ? dose.toFixed(3)
                      : dose < 1 ? dose.toFixed(2) : dose.toFixed(1)}
                  </motion.div>
                </AnimatePresence>
                <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{activeDrug.unit}</div>
              </div>
              <div className="px-3">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Weight</div>
                <div className="text-lg font-black text-white mt-1 tabular-nums">{weightKg}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">kg</div>
              </div>
              <div className="px-3">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Rate</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={calc.mlPerHr.toFixed(1)}
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-lg font-black mt-1 tabular-nums"
                    style={{ color: s.accent, textShadow: `0 0 14px rgba(${s.rgb},0.6)` }}
                  >
                    {calc.mlPerHr.toFixed(1)}
                  </motion.div>
                </AnimatePresence>
                <div className="text-[9px] text-slate-400 mt-0.5">mL/hr</div>
              </div>
            </div>
            <div
              className="relative mt-4 rounded-xl px-3 py-2.5 text-center font-mono text-[11px] leading-relaxed"
              style={{ background: 'rgba(2,6,23,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-slate-500">
                ({dose < 0.01 ? dose.toFixed(3) : dose.toFixed(2)} × {weightKg} × 60) ÷ {mcgPerML.toFixed(0)} mcg/mL ={' '}
              </span>
              <span className="font-black" style={{ color: s.accent }}>{calc.mlPerHr.toFixed(1)} mL/hr</span>
            </div>
          </div>

          {/* ── Copy for Chart ── */}
          <motion.button
            id="copy-chart-btn"
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-[1.8rem] border px-5 py-4 text-base font-black"
            style={{
              background: 'linear-gradient(135deg, rgba(125,211,252,0.28), rgba(125,211,252,0.16))',
              borderColor: 'rgba(125,211,252,0.4)',
              color: '#7dd3fc',
              boxShadow: '0 0 30px rgba(125,211,252,0.18)',
            }}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied for Chart' : 'Copy for Chart'}
          </motion.button>

          {/* ── Premium Upsell ── */}
          <div ref={paywallRef} className="relative overflow-hidden rounded-[1.8rem] border border-sky-400/18 bg-sky-500/5 p-5 mt-4">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(125,211,252,0.14), transparent 40%)' }} />
            <div className="relative flex items-center gap-2 text-sky-300 mb-3">
              <Lock size={14} />
              <div className="text-[11px] font-black uppercase tracking-[0.26em]">Shiftside Pro</div>
            </div>
            {/* Locked feature list — plain rows (divider, not per-item mini-cards)
                inside the paywall card (nested-cards). */}
            <div className="relative grid grid-cols-2 gap-x-3 gap-y-2.5 blur-[1.5px] pointer-events-none mb-4">
              {['Custom Concentrations', 'Saved Drug Profiles', 'Titration Log', 'Weight-Based Targets'].map((f) => (
                <div key={f} className="border-l-2 border-sky-300/30 pl-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/70">
                  {f}
                </div>
              ))}
            </div>
            <a
              href={STRIPE_MONTHLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCheckoutStarted('monthly')}
              className="relative flex items-start gap-3 rounded-[1.4rem] border border-sky-300/18 bg-slate-950/75 p-4 no-underline"
            >
              <Lock size={16} className="mt-0.5 shrink-0 text-sky-300" />
              <div>
                <div className="text-sm font-black text-sky-100">Unlock Shiftside Pro</div>
                <p className="mt-1 text-xs leading-relaxed text-sky-50/75">
                  {activeDrug.premiumConcs.length} custom concentrations for {activeDrug.name}, titration history, and saved profiles.
                </p>
              </div>
              <div className="ml-auto shrink-0 rounded-full bg-sky-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950">
                Upgrade
              </div>
            </a>
          </div>

          {/* ── Safety Disclaimer ── */}
          <div className="mt-4 mb-2 rounded-[1.6rem] border border-red-400/16 bg-red-500/5 px-4 py-3">
            <div className="flex items-center gap-2 text-red-300 mb-1.5">
              <BadgeAlert size={14} />
              <span className="font-black uppercase tracking-[0.18em] text-[10px]">Clinical Safety</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Drip calculations support bedside decision-making but do not replace clinical judgment. Verify all doses, concentration, patient weight, and pump settings per institutional protocol before infusion.
            </p>
          </div>
        </div>
        </ContentTag>
      </div>
    </div>
  )
}
