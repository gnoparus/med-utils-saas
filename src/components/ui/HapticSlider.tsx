import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface HapticSliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  label: string
  unit: string
  colorClass?: string
}

export function HapticSlider({ 
  min, 
  max, 
  value, 
  onChange, 
  label, 
  unit,
  colorClass = "bg-neon-blue"
}: HapticSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const previousValue = useRef(value)

  useEffect(() => {
    // Only fire haptic on whole number changes and only when dragging
    if (isDragging && Math.floor(value) !== Math.floor(previousValue.current)) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10) // Light click
      }
      previousValue.current = value
    }
  }, [value, isDragging])

  // Calculate percentage for background
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full relative py-4">
      <div className="flex justify-between items-end mb-4">
        <label className="text-xl font-bold text-slate-300">{label}</label>
        <div className="text-right">
          <motion.span 
            key={value}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400`}
          >
            {value.toFixed(1)}
          </motion.span>
          <span className="text-slate-500 font-bold ml-1">{unit}</span>
        </div>
      </div>
      
      <div className="relative h-20 bg-slate-900 rounded-3xl overflow-hidden shadow-inner flex items-center px-4 border border-white/5">
        <div 
          className="absolute inset-y-0 left-0 opacity-20 pointer-events-none"
          style={{ width: `${percentage}%`, backgroundColor: 'currentColor' }}
        />
        
        <input
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          autoFocus={false}
          className={`w-full h-full opacity-0 absolute inset-0 cursor-pointer z-10 touch-none ${colorClass}`}
        />
        
        <motion.div 
          className={`h-12 w-12 rounded-full absolute pointer-events-none ${colorClass} shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-current border-2 border-white/20`}
          style={{ left: `calc(${percentage}% - 24px)` }}
          animate={{ scale: isDragging ? 1.1 : 1 }}
        >
          <div className="w-full h-full rounded-full flex items-center justify-center bg-black/20">
            <div className="w-1 h-4 bg-white/50 rounded-full" />
            <div className="w-1 h-4 bg-white/50 rounded-full ml-1" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
