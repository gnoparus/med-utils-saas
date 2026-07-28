import { useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import {
  AlertTriangle,
  BadgeAlert,
  Check,
  ChevronDown,
  Copy,
  Delete,
  Droplets,
  Lock,
  Pill,
  Zap,
} from 'lucide-react'
import { AppShellHeader } from '../../components/app-shell'
import { trackToolOpened, trackFirstResultCompleted, trackPaywallViewed, trackCheckoutStarted } from '../../lib/analytics'
import { STRIPE_MONTHLY_URL } from '../../lib/billing'
import {
  GLOW_COLORS,
  LYTE_PRESETS,
  LYTES,
  analyzeLyte,
  getLyteMeta,
  type ElectrolyteId,
  type ElectrolyteAnalysis,
  type ElectrolyteMeta,
  type GlowState,
  type RepleteOption,
} from '../../lib/lytesout-calculator'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }

function appendValue(raw: string, key: string, meta: ElectrolyteMeta): string {
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
    if (decimals.length > 1) return raw
  }
  return next
}

function parseValue(raw: string, meta: ElectrolyteMeta): number {
  const v = parseFloat(raw)
  return Number.isNaN(v) ? meta.defaultValue : clamp(v, meta.inputMin, meta.inputMax)
}

// ─── Severity gauge ───────────────────────────────────────────────────────────

function SeverityGauge({
  meta,
  value,
  glowState,
}: {
  meta: ElectrolyteMeta
  value: number
  glowState: GlowState
}) {
  const glow = GLOW_COLORS[glowState]
  const range = meta.inputMax - meta.inputMin
  const pct = clamp(((value - meta.inputMin) / range) * 100, 0, 100)
  const normalLowPct = ((meta.normalLow - meta.inputMin) / range) * 100
  const normalHighPct = ((meta.normalHigh - meta.inputMin) / range) * 100

  const springPct = useSpring(pct, { stiffness: 200, damping: 22 })
  const cursorLeft = useTransform(springPct, v => `calc(${v}% - 10px)`)
  const fillWidth = useTransform(springPct, v => `${v}%`)

  useEffect(() => { springPct.set(pct) }, [pct, springPct])

  return (
    <div className="px-1">
      {/* Bar */}
      <div className="relative h-2.5 rounded-full bg-slate-800/80 overflow-visible mb-4">
        {/* Normal zone highlight */}
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${normalLowPct}%`,
            width: `${normalHighPct - normalLowPct}%`,
            background: 'rgba(16,185,129,0.35)',
          }}
        />
        {/* Animated fill */}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: fillWidth,
            background: `linear-gradient(to right, rgba(${glow.rgb},0.3), rgba(${glow.rgb},0.85))`,
          }}
        />
        {/* Cursor */}
        <motion.div
          className="absolute top-1/2 w-5 h-5 rounded-full border-2 border-white/90 -translate-y-1/2 shadow-lg pointer-events-none"
          style={{
            left: cursorLeft,
            background: glow.accent,
            boxShadow: `0 0 10px rgba(${glow.rgb},0.7)`,
          }}
        />
      </div>
      {/* Range labels */}
      <div className="flex justify-between text-[10px] font-bold tabular-nums mt-1">
        <span className="text-slate-600">{meta.inputMin}</span>
        <span style={{ color: '#10b981' }}>
          Normal: {meta.normalLow}–{meta.normalHigh} {meta.unit}
        </span>
        <span className="text-slate-600">{meta.inputMax}</span>
      </div>
    </div>
  )
}

// ─── Repletion card ───────────────────────────────────────────────────────────

function RepleteCard({
  opt,
  index,
  meta,
}: {
  opt: RepleteOption
  index: number
  meta: ElectrolyteMeta
}) {
  const isNoAction = opt.id.endsWith('-normal')
  const iconEl = opt.routeIcon === 'pill' ? <Pill size={15} /> : opt.routeIcon === 'bolt' ? <Zap size={15} /> : <Droplets size={15} />

  const bg = opt.isUrgent
    ? 'rgba(251,113,133,0.08)'
    : isNoAction
    ? 'rgba(16,185,129,0.06)'
    : meta.accentBg
  const borderColor = opt.isUrgent
    ? 'rgba(251,113,133,0.3)'
    : isNoAction
    ? 'rgba(16,185,129,0.25)'
    : meta.accentBorder
  const iconColor = opt.isUrgent ? '#fb7185' : isNoAction ? '#10b981' : meta.accentColor

  return (
    <motion.div
      key={opt.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
      className="relative overflow-hidden rounded-3xl border"
      style={{ background: bg, borderColor }}
    >
      {/* Urgent pulse ring */}
      {opt.isUrgent && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ border: '2px solid rgba(251,113,133,0.45)' }}
          animate={{ opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Pro lock overlay */}
      {opt.locked && (
        <div className="absolute inset-0 rounded-3xl z-20 backdrop-blur-sm bg-slate-950/65 flex flex-col items-center justify-center gap-2">
          <Lock size={18} className="text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pro Only</span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${iconColor}20`, color: iconColor }}
          >
            {iconEl}
          </div>
          <span className="font-black text-sm text-slate-100 leading-tight">{opt.routeLabel}</span>
          {opt.isUrgent && (
            <span className="ml-auto shrink-0 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
              Urgent
            </span>
          )}
        </div>

        {/* Product label */}
        {opt.product !== '—' && (
          <div
            className="font-mono text-xs font-bold px-3 py-2 rounded-xl mb-4 leading-snug"
            style={{ background: `${iconColor}14`, color: iconColor }}
          >
            {opt.product}
          </div>
        )}

        {/* Dose + Rate chips */}
        {opt.dose !== '—' && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-2xl border border-white/8 bg-slate-950/60 px-3 py-2.5">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Dose</div>
              <div className="text-xs font-black text-white leading-snug">{opt.dose}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/60 px-3 py-2.5">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Rate</div>
              <div className="text-xs font-black text-white leading-snug">{opt.rate}</div>
            </div>
          </div>
        )}

        {/* Clinical notes */}
        {opt.notes.length > 0 && (
          <div className="space-y-2">
            {opt.notes.map((note, i) => (
              <div key={i} className="flex gap-2 text-[11px] text-slate-400 leading-snug">
                <span className="text-slate-600 shrink-0 mt-0.5">•</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accent bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${iconColor}60, transparent)` }}
      />
    </motion.div>
  )
}

// ─── Urgency badge ────────────────────────────────────────────────────────────

function UrgencyBadge({ label, glowState }: { label: string; glowState: GlowState }) {
  const glow = GLOW_COLORS[glowState]
  const isNormal = label === 'Normal'

  return (
    <motion.div
      key={label}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.28em]"
      style={{
        background: glow.panel,
        border: `1px solid ${glow.border}`,
        color: isNormal ? '#10b981' : glow.accent,
        boxShadow: `0 0 18px rgba(${glow.rgb},0.2)`,
      }}
    >
      {label}
    </motion.div>
  )
}

// ─── Warning banner ───────────────────────────────────────────────────────────

function WarningBanner({ text, index }: { text: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/8 px-4 py-3"
    >
      <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
      <p className="text-xs font-semibold text-amber-200/80 leading-snug">{text}</p>
    </motion.div>
  )
}

// ─── Animated value display ───────────────────────────────────────────────────

function AnimatedValue({ value, meta }: { value: number; meta: ElectrolyteMeta }) {
  const spring = useSpring(value, { stiffness: 200, damping: 20 })
  const display = useTransform(spring, v =>
    meta.allowDecimal ? v.toFixed(1) : Math.round(v).toString()
  )
  useEffect(() => { spring.set(value) }, [value, spring])

  return (
    <motion.span className="text-4xl font-black tabular-nums text-white leading-none">
      {display}
    </motion.span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LytesOut() {
  const [activeId, setActiveId] = useState<ElectrolyteId>('k')
  const [rawInputs, setRawInputs] = useState<Record<ElectrolyteId, string>>({

    k: '3.0', mg: '1.4', po4: '1.8', ca: '7.8', na: '128',
  })
  const [numpadOpen, setNumpadOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const paywallRef = useRef<HTMLDivElement>(null)
  const firstResultFired = useRef(false)

  const meta = getLyteMeta(activeId)
  const rawValue = rawInputs[activeId]
  const parsedValue = useMemo(() => parseValue(rawValue, meta), [rawValue, meta])
  const analysis: ElectrolyteAnalysis = useMemo(() => analyzeLyte(activeId, parsedValue), [activeId, parsedValue])
  const glow = GLOW_COLORS[analysis.glowState]

  useEffect(() => { trackToolOpened('lytes') }, [])

  useEffect(() => {
    if (!firstResultFired.current) {
      firstResultFired.current = true
      trackFirstResultCompleted('lytes')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedValue])

  useEffect(() => {
    const el = paywallRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackPaywallViewed('lytes', 'weight_based_dosing')
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleKey = (key: string) => {
    triggerHaptic(8)
    setRawInputs(prev => ({
      ...prev,
      [activeId]: appendValue(prev[activeId], key, meta),
    }))
  }

  const handleBackspace = () => {
    triggerHaptic(8)
    setRawInputs(prev => {
      const raw = prev[activeId]
      return { ...prev, [activeId]: raw.length > 1 ? raw.slice(0, -1) : '0' }
    })
  }

  const handlePreset = (value: number) => {
    triggerHaptic([8, 16, 8])
    const str = meta.allowDecimal ? value.toFixed(1) : String(value)
    setRawInputs(prev => ({ ...prev, [activeId]: str }))
  }

  const handleLyteChange = (id: ElectrolyteId) => {
    triggerHaptic(12)
    setActiveId(id)
    setNumpadOpen(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.chartNote)
      setCopied(true)
      triggerHaptic([20, 40, 20])
      setTimeout(() => setCopied(false), 2400)
    } catch {
      triggerHaptic([40, 20, 40])
    }
  }

  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0']
  const isNormal = analysis.tier === 'normal'

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Ambient glow — dual layer: electrolyte accent + severity glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeId}-${analysis.glowState}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 15% 5%, rgba(${meta.accentRgb},0.14), transparent 30%),
              radial-gradient(circle at 85% 8%, rgba(${glow.rgb},0.12), transparent 30%),
              radial-gradient(circle at 50% 100%, rgba(${meta.accentRgb},0.08), transparent 42%)
            `,
          }}
        />
      </AnimatePresence>

      <div className="relative flex h-full flex-col">
        <AppShellHeader toolId="lytes" />

        <div id="main-content" tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">
        {/* ── Electrolyte tab strip ── */}
        <div className="shrink-0 px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LYTES.map(lyte => (
              <motion.button
                key={lyte.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleLyteChange(lyte.id)}
                className="shrink-0 px-5 py-2.5 rounded-2xl text-sm font-black tracking-wide transition-all duration-200 border"
                style={
                  activeId === lyte.id
                    ? {
                        background: lyte.accentBg,
                        borderColor: `${lyte.accentColor}66`,
                        color: lyte.accentColor,
                        boxShadow: `0 0 18px rgba(${lyte.accentRgb},0.22)`,
                      }
                    : {
                        background: 'rgba(15,23,42,0.6)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        color: '#64748b',
                      }
                }
              >
                {lyte.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Quick presets */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {LYTE_PRESETS[activeId].map(p => (
              <motion.button
                key={p.label}
                whileTap={{ scale: 0.94 }}
                onClick={() => handlePreset(p.value)}
                className="shrink-0 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-400"
              >
                {p.label}
              </motion.button>
            ))}
          </div>

          {/* ── Severity panel ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeId}-${analysis.tier}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="relative overflow-hidden rounded-4xl border p-5 mb-4"
              style={{ background: 'rgba(2,6,23,0.85)', borderColor: glow.border }}
            >
              {/* Inner glow */}
              <div
                className="absolute inset-0 pointer-events-none rounded-4xl"
                style={{
                  background: `radial-gradient(circle at 80% 0%, rgba(${glow.rgb},0.18), transparent 50%)`,
                }}
              />

              <div className="relative flex items-start justify-between gap-3 mb-5">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-500 mb-1">
                    {meta.fullName}
                  </div>
                  <div className="text-xl font-black tracking-tight text-white leading-tight">
                    {analysis.severityLabel}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                    {analysis.severityNote}
                  </p>
                </div>
                <UrgencyBadge label={analysis.urgencyLabel} glowState={analysis.glowState} />
              </div>

              <SeverityGauge meta={meta} value={parsedValue} glowState={analysis.glowState} />

              {analysis.deficitNote && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-2.5 text-center"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Deficit Estimate
                  </span>
                  <p className="mt-0.5 text-sm font-black text-slate-200">{analysis.deficitNote}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Repletion options ── */}
          {!isNormal && (
            <div className="mb-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 mb-3">
                Repletion Protocol
              </div>
              <div className="space-y-3">
                <AnimatePresence mode="sync">
                  {analysis.options.map((opt, i) => (
                    <RepleteCard key={`${activeId}-${opt.id}`} opt={opt} index={i} meta={meta} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {isNormal && (
            <div className="space-y-3 mb-4">
              {analysis.options.map((opt, i) => (
                <RepleteCard key={`${activeId}-${opt.id}`} opt={opt} index={i} meta={meta} />
              ))}
            </div>
          )}

          {/* ── Warnings ── */}
          {analysis.warnings.length > 0 && (
            <div className="mt-4 mb-4 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 mb-3">
                Clinical Alerts
              </div>
              {analysis.warnings.map((w, i) => (
                <WarningBanner key={i} text={w} index={i} />
              ))}
            </div>
          )}

          {/* ── Copy chart note ── */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2.5 rounded-[1.8rem] border px-5 py-4 text-sm font-black transition-all active:scale-[0.98] mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(52,211,153,0.14))',
              borderColor: 'rgba(16,185,129,0.34)',
              color: '#6ee7b7',
              boxShadow: '0 0 28px rgba(16,185,129,0.14)',
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied for Chart' : 'Copy Chart Note'}
          </button>

          {/* ── Pro upsell ── */}
          <div ref={paywallRef} className="relative overflow-hidden rounded-[1.8rem] border border-yellow-400/18 bg-yellow-500/5 p-5 mb-4">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at top right, rgba(234,179,8,0.14), transparent 40%)',
              }}
            />
            <div className="relative flex items-center gap-2 text-yellow-300 mb-3">
              <Zap size={16} />
              <div className="text-[11px] font-black uppercase tracking-[0.26em]">Shiftside Pro</div>
            </div>
            <div className="relative grid grid-cols-2 gap-2 blur-[1.5px] pointer-events-none mb-4">
              {['Weight-Based Dosing', 'Anion Gap & ΔΔ', 'Refeeding Protocol', 'Corrected Ca'].map(f => (
                <div key={f} className="rounded-2xl border border-yellow-300/14 bg-slate-950/70 px-3 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-200/70">{f}</div>
                </div>
              ))}
            </div>
            <a
              href={STRIPE_MONTHLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCheckoutStarted('monthly')}
              className="relative flex items-start gap-3 rounded-[1.4rem] border border-yellow-300/18 bg-slate-950/75 p-4 no-underline"
            >
              <Lock size={16} className="mt-0.5 shrink-0 text-yellow-300" />
              <div>
                <div className="text-sm font-black text-yellow-100">Unlock Shiftside Pro</div>
                <p className="mt-1 text-xs leading-relaxed text-yellow-50/75">
                  Weight-based IV protocols, anion gap, corrected calcium, refeeding syndrome tracker, and IV compatibility checker.
                </p>
              </div>
              <div className="ml-auto shrink-0 rounded-full bg-yellow-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950">
                Upgrade
              </div>
            </a>
          </div>

          {/* ── Safety disclaimer ── */}
          <div className="rounded-[1.6rem] border border-red-400/16 bg-red-500/5 px-4 py-3 text-xs leading-relaxed text-slate-400">
            <div className="flex items-center gap-2 text-red-300 mb-2">
              <BadgeAlert size={14} />
              <span className="font-black uppercase tracking-[0.18em] text-[10px]">Clinical Safety</span>
            </div>
            Repletion guides support clinical decision-making but do not replace bedside assessment. Confirm all lab values, adjust for renal/hepatic function, and verify doses per institutional protocol before ordering.
          </div>
        </div>

        {/* ── Bottom input deck ── */}
        <div className="shrink-0 border-t border-white/6 bg-slate-950/90 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl">
          {/* Collapsed trigger */}
          <button
            onClick={() => setNumpadOpen(o => !o)}
            className="w-full rounded-3xl border border-white/8 bg-white/3 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                  Serum {meta.fullName}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
                    style={{
                      background: meta.accentBg,
                      color: meta.accentColor,
                      border: `1px solid ${meta.accentBorder}`,
                    }}
                  >
                    {meta.name} · {rawValue} {meta.unit}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Live big value */}
                <div className="text-right">
                  <AnimatedValue value={parsedValue} meta={meta} />
                  <span className="ml-1.5 text-xs font-bold text-slate-500">{meta.unit}</span>
                </div>
                <motion.div animate={{ rotate: numpadOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={18} className="text-slate-500" />
                </motion.div>
              </div>
            </div>
          </button>

          {/* Expandable numpad */}
          <AnimatePresence initial={false}>
            {numpadOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 26 }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  {/* Current raw value display */}
                  <div
                    className="mb-3 rounded-2xl border border-white/8 bg-slate-950/80 px-4 py-3 text-center"
                    style={{ borderColor: meta.accentBorder }}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                      Enter {meta.fullName} ({meta.unit})
                    </div>
                    <div className="mt-2 flex items-baseline justify-center gap-1.5">
                      <span className="text-3xl font-black tabular-nums text-white">{rawValue || '0'}</span>
                      <span className="text-sm font-bold text-slate-500">{meta.unit}</span>
                    </div>
                    <div
                      className="mt-1 h-0.5 rounded-full mx-auto w-16"
                      style={{ background: meta.accentColor }}
                    />
                  </div>

                  {/* Key grid */}
                  <div className="grid grid-cols-3 gap-2 w-full max-w-sm mx-auto">
                    {numpadKeys.map(k => {
                      const isDisabled = k === '.' && !meta.allowDecimal
                      return (
                        <motion.button
                          key={k}
                          whileTap={{ scale: 0.88 }}
                          onClick={() => !isDisabled && handleKey(k)}
                          disabled={isDisabled}
                          className={`h-12 rounded-2xl border text-slate-100 font-bold text-xl flex items-center justify-center select-none touch-manipulation transition-colors ${
                            isDisabled
                              ? 'opacity-20 border-white/5 bg-slate-800/30'
                              : 'bg-slate-800/80 border-white/6 active:bg-slate-700/90'
                          }`}
                        >
                          {k}
                        </motion.button>
                      )
                    })}
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={handleBackspace}
                      className="h-12 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 active:bg-red-500/20 flex items-center justify-center select-none touch-manipulation"
                    >
                      <Delete size={18} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setNumpadOpen(false)}
                      className="col-span-3 h-12 rounded-[1.4rem] flex items-center justify-center font-black text-sm uppercase tracking-widest mt-1 select-none touch-manipulation"
                      style={{
                        background: meta.accentBg,
                        border: `1px solid ${meta.accentBorder}`,
                        color: meta.accentColor,
                      }}
                    >
                      Done · Analyze
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>
    </div>
  )
}
