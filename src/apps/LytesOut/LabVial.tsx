import { useEffect, useId } from 'react'
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { GLOW_COLORS, type ElectrolyteMeta, type GlowState } from '../../lib/lytesout-calculator'

const VIAL_WIDTH = 84
const VIAL_HEIGHT = 172
const BODY_RADIUS = 18
const BUBBLES = [
  { cx: 30, delay: 0 },
  { cx: 48, delay: 0.6 },
  { cx: 58, delay: 1.3 },
] as const

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

/**
 * Serum level rendered as a fillable lab vial — the electrolyte-repletion
 * equivalent of DripDrop's IV bag / TippingPoint's balance scale. The cap
 * carries the electrolyte's own identity accent; the liquid carries the
 * severity glow, so both signals this app already tracks stay visible here.
 */
export function LabVial({
  meta,
  value,
  glowState,
}: {
  meta: ElectrolyteMeta
  value: number
  glowState: GlowState
}) {
  const glow = GLOW_COLORS[glowState]
  const gradientId = useId()
  const reduceMotion = useReducedMotion()

  const range = meta.inputMax - meta.inputMin
  const pct = clamp((value - meta.inputMin) / range, 0, 1)
  const normalLowPct = clamp((meta.normalLow - meta.inputMin) / range, 0, 1)
  const normalHighPct = clamp((meta.normalHigh - meta.inputMin) / range, 0, 1)

  const springPct = useSpring(pct, { stiffness: 170, damping: 22 })
  useEffect(() => {
    // .set() always animates via spring physics, even at high stiffness —
    // .jump() is the actual instant path prefers-reduced-motion needs.
    if (reduceMotion) springPct.jump(pct)
    else springPct.set(pct)
  }, [pct, reduceMotion, springPct])

  const fillHeight = useTransform(springPct, (v) => v * VIAL_HEIGHT)
  const fillY = useTransform(fillHeight, (h) => VIAL_HEIGHT - h)

  const bodyPath = `M0,${BODY_RADIUS} A${BODY_RADIUS},${BODY_RADIUS} 0 0 1 ${BODY_RADIUS},0 H${VIAL_WIDTH - BODY_RADIUS} A${BODY_RADIUS},${BODY_RADIUS} 0 0 1 ${VIAL_WIDTH},${BODY_RADIUS} V${VIAL_HEIGHT - BODY_RADIUS} A${BODY_RADIUS},${BODY_RADIUS} 0 0 1 ${VIAL_WIDTH - BODY_RADIUS},${VIAL_HEIGHT} H${BODY_RADIUS} A${BODY_RADIUS},${BODY_RADIUS} 0 0 1 0,${VIAL_HEIGHT - BODY_RADIUS} Z`

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <svg
        width={VIAL_WIDTH}
        height={VIAL_HEIGHT + 14}
        viewBox={`0 -14 ${VIAL_WIDTH} ${VIAL_HEIGHT + 14}`}
        className="overflow-visible"
        role="img"
        aria-label={`${meta.fullName} level ${value} ${meta.unit}, ${glowState === 'green' ? 'within' : 'outside'} normal range`}
      >
        <defs>
          <clipPath id={`${gradientId}-clip`}>
            <path d={bodyPath} />
          </clipPath>
          <linearGradient id={`${gradientId}-fill`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={`rgba(${glow.rgb},0.92)`} />
            <stop offset="100%" stopColor={`rgba(${glow.rgb},0.5)`} />
          </linearGradient>
        </defs>

        {/* Cap — carries the electrolyte's own identity accent */}
        <rect
          x={VIAL_WIDTH / 2 - 15}
          y={-12}
          width={30}
          height={12}
          rx={5}
          fill={meta.accentColor}
          opacity={0.85}
        />

        {/* Glass body outline */}
        <path d={bodyPath} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.16)" strokeWidth={1.5} />

        {/* Normal-range band */}
        <rect
          x={2}
          y={VIAL_HEIGHT * (1 - normalHighPct)}
          width={VIAL_WIDTH - 4}
          height={Math.max(VIAL_HEIGHT * (normalHighPct - normalLowPct), 2)}
          fill="rgba(16,185,129,0.16)"
        />

        <g clipPath={`url(#${gradientId}-clip)`}>
          <motion.rect x={0} width={VIAL_WIDTH} y={fillY} height={fillHeight} fill={`url(#${gradientId}-fill)`} />
          <motion.rect x={0} width={VIAL_WIDTH} y={fillY} height={2} fill={glow.accent} opacity={0.9} />

          {!reduceMotion &&
            BUBBLES.map((b, i) => (
              <motion.circle
                key={i}
                cx={b.cx}
                r={2}
                fill="rgba(255,255,255,0.35)"
                initial={{ cy: VIAL_HEIGHT + 6, opacity: 0 }}
                animate={{ cy: -6, opacity: [0, 0.7, 0] }}
                transition={{ duration: 3.2, delay: b.delay, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
        </g>

        {/* Glass outline redrawn on top so the fill never overpaints the rim */}
        <path d={bodyPath} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={1.5} />
      </svg>

      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          {meta.normalLow}–{meta.normalHigh}
        </div>
        <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Normal</div>
      </div>
    </div>
  )
}
