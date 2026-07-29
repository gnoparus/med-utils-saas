import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { triggerHaptic } from '../../lib/haptics'

interface HapticSliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  /** Tool accent color as a hex string — sliders are used across tools with runtime-computed accents (e.g. Broselow band color), so this takes a value, not a Tailwind class. */
  accentColor: string
  ariaLabel: string
  className?: string
}

export function HapticSlider({ value, min, max, step = 1, onChange, accentColor, ariaLabel, className }: HapticSliderProps) {
  const [dragging, setDragging] = useState(false)
  const lastWholeUnit = useRef(Math.round(value))
  const reduceMotion = useReducedMotion()
  const pct = ((value - min) / (max - min)) * 100

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    onChange(v)
    const whole = Math.round(v)
    if (whole !== lastWholeUnit.current) {
      lastWholeUnit.current = whole
      triggerHaptic(10)
    }
  }

  return (
    <div className={`relative h-12 flex items-center ${className ?? ''}`}>
      <div className="absolute inset-y-0 left-0 right-0 flex items-center">
        <div className="relative w-full h-2 rounded-3xl bg-slate-900 overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 rounded-3xl"
            style={{ width: `${pct}%`, background: accentColor, opacity: 0.2 }}
          />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        aria-label={ariaLabel}
        className="absolute inset-0 w-full opacity-0 cursor-pointer z-10 touch-none"
      />
      <motion.div
        className="absolute pointer-events-none h-12 w-12 rounded-full flex items-center justify-center"
        style={{
          left: `calc(${pct}% - 24px)`,
          background: accentColor,
          boxShadow: `0 0 20px ${accentColor}80`,
        }}
        animate={{ scale: dragging && !reduceMotion ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="flex gap-0.5">
          <div className="w-0.5 h-3 bg-black/40 rounded-full" />
          <div className="w-0.5 h-3 bg-black/40 rounded-full" />
        </div>
      </motion.div>
    </div>
  )
}
