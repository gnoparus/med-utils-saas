import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import {
  Brain,
  Check,
  Copy,
  Lock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react'
import {
  GCS_CATEGORIES,
  NIHSS_CATEGORIES,
  analyzeGcs,
  analyzeNihss,
  type GcsCategory,
  type NihssCategory,
} from '../../lib/neurosnap-calculator'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

const GLOW = {
  green: { accent: '#10b981', rgb: '16,185,129', panel: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.28)' },
  amber: { accent: '#f59e0b', rgb: '245,158,11', panel: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)' },
  red:   { accent: '#fb7185', rgb: '251,113,133', panel: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.28)' },
} as const

type GlowKey = keyof typeof GLOW

// ─── Score Hero ───────────────────────────────────────────────────────────────

function ScoreHero({
  score,
  maxScore,
  label,
  note,
  glowKey,
  sub,
}: {
  score: number
  maxScore: number
  label: string
  note: string
  glowKey: GlowKey
  sub: string
}) {
  const glow = GLOW[glowKey]
  const spring = useSpring(score, { stiffness: 220, damping: 22 })
  const displayed = useTransform(spring, v => Math.round(v).toString())

  useEffect(() => { spring.set(score) }, [score, spring])

  const isPerfect = glowKey === 'green'
  const pct = (score / maxScore) * 100

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border p-5"
      style={{ background: 'rgba(2,6,23,0.82)', borderColor: glow.border }}
    >
      {/* Ambient glow rays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 0%, rgba(${glow.rgb},0.18), transparent 42%),
            radial-gradient(circle at 80% 0%, rgba(${glow.rgb},0.10), transparent 38%)
          `,
        }}
      />

      {/* Perfect glow shimmer */}
      {isPerfect && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[2rem]"
          style={{ border: `2px solid rgba(${glow.rgb},0.35)` }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative flex items-center justify-between gap-4">
        {/* Score display */}
        <div className="flex items-end gap-1">
          <motion.span
            className="text-7xl font-black tabular-nums leading-none"
            style={{ color: glow.accent }}
          >
            {displayed}
          </motion.span>
          <span className="mb-2 text-xl font-black text-slate-600">/{maxScore}</span>
        </div>

        {/* Severity + sub */}
        <div className="flex flex-col items-end gap-2 min-w-0">
          <motion.div
            key={label}
            initial={{ opacity: 0, y: -6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.22em]"
            style={{ background: glow.panel, border: `1px solid ${glow.border}`, color: glow.accent }}
          >
            {label}
          </motion.div>
          <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500 text-right">{sub}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mt-4 h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          style={{ background: `linear-gradient(to right, rgba(${glow.rgb},0.4), rgba(${glow.rgb},0.9))` }}
        />
      </div>

      {/* Clinical note */}
      <AnimatePresence mode="wait">
        <motion.p
          key={note}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28 }}
          className="mt-3 text-xs leading-relaxed text-slate-400"
        >
          {note}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

// ─── GCS Radar chart (triangle SVG) ──────────────────────────────────────────

function GcsRadarChart({
  eyes,
  verbal,
  motor,
  glowKey,
}: {
  eyes: number
  verbal: number
  motor: number
  glowKey: GlowKey
}) {
  const glow = GLOW[glowKey]
  const SIZE = 140
  const cx = SIZE / 2
  const cy = SIZE / 2
  const R = SIZE * 0.38
  const RINGS = 3

  // 3 axes: E at top, V bottom-right, M bottom-left
  const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]
  const maxes = [4, 5, 6]
  const values = [eyes, verbal, motor]
  const labels = ['E', 'V', 'M']
  const cats = GCS_CATEGORIES

  function axisPoint(i: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angles[i]),
      y: cy + radius * Math.sin(angles[i]),
    }
  }

  // Outer triangle for reference
  const outerPts = [0, 1, 2].map(i => axisPoint(i, R))
  const outerPath = outerPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z'

  // Current score polygon
  const scorePts = values.map((v, i) => axisPoint(i, R * (v / maxes[i])))
  const scorePath = scorePts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z'

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
      {/* Grid rings */}
      {Array.from({ length: RINGS }, (_, ri) => {
        const frac = (ri + 1) / RINGS
        const pts = [0, 1, 2].map(i => axisPoint(i, R * frac))
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z'
        return (
          <path key={ri} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        )
      })}

      {/* Axis lines */}
      {[0, 1, 2].map(i => {
        const outer = axisPoint(i, R)
        return (
          <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y}
            stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        )
      })}

      {/* Outer frame */}
      <path d={outerPath} fill="none" stroke={`rgba(${glow.rgb},0.18)`} strokeWidth="1.5" />

      {/* Score fill */}
      <motion.path
        d={scorePath}
        fill={`rgba(${glow.rgb},0.22)`}
        stroke={glow.accent}
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Score dots */}
      {scorePts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill={glow.accent}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
        />
      ))}

      {/* Axis labels + scores */}
      {[0, 1, 2].map(i => {
        const lp = axisPoint(i, R + 16)
        const cat = cats[i]
        return (
          <g key={i}>
            <text
              x={lp.x}
              y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="900"
              fill={cat.accent}
            >
              {labels[i]}{values[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── GCS Category Card ────────────────────────────────────────────────────────

function GcsCategoryCard({
  cat,
  selected,
  onSelect,
  index,
}: {
  cat: GcsCategory
  selected: number
  onSelect: (score: number) => void
  index: number
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 24 }}
      className="relative overflow-hidden rounded-3xl border"
      style={{ background: 'rgba(2,6,23,0.72)', borderColor: expanded ? cat.accentBorder : 'rgba(255,255,255,0.08)' }}
    >
      {/* Category header */}
      <button
        className="flex w-full items-center justify-between px-5 py-4"
        onClick={() => { setExpanded(e => !e); triggerHaptic(8) }}
      >
        <div className="flex items-center gap-3">
          {/* Abbrev badge */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black"
            style={{ background: cat.accentBg, color: cat.accent }}
          >
            {cat.abbrev}
          </div>
          <div className="text-left">
            <div className="text-sm font-black text-slate-100">{cat.label}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Max: {cat.maxScore} pts
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Selected score chip */}
          <div
            className="rounded-xl px-3 py-1.5 text-sm font-black tabular-nums"
            style={{ background: cat.accentBg, color: cat.accent, border: `1px solid ${cat.accentBorder}` }}
          >
            {selected}/{cat.maxScore}
          </div>
          {expanded ? (
            <ChevronUp size={16} className="text-slate-500" />
          ) : (
            <ChevronDown size={16} className="text-slate-500" />
          )}
        </div>
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-4 pb-4">
              {cat.items.map(item => {
                const isSelected = item.score === selected
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { onSelect(item.score); triggerHaptic(isSelected ? 6 : [10, 8]) }}
                    className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200"
                    style={{
                      background: isSelected ? cat.accentBg : 'rgba(255,255,255,0.03)',
                      borderColor: isSelected ? cat.accentBorder : 'rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Score badge */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black tabular-nums"
                      style={{
                        background: isSelected ? cat.accent : 'rgba(255,255,255,0.06)',
                        color: isSelected ? '#020617' : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {item.score}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-sm font-bold leading-tight"
                        style={{ color: isSelected ? cat.accent : 'rgba(255,255,255,0.75)' }}
                      >
                        {item.label}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-snug text-slate-500">
                        {item.description}
                      </div>
                    </div>
                    {/* Checkmark */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                          style={{ background: cat.accent }}
                        >
                          <Check size={13} color="#020617" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── NIHSS Category Card ──────────────────────────────────────────────────────

function NihssCategoryCard({
  cat,
  selected,
  onSelect,
  index,
}: {
  cat: NihssCategory
  selected: number
  onSelect: (id: string, score: number) => void
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const hasDeficit = selected > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 280, damping: 26 }}
      className="relative overflow-hidden rounded-3xl border"
      style={{ background: 'rgba(2,6,23,0.72)', borderColor: hasDeficit ? cat.accentBorder : 'rgba(255,255,255,0.08)' }}
    >
      <button
        className="flex w-full items-center justify-between px-5 py-3.5"
        onClick={() => { setExpanded(e => !e); triggerHaptic(8) }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black"
            style={{ background: cat.accentBg, color: cat.accent }}
          >
            {selected}
          </div>
          <span className="text-sm font-bold text-slate-200">{cat.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasDeficit && (
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: cat.accent, boxShadow: `0 0 6px ${cat.accent}` }}
            />
          )}
          {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 px-4 pb-4">
              {cat.items.map(item => {
                const isSelected = item.score === selected
                return (
                  <motion.button
                    key={item.score}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { onSelect(cat.id, item.score); triggerHaptic(10) }}
                    className="flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-left transition-all duration-200"
                    style={{
                      background: isSelected ? cat.accentBg : 'rgba(255,255,255,0.02)',
                      borderColor: isSelected ? cat.accentBorder : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black tabular-nums"
                      style={{
                        background: isSelected ? cat.accent : 'rgba(255,255,255,0.06)',
                        color: isSelected ? '#020617' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {item.score}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-xs font-bold"
                        style={{ color: isSelected ? cat.accent : 'rgba(255,255,255,0.7)' }}
                      >
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-snug">{item.description}</div>
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          style={{ background: cat.accent }}
                        >
                          <Check size={11} color="#020617" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── NIHSS Score breakdown bar ────────────────────────────────────────────────

function NihssBreakdownBar({ scores, glowKey }: { scores: Record<string, number>; glowKey: GlowKey }) {
  const glow = GLOW[glowKey]
  const groups = [
    { label: 'Consciousness', ids: ['loc', 'loc_questions', 'loc_commands'], max: 7 },
    { label: 'Gaze / Vision', ids: ['gaze', 'visual'], max: 5 },
    { label: 'Face', ids: ['facial'], max: 3 },
    { label: 'Motor', ids: ['left_arm', 'right_arm', 'left_leg', 'right_leg'], max: 16 },
    { label: 'Ataxia / Sensory', ids: ['ataxia', 'sensory'], max: 4 },
    { label: 'Language / Speech', ids: ['language', 'dysarthria', 'extinction'], max: 7 },
  ]

  return (
    <div className="rounded-[1.6rem] border border-white/8 bg-slate-950/60 px-5 py-4 space-y-3">
      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 mb-1">Domain Breakdown</div>
      {groups.map(g => {
        const total = g.ids.reduce((s, id) => s + (scores[id] ?? 0), 0)
        const pct = g.max > 0 ? (total / g.max) * 100 : 0
        const hasDeficit = total > 0
        return (
          <div key={g.label}>
            <div className="flex justify-between text-[11px] font-bold mb-1">
              <span className="text-slate-400">{g.label}</span>
              <span style={{ color: hasDeficit ? glow.accent : 'rgba(255,255,255,0.2)' }}>{total}/{g.max}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                style={{ background: hasDeficit ? `rgba(${glow.rgb},0.75)` : 'transparent' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy for Chart' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      triggerHaptic([20, 40, 20])
      setTimeout(() => setCopied(false), 2400)
    } catch {
      triggerHaptic([40, 20, 40])
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handleCopy}
      className="flex w-full items-center justify-center gap-2.5 rounded-[1.8rem] border px-5 py-4 text-base font-black transition-all"
      style={{
        background: copied
          ? 'linear-gradient(135deg, rgba(16,185,129,0.32), rgba(52,211,153,0.2))'
          : 'linear-gradient(135deg, rgba(167,139,250,0.22), rgba(139,92,246,0.14))',
        borderColor: copied ? 'rgba(16,185,129,0.4)' : 'rgba(167,139,250,0.35)',
        color: copied ? '#10b981' : '#a78bfa',
      }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="flex items-center gap-2">
            <Check size={18} strokeWidth={3} /> Copied!
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="flex items-center gap-2">
            <Copy size={17} /> {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ─── GCS Tab ──────────────────────────────────────────────────────────────────

function GcsTab() {
  const [scores, setScores] = useState({ eyes: 4, verbal: 5, motor: 6 })

  const analysis = useMemo(
    () => analyzeGcs(scores.eyes, scores.verbal, scores.motor),
    [scores]
  )
  const glow = GLOW[analysis.glowState]

  const handleSelect = useCallback((cat: 'eyes' | 'verbal' | 'motor', score: number) => {
    setScores(prev => ({ ...prev, [cat]: score }))
  }, [])

  const handleReset = () => {
    setScores({ eyes: 4, verbal: 5, motor: 6 })
    triggerHaptic([10, 30, 10])
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Score hero */}
      <ScoreHero
        score={analysis.total}
        maxScore={15}
        label={analysis.severityLabel}
        note={analysis.severityNote}
        glowKey={analysis.glowState}
        sub="Glasgow Coma Scale"
      />

      {/* Radar chart + sub-scores */}
      <div
        className="flex items-center justify-between gap-3 rounded-[1.8rem] border px-5 py-4"
        style={{ background: 'rgba(2,6,23,0.72)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <GcsRadarChart
          eyes={scores.eyes}
          verbal={scores.verbal}
          motor={scores.motor}
          glowKey={analysis.glowState}
        />
        <div className="flex flex-col gap-3 flex-1">
          {GCS_CATEGORIES.map(cat => (
            <div key={cat.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: cat.accent, boxShadow: `0 0 5px ${cat.accent}` }}
                />
                <span className="text-xs font-bold text-slate-400">{cat.label}</span>
              </div>
              <span
                className="text-sm font-black tabular-nums"
                style={{ color: cat.accent }}
              >
                {scores[cat.id]}/{cat.maxScore}
              </span>
            </div>
          ))}
          <div
            className="mt-1 rounded-xl border px-3 py-2 text-center"
            style={{ borderColor: glow.border, background: glow.panel }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.26em]" style={{ color: glow.accent }}>
              E{scores.eyes}V{scores.verbal}M{scores.motor}
            </span>
          </div>
        </div>
      </div>

      {/* Category cards */}
      {GCS_CATEGORIES.map((cat, i) => (
        <GcsCategoryCard
          key={cat.id}
          cat={cat}
          selected={scores[cat.id]}
          onSelect={score => handleSelect(cat.id, score)}
          index={i}
        />
      ))}

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="flex items-center justify-center gap-2 rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-4 text-sm font-black text-slate-400"
        >
          <RotateCcw size={15} /> Reset
        </motion.button>
        <div className="flex-1">
          <CopyButton text={analysis.chartNote} />
        </div>
      </div>
    </div>
  )
}

// ─── NIHSS Tab ────────────────────────────────────────────────────────────────

function NihssTab() {
  const LOCKED = true // Pro feature: $19.99 unlock

  const [scores, setScores] = useState<Record<string, number>>(
    () => Object.fromEntries(NIHSS_CATEGORIES.map(c => [c.id, 0]))
  )

  const analysis = useMemo(() => analyzeNihss(scores), [scores])
  const glow = GLOW[analysis.glowState]

  const handleSelect = useCallback((id: string, score: number) => {
    setScores(prev => ({ ...prev, [id]: score }))
  }, [])

  const handleReset = () => {
    setScores(Object.fromEntries(NIHSS_CATEGORIES.map(c => [c.id, 0])))
    triggerHaptic([10, 30, 10])
  }

  return (
    <div className="relative flex flex-col gap-4">
      {/* Lock overlay */}
      {LOCKED && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-start rounded-3xl backdrop-blur-sm bg-slate-950/70 px-6 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="w-full max-w-sm rounded-[2rem] border border-purple-500/30 bg-slate-900/90 p-7 flex flex-col items-center text-center shadow-2xl"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-purple-500/15 border border-purple-500/25">
              <Lock size={28} className="text-purple-400" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">NIHSS Pro</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Full 15-item NIHSS scoring with stroke severity interpretation,
              Hunt &amp; Hess scale, and EHR export.
            </p>

            <div className="mt-6 w-full rounded-2xl border border-purple-500/25 bg-purple-500/10 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-purple-400 mb-2">Included in Pro</div>
              {['NIHSS 0–42 full scoring', 'Stroke severity + tPA eligibility', 'Hunt & Hess scale', 'EHR chart note export'].map(f => (
                <div key={f} className="flex items-center gap-2 py-1">
                  <Check size={12} className="text-purple-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-300">{f}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerHaptic([10, 20, 40])}
              className="mt-6 w-full rounded-[1.6rem] px-5 py-4 text-base font-black text-white"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.7), rgba(167,139,250,0.5))',
                border: '1px solid rgba(167,139,250,0.4)',
              }}
            >
              Unlock NIHSS — $19.99
            </motion.button>

            <p className="mt-3 text-[10px] text-slate-600">One-time purchase · Lifetime access</p>
          </motion.div>

          {/* Preview scores below lock (blurred) */}
          <div className="mt-6 w-full opacity-30 pointer-events-none select-none">
            <ScoreHero
              score={analysis.total}
              maxScore={42}
              label={analysis.severityLabel}
              note={analysis.severityNote}
              glowKey={analysis.glowState}
              sub="NIH Stroke Scale"
            />
          </div>
        </div>
      )}

      {/* Score hero */}
      <ScoreHero
        score={analysis.total}
        maxScore={42}
        label={analysis.severityLabel}
        note={analysis.severityNote}
        glowKey={analysis.glowState}
        sub="NIH Stroke Scale"
      />

      {/* Domain breakdown */}
      <NihssBreakdownBar scores={scores} glowKey={analysis.glowState} />

      {/* Category cards */}
      {NIHSS_CATEGORIES.map((cat, i) => (
        <NihssCategoryCard
          key={cat.id}
          cat={cat}
          selected={scores[cat.id] ?? 0}
          onSelect={handleSelect}
          index={i}
        />
      ))}

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="flex items-center justify-center gap-2 rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-4 text-sm font-black text-slate-400"
        >
          <RotateCcw size={15} /> Reset
        </motion.button>
        <div className="flex-1">
          <CopyButton text={analysis.chartNote} label="Copy NIHSS Note" />
        </div>
      </div>
    </div>
  )
}

// ─── Main NeuroSnap ───────────────────────────────────────────────────────────

type Mode = 'gcs' | 'nihss'

export default function NeuroSnap() {
  const [mode, setMode] = useState<Mode>('gcs')

  const handleModeChange = (m: Mode) => {
    setMode(m)
    triggerHaptic(12)
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Ambient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              mode === 'gcs'
                ? `
                  radial-gradient(circle at 20% 0%, rgba(167,139,250,0.12), transparent 36%),
                  radial-gradient(circle at 80% 5%, rgba(56,189,248,0.09), transparent 32%),
                  radial-gradient(circle at 50% 100%, rgba(251,113,133,0.07), transparent 40%)
                `
                : `
                  radial-gradient(circle at 15% 0%, rgba(139,92,246,0.14), transparent 36%),
                  radial-gradient(circle at 85% 5%, rgba(249,115,22,0.08), transparent 32%)
                `,
          }}
        />
      </AnimatePresence>

      <div className="relative flex h-full flex-col">
        {/* ── Header ── */}
        <div className="shrink-0 px-4 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="glass rounded-full px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white"
            >
              ← Back
            </Link>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Brain size={17} className="text-purple-400" />
                <h1 className="text-lg font-black tracking-tight text-white">NeuroSnap</h1>
              </div>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Visual GCS &amp; NIHSS
              </p>
            </div>
            <div className="w-20" />
          </div>
        </div>

        {/* ── Mode tab strip ── */}
        <div className="shrink-0 px-4 mb-4">
          <div
            className="flex rounded-2xl border border-white/8 bg-slate-900/60 p-1"
          >
            {([
              { id: 'gcs', label: 'GCS', badge: '/15', accent: '#a78bfa', rgb: '167,139,250' },
              { id: 'nihss', label: 'NIHSS', badge: '/42', accent: '#9333ea', rgb: '147,51,234', locked: true },
            ] as const).map(tab => {
              const isActive = mode === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleModeChange(tab.id)}
                  className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-black transition-all duration-200"
                  style={{
                    background: isActive ? `rgba(${tab.rgb},0.18)` : 'transparent',
                    color: isActive ? tab.accent : 'rgba(255,255,255,0.3)',
                    border: isActive ? `1px solid rgba(${tab.rgb},0.3)` : '1px solid transparent',
                  }}
                >
                  {tab.label}
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums"
                    style={{
                      background: isActive ? `rgba(${tab.rgb},0.2)` : 'rgba(255,255,255,0.04)',
                      color: isActive ? tab.accent : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {tab.badge}
                  </span>
                  {'locked' in tab && tab.locked && (
                    <Lock size={11} className="opacity-60" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-4 pb-10" style={{ WebkitOverflowScrolling: 'touch' }}>
          <AnimatePresence mode="wait">
            {mode === 'gcs' ? (
              <motion.div
                key="gcs"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <GcsTab />
              </motion.div>
            ) : (
              <motion.div
                key="nihss"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <NihssTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
