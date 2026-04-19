import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Lock, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import {
  PRESSOR_DRUGS,
  calculateRate,
  getEffectLabel,
  generateDripChartNote,
  type PresssorDrug,
} from '../../lib/dripdrop-calculator'
import { IVBagAnimation } from './IVBagAnimation'
import { RadialDial } from './RadialDial'

// ─── Helpers ────────────────────────────────────────────────────────────────

const WEIGHT_MIN = 30
const WEIGHT_MAX = 200

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}

// ─── Drug Selector strip ─────────────────────────────────────────────────────

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
    <div className="flex gap-2 overflow-x-auto pb-1 px-6 scrollbar-none snap-x snap-mandatory">
      {drugs.map((d) => (
        <button
          id={`drug-${d.id}`}
          key={d.id}
          onClick={() => onSelect(d)}
          className={`shrink-0 px-4 py-2 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 snap-start border ${
            selected.id === d.id
              ? `border-${d.color}-500/60 bg-${d.color}-500/15 text-${d.color}-300`
              : 'border-white/10 text-slate-500 bg-slate-900/40'
          }`}
        >
          {d.shortName}
        </button>
      ))}
    </div>
  )
}

// ─── Weight Stepper ──────────────────────────────────────────────────────────

function WeightStepper({
  weight,
  onChange,
}: {
  weight: number
  onChange: (w: number) => void
}) {
  const step5 = (dir: 1 | -1) => {
    const next = clamp(weight + dir * 5, WEIGHT_MIN, WEIGHT_MAX)
    onChange(next)
    if (navigator.vibrate) navigator.vibrate(10)
  }
  const step1 = (dir: 1 | -1) => {
    const next = clamp(weight + dir * 1, WEIGHT_MIN, WEIGHT_MAX)
    onChange(next)
    if (navigator.vibrate) navigator.vibrate(6)
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => step5(-1)} className="glass border-white/10 px-3 py-2 rounded-xl text-slate-400 font-bold text-sm clickable active:scale-95">−5</button>
      <button onClick={() => step1(-1)} className="glass border-white/10 px-3 py-2 rounded-xl text-slate-400 font-bold text-sm clickable active:scale-95">−1</button>
      <div className="glass border-white/10 px-5 py-2 rounded-xl text-center min-w-[70px]">
        <motion.span
          key={weight}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xl font-black text-white tabular-nums"
        >
          {weight}
        </motion.span>
        <span className="text-slate-500 text-xs font-bold ml-1">kg</span>
      </div>
      <button onClick={() => step1(1)}  className="glass border-white/10 px-3 py-2 rounded-xl text-slate-400 font-bold text-sm clickable active:scale-95">+1</button>
      <button onClick={() => step5(1)}  className="glass border-white/10 px-3 py-2 rounded-xl text-slate-400 font-bold text-sm clickable active:scale-95">+5</button>
    </div>
  )
}

// ─── Danger Banner ────────────────────────────────────────────────────────────

function DangerBanner({ drug, dose }: { drug: PresssorDrug; dose: number }) {
  return (
    <AnimatePresence>
      {dose >= drug.dangerDose && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-6 mt-2 glass border border-red-500/40 bg-red-500/10 rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-300 text-xs font-semibold leading-tight">
            High-dose territory. Verify MAP, reassess fluid status and source control.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DripDrop() {
  const [activeDrug, setActiveDrug] = useState<PresssorDrug>(PRESSOR_DRUGS[0])
  const [dose, setDose] = useState(activeDrug.doseRange.min)
  const [weightKg, setWeightKg] = useState(70)
  const [copied, setCopied] = useState(false)

  // When drug changes, reset dose to its minimum
  const handleDrugChange = (d: PresssorDrug) => {
    setActiveDrug(d)
    setDose(d.doseRange.min)
  }

  const concLabel = activeDrug.standardConc.label
  const mcgPerML = activeDrug.standardConc.mcgPerML

  const calc = useMemo(
    () => calculateRate(dose, weightKg, activeDrug, mcgPerML),
    [dose, weightKg, activeDrug, mcgPerML]
  )

  const effectLabel = useMemo(() => getEffectLabel(activeDrug, dose), [activeDrug, dose])

  const handleCopy = () => {
    const note = generateDripChartNote(activeDrug, calc, concLabel)
    navigator.clipboard.writeText(note)
    setCopied(true)
    if (navigator.vibrate) navigator.vibrate([20, 40, 20])
    setTimeout(() => setCopied(false), 2500)
  }

  const colorBorder: Record<string, string> = {
    amber: 'border-amber-500/30',
    red: 'border-red-500/30',
    violet: 'border-violet-500/30',
    sky: 'border-sky-500/30',
    emerald: 'border-emerald-500/30',
  }

  return (
    <div className="h-screen w-screen flex flex-col pt-12 text-slate-100 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 flex items-center justify-between mb-4 shrink-0">
        <Link
          to="/"
          className="text-slate-400 hover:text-white glass px-4 py-2 rounded-full text-sm font-semibold clickable"
        >
          ← Back
        </Link>
        <h1 className="font-bold text-xl tracking-tight text-white">DripDrop 💧</h1>
        <div className="w-20" />
      </div>

      {/* ── Drug Selector ── */}
      <div className="shrink-0 mb-3">
        <DrugSelector drugs={PRESSOR_DRUGS} selected={activeDrug} onSelect={handleDrugChange} />
      </div>

      {/* ── Drug info card (sticky, non-scrolling) ── */}
      <AnimatePresence mode="wait">
          <motion.div
            key={activeDrug.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={`mx-6 mb-2 glass ${colorBorder[activeDrug.color] ?? ''} rounded-2xl px-4 py-3`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-black text-base text-white leading-tight">{activeDrug.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{concLabel}</div>
              </div>
              <div className="text-right shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={effectLabel}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs font-bold"
                    style={{ color: `rgb(${activeDrug.glowRgb})` }}
                  >
                    {effectLabel}
                  </motion.div>
                </AnimatePresence>
                <div className="text-[10px] text-slate-600 mt-0.5 max-w-[140px] text-right leading-tight">
                  {activeDrug.clinicalNote}
                </div>
              </div>
            </div>
          </motion.div>
      </AnimatePresence>

      {/* Danger banner */}
      <DangerBanner drug={activeDrug} dose={dose} />

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto pb-8">

        {/* ── Main interaction area: dial + bag ── */}
        <div className="flex items-center justify-center gap-6 px-6 mt-4">
          {/* Radial dial */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Dose Rate</div>
            <RadialDial
              value={dose}
              min={activeDrug.doseRange.min}
              max={activeDrug.doseRange.max}
              step={activeDrug.dialStep}
              glowRgb={activeDrug.glowRgb}
              unit={activeDrug.unit}
              onChange={setDose}
            />
            {/* +/- fine tune buttons */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => { const n = Math.max(activeDrug.doseRange.min, parseFloat((dose - activeDrug.dialStep).toFixed(4))); setDose(n); if(navigator.vibrate) navigator.vibrate(8) }}
                className="glass border-white/10 w-10 h-10 rounded-full font-bold text-lg text-slate-400 clickable active:scale-90 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { const n = Math.min(activeDrug.doseRange.max, parseFloat((dose + activeDrug.dialStep).toFixed(4))); setDose(n); if(navigator.vibrate) navigator.vibrate(8) }}
                className="glass border-white/10 w-10 h-10 rounded-full font-bold text-lg text-slate-400 clickable active:scale-90 flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* IV Bag */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">IV Pump</div>
            <IVBagAnimation
              mlPerHr={calc.mlPerHr}
              dropsPerSec={calc.dropsPerSec}
              color={activeDrug.color}
              glowRgb={activeDrug.glowRgb}
              isActive={dose > activeDrug.doseRange.min || calc.mlPerHr > 0.1}
            />
          </div>
        </div>

        {/* ── Weight input ── */}
        <div className="mx-6 mt-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Patient Weight</div>
          <WeightStepper weight={weightKg} onChange={setWeightKg} />
        </div>

        {/* ── Result summary card ── */}
        <div className="mx-6 mt-4 glass border-white/10 rounded-3xl p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">Dose</div>
              <div className="text-lg font-black text-white mt-1 tabular-nums">
                {activeDrug.unit === 'units/min'
                  ? dose.toFixed(3)
                  : dose < 1 ? dose.toFixed(2) : dose.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500">{activeDrug.unit}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">Weight</div>
              <div className="text-lg font-black text-white mt-1 tabular-nums">{weightKg}</div>
              <div className="text-[10px] text-slate-500">kg</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">Rate</div>
              <div
                className="text-lg font-black mt-1 tabular-nums"
                style={{ color: `rgb(${activeDrug.glowRgb})` }}
              >
                {calc.mlPerHr.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500">mL/hr</div>
            </div>
          </div>

          <div className="mt-4 text-center text-[11px] text-slate-600 font-mono leading-relaxed">
            ({dose < 0.01 ? dose.toFixed(3) : dose.toFixed(2)} × {weightKg} kg × 60) ÷ {mcgPerML.toFixed(0)} mcg/mL
          </div>
        </div>

        {/* ── Copy for Chart ── */}
        <div className="mx-6 mt-4">
          <button
            id="copy-chart-btn"
            onClick={handleCopy}
            className="w-full glass bg-green-500/15 border border-green-500/40 text-green-400 p-4 rounded-3xl font-bold text-base clickable flex items-center justify-center gap-2 active:bg-green-500/25 transition-all shadow-[0_0_20px_rgba(34,197,94,0.15)]"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy for Chart'}
          </button>
        </div>

        {/* ── Premium Upsell ── */}
        <div className="mx-6 mt-4 mb-8">
          <button
            id="unlock-premium-btn"
            className="w-full glass border-blue-500/30 bg-blue-500/8 text-blue-400 px-6 py-4 rounded-3xl font-bold text-sm clickable flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Unlock Custom Concentrations &amp; Saved Profiles</span>
            <span className="bg-blue-500 text-slate-900 text-xs px-2 py-0.5 rounded-full font-black ml-auto">
              $4.99/mo
            </span>
          </button>
          <p className="text-center text-slate-700 text-xs mt-2">
            or $29 lifetime · {activeDrug.premiumConcs.length} custom concs for {activeDrug.name}
          </p>
        </div>
      </div>
    </div>
  )
}
