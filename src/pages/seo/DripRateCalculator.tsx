import { lazy, Suspense } from 'react'
import SeoPageShell from '../../components/seo/SeoPageShell'

const DripDrop = lazy(() => import('../../apps/DripDrop'))

const TITLE = 'IV Drip Rate Calculator (mL/hr) | Shiftside'
const DESCRIPTION = 'Calculate IV drip rates in mL/hr from mcg/kg/min, mcg/min, or mg/hr. Free bedside clinical calculator for nurses, pharmacists, and critical care clinicians.'
const CANONICAL = 'https://utils.clinicianid.com/drip-rate-calculator'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'IV Drip Rate Calculator',
  description: DESCRIPTION,
  url: CANONICAL,
  applicationCategory: 'MedicalApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function DripRateCalculator() {
  return (
    <SeoPageShell
      title={TITLE}
      description={DESCRIPTION}
      canonical={CANONICAL}
      schema={schema}
      relatedTools={[
        { label: 'mcg/kg/min → mL/hr', href: '/mcg-kg-min-to-ml-hr-calculator' },
        { label: 'Vasopressor Rates', href: '/pressor-rate-calculator' },
        { label: 'Norepinephrine Drip', href: '/norepinephrine-drip-calculator' },
        { label: 'Epinephrine Drip', href: '/epinephrine-drip-calculator' },
      ]}
    >
      <h1 className="text-3xl font-black text-white sm:text-4xl leading-tight mb-4">
        IV Drip Rate Calculator (mL/hr)
      </h1>
      <p className="text-lg text-slate-400 leading-relaxed mb-8">
        Convert any IV infusion order — mcg/kg/min, mcg/min, or mg/hr — to a pump rate in mL/hr.
        Handles vasopressors, inotropes, analgesics, and custom concentrations at the bedside.
      </p>

      {/* Interactive tool */}
      <Suspense fallback={<div className="h-64 rounded-2xl animate-pulse bg-slate-800/60" />}>
        <DripDrop embedded />
      </Suspense>

      {/* Formula */}
      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">How to calculate an IV drip rate</h2>
        <p className="text-slate-400 leading-relaxed">
          For a weight-based infusion ordered in <strong className="text-slate-200">mcg/kg/min</strong>:
        </p>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-6 py-5 font-mono text-sm text-cyan-200">
          mL/hr = (dose × weight × 60) ÷ concentration
        </div>
        <p className="text-slate-400 leading-relaxed text-sm">
          Where <em>dose</em> is in mcg/kg/min, <em>weight</em> is in kg, 60 converts minutes to hours,
          and <em>concentration</em> is in mcg/mL (e.g., 8 mg in 250 mL = 32 mcg/mL).
        </p>

        <h3 className="text-lg font-bold text-white pt-2">Worked example</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Norepinephrine 0.1 mcg/kg/min for a 70 kg patient. Standard concentration: 8 mg in 250 mL = 32 mcg/mL.
        </p>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-6 py-5 font-mono text-sm text-slate-200 space-y-1">
          <p>= (0.1 mcg/kg/min × 70 kg × 60 min/hr) ÷ 32 mcg/mL</p>
          <p>= 420 ÷ 32</p>
          <p className="text-cyan-300 font-bold">= 13.1 mL/hr</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently asked questions</h2>
        {[
          {
            q: 'What units does this calculator support?',
            a: 'mcg/kg/min (weight-based), mcg/min (fixed rate), mg/hr, and mL/hr pass-through. All convert to a pump-ready mL/hr value.',
          },
          {
            q: 'How do I change the drug concentration?',
            a: 'Enter your custom concentration (mg per total bag volume in mL) under the concentration field. The calculator recalculates the mL/hr rate instantly.',
          },
          {
            q: 'Is this calculator clinically validated?',
            a: 'The underlying math follows standard pharmacokinetic unit conversion formulas. Always verify results with your institution\'s protocols and double-check with a colleague before titrating vasoactive drugs.',
          },
          {
            q: 'Does it work offline?',
            a: 'Yes. Shiftside is a Progressive Web App (PWA). Install it once from your browser and use it at the bedside without a network connection.',
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
