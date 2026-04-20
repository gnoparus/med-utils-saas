import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Clock3,
  Copy,
  Lock,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from 'lucide-react'
import { heroPreviewTools, shiftsideTools } from '../../content/shiftsideTools'
import {
  ANNUAL_PRICE,
  ANNUAL_SAVINGS_PCT,
  MONTHLY_PRICE,
  STRIPE_ANNUAL_URL,
  STRIPE_MONTHLY_URL,
} from '../../lib/billing'
import { trackCheckoutStarted, trackLandingCtaClicked } from '../../lib/analytics'

const PAGE_TITLE = 'Shiftside | Fastest Bedside Drip Workflow on Mobile'
const PAGE_DESCRIPTION =
  'Calculate IV drip rates in seconds. Norepi, epi, dopamine and more — mcg/kg/min to mL/hr, concentration-aware, offline. Free tier available with passwordless sign-in for Pro.'

// Index of DripDrop in heroPreviewTools (tools with .preview defined: Dose=0, Drips=1)
const DRIPS_HERO_INDEX = 1

const outcomeCards = [
  {
    title: 'Dose with confidence',
    body: 'Weight-based meds, resus doses, and quick calculations without mental math.',
  },
  {
    title: 'Make bedside calls faster',
    body: 'Drips, ABGs, lytes, and neuro scores in a thumb-first workflow.',
  },
  {
    title: 'Chart cleanly',
    body: 'Copy chart-ready text and order phrasing without switching contexts.',
  },
]

const comparison = {
  generic: [
    'Too many taps',
    'Desktop-feeling forms',
    'Results without context',
    'Requires login or app switching',
    'Hard to use during active care',
  ],
  shiftside: [
    'Thumb-first mobile inputs',
    'Immediate outputs',
    'Chart-ready copy where relevant',
    'Works offline',
    'No patient data stored',
  ],
}

const workflowHighlights = [
  {
    title: 'Pediatric resuscitation',
    body: 'Weight-based doses and shock settings without bedside arithmetic.',
    route: '/neodose',
    accent: '#67e8f9',
    previewLabel: 'Dose',
    previewValue: '0.18 mg',
    previewMeta: 'Epinephrine',
  },
  {
    title: 'Drip titration',
    body: 'Convert mcg/kg/min to mL/hr fast, with concentration-aware logic.',
    route: '/dripdrop',
    accent: '#93c5fd',
    previewLabel: 'Pump',
    previewValue: '18.9 mL/hr',
    previewMeta: 'Norepi @ 70 kg',
  },
  {
    title: 'Neuro checks',
    body: 'Tap to score GCS and advanced neuro scales without hunting through forms.',
    route: '/neurosnap',
    accent: '#86efac',
    previewLabel: 'Score',
    previewValue: '11 / 15',
    previewMeta: 'GCS running total',
  },
  {
    title: 'ABG and lytes',
    body: 'Interpret common acid-base and repletion scenarios faster.',
    route: '/tippingpoint',
    accent: '#fdba74',
    previewLabel: 'Read',
    previewValue: 'Mixed disorder',
    previewMeta: 'ABG + repletion context',
  },
]

const faqItems = [
  {
    question: 'Does Shiftside store patient data?',
    answer:
      'No. Shiftside is designed for fast bedside use without storing patient data.',
  },
  {
    question: 'Does it work offline?',
    answer:
      'Yes. Shiftside is built as an offline-capable PWA for unreliable signal and bad Wi-Fi moments.',
  },
  {
    question: 'Is this designed for phones?',
    answer:
      'Yes. The product is built mobile-first with thumb-friendly inputs, readable output, and shift-friendly spacing.',
  },
  {
    question: 'Who is Shiftside for?',
    answer:
      'Shiftside is built for ER, ICU, pediatric acute care, wards, residents, nurses, EMS, and trainees who need fast bedside support.',
  },
  {
    question: 'What’s included in Pro?',
    answer:
      'Shiftside Pro unlocks the full bedside toolkit, including advanced calculators, broader scoring, and full chart-ready copy tools.',
  },
  {
    question: 'Can I use it during training or on shift?',
    answer:
      'Yes. It is designed for both trainees and clinicians who need fast access during active care and charting.',
  },
]

const trustPills = ['Passwordless sign-in', 'Works offline', 'No patient data stored', 'Built for phone use']

function ensureDescriptionMeta() {
  let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'description'
    document.head.appendChild(meta)
  }
  return meta
}

function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'left',
}: {
  eyebrow?: string
  title: string
  body?: string
  align?: 'left' | 'center'
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-200/70">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display mt-3 text-3xl leading-tight text-white sm:text-4xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
          {body}
        </p>
      ) : null}
    </div>
  )
}

function PrimaryButton({
  to,
  children,
  onClick,
}: {
  to: string
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_60px_rgba(103,232,249,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

function GhostButton({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-100 transition-colors duration-200 hover:bg-white/[0.06]"
    >
      {children}
    </a>
  )
}

function HeroPreview() {
  const [activeIndex, setActiveIndex] = useState(DRIPS_HERO_INDEX)
  const activeCard = heroPreviewTools[activeIndex]
  const ActiveIcon = activeCard.icon

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroPreviewTools.length)
    }, 3200)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative mx-auto w-full max-w-[26rem]"
    >
      <div className="absolute -left-6 top-12 hidden h-28 w-28 rounded-full bg-cyan-300/14 blur-3xl sm:block" />
      <div className="absolute -right-3 bottom-10 h-36 w-36 rounded-full bg-emerald-300/12 blur-3xl" />

      <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/70 p-3 shadow-[0_32px_100px_rgba(2,6,23,0.72)] backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200/65">
              Toolkit preview
            </div>
            <div className="mt-1 text-sm font-medium text-slate-300">
              Open on shift. Move fast.
            </div>
          </div>
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200">
            Offline ready
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {heroPreviewTools.map((tool, index) => {
            const Icon = tool.icon
            const isActive = index === activeIndex

            return (
              <button
                key={tool.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="rounded-[1.2rem] border px-3 py-3 text-left transition-all duration-200"
                style={{
                  background: isActive ? `rgba(${tool.rgb},0.12)` : 'rgba(255,255,255,0.03)',
                  borderColor: isActive ? `rgba(${tool.rgb},0.3)` : 'rgba(255,255,255,0.08)',
                  boxShadow: isActive ? `0 12px 30px rgba(${tool.rgb},0.16)` : 'none',
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-2xl"
                  style={{ background: `rgba(${tool.rgb},0.12)`, color: tool.accent }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-3 text-xs font-semibold text-white">{tool.name.replace('Shiftside ', '')}</div>
                <div className="mt-1 text-[11px] leading-4 text-slate-400">{tool.usedIn}</div>
              </button>
            )
          })}
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,23,40,0.96),rgba(4,10,20,0.96))] px-4 pb-4 pt-3 shadow-inner shadow-black/20">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500/20" />
            </div>
            <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Thumb-first
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCard.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="min-h-[26rem] rounded-[1.7rem] border border-white/8 bg-slate-950/85 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[1.2rem]"
                    style={{ background: `rgba(${activeCard.rgb},0.14)`, color: activeCard.accent }}
                  >
                    <ActiveIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{activeCard.name}</div>
                    <div className="text-[11px] text-slate-400">{activeCard.subtitle}</div>
                  </div>
                </div>
                <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  No login
                </div>
              </div>

              <div
                className="mt-5 rounded-[1.6rem] border p-4"
                style={{
                  borderColor: `rgba(${activeCard.rgb},0.24)`,
                  background: `linear-gradient(135deg, rgba(${activeCard.rgb},0.11), rgba(15,23,42,0.42))`,
                }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300/70">
                  {activeCard.preview.label}
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {activeCard.preview.value}
                </div>
                <div className="mt-1 text-sm text-slate-300">{activeCard.preview.helper}</div>
              </div>

              <div className="mt-4 grid gap-2">
                {activeCard.preview.chips.map((chip) => (
                  <div
                    key={chip}
                    className="flex items-center justify-between rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-sm text-slate-200">{chip}</span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: activeCard.accent, boxShadow: `0 0 16px rgba(${activeCard.rgb},0.55)` }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div
                  className="flex-1 rounded-[1.25rem] border px-4 py-3 text-sm font-semibold"
                  style={{
                    background: `rgba(${activeCard.rgb},0.14)`,
                    borderColor: `rgba(${activeCard.rgb},0.24)`,
                    color: activeCard.accent,
                  }}
                >
                  {activeCard.preview.action}
                </div>
                <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Copy
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <Clock3 className="h-4 w-4" />
                  <span>{activeCard.preview.footer}</span>
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Built for phone use
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function ComparisonPanel({
  title,
  items,
  accent,
  icon: Icon,
}: {
  title: string
  items: string[]
  accent: string
  icon: LucideIcon
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[1.2rem]" style={{ background: `${accent}20`, color: accent }}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item} className="rounded-[1.2rem] border border-white/8 bg-slate-950/55 px-4 py-3 text-sm text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
      >
        <span className="text-sm font-semibold text-white sm:text-base">{question}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-slate-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-7 text-slate-300 sm:px-6">{answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const previousTitle = document.title
    const meta = ensureDescriptionMeta()
    const previousDescription = meta.content

    document.title = PAGE_TITLE
    meta.content = PAGE_DESCRIPTION

    return () => {
      document.title = previousTitle
      meta.content = previousDescription
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-transparent text-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.14),transparent_48%)]" />
        <div className="absolute right-0 top-40 h-[28rem] w-[28rem] bg-[radial-gradient(circle,rgba(52,211,153,0.1),transparent_52%)]" />
        <div className="absolute bottom-0 left-0 h-[22rem] w-[22rem] bg-[radial-gradient(circle,rgba(251,191,36,0.08),transparent_55%)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-200 shadow-[0_0_30px_rgba(103,232,249,0.12)]">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-white">Shiftside</div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">By ClinicianID</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <a href="#tools" className="transition-colors hover:text-white">Tools</a>
            <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
          </nav>

          <PrimaryButton to="/neodose">Open Shiftside</PrimaryButton>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/16 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-100/80">
                  FAST, OFFLINE, MOBILE-FIRST
                </div>
                <h1 className="font-display mt-6 max-w-xl text-5xl leading-[0.95] text-white sm:text-6xl lg:text-[4.6rem]">
                  The fastest bedside drip workflow on mobile.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  Convert mcg/kg/min to mL/hr in seconds — concentration-aware, offline, no login. Norepi, epi, dopamine and more. Then stay for ABGs, GCS, lytes, and chart-ready text.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton
                    to="/dripdrop"
                    onClick={() => trackLandingCtaClicked('hero_try_drips_free')}
                  >
                    Try Drips Free
                  </PrimaryButton>
                  <GhostButton href="#tools">See all tools</GhostButton>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {trustPills.map((pill) => (
                    <div
                      key={pill}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300"
                    >
                      {pill}
                    </div>
                  ))}
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100/80">
                  <ShieldCheck className="h-4 w-4" />
                  No login. No patient data. Works offline.
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  For ER, ICU, pediatrics, wards, and night shift workflows.
                </p>
              </motion.div>
            </div>

            <HeroPreview />
          </div>
        </section>

        <section className="border-y border-white/8 bg-white/[0.03]">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <SectionHeading
              title="What Shiftside helps you do in seconds"
            />

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {outcomeCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  className="rounded-[1.8rem] border border-white/10 bg-slate-950/60 p-5"
                >
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="tools" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            title="One toolkit for the moments clinicians actually feel friction"
            body="Generic medical calculators make you hunt, tap through clutter, and re-translate results into chart language. Shiftside is designed for shift use: fast inputs, readable outputs, and copy-ready results."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shiftsideTools.map((tool, index) => {
              const Icon = tool.icon

              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.04, duration: 0.32 }}
                >
                  <Link
                    to={tool.route}
                    className="group block rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-5 transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-[1.25rem]"
                        style={{ background: `rgba(${tool.rgb},0.12)`, color: tool.accent }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div
                        className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
                        style={{ borderColor: `rgba(${tool.rgb},0.2)`, color: tool.accent, background: `rgba(${tool.rgb},0.08)` }}
                      >
                        Used in {tool.usedIn}
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="text-xl font-semibold text-white">{tool.name}</h3>
                      <p className="mt-2 text-sm font-medium text-slate-200">{tool.subtitle}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-400">{tool.description}</p>
                    </div>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
                      Open module
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8 lg:py-6">
          <SectionHeading
            title="Built for stress, bad Wi-Fi, and one-handed use"
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <ComparisonPanel
              title="Generic calculator apps"
              items={comparison.generic}
              accent="#94a3b8"
              icon={WifiOff}
            />
            <ComparisonPanel
              title="Shiftside"
              items={comparison.shiftside}
              accent="#67e8f9"
              icon={Smartphone}
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            title="Start with the workflows clinicians reach for most"
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {workflowHighlights.map((workflow, index) => (
              <motion.div
                key={workflow.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05, duration: 0.32 }}
              >
                <Link
                  to={workflow.route}
                  className="group block rounded-[2rem] border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="rounded-[1.6rem] border border-white/8 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                        {workflow.previewLabel}
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
                        style={{ background: `${workflow.accent}18`, color: workflow.accent }}
                      >
                        Fast path
                      </div>
                    </div>
                    <div className="mt-4 text-2xl font-semibold text-white">{workflow.previewValue}</div>
                    <div className="mt-2 text-sm text-slate-400">{workflow.previewMeta}</div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      {['Readable output', 'Thumb input', 'Shift-ready', 'Copy-ready'].map((chip) => (
                        <div key={chip} className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {chip}
                        </div>
                      ))}
                    </div>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{workflow.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{workflow.body}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8 lg:py-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <SectionHeading
                title="Not just results. Chart-ready output."
                body="Most calculators stop at the number. Shiftside helps clinicians turn scores and calculations into usable chart language without breaking focus."
              />
              <div className="mt-6">
                <Link
                  to="/chartninja"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-100"
                >
                  Open Shiftside Notes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className="rounded-[1.6rem] border border-white/8 bg-slate-950/80 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Shiftside Notes</div>
                    <div className="mt-2 text-lg font-semibold text-white">Chart-ready output preview</div>
                  </div>
                  <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                    Copy-ready
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    {
                      label: 'WELLS',
                      result: 'Low risk',
                      text: 'WELLS score suggests low risk for PE. Clinical decision-making remains guided by overall presentation.',
                    },
                    {
                      label: 'Lytes',
                      result: 'K 3.1',
                      text: 'Potassium repletion recommendation: oral or IV replacement per severity and local protocol.',
                    },
                    {
                      label: 'Neuro',
                      result: 'GCS 11',
                      text: 'GCS total 11 with component scores documented and ready for charting.',
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</div>
                        <div className="text-sm font-semibold text-white">{item.result}</div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Copy className="h-4 w-4 text-emerald-300" />
                    Copy for chart
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    No context switching
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            title="Free essentials. Pro for every shift."
            align="center"
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {/* ── Free card ── */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Free Essentials</div>
                  <div className="mt-2 text-4xl font-semibold text-white">$0</div>
                  <div className="mt-1 text-xs text-slate-500">Free forever. No login.</div>
                </div>
                <div className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                  Open now
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {[
                  'Drips: standard concentrations',
                  'Neuro: GCS only',
                  'ABG: basic interpretation',
                  'Installable PWA',
                  'Offline. No login. No patient data.',
                ].map((item) => (
                  <div key={item} className="rounded-[1.2rem] border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <PrimaryButton
                  to="/dripdrop"
                  onClick={() => trackLandingCtaClicked('pricing_open_drips_free')}
                >
                  Open Drips Free
                </PrimaryButton>
              </div>
            </div>

            {/* ── Pro card ── */}
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(103,232,249,0.09),rgba(15,23,42,0.26))] p-6 shadow-[0_30px_90px_rgba(103,232,249,0.12)]">
              <div className="absolute right-0 top-0 h-40 w-40 bg-[radial-gradient(circle,rgba(103,232,249,0.14),transparent_58%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-100/70">Shiftside Pro</div>
                  <div className="mt-2 text-4xl font-semibold text-white">{MONTHLY_PRICE}<span className="text-xl text-slate-400">/mo</span></div>
                  <div className="mt-1 text-xs text-slate-400">{ANNUAL_PRICE}/yr <span className="text-emerald-300">— save {ANNUAL_SAVINGS_PCT}</span></div>
                </div>
                <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100 shrink-0">
                  Full toolkit
                </div>
              </div>
              <div className="relative mt-6 grid gap-3">
                {[
                  'Full Drips — custom concentrations',
                  'Full NeoDose — all weight-based modes',
                  'Full ABG — advanced acid-base modes',
                  'LytesOut — electrolyte repletion',
                  'NIHSS and advanced neuro scales',
                  'Notes and chart-ready copy tools',
                  'Every future bedside tool',
                ].map((item) => (
                  <div key={item} className="rounded-[1.2rem] border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-slate-100">
                    {item}
                  </div>
                ))}
              </div>
              <div className="relative mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={STRIPE_MONTHLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCheckoutStarted('monthly')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  <Lock className="h-4 w-4" />
                  Monthly — {MONTHLY_PRICE}
                </a>
                <a
                  href={STRIPE_ANNUAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCheckoutStarted('annual')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/22 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100"
                >
                  Annual — {ANNUAL_PRICE} <span className="text-emerald-300 text-xs">save {ANNUAL_SAVINGS_PCT}</span>
                </a>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm leading-7 text-slate-400">
            For departments, training programs, or bulk access, contact us.
          </p>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8 lg:py-6">
          <SectionHeading
            title="FAQ"
          />

          <div className="mt-8 grid gap-3">
            {faqItems.map((item, index) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq((current) => (current === index ? null : index))}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-16 max-w-6xl border-t border-white/8 px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pb-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-lg font-semibold text-white">Shiftside</div>
            <p className="mt-3 max-w-sm text-sm leading-7 text-slate-400">
              Fast bedside calculators and chart-ready clinical tools for urgent care teams.
            </p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Shiftside by ClinicianID
            </p>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Product links</div>
            <div className="mt-4 grid gap-2 text-sm text-slate-300">
              {shiftsideTools.map((module) => (
                <Link key={module.name} to={module.route} className="transition-colors hover:text-white">
                  {module.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Explore</div>
            <div className="mt-4 grid gap-2 text-sm text-slate-300">
              <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
              <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
              <div>Contact ClinicianID</div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-sm leading-7 text-slate-500">
          For licensed clinicians and trainees. Verify calculations against local protocols.
        </p>
      </footer>

      <div className="fixed inset-x-4 bottom-4 z-50 md:hidden">
        <Link
          to="/dripdrop"
          onClick={() => trackLandingCtaClicked('mobile_sticky_try_drips')}
          className="flex items-center justify-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_24px_70px_rgba(103,232,249,0.22)]"
        >
          Try Drips Free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
