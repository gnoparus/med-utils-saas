import { lazy, Suspense } from 'react'
import SeoPageShell from '../../components/seo/SeoPageShell'

const DripDrop = lazy(() => import('../../apps/DripDrop'))

const TITLE = 'Vasopressor Rate Calculator | Shiftside'
const DESCRIPTION = 'Calculate vasopressor infusion rates (norepinephrine, epinephrine, dopamine, dobutamine, vasopressin) in mL/hr. Designed for ICU and ED nurses and physicians.'
const CANONICAL = 'https://utils.clinicianid.com/pressor-rate-calculator'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Vasopressor Rate Calculator',
  description: DESCRIPTION,
  url: CANONICAL,
  applicationCategory: 'MedicalApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function PresssorRateCalculator() {
  return (
    <SeoPageShell
      title={TITLE}
      description={DESCRIPTION}
      canonical={CANONICAL}
      schema={schema}
      relatedTools={[
        { label: 'IV Drip Rate (mL/hr)', href: '/drip-rate-calculator' },
        { label: 'Norepinephrine Drip', href: '/norepinephrine-drip-calculator' },
        { label: 'Epinephrine Drip', href: '/epinephrine-drip-calculator' },
        { label: 'mcg/kg/min → mL/hr', href: '/mcg-kg-min-to-ml-hr-calculator' },
      ]}
    >
      <h1 className="text-3xl font-black text-white sm:text-4xl leading-tight mb-4">
        Vasopressor Rate Calculator
      </h1>
      <p className="text-lg text-slate-400 leading-relaxed mb-8">
        Fast mL/hr calculations for norepinephrine, epinephrine, dopamine, dobutamine, phenylephrine,
        and vasopressin. Supports weight-based and fixed-rate infusion orders.
      </p>

      <Suspense fallback={<div className="h-64 rounded-2xl animate-pulse bg-slate-800/60" />}>
        <DripDrop embedded />
      </Suspense>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">Common vasopressor concentrations</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04] text-slate-400">
                <th className="px-4 py-3 text-left font-medium">Drug</th>
                <th className="px-4 py-3 text-left font-medium">Standard mix</th>
                <th className="px-4 py-3 text-left font-medium">Concentration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr><td className="px-4 py-3">Norepinephrine</td><td className="px-4 py-3">4 mg / 250 mL</td><td className="px-4 py-3">16 mcg/mL</td></tr>
              <tr><td className="px-4 py-3">Norepinephrine</td><td className="px-4 py-3">8 mg / 250 mL</td><td className="px-4 py-3">32 mcg/mL</td></tr>
              <tr><td className="px-4 py-3">Epinephrine</td><td className="px-4 py-3">4 mg / 250 mL</td><td className="px-4 py-3">16 mcg/mL</td></tr>
              <tr><td className="px-4 py-3">Dopamine</td><td className="px-4 py-3">400 mg / 250 mL</td><td className="px-4 py-3">1600 mcg/mL</td></tr>
              <tr><td className="px-4 py-3">Dobutamine</td><td className="px-4 py-3">500 mg / 250 mL</td><td className="px-4 py-3">2000 mcg/mL</td></tr>
              <tr><td className="px-4 py-3">Vasopressin</td><td className="px-4 py-3">20 units / 100 mL</td><td className="px-4 py-3">0.2 units/mL</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Concentrations vary by institution. Always confirm with your pharmacy before infusing.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently asked questions</h2>
        {[
          {
            q: 'What vasopressors does this calculator support?',
            a: 'Norepinephrine, epinephrine, dopamine, dobutamine, phenylephrine, vasopressin, and any custom drug with an entered concentration.',
          },
          {
            q: 'How is vasopressin calculated?',
            a: 'Vasopressin is typically ordered in units/min. The calculator converts to mL/hr using concentration (units/mL) and ×60 for the per-hour conversion.',
          },
          {
            q: 'Can I use this in the ICU and ED?',
            a: 'Yes. The calculator is designed for bedside use in time-critical settings. It has no account requirement and works offline as an installable web app.',
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
