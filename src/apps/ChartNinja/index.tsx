import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Copy,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Lock,
} from 'lucide-react'
import { AppShellHeader } from '../../components/app-shell'
import {
  NOTE_TEMPLATES,
  countFilledFields,
  isTemplateComplete,
  type NoteTemplate,
  type NoteField,
} from '../../lib/chartninja-calculator'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

const GLOW = {
  sky:    { accent: '#38bdf8', rgb: '56,189,248',   panel: 'rgba(56,189,248,0.12)',   border: 'rgba(56,189,248,0.28)'   },
  purple: { accent: '#a78bfa', rgb: '167,139,250',  panel: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.28)'  },
  red:    { accent: '#fb7185', rgb: '251,113,133',  panel: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.28)'  },
  green:  { accent: '#34d399', rgb: '52,211,153',   panel: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.28)'   },
  orange: { accent: '#f97316', rgb: '249,115,22',   panel: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.28)'   },
} as const

type GlowKey = keyof typeof GLOW

const TEMPLATE_GLOW: Record<string, GlowKey> = {
  admission:      'sky',
  soap:           'purple',
  procedure:      'red',
  discharge:      'green',
  rapid_response: 'orange',
}

// ─── Template Selector ────────────────────────────────────────────────────────

function TemplateSelector({
  selected,
  onSelect,
}: {
  selected: NoteTemplate
  onSelect: (t: NoteTemplate) => void
}) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 px-6 scrollbar-none snap-x snap-mandatory">
      {NOTE_TEMPLATES.map((t, i) => {
        const isActive = t.id === selected.id
        return (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => { onSelect(t); triggerHaptic(8) }}
            className="shrink-0 snap-start flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all duration-200"
            style={{
              background: isActive ? t.accentBg : 'rgba(255,255,255,0.03)',
              borderColor: isActive ? t.accentBorder : 'rgba(255,255,255,0.08)',
              minWidth: 72,
            }}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span
              className="text-[10px] font-black uppercase tracking-[0.18em] leading-none"
              style={{ color: isActive ? t.accent : 'rgba(255,255,255,0.38)' }}
            >
              {t.shortLabel}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── Completion Ring ──────────────────────────────────────────────────────────

function CompletionRing({
  filled,
  total,
  glowKey,
  complete,
}: {
  filled: number
  total: number
  glowKey: GlowKey
  complete: boolean
}) {
  const glow = GLOW[glowKey]
  const SIZE = 56
  const R = 22
  const STROKE = 4
  const circ = 2 * Math.PI * R
  const pct = total > 0 ? filled / total : 0
  const dashOffset = circ * (1 - pct)

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        {/* Track */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
          stroke="rgba(255,255,255,0.07)" strokeWidth={STROKE} />
        {/* Progress */}
        <motion.circle
          cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
          stroke={glow.accent} strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        />
      </svg>
      {/* Center icon / count */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {complete ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Check size={16} style={{ color: glow.accent }} strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.span
              key="count"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-black tabular-nums"
              style={{ color: glow.accent }}
            >
              {filled}/{total}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Single-select Field Card ──────────────────────────────────────────────────

function ChipsFieldCard({
  field,
  value,
  onChange,
  index,
}: {
  field: NoteField
  value: string
  onChange: (v: string) => void
  index: number
}) {
  const [expanded, setExpanded] = useState(index < 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 280, damping: 26 }}
      className="rounded-3xl border overflow-hidden"
      style={{
        background: 'rgba(2,6,23,0.72)',
        borderColor: value ? field.accentBorder : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <button
        className="flex w-full items-center justify-between px-5 py-4"
        onClick={() => { setExpanded(e => !e); triggerHaptic(8) }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-black"
            style={{ background: field.accentBg, color: field.accent }}
          >
            {field.shortLabel.slice(0, 2)}
          </div>
          <div className="text-left">
            <div className="text-sm font-black text-slate-100">{field.label}</div>
            {field.required && (
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">Required</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] max-w-25 truncate"
              style={{ background: field.accentBg, color: field.accent, border: `1px solid ${field.accentBorder}` }}
            >
              {field.options?.find(o => o.text === value)?.label ?? value}
            </motion.div>
          )}
          {expanded ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
        </div>
      </button>

      {/* Options */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {field.options?.map(opt => {
                const isSelected = value === opt.text
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      onChange(isSelected ? '' : opt.text)
                      triggerHaptic(isSelected ? 6 : [10, 8])
                    }}
                    className="flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all duration-150"
                    style={{
                      background: isSelected ? field.accentBg : 'rgba(255,255,255,0.04)',
                      borderColor: isSelected ? field.accentBorder : 'rgba(255,255,255,0.09)',
                      color: isSelected ? field.accent : 'rgba(255,255,255,0.58)',
                    }}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} style={{ color: field.accent }} />}
                    {opt.label}
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

// ─── Multi-select Field Card ──────────────────────────────────────────────────

function MultiChipsFieldCard({
  field,
  value,
  onChange,
  index,
}: {
  field: NoteField
  value: string[]
  onChange: (v: string[]) => void
  index: number
}) {
  const [expanded, setExpanded] = useState(false)

  const toggle = (text: string) => {
    const next = value.includes(text)
      ? value.filter(v => v !== text)
      : [...value, text]
    onChange(next)
    triggerHaptic([10, 8])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 280, damping: 26 }}
      className="rounded-3xl border overflow-hidden"
      style={{
        background: 'rgba(2,6,23,0.72)',
        borderColor: value.length > 0 ? field.accentBorder : 'rgba(255,255,255,0.08)',
      }}
    >
      <button
        className="flex w-full items-center justify-between px-5 py-4"
        onClick={() => { setExpanded(e => !e); triggerHaptic(8) }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-black"
            style={{ background: field.accentBg, color: field.accent }}
          >
            {field.shortLabel.slice(0, 2)}
          </div>
          <div className="text-left">
            <div className="text-sm font-black text-slate-100">{field.label}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">Multi-select</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {value.length > 0 && (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-black"
              style={{ background: field.accentBg, color: field.accent, border: `1px solid ${field.accentBorder}` }}
            >
              {value.length}
            </div>
          )}
          {expanded ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
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
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {field.options?.map(opt => {
                const isSelected = value.includes(opt.text)
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => toggle(opt.text)}
                    className="flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all duration-150"
                    style={{
                      background: isSelected ? field.accentBg : 'rgba(255,255,255,0.04)',
                      borderColor: isSelected ? field.accentBorder : 'rgba(255,255,255,0.09)',
                      color: isSelected ? field.accent : 'rgba(255,255,255,0.58)',
                    }}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} style={{ color: field.accent }} />}
                    {opt.label}
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

// ─── Snippet Preview Panel ────────────────────────────────────────────────────

function SnippetPanel({
  snippet,
  complete,
  glowKey,
  template,
}: {
  snippet: string
  complete: boolean
  glowKey: GlowKey
  template: NoteTemplate
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      triggerHaptic([20, 40, 20])
      setTimeout(() => setCopied(false), 2400)
    } catch {
      triggerHaptic([40, 20, 40])
    }
  }

  const glow = GLOW[glowKey]

  return (
    <div
      className="rounded-4xl border overflow-hidden"
      style={{
        background: 'rgba(2,6,23,0.85)',
        borderColor: complete ? glow.border : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl text-sm"
            style={{ background: glow.panel, border: `1px solid ${glow.border}` }}
          >
            <FileText size={14} style={{ color: glow.accent }} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-100">{template.label}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: complete ? glow.accent : 'rgba(255,255,255,0.28)' }}
            >
              {complete ? 'Ready to copy' : 'Fill required fields'}
            </div>
          </div>
        </div>

        {/* Glow pulse if complete */}
        {complete && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-2 w-2 rounded-full"
            style={{ background: glow.accent, boxShadow: `0 0 8px ${glow.accent}` }}
          />
        )}
      </div>

      {/* Snippet text */}
      <div className="px-5 py-4 overflow-y-auto max-h-48 scrollbar-none">
        <pre
          className="text-xs leading-relaxed font-mono whitespace-pre-wrap"
          style={{ color: complete ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.30)' }}
        >
          {snippet}
        </pre>
      </div>

      {/* Copy button */}
      <div className="px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCopy}
          disabled={!complete}
          className="flex w-full items-center justify-center gap-2.5 rounded-[1.6rem] border px-5 py-3.5 text-sm font-black transition-all"
          style={{
            background: copied
              ? 'linear-gradient(135deg, rgba(52,211,153,0.32), rgba(16,185,129,0.18))'
              : complete
                ? `linear-gradient(135deg, rgba(${glow.rgb},0.22), rgba(${glow.rgb},0.12))`
                : 'rgba(255,255,255,0.04)',
            borderColor: copied
              ? 'rgba(52,211,153,0.4)'
              : complete
                ? glow.border
                : 'rgba(255,255,255,0.08)',
            color: copied ? '#34d399' : complete ? glow.accent : 'rgba(255,255,255,0.25)',
            cursor: complete ? 'pointer' : 'not-allowed',
          }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="flex items-center gap-2">
                <Check size={16} strokeWidth={3} /> Copied to clipboard!
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="flex items-center gap-2">
                <Copy size={15} />
                {complete ? 'Copy for Chart' : 'Complete required fields'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChartNinja() {
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate>(NOTE_TEMPLATES[0])
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string | string[]>>>({})

  const currentValues = fieldValues[selectedTemplate.id] ?? {}

  const handleTemplateChange = useCallback((t: NoteTemplate) => {
    setSelectedTemplate(t)
    triggerHaptic(12)
  }, [])

  const handleFieldChange = useCallback((fieldId: string, value: string | string[]) => {
    setFieldValues(prev => ({
      ...prev,
      [selectedTemplate.id]: {
        ...(prev[selectedTemplate.id] ?? {}),
        [fieldId]: value,
      },
    }))
  }, [selectedTemplate.id])

  const handleReset = useCallback(() => {
    setFieldValues(prev => ({ ...prev, [selectedTemplate.id]: {} }))
    triggerHaptic([10, 30, 10])
  }, [selectedTemplate.id])

  const filledCount = useMemo(
    () => countFilledFields(selectedTemplate, currentValues),
    [selectedTemplate, currentValues]
  )

  const complete = useMemo(
    () => isTemplateComplete(selectedTemplate, currentValues),
    [selectedTemplate, currentValues]
  )

  const snippet = useMemo(
    () => selectedTemplate.generate(currentValues),
    [selectedTemplate, currentValues]
  )

  const glowKey = TEMPLATE_GLOW[selectedTemplate.id] ?? 'sky'

  return (
    <div className="h-screen w-screen flex flex-col text-slate-100 overflow-hidden">
      <AppShellHeader
        toolId="notes"
        rightSlot={
          <div aria-label="Template completion progress">
            <CompletionRing
              filled={filledCount}
              total={selectedTemplate.fields.length}
              glowKey={glowKey}
              complete={complete}
            />
          </div>
        }
      />

      {/* ── Template selector ──────────────────────────────────────────── */}
      <div className="shrink-0 mb-4">
        <TemplateSelector selected={selectedTemplate} onSelect={handleTemplateChange} />
      </div>

      {/* ── Template label / description ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTemplate.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mx-6 mb-3 rounded-2xl border px-4 py-3 flex items-center gap-3"
          style={{ background: selectedTemplate.accentBg, borderColor: selectedTemplate.accentBorder }}
        >
          <span className="text-2xl">{selectedTemplate.icon}</span>
          <div>
            <div className="text-sm font-black text-slate-100 leading-tight">{selectedTemplate.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{selectedTemplate.description}</div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Scrollable content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-none scrollbar-none px-6 pb-8 space-y-3">
        {/* Fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTemplate.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {selectedTemplate.fields.map((field, i) => {
              if (field.type === 'chips') {
                return (
                  <ChipsFieldCard
                    key={field.id}
                    field={field}
                    value={(currentValues[field.id] as string) ?? ''}
                    onChange={v => handleFieldChange(field.id, v)}
                    index={i}
                  />
                )
              }
              return (
                <MultiChipsFieldCard
                  key={field.id}
                  field={field}
                  value={(currentValues[field.id] as string[]) ?? []}
                  onChange={v => handleFieldChange(field.id, v)}
                  index={i}
                />
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Snippet preview */}
        <SnippetPanel
          snippet={snippet}
          complete={complete}
          glowKey={glowKey}
          template={selectedTemplate}
        />

        {/* Reset */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleReset}
          className="flex w-full items-center justify-center gap-2 rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-black text-slate-400"
        >
          <RotateCcw size={14} /> Reset Fields
        </motion.button>

        {/* Pro teaser */}
        <div
          className="rounded-[1.8rem] border px-5 py-4 flex items-center gap-3"
          style={{ background: 'rgba(167,139,250,0.07)', borderColor: 'rgba(167,139,250,0.22)' }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)' }}
          >
            <Lock size={16} className="text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-100">Shiftside Pro</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Custom templates, expanded bedside documentation modes, voice dictation, and export tools.
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => triggerHaptic([10, 20, 40])}
            className="shrink-0 rounded-2xl px-3.5 py-2 text-[11px] font-black"
            style={{
              background: 'rgba(167,139,250,0.2)',
              border: '1px solid rgba(167,139,250,0.3)',
              color: '#a78bfa',
            }}
          >
            Unlock Pro
          </motion.button>
        </div>
      </div>
    </div>
  )
}
