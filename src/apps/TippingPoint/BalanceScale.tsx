import { motion } from 'framer-motion'

interface BalanceScaleProps {
  angle: number
  glowColor: string
}

export function BalanceScale({ angle, glowColor }: BalanceScaleProps) {
  // Angle: negative is left (acid), positive is right (base)
  const glowClass = glowColor.includes('red') ? 'bg-red-500' : glowColor.includes('cyan') ? 'bg-cyan-500' : 'bg-green-500'

  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-visible my-8 shrink-0">
      {/* Background ambient glow based on severity */}
      <div 
        className={`absolute inset-0 opacity-10 blur-3xl transition-colors duration-1000 ${glowClass}`}
      />

      <div className="relative w-64 h-32 flex flex-col items-center justify-end">
        {/* The Fulcrum (Base triangle) */}
        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-slate-700 absolute bottom-0 z-10 drop-shadow-xl" />
        
        {/* The pivotal point circle */}
        <div className="w-4 h-4 bg-slate-400 rounded-full absolute bottom-[30px] z-20 shadow-inner" />

        {/* The Scale Beam */}
        <motion.div 
          className="absolute bottom-[36px] w-[280px] h-3 bg-gradient-to-r from-red-500/80 via-slate-600 to-cyan-500/80 rounded-full flex items-center justify-between px-2 shadow-lg"
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
           {/* Acid Plate */}
           <motion.div 
             className="w-12 h-2 bg-red-400 rounded-full relative -left-4"
             animate={{ rotate: -angle }} // counter-rotate so it stays horizontal
             transition={{ type: "spring", stiffness: 60, damping: 15 }}
           >
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-red-500/50" />
             <div className="absolute top-10 left-1/2 -translate-x-1/2 w-16 h-3 bg-red-500/20 border border-red-500/50 rounded-full backdrop-blur-sm shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
             <div className="absolute top-14 left-1/2 -translate-x-1/2 text-xs font-black text-red-500/80">ACID</div>
           </motion.div>

           {/* Base Plate */}
           <motion.div 
             className="w-12 h-2 bg-cyan-400 rounded-full relative -right-4"
             animate={{ rotate: -angle }}
             transition={{ type: "spring", stiffness: 60, damping: 15 }}
           >
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-cyan-500/50" />
             <div className="absolute top-10 left-1/2 -translate-x-1/2 w-16 h-3 bg-cyan-500/20 border border-cyan-500/50 rounded-full backdrop-blur-sm shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
             <div className="absolute top-14 left-1/2 -translate-x-1/2 text-xs font-black text-cyan-500/80">BASE</div>
           </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
