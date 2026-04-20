import { lazy, Suspense } from 'react'
import SeoPageShell from '../../components/seo/SeoPageShell'

const DripDrop = lazy(() => import('../../apps/DripDrop'))

const TITLE = 'Norepinephrine Drip Rate Calculator | Shiftside'
const DESCRIPTION = 'Calculate norepinephrine infusion rates in mL/hr from mcg/kg/min. Supports 4 mg/250 mL and 8 mg/250 mL standard concentrations and custom mixes.'
const CANONICAL = 'https://utils.clinicianid.com/norepinephrine-drip-calculator'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Norepinephrine Drip Rate Calculator',
  description: DESCRIPTION,
  url: CANONICAL,
  applicationCategory: 'MedicalApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function NorepinephrineDripCalculator() {
  return (
    <SeoPageShell
      title={TITLE}
      description={DESCRIPTION}
      canonical={CANONICAL}
      schema={schema}
      relatedTools={[
        { label: 'Vasopressor Rates', href: '/pressor-rate-calculator' },
        { label: 'Epinephrine Drip', href: '/epinephrine-drip-calculator' },
        { label: 'IV Drip Rate (mL/hr)', href: '/drip-rate-calculator' },
      ]}
    >
      <h1 className="text-3xl font-black text-white sm:text-4xl leading-tight mb-4">
        Norepinephrine Drip Rate Calculator
      </h1>
      <p className="text-lg text-slate-400 leading-relaxed mb-8">
        Titrate levophed precisely — enter dose in mcg/kg/min and patient weight to get the mL/hr pump
        rate for your norepinephrine bag. Supports 4 mg/250 mL, 8 mg/250 mL, and custom concentrations.
      </p>

      <Suspense fallback={<div className="h-64 rounded-2xl animate-pulse bg-slate-800/60" />}>
        <DripDrop embedded />
      </Suspense>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">Norepinephrine quick reference</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04] text-slate-400">
                <th className="px-4 py-3 text-left font-medium">Dose (mcg/kg/min)</th>
                <th className="px-4 py-3 text-left font-medium">Clinical target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr><td className="px-4 py-3">0.01–0.1</td><td className="px-4 py-3">Low — MAP support, septic shock start</td></tr>
              <tr><td className="px-4 py-3">0.1–0.5</td><td className="px-4 py-3">Moderate — refractory hypotension</td></tr>
              <tr><td className="px-4 py-3">&gt;0.5</td><td className="px-4 py-3">High — consider second pressor</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">Ranges are general ICU references. Titrate to MAP target per your institution's sepsis protocol.</p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">Formula</h2>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-6 py-5 font-mono text-sm text-cyan-200">
          mL/hr = (mcg/kg/min × kg × 60) ÷ mcg/mL
        </div>
        <p className="text-slate-400 text-sm">
          For standard 4 mg in 250 mL bag: concentration = 16 mcg/mL.
          For standard 8 mg in 250 mL bag: concentration = 32 mcg/mL.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently asked questions</h2>
        {[
          {
            q: 'What is levophed\'s standard concentration?',
            a: '4 mg in 250 mL D5W gives 16 mcg/mL. Double-strength (8 mg/250 mL = 32 mcg/mL) is common in fluid-restricted ICU patients.',
          },
          {
            q: 'How often do I titrate norepinephrine?',
            a: 'Typically every 5–15 minutes per MAP response in septic shock (Surviving Sepsis Campaign). Adjust to maintain target MAP ≥65 mmHg.',
          },
          {
            q: 'Can I use this for post-cardiac surgery patients?',
            a: 'Yes. Enter the concentration your cardiac surgery unit uses — the formula is the same regardless of indication.',
          },
        ].map(({ q, a }) => (
          <div key={q}>
            <h3 className="font-semibold text-slate-100 mb-2">{q}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
          </div>
        ))}
      </section>
    </SeoPageShell>
  )
}
