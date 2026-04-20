import { lazy, Suspense } from 'react'
import SeoPageShell from '../../components/seo/SeoPageShell'

const NeoDose = lazy(() => import('../../apps/NeoDose'))

const TITLE = 'Pediatric Weight-Based Dose Calculator | Shiftside'
const DESCRIPTION = 'Calculate weight-based pediatric medication doses (mg/kg) in seconds. Covers common emergency and inpatient drugs with standard dosing ranges for children.'
const CANONICAL = 'https://utils.clinicianid.com/pediatric-dose-calculator'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Pediatric Weight-Based Dose Calculator',
  description: DESCRIPTION,
  url: CANONICAL,
  applicationCategory: 'MedicalApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function PediatricDoseCalculator() {
  return (
    <SeoPageShell
      title={TITLE}
      description={DESCRIPTION}
      canonical={CANONICAL}
      schema={schema}
      relatedTools={[
        { label: 'IV Drip Rates', href: '/drip-rate-calculator' },
        { label: 'GCS Calculator', href: '/gcs-calculator' },
      ]}
    >
      <h1 className="text-3xl font-black text-white sm:text-4xl leading-tight mb-4">
        Pediatric Weight-Based Dose Calculator
      </h1>
      <p className="text-lg text-slate-400 leading-relaxed mb-8">
        Enter patient weight and drug — get the calculated dose in mg or mcg with standard
        dosing guidance. Designed for pediatric emergency, NICU, and general pediatric use.
      </p>

      <Suspense fallback={<div className="h-64 rounded-2xl animate-pulse bg-slate-800/60" />}>
        <NeoDose embedded />
      </Suspense>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">Weight-based dosing formula</h2>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-6 py-5 font-mono text-sm text-cyan-200">
          dose (mg) = dose_per_kg (mg/kg) × weight (kg)
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          For doses in mcg/kg, convert the result: 1 mg = 1,000 mcg.
          Always check the maximum safe dose (adult cap) — pediatric weight-based calculations
          can exceed adult doses in larger children.
        </p>

        <h3 className="text-lg font-bold text-white pt-2">Common pediatric drug caps</h3>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04] text-slate-400">
                <th className="px-4 py-3 text-left font-medium">Drug</th>
                <th className="px-4 py-3 text-left font-medium">Dose per kg</th>
                <th className="px-4 py-3 text-left font-medium">Max single dose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr><td className="px-4 py-3">Acetaminophen</td><td className="px-4 py-3">15 mg/kg</td><td className="px-4 py-3">1,000 mg</td></tr>
              <tr><td className="px-4 py-3">Ibuprofen</td><td className="px-4 py-3">10 mg/kg</td><td className="px-4 py-3">600 mg</td></tr>
              <tr><td className="px-4 py-3">Morphine</td><td className="px-4 py-3">0.05–0.1 mg/kg</td><td className="px-4 py-3">5 mg (non-opioid naive)</td></tr>
              <tr><td className="px-4 py-3">Ondansetron</td><td className="px-4 py-3">0.1 mg/kg</td><td className="px-4 py-3">4 mg</td></tr>
              <tr><td className="px-4 py-3">Dexamethasone</td><td className="px-4 py-3">0.6 mg/kg (croup)</td><td className="px-4 py-3">10 mg</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">Doses are approximate references. Confirm with current formulary and clinical guidelines.</p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently asked questions</h2>
        {[
          {
            q: 'What age range does this calculator cover?',
            a: 'Neonates through adolescents. For neonates &lt;1 kg, dosing should be reviewed by neonatology as renal and hepatic drug clearance differs significantly.',
          },
          {
            q: 'How do I handle estimated vs. actual weight?',
            a: 'Use actual weight when available. If unknown, use Broselow tape length-based weight estimation. Enter the estimated weight and note it as estimated in your documentation.',
          },
          {
            q: 'Does this calculator account for maximum doses?',
            a: 'Yes. The calculator flags when weight-based calculations exceed standard adult maximum doses for supported drugs.',
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
