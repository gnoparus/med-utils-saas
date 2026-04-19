import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'

interface NumpadProps {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onNext: () => void
  nextLabel?: string
}

export function Numpad({ onKeyPress, onBackspace, onNext, nextLabel = "Next Field" }: NumpadProps) {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const handleKey = (k: string) => {
    triggerHaptic()
    onKeyPress(k)
  }

  const handleBack = () => {
    triggerHaptic()
    onBackspace()
  }

  const handleNext = () => {
    triggerHaptic()
    onNext()
  }

  const keys = ['1','2','3','4','5','6','7','8','9','.','0']

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-sm mx-auto">
      {keys.map(k => (
        <motion.button
          key={k}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleKey(k)}
          className="glass aspect-video rounded-2xl flex items-center justify-center text-2xl font-bold bg-white/5 border border-white/10 active:bg-white/20 select-none touch-manipulation"
        >
          {k}
        </motion.button>
      ))}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleBack}
        className="glass aspect-video rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/30 text-red-400 active:bg-red-500/20 select-none touch-manipulation"
      >
        <Delete />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleNext}
        className="col-span-3 glass py-4 rounded-full flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold active:bg-cyan-500/20 select-none mt-2 touch-manipulation"
      >
        {nextLabel}
      </motion.button>
    </div>
  )
}
