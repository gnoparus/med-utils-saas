import { lazy, Suspense } from 'react'
import SeoPageShell from '../../components/seo/SeoPageShell'

const DripDrop = lazy(() => import('../../apps/DripDrop'))

const TITLE = 'mcg/kg/min to mL/hr Converter | Shiftside'
const DESCRIPTION = 'Instantly convert mcg/kg/min to mL/hr for any weight and drug concentration. Free bedside converter for vasopressors, inotropes, and continuous infusions.'
const CANONICAL = 'https://utils.clinicianid.com/mcg-kg-min-to-ml-hr-calculator'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'mcg/kg/min to mL/hr Converter',
  description: DESCRIPTION,
  url: CANONICAL,
  applicationCategory: 'MedicalApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function McgKgMinCalculator() {
  return (
    <SeoPageShell
      title={TITLE}
      description={DESCRIPTION}
      canonical={CANONICAL}
      schema={schema}
      relatedTools={[
        { label: 'IV Drip Rate (mL/hr)', href: '/drip-rate-calculator' },
        { label: 'Vasopressor Rates', href: '/pressor-rate-calculator' },
        { label: 'Norepinephrine Drip', href: '/norepinephrine-drip-calculator' },
      ]}
    >
      <h1 className="text-3xl font-black text-white sm:text-4xl leading-tight mb-4">
        mcg/kg/min to mL/hr Converter
      </h1>
      <p className="text-lg text-slate-400 leading-relaxed mb-8">
        Weight-based infusion math done in seconds. Enter dose in mcg/kg/min, patient weight, and
        drug concentration — get a pump-ready mL/hr value.
      </p>

      <Suspense fallback={<div className="h-64 rounded-2xl animate-pulse bg-slate-800/60" />}>
        <DripDrop embedded />
      </Suspense>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">The formula</h2>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-6 py-5 font-mono text-sm text-cyan-200">
          mL/hr = (mcg/kg/min × kg × 60) ÷ mcg/mL
        </div>
        <p className="text-slate-400 leading-relaxed text-sm">
          The ×60 converts minutes to hours. Concentration (mcg/mL) is derived from the amount of drug
          dissolved in the total bag volume — e.g., 4 mg dopamine in 250 mL = 16 mcg/mL.
        </p>

        <h3 className="text-lg font-bold text-white pt-2">Common mistakes</h3>
        <ul className="text-slate-400 text-sm leading-relaxed space-y-2 list-disc list-outside pl-5">
          <li>Forgetting to convert mg to mcg before dividing (×1000).</li>
          <li>Using total drug amount instead of concentration per mL.</li>
          <li>Not updating weight when patient weight changes post-admission.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently asked questions</h2>
        {[
          {
            q: 'Why does the formula multiply by 60?',
            a: 'Pump rates are in mL/hr but the dose is ordered per minute. Multiplying by 60 min/hr converts the dose to a per-hour value before dividing by concentration.',
          },
          {
            q: 'What if my drug is ordered in mcg/min, not mcg/kg/min?',
            a: 'Select the "mcg/min" unit mode. The formula then drops the weight term: mL/hr = (mcg/min × 60) ÷ mcg/mL.',
          },
          {
            q: 'How do I handle titrations?',
            a: 'Simply update the dose field — the mL/hr result updates instantly. No recalculating needed during titration events.',
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
