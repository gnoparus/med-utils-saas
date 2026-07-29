import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'
import { triggerHaptic } from '../../lib/haptics'

interface NumpadProps {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onNext: () => void
  nextLabel?: string
  /** Caller's tool accent classes for the primary "next" button, e.g. "bg-orange-500/10 border-orange-500/30 text-orange-400 active:bg-orange-500/20" */
  accentClassName?: string
  /** Alternative to accentClassName for tools whose accent is a runtime value (e.g. NeoDose's Broselow band color) rather than a static Tailwind class. */
  accentStyle?: { background: string; borderColor: string; color: string }
  /** Keys to render disabled, e.g. ['.'] when the active field doesn't allow decimals. */
  disabledKeys?: string[]
}

export function Numpad({ onKeyPress, onBackspace, onNext, nextLabel = "Next Field", accentClassName, accentStyle, disabledKeys = [] }: NumpadProps) {
  const handleKey = (k: string) => {
    triggerHaptic(10)
    onKeyPress(k)
  }

  const handleBack = () => {
    triggerHaptic(10)
    onBackspace()
  }

  const handleNext = () => {
    triggerHaptic(10)
    onNext()
  }

  const keys = ['1','2','3','4','5','6','7','8','9','.','0']

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-sm mx-auto">
      {keys.map(k => {
        const disabled = disabledKeys.includes(k)
        return (
          <motion.button
            key={k}
            whileTap={disabled ? undefined : { scale: 0.9 }}
            onClick={() => !disabled && handleKey(k)}
            disabled={disabled}
            className={`glass h-12 rounded-2xl flex items-center justify-center text-2xl font-bold border select-none touch-manipulation ${
              disabled
                ? 'opacity-20 border-white/5 bg-slate-800/30'
                : 'bg-white/5 border-white/10 active:bg-white/20'
            }`}
          >
            {k}
          </motion.button>
        )
      })}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleBack}
        aria-label="Backspace"
        className="glass h-12 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/30 text-red-400 active:bg-red-500/20 select-none touch-manipulation"
      >
        <Delete />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleNext}
        className={`col-span-3 glass h-12 rounded-full flex items-center justify-center border font-bold select-none mt-2 touch-manipulation ${accentClassName ?? ''}`}
        style={accentStyle}
      >
        {nextLabel}
      </motion.button>
    </div>
  )
}
