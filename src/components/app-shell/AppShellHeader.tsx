import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home } from 'lucide-react'
import {
  getShiftsideTool,
  isShiftsideToolRoute,
  shiftsideTools,
  type ShiftsideToolId,
} from '../../content/shiftsideTools'

interface AppShellHeaderProps {
  toolId: ShiftsideToolId
  rightSlot?: ReactNode
}

const FADE_EDGE = '2rem'
const NAV_FADE: Record<string, string | undefined> = {
  both: `linear-gradient(to right, transparent, black ${FADE_EDGE}, black calc(100% - ${FADE_EDGE}), transparent)`,
  left: `linear-gradient(to right, transparent, black ${FADE_EDGE})`,
  right: `linear-gradient(to right, black calc(100% - ${FADE_EDGE}), transparent)`,
  none: undefined,
}

export function AppShellHeader({ toolId, rightSlot }: AppShellHeaderProps) {
  const location = useLocation()
  const activeTool = getShiftsideTool(toolId)
  const ActiveIcon = activeTool.icon
  const navRef = useRef<HTMLElement>(null)
  const [navFade, setNavFade] = useState<'both' | 'left' | 'right' | 'none'>('none')

  useEffect(() => {
    const el = navRef.current
    if (!el) return

    const updateFade = () => {
      const canScrollLeft = el.scrollLeft > 1
      const canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 1

      if (canScrollLeft && canScrollRight) setNavFade('both')
      else if (canScrollRight) setNavFade('right')
      else if (canScrollLeft) setNavFade('left')
      else setNavFade('none')
    }

    updateFade()
    el.addEventListener('scroll', updateFade, { passive: true })
    window.addEventListener('resize', updateFade)
    return () => {
      el.removeEventListener('scroll', updateFade)
      window.removeEventListener('resize', updateFade)
    }
  }, [])

  return (
    <div className="sticky top-0 z-30 shrink-0 border-b border-white/8 bg-slate-950/84 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.85rem)] backdrop-blur-xl">
      <div className="grid grid-cols-[6rem_1fr_6rem] items-center gap-3">
        <div className="flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 outline-hidden transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>

        <div className="min-w-0 text-center">
          <div className="flex items-center justify-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-2xl"
              style={{
                background: `rgba(${activeTool.rgb},0.14)`,
                color: activeTool.accent,
                boxShadow: `0 0 24px rgba(${activeTool.rgb},0.12)`,
              }}
            >
              <ActiveIcon className="h-4 w-4" />
            </div>
            <h1 className="truncate text-lg font-black tracking-tight text-white">
              {activeTool.name}
            </h1>
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">
            {activeTool.subtitle}
          </p>
        </div>

        <div className="flex min-h-10 items-center justify-end">
          {rightSlot ?? <div className="h-10 w-10" aria-hidden="true" />}
        </div>
      </div>

      <nav
        ref={navRef}
        aria-label="Switch Shiftside tools"
        className="-mx-4 mt-4 overflow-x-auto px-4 pb-1 scrollbar-none"
        style={{ maskImage: NAV_FADE[navFade], WebkitMaskImage: NAV_FADE[navFade] }}
      >
        <div className="flex min-w-max gap-2.5">
          {shiftsideTools.map((tool) => {
            const isActive = isShiftsideToolRoute(location.pathname, tool)

            return (
              <Link
                key={tool.id}
                to={tool.route}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Open ${tool.name}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] outline-hidden transition-all duration-200 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
                style={
                  isActive
                    ? {
                        background: `rgba(${tool.rgb},0.16)`,
                        borderColor: `rgba(${tool.rgb},0.34)`,
                        color: tool.accent,
                        boxShadow: `0 0 20px rgba(${tool.rgb},0.3)`,
                        outlineColor: tool.accent,
                      }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        color: '#94a3b8',
                        outlineColor: tool.accent,
                      }
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: isActive ? tool.accent : 'rgba(148,163,184,0.55)',
                    boxShadow: isActive ? `0 0 12px rgba(${tool.rgb},0.55)` : 'none',
                  }}
                />
                {tool.shortLabel}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
