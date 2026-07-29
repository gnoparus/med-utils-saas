import { useDeferredValue, useMemo, useState, useTransition, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Activity,
  BadgeAlert,
  Check,
  ChevronDown,
  Copy,
  FlaskConical,
  Lock,
  Scale,
  Sigma,
  Sparkles,
} from 'lucide-react'
import { AppShellHeader } from '../../components/app-shell'
import { trackToolOpened, trackFirstResultCompleted } from '../../lib/analytics'
import { triggerHaptic } from '../../lib/haptics'
import { Numpad } from '../../components/ui/Numpad'
import { TIPPING_POINT_PRESETS, analyzeAbg, type AbgAnalysis } from '../../lib/tippingpoint-calculator'

type FieldKey = 'pH' | 'pco2' | 'hco3'
type DetailTab = 'read' | 'compensation' | 'chart'

const FIELD_ORDER: FieldKey[] = ['pH', 'pco2', 'hco3']

const ABG_ORANGE = '#FDBA74'
const ABG_ORANGE_RGB = '253,186,116'

const FIELD_META: Record<FieldKey, {
  label: string
  unit: string
  min: number
  max: number
  allowDecimal: boolean
  maxLength: number
  defaultValue: string
  accent: string
  accentBg: string
}> = {
  pH: {
    label: 'pH',
    unit: '',
    min: 6.8,
    max: 7.8,
    allowDecimal: true,
    maxLength: 4,
    defaultValue: '7.40',
    accent: ABG_ORANGE,
    accentBg: `rgba(${ABG_ORANGE_RGB},0.14)`,
  },
  pco2: {
    label: 'PaCO2',
    unit: 'mmHg',
    min: 10,
    max: 120,
    allowDecimal: false,
    maxLength: 3,
    defaultValue: '40',
    accent: ABG_ORANGE,
    accentBg: `rgba(${ABG_ORANGE_RGB},0.20)`,
  },
  hco3: {
    label: 'HCO3',
    unit: 'mEq/L',
    min: 4,
    max: 50,
    allowDecimal: false,
    maxLength: 2,
    defaultValue: '24',
    accent: ABG_ORANGE,
    accentBg: `rgba(${ABG_ORANGE_RGB},0.26)`,
  },
}

const GLOW_STYLES = {
  green: {
    accent: '#10b981',
    rgb: '16,185,129',
    panel: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.28)',
  },
  red: {
    accent: '#fb7185',
    rgb: '251,113,133',
    panel: 'rgba(251,113,133,0.12)',
    border: 'rgba(251,113,133,0.28)',
  },
  cyan: {
    accent: '#22d3ee',
    rgb: '34,211,238',
    panel: 'rgba(34,211,238,0.12)',
    border: 'rgba(34,211,238,0.28)',
  },
  amber: {
    accent: '#f59e0b',
    rgb: '245,158,11',
    panel: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.28)',
  },
} as const


function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parseFieldValue(key: FieldKey, raw: string) {
  const meta = FIELD_META[key]
  const parsed = Number.parseFloat(raw)

  if (Number.isNaN(parsed)) {
    return Number.parseFloat(meta.defaultValue)
  }

  return clamp(parsed, meta.min, meta.max)
}

function appendToField(raw: string, key: string, field: FieldKey) {
  const meta = FIELD_META[field]

  if (key === '.') {
    if (!meta.allowDecimal || raw.includes('.')) return raw
    if (raw.length >= meta.maxLength) return raw
    return raw.length === 0 ? '0.' : `${raw}.`
  }

  if (!/^\d$/.test(key)) return raw

  const next = raw === '0' ? key : `${raw}${key}`

  if (next.length > meta.maxLength) return raw

  if (meta.allowDecimal && next.includes('.')) {
    const [, decimals = ''] = next.split('.')
    if (decimals.length > 2) return raw
  }

  return next
}

function getFieldDirectionLabel(analysis: AbgAnalysis, key: FieldKey) {
  if (key === 'pH') {
    if (analysis.acidBaseState === 'acidemia') return 'Acidic'
    if (analysis.acidBaseState === 'alkalemia') return 'Alkaline'
    return 'Balanced'
  }

  const direction = key === 'pco2' ? analysis.respiratoryStatus.direction : analysis.metabolicStatus.direction

  if (direction === 'acid') return 'Acid pull'
  if (direction === 'alkaline') return 'Alk pull'
  return 'Set point'
}

function formatMeasuredValue(key: FieldKey, value: number) {
  if (key === 'pH') return value.toFixed(2)
  return value.toFixed(0)
}

function BalanceScale({ analysis }: { analysis: AbgAnalysis }) {
  const glow = GLOW_STYLES[analysis.glowState]
  const reduceMotion = useReducedMotion()
  const acidDrivers = [
    analysis.metabolicStatus.direction === 'acid' ? `HCO3 ${analysis.input.hco3.toFixed(0)}` : null,
    analysis.respiratoryStatus.direction === 'acid' ? `PaCO2 ${analysis.input.pco2.toFixed(0)}` : null,
  ].filter(Boolean)

  const alkDrivers = [
    analysis.metabolicStatus.direction === 'alkaline' ? `HCO3 ${analysis.input.hco3.toFixed(0)}` : null,
    analysis.respiratoryStatus.direction === 'alkaline' ? `PaCO2 ${analysis.input.pco2.toFixed(0)}` : null,
  ].filter(Boolean)

  return (
    <div className="relative overflow-hidden rounded-[2rem] border p-5" style={{ background: 'rgba(2,6,23,0.82)', borderColor: glow.border }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 18% 18%, rgba(251,113,133,0.2), transparent 34%),
            radial-gradient(circle at 82% 20%, rgba(34,211,238,0.18), transparent 34%),
            radial-gradient(circle at 50% 100%, rgba(${glow.rgb},0.2), transparent 42%)
          `,
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="max-w-[70%]">
          <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-500">Visual Balance</div>
          <div className="mt-1 text-xl font-black tracking-tight text-white">{analysis.title}</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{analysis.subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <motion.div
            key={`${analysis.title}-${analysis.compensation.kind}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]"
            style={{
              background: glow.panel,
              border: `1px solid ${glow.border}`,
              color: glow.accent,
              boxShadow: `0 0 22px rgba(${glow.rgb},0.22)`,
            }}
          >
            {analysis.compensation.kind === 'appropriate' || analysis.compensation.kind === 'acute' || analysis.compensation.kind === 'chronic'
              ? 'Locked In'
              : analysis.compensation.kind === 'mixed'
                ? 'Mixed Alert'
                : 'Recheck'}
          </motion.div>
          <div className="rounded-2xl border border-white/8 bg-slate-950/80 px-3 py-2 text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Net</div>
            <div className="mt-1 text-2xl font-black tabular-nums" style={{ color: glow.accent }}>
              {analysis.netImbalance > 0 ? '+' : ''}
              {analysis.netImbalance.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 h-[15rem] sm:h-[17rem]">
        <div className="absolute inset-x-0 top-0 h-full rounded-[1.7rem] bg-[linear-gradient(90deg,rgba(251,113,133,0.08),transparent_36%,transparent_64%,rgba(34,211,238,0.08))]" />
        <div className="absolute left-1/2 top-4 h-28 w-[2px] -translate-x-1/2 rounded-full bg-slate-700/80" />
        <div className="absolute left-1/2 top-28 h-20 w-28 -translate-x-1/2 rounded-t-[999px] border border-white/8 bg-slate-900/75 shadow-[0_20px_50px_rgba(2,6,23,0.5)]" />

        <motion.div
          className="absolute left-1/2 top-14 h-2 -translate-x-1/2 rounded-full"
          animate={{ rotate: analysis.scaleAngle }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          style={{
            width: 'min(16.75rem, calc(100% - 2.75rem))',
            transformOrigin: '50% 50%',
            background: 'linear-gradient(90deg, rgba(251,113,133,0.7), rgba(226,232,240,0.55), rgba(34,211,238,0.72))',
            boxShadow: '0 0 24px rgba(148,163,184,0.22)',
          }}
        >
          <div className="absolute left-0 top-1/2">
            <div className="absolute left-1/2 top-0 h-12 w-px -translate-x-1/2 bg-slate-500/80" />
            <motion.div
              animate={{ rotate: -analysis.scaleAngle }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              className="absolute left-1/2 top-12 flex w-28 -translate-x-1/2 flex-col items-center gap-2"
            >
              <div className="rounded-full border border-rose-400/30 bg-rose-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-300">
                Acidosis
              </div>
              <div className="min-h-20 w-full rounded-[1.7rem] border border-rose-400/18 bg-slate-950/85 px-3 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.35)]">
                <div className="space-y-2">
                  {acidDrivers.length > 0 ? acidDrivers.map((driver) => (
                    <div key={driver} className="rounded-2xl border border-rose-400/18 bg-rose-500/10 px-2.5 py-1.5 text-center text-[10px] font-bold tracking-wide text-rose-200">
                      {driver}
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-2.5 py-2 text-center text-[10px] font-semibold text-slate-500">
                      No major acid driver
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute right-0 top-1/2">
            <div className="absolute left-1/2 top-0 h-12 w-px -translate-x-1/2 bg-slate-500/80" />
            <motion.div
              animate={{ rotate: -analysis.scaleAngle }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              className="absolute left-1/2 top-12 flex w-28 -translate-x-1/2 flex-col items-center gap-2"
            >
              <div className="rounded-full border border-cyan-400/30 bg-cyan-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Alkalosis
              </div>
              <div className="min-h-20 w-full rounded-[1.7rem] border border-cyan-400/18 bg-slate-950/85 px-3 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.35)]">
                <div className="space-y-2">
                  {alkDrivers.length > 0 ? alkDrivers.map((driver) => (
                    <div key={driver} className="rounded-2xl border border-cyan-400/18 bg-cyan-500/10 px-2.5 py-1.5 text-center text-[10px] font-bold tracking-wide text-cyan-200">
                      {driver}
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-2.5 py-2 text-center text-[10px] font-semibold text-slate-500">
                      No major alk driver
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-8 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border"
          animate={
            reduceMotion
              ? { scale: 1 }
              : { scale: analysis.compensation.kind === 'mixed' ? [1, 1.05, 1] : [1, 1.1, 1] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{
            background: glow.panel,
            borderColor: glow.border,
            boxShadow: `0 0 30px rgba(${glow.rgb},0.28)`,
          }}
        >
          <Scale size={22} style={{ color: glow.accent }} />
        </motion.div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Read</div>
          <div className="mt-1 text-sm font-black text-white">{analysis.summary}</div>
        </div>
        <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Compensation</div>
          <div className="mt-1 text-sm font-black text-white">{analysis.compensation.label}</div>
          <div className="mt-1 text-xs text-slate-500">{analysis.compensation.formula}</div>
        </div>
      </div>
    </div>
  )
}

function LabStrip({
  analysis,
  fieldValues,
  activeField,
  onSelect,
}: {
  analysis: AbgAnalysis
  fieldValues: Record<FieldKey, string>
  activeField: FieldKey
  onSelect: (field: FieldKey) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {FIELD_ORDER.map((field) => {
        const meta = FIELD_META[field]
        const active = field === activeField

        return (
          <motion.button
            key={field}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onSelect(field)
              triggerHaptic(8)
            }}
            className="relative overflow-hidden rounded-[1.45rem] border px-3 py-3 text-left"
            style={{
              background: active ? meta.accentBg : 'rgba(15,23,42,0.72)',
              borderColor: active ? `${meta.accent}66` : 'rgba(255,255,255,0.08)',
              boxShadow: active ? `0 0 18px ${meta.accent}22` : 'none',
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: active ? `linear-gradient(90deg, transparent, ${meta.accent}, transparent)` : 'transparent' }}
            />
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{meta.label}</div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <div className="text-2xl font-black tabular-nums text-white">{fieldValues[field]}</div>
              {meta.unit && <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">{meta.unit}</span>}
            </div>
            <div className="mt-2 inline-flex rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              {getFieldDirectionLabel(analysis, field)}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em]"
      style={{
        background: active ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)',
        borderColor: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
        color: active ? '#f8fafc' : '#94a3b8',
      }}
    >
      {label}
    </motion.button>
  )
}

function DetailPanel({
  activeTab,
  analysis,
  copied,
  compensationHasRange,
  glow,
  onCopy,
}: {
  activeTab: DetailTab
  analysis: AbgAnalysis
  copied: boolean
  compensationHasRange: boolean
  glow: (typeof GLOW_STYLES)[keyof typeof GLOW_STYLES]
  onCopy: () => void
}) {
  if (activeTab === 'read') {
    return (
      <div className="glass rounded-[1.8rem] border-white/8 p-4">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-100">
            <Activity size={18} className="text-orange-300" />
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Interpretation</div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{analysis.summary}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {FIELD_ORDER.map((field) => (
            <div key={field} className="rounded-2xl border border-white/8 bg-slate-950/80 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{FIELD_META[field].label}</div>
              <div className="mt-1 text-lg font-black tabular-nums text-white">
                {formatMeasuredValue(field, analysis.input[field])}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeTab === 'compensation') {
    return (
      <div className="glass rounded-[1.8rem] border-white/8 p-4">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-100">
            <FlaskConical size={18} className="text-orange-300" />
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Compensation</div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-black text-white">{analysis.compensation.label}</div>
            <div className="mt-1 text-sm text-slate-400">{analysis.compensation.note}</div>
          </div>
          <div
            className="shrink-0 rounded-2xl px-3 py-2 text-right"
            style={{ background: glow.panel, border: `1px solid ${glow.border}` }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Formula</div>
            <div className="mt-1 text-sm font-black" style={{ color: glow.accent }}>
              {analysis.compensation.formula}
            </div>
          </div>
        </div>

        {compensationHasRange ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/8 bg-slate-950/80 px-3 py-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Expected</div>
              <div className="mt-1 text-xl font-black tabular-nums text-white">
                {analysis.compensation.expectedLow.toFixed(1)}-{analysis.compensation.expectedHigh.toFixed(1)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/80 px-3 py-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Measured</div>
              <div className="mt-1 text-xl font-black tabular-nums text-white">
                {analysis.compensation.measured.toFixed(1)}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-amber-400/18 bg-amber-500/10 px-3 py-3 text-sm leading-relaxed text-amber-100">
            Pattern-based alert instead of a compensation range. Reconcile clinically and pair with serum chemistries if the story is complex.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="glass rounded-[1.8rem] border-white/8 p-4">
      <div className="flex items-center gap-2 text-slate-300">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-100">
          <Sparkles size={18} className="text-orange-300" />
        </div>
        <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Chart Note</div>
      </div>
      <p className="mt-4 rounded-[1.5rem] border border-white/8 bg-slate-950/80 p-4 text-sm leading-relaxed text-slate-300">
        {analysis.chartNote}
      </p>
      <button
        id="copy-abg-note"
        onClick={onCopy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[1.8rem] border px-5 py-4 text-base font-black transition-all active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, rgba(253,186,116,0.28), rgba(253,186,116,0.16))',
          borderColor: 'rgba(253,186,116,0.4)',
          color: '#fdba74',
          boxShadow: '0 0 30px rgba(253,186,116,0.18)',
        }}
      >
        {copied ? <Check size={20} /> : <Copy size={20} />}
        {copied ? 'Copied for Chart' : 'Copy for Chart'}
      </button>
    </div>
  )
}

export default function TippingPoint({ embedded }: { embedded?: boolean } = {}) {
  const ContentTag = embedded ? 'div' : 'main'
  const [fieldValues, setFieldValues] = useState<Record<FieldKey, string>>({
    pH: FIELD_META.pH.defaultValue,
    pco2: FIELD_META.pco2.defaultValue,
    hco3: FIELD_META.hco3.defaultValue,
  })
  const [activeField, setActiveField] = useState<FieldKey>('pH')
  const [activeTab, setActiveTab] = useState<DetailTab>('read')
  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const firstResultFired = useRef(false)

  useEffect(() => { trackToolOpened('abg') }, [])

  useEffect(() => {
    if (!firstResultFired.current) {
      firstResultFired.current = true
      trackFirstResultCompleted('abg')
    }
  }, [fieldValues])

  const parsedInput = useMemo(() => ({
    pH: parseFieldValue('pH', fieldValues.pH),
    pco2: parseFieldValue('pco2', fieldValues.pco2),
    hco3: parseFieldValue('hco3', fieldValues.hco3),
  }), [fieldValues])

  const deferredInput = useDeferredValue(parsedInput)
  const analysis = useMemo(() => analyzeAbg(deferredInput), [deferredInput])
  const activeIndex = FIELD_ORDER.indexOf(activeField)
  const nextField = FIELD_ORDER[(activeIndex + 1) % FIELD_ORDER.length]

  const handleKeyPress = (key: string) => {
    setFieldValues((current) => ({
      ...current,
      [activeField]: appendToField(current[activeField], key, activeField),
    }))
  }

  const handleBackspace = () => {
    setFieldValues((current) => {
      const raw = current[activeField]
      const next = raw.length > 1 ? raw.slice(0, -1) : '0'

      return {
        ...current,
        [activeField]: next,
      }
    })
  }

  const handleNext = () => {
    setActiveField(nextField)
    setSheetExpanded(true)
    triggerHaptic([8, 20, 8])
  }

  const handlePreset = (preset: (typeof TIPPING_POINT_PRESETS)[number]) => {
    startTransition(() => {
      setFieldValues({
        pH: preset.values.pH.toFixed(2),
        pco2: String(preset.values.pco2),
        hco3: String(preset.values.hco3),
      })
      setActiveField('pH')
      setActiveTab('read')
    })
    triggerHaptic([10, 30, 10])
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.chartNote)
      setCopied(true)
      triggerHaptic([20, 40, 20])
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      triggerHaptic([40, 20, 40])
    }
  }

  const compensationHasRange = analysis.compensation.expectedLow !== 0 || analysis.compensation.expectedHigh !== 0
  const glow = GLOW_STYLES[analysis.glowState]

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 12% 8%, rgba(253,186,116,0.12), transparent 28%),
            radial-gradient(circle at 88% 12%, rgba(253,186,116,0.09), transparent 28%),
            radial-gradient(circle at 50% 100%, rgba(253,186,116,0.10), transparent 40%)
          `,
        }}
      />

      <div className={embedded ? 'relative flex h-full w-full flex-col' : 'relative mx-auto flex h-full w-full max-w-md flex-col lg:max-w-lg'}>
        {!embedded && <AppShellHeader toolId="abg" />}

        <ContentTag id={embedded ? undefined : 'main-content'} tabIndex={-1} className="flex-1 overflow-y-auto px-4 pb-8 outline-none">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TIPPING_POINT_PRESETS.map((preset) => (
              <motion.button
                key={preset.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => handlePreset(preset)}
                className="shrink-0 rounded-full border border-white/8 bg-white/[0.03] px-3.5 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-300"
              >
                {preset.label}
              </motion.button>
            ))}
          </div>

          <div className="mt-3">
            <BalanceScale analysis={analysis} />
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">ABG Inputs</div>
              <button
                onClick={() => setSheetExpanded((current) => !current)}
                className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
              >
                {sheetExpanded ? 'Hide keypad' : 'Edit values'}
              </button>
            </div>
            <LabStrip
              analysis={analysis}
              fieldValues={fieldValues}
              activeField={activeField}
              onSelect={(field) => {
                setActiveField(field)
                setSheetExpanded(true)
              }}
            />
          </div>

          <div className="mt-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              <TabButton active={activeTab === 'read'} label="Read" onClick={() => setActiveTab('read')} />
              <TabButton active={activeTab === 'compensation'} label="Compensation" onClick={() => setActiveTab('compensation')} />
              <TabButton active={activeTab === 'chart'} label="Chart Note" onClick={() => setActiveTab('chart')} />
            </div>

            <DetailPanel
              activeTab={activeTab}
              analysis={analysis}
              copied={copied}
              compensationHasRange={compensationHasRange}
              glow={glow}
              onCopy={handleCopy}
            />
          </div>

          <div className="mt-4 grid gap-3">
            <div className="relative overflow-hidden rounded-[1.8rem] border border-amber-400/20 bg-amber-500/[0.06] p-4">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_30%)]" />
              <div className="relative flex items-center gap-2 text-amber-300">
                <Sigma size={18} />
                <div className="text-[11px] font-black uppercase tracking-[0.24em]">Triple Dagger</div>
              </div>
              <div className="relative mt-3 grid grid-cols-3 gap-2 blur-[1.6px]">
                {[
                  { label: 'Anion Gap', value: '24' },
                  { label: 'Delta-Delta', value: '37' },
                  { label: 'Osm Gap', value: '18' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-amber-300/14 bg-slate-950/75 px-3 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/70">{item.label}</div>
                    <div className="mt-1 text-xl font-black text-amber-100/80">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="relative mt-4 flex items-start gap-3 rounded-[1.4rem] border border-amber-300/16 bg-slate-950/75 p-4">
                <Lock size={18} className="mt-0.5 shrink-0 text-amber-300" />
                <div>
                  <div className="text-sm font-black text-amber-100">Unlock Shiftside Pro</div>
                  <p className="mt-1 text-sm leading-relaxed text-amber-50/80">
                    Add anion gap, delta gap, corrected bicarbonate, osmolar gap inputs, and the full mixed-disorder layer.
                  </p>
                </div>
                <div className="ml-auto rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950">
                  Full toolkit
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-red-400/18 bg-red-500/[0.05] px-4 py-3 text-sm leading-relaxed text-slate-300">
              <div className="flex items-center gap-2 text-red-300">
                <BadgeAlert size={16} />
                <span className="font-black uppercase tracking-[0.18em] text-[11px]">Clinical Safety</span>
              </div>
              <p className="mt-2">
                Acid-base tools support interpretation but do not replace the bedside picture. Check electrolytes, lactate, renal function, and ventilation settings when the pattern looks mixed or the patient looks worse than the gas.
              </p>
            </div>
          </div>
        </ContentTag>

        <div className="shrink-0 border-t border-white/6 bg-slate-950/90 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur-xl">
          <button
            onClick={() => setSheetExpanded((current) => !current)}
            className="w-full rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Input Deck</div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
                    style={{
                      background: FIELD_META[activeField].accentBg,
                      color: FIELD_META[activeField].accent,
                      border: `1px solid ${FIELD_META[activeField].accent}44`,
                    }}
                  >
                    Editing {FIELD_META[activeField].label}
                  </span>
                  <AnimatePresence mode="wait">
                    {isPending && (
                      <motion.span
                        key="updating"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500"
                      >
                        Updating analysis…
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Live</div>
                  <div className="mt-1 text-2xl font-black tabular-nums text-white">
                    {fieldValues[activeField]}
                  </div>
                </div>
                <motion.div animate={{ rotate: sheetExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={18} className="text-slate-500" />
                </motion.div>
              </div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {sheetExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  <Numpad
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onNext={handleNext}
                    nextLabel={`Next · ${FIELD_META[nextField].label}`}
                    accentClassName="bg-orange-500/10 border-orange-500/30 text-orange-400 active:bg-orange-500/20"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
