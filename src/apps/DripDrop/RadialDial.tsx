import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { triggerHaptic } from '../../lib/haptics'

interface RadialDialProps {
  value: number       // current dose
  min: number
  max: number
  step: number
  glowRgb: string
  unit: string
  onChange: (value: number) => void
}

const DIAL_RADIUS = 80
const DIAL_STROKE = 10
const CENTER = 90
const SVG_SIZE = 180

// Start at 7 o'clock (225°), sweep 270° clockwise to 5 o'clock (135°)
const START_ANGLE = 225
const SWEEP = 270

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const s = polarToCartesian(cx, cy, r, startAngle)
  const e = polarToCartesian(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`
}

export function RadialDial({ value, min, max, step, glowRgb, unit, onChange }: RadialDialProps) {
  const pct = (value - min) / (max - min)
  const valueDeg = START_ANGLE + pct * SWEEP
  const knob = polarToCartesian(CENTER, CENTER, DIAL_RADIUS, valueDeg)

  const dragRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startValue = useRef(value)

  const hapticOnChange = useCallback((newVal: number) => {
    const clamped = Math.min(max, Math.max(min, Math.round(newVal / step) * step))
    if (clamped !== value) {
      onChange(parseFloat(clamped.toFixed(4)))
      triggerHaptic(8)
    }
  }, [value, min, max, step, onChange])

  // Pointer drag: vertical swipe = value up/down
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    startY.current = e.clientY
    startValue.current = value
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const deltaY = startY.current - e.clientY // drag up = increase
    const range = max - min
    const sensitivity = 200 // px for full range
    const rawNew = startValue.current + (deltaY / sensitivity) * range
    hapticOnChange(rawNew)
  }

  const onPointerUp = () => {
    isDragging.current = false
  }

  // Track arc end angle
  const trackEnd = START_ANGLE + SWEEP

  return (
    <div
      ref={dragRef}
      className="relative flex items-center justify-center touch-none select-none"
      style={{ width: SVG_SIZE, height: SVG_SIZE }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
        {/* Background track */}
        <path
          d={describeArc(CENTER, CENTER, DIAL_RADIUS, START_ANGLE, trackEnd)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={DIAL_STROKE}
          strokeLinecap="round"
        />
        {/* Filled progress arc */}
        {pct > 0 && (
          <path
            d={describeArc(CENTER, CENTER, DIAL_RADIUS, START_ANGLE, valueDeg)}
            fill="none"
            stroke={`rgb(${glowRgb})`}
            strokeWidth={DIAL_STROKE}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px rgba(${glowRgb},0.7))` }}
          />
        )}

        {/* Tick marks */}
        {Array.from({ length: 11 }, (_, i) => {
          const tickAngle = START_ANGLE + (i / 10) * SWEEP
          const inner = polarToCartesian(CENTER, CENTER, DIAL_RADIUS - 14, tickAngle)
          const outer = polarToCartesian(CENTER, CENTER, DIAL_RADIUS - 6, tickAngle)
          const isActive = i / 10 <= pct
          return (
            <line
              key={i}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke={isActive ? `rgba(${glowRgb},0.5)` : 'rgba(255,255,255,0.08)'}
              strokeWidth={i % 5 === 0 ? 2 : 1}
              strokeLinecap="round"
            />
          )
        })}

        {/* Knob */}
        <circle
          cx={knob.x}
          cy={knob.y}
          r={10}
          fill={`rgb(${glowRgb})`}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1.5}
          style={{ filter: `drop-shadow(0 0 8px rgba(${glowRgb},0.9))` }}
        />
        <circle cx={knob.x} cy={knob.y} r={4} fill="rgba(0,0,0,0.5)" />
      </svg>

      {/* Center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          key={value.toFixed(3)}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div
            className="text-3xl font-black tabular-nums leading-none"
            style={{ color: `rgb(${glowRgb})`, textShadow: `0 0 16px rgba(${glowRgb},0.6)` }}
          >
            {value < 0.1 ? value.toFixed(3) : value < 1 ? value.toFixed(2) : value.toFixed(1)}
          </div>
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mt-1 whitespace-nowrap">
            {unit}
          </div>
        </motion.div>

        {/* Drag hint */}
        <div
          className="text-[9px] font-medium mt-3 tracking-widest uppercase"
          style={{ color: `rgba(${glowRgb},0.45)` }}
        >
          drag ↕
        </div>
      </div>
    </div>
  )
}
