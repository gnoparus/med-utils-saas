import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface IVBagProps {
  mlPerHr: number
  dropsPerSec: number
  color: string
  glowRgb: string
  isActive: boolean
}

interface DropItem {
  id: number
}

// ponytail: keys are drug-identity ids (kept for parity with DRUG_STYLES /
// clipPath id below); values all share drips-sky (One Signal Rule) — only
// fill alpha varies per drug so the bag still reads distinctly.
function skyBag(fillAlpha: number) {
  return {
    fill: `rgba(125,211,252,${fillAlpha})`,
    stroke: 'rgba(125,211,252,0.55)',
    tube: 'rgba(125,211,252,0.45)',
  }
}

const BAG_COLORS: Record<string, { fill: string; stroke: string; tube: string }> = {
  amber: skyBag(0.16),
  red: skyBag(0.19),
  violet: skyBag(0.22),
  sky: skyBag(0.25),
  emerald: skyBag(0.28),
}

export function IVBagAnimation({ mlPerHr, dropsPerSec, color, glowRgb, isActive }: IVBagProps) {
  const [drops, setDrops] = useState<DropItem[]>([])
  const [visibleFromId, setVisibleFromId] = useState(0)
  const nextIdRef = useRef(0)

  // Drip emitter
  useEffect(() => {
    const startId = nextIdRef.current
    const revealId = window.setTimeout(() => {
      setVisibleFromId(startId)
    }, 0)

    if (!isActive || mlPerHr <= 0) {
      return () => window.clearTimeout(revealId)
    }

    const intervalMs = Math.max(90, 1000 / dropsPerSec)
    const id = setInterval(() => {
      const newDrop: DropItem = { id: nextIdRef.current++ }
      setDrops(prev => [...prev.slice(-5), newDrop])
    }, intervalMs)

    return () => {
      window.clearTimeout(revealId)
      clearInterval(id)
    }
  }, [isActive, dropsPerSec, mlPerHr])

  const bc = BAG_COLORS[color] ?? BAG_COLORS.amber
  // Fill level: maps 0 mL/hr → 8%, 200 mL/hr → 88%
  const fillPct = isActive ? Math.max(8, Math.min(88, 8 + (mlPerHr / 200) * 80)) : 8
  const fillY = 22 + (100 * (1 - fillPct / 100))
  const fillH = 100 * fillPct / 100
  const clipId = `bag-clip-${color}`
  const visibleDrops = isActive ? drops.filter(drop => drop.id >= visibleFromId) : []

  return (
    <div className="flex flex-col items-center select-none pointer-events-none">
      {/* IV Bag SVG */}
      <svg width={130} height={160} viewBox="0 0 130 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={clipId}>
            <rect x="22" y="24" width="86" height="104" rx="18" ry="18" />
          </clipPath>
        </defs>

        {/* Hanger hook */}
        <path d="M65 12 Q65 3 56 3 Q46 3 46 12" stroke="rgba(148,163,184,0.35)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <line x1="65" y1="12" x2="65" y2="24" stroke="rgba(148,163,184,0.25)" strokeWidth="2"/>

        {/* Bag body */}
        <rect x="22" y="24" width="86" height="104" rx="18" ry="18"
          fill="rgba(15,23,42,0.55)"
          stroke={bc.stroke}
          strokeWidth="1.5"
        />

        {/* Fluid fill (animated via CSS transition) */}
        <rect
          x="22"
          y={fillY}
          width="86"
          height={fillH}
          fill={bc.fill}
          clipPath={`url(#${clipId})`}
          style={{ transition: 'y 1.2s ease, height 1.2s ease' }}
        />

        {/* Meniscus shine */}
        <ellipse cx="65" cy={fillY} rx="36" ry="3.5"
          fill={`rgba(${glowRgb},0.15)`}
          clipPath={`url(#${clipId})`}
          style={{ transition: 'cy 1.2s ease' }}
        />

        {/* Inner label lines for visual realism */}
        <line x1="36" y1="82" x2="94" y2="82" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        <line x1="36" y1="94" x2="94" y2="94" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        <line x1="36" y1="106" x2="80" y2="106" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>

        {/* Drip chamber body */}
        <line x1="65" y1="128" x2="65" y2="160" stroke={bc.tube} strokeWidth="3.5" strokeLinecap="round"/>
        <ellipse cx="65" cy="142" rx="8" ry="11"
          fill="rgba(15,23,42,0.75)"
          stroke={bc.stroke}
          strokeWidth="1"
        />
        {/* Fluid inside drip chamber */}
        {isActive && (
          <ellipse cx="65" cy="148" rx="5" ry="4"
            fill={bc.fill}
          />
        )}
      </svg>

      {/* Drip Drops zone — below tube end */}
      <div className="relative" style={{ height: 60, width: 24, marginTop: -16 }}>
        <AnimatePresence>
          {visibleDrops.map((drop) => (
            <motion.div
              key={drop.id}
              initial={{ y: 0, opacity: 1, scale: 0.7 }}
              animate={{ y: 52, opacity: [1, 0.8, 0], scale: [0.9, 1.1, 0.4] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 10,
                height: 14,
                borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                backgroundColor: `rgb(${glowRgb})`,
                boxShadow: `0 0 10px rgba(${glowRgb}, 0.9)`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Rate readout */}
      <motion.div
        key={`rate-${mlPerHr.toFixed(1)}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mt-3"
      >
        <span
          className="text-4xl font-black tabular-nums tracking-tight"
          style={{ color: `rgb(${glowRgb})`, textShadow: `0 0 20px rgba(${glowRgb}, 0.55)` }}
        >
          {mlPerHr < 1 ? mlPerHr.toFixed(2) : mlPerHr.toFixed(1)}
        </span>
        <span className="text-slate-400 text-sm font-semibold ml-1.5">mL/hr</span>
      </motion.div>
    </div>
  )
}
