import { lazy, Suspense } from 'react'
import SeoPageShell from '../../components/seo/SeoPageShell'

const DripDrop = lazy(() => import('../../apps/DripDrop'))

const TITLE = 'Epinephrine Drip Rate Calculator | Shiftside'
const DESCRIPTION = 'Calculate epinephrine infusion rates in mL/hr from mcg/kg/min or mcg/min. Free bedside calculator for cardiac arrest, anaphylaxis, and shock resuscitation.'
const CANONICAL = 'https://utils.clinicianid.com/epinephrine-drip-calculator'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Epinephrine Drip Rate Calculator',
  description: DESCRIPTION,
  url: CANONICAL,
  applicationCategory: 'MedicalApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function EpinephrineDripCalculator() {
  return (
    <SeoPageShell
      title={TITLE}
      description={DESCRIPTION}
      canonical={CANONICAL}
      schema={schema}
      relatedTools={[
        { label: 'Norepinephrine Drip', href: '/norepinephrine-drip-calculator' },
        { label: 'Vasopressor Rates', href: '/pressor-rate-calculator' },
        { label: 'IV Drip Rate (mL/hr)', href: '/drip-rate-calculator' },
      ]}
    >
      <h1 className="text-3xl font-black text-white sm:text-4xl leading-tight mb-4">
        Epinephrine Drip Rate Calculator
      </h1>
      <p className="text-lg text-slate-400 leading-relaxed mb-8">
        Fast epinephrine infusion math for cardiogenic shock, anaphylaxis, and post-ROSC care.
        Supports mcg/kg/min and mcg/min orders with any concentration.
      </p>

      <Suspense fallback={<div className="h-64 rounded-2xl animate-pulse bg-slate-800/60" />}>
        <DripDrop embedded />
      </Suspense>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">Epinephrine dose ranges</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04] text-slate-400">
                <th className="px-4 py-3 text-left font-medium">Indication</th>
                <th className="px-4 py-3 text-left font-medium">Typical dose range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr><td className="px-4 py-3">Cardiogenic shock</td><td className="px-4 py-3">0.01–0.5 mcg/kg/min</td></tr>
              <tr><td className="px-4 py-3">Anaphylaxis infusion</td><td className="px-4 py-3">1–10 mcg/min</td></tr>
              <tr><td className="px-4 py-3">Post-ROSC vasopressor</td><td className="px-4 py-3">0.05–0.5 mcg/kg/min</td></tr>
              <tr><td className="px-4 py-3">Low-dose inotrope</td><td className="px-4 py-3">0.01–0.05 mcg/kg/min</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">Ranges are approximate. Titrate to clinical response per your protocol.</p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">Formula</h2>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-6 py-5 font-mono text-sm text-cyan-200">
          mL/hr = (mcg/kg/min × kg × 60) ÷ mcg/mL
        </div>
        <p className="text-slate-400 text-sm">
          Standard mix: 4 mg in 250 mL D5W = 16 mcg/mL.
          For fixed-rate (mcg/min): mL/hr = (mcg/min × 60) ÷ mcg/mL.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently asked questions</h2>
        {[
          {
            q: 'What\'s the standard epinephrine concentration for infusion?',
            a: '4 mg in 250 mL D5W is common (16 mcg/mL). Some institutions use 1 mg in 250 mL (4 mcg/mL) for lower-dose infusions in anaphylaxis.',
          },
          {
            q: 'Can I calculate epinephrine in mcg/min instead of mcg/kg/min?',
            a: 'Yes — select the mcg/min mode in the calculator. The formula drops the weight term and computes mL/hr from mcg/min directly.',
          },
          {
            q: 'Is this safe to use for pediatric patients?',
            a: 'Enter the patient\'s actual weight in kg for accurate weight-based dosing. Pediatric concentrations vary significantly — always confirm with your pharmacy and institutional protocols.',
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
