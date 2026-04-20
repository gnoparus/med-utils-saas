import { lazy, Suspense } from 'react'
import SeoPageShell from '../../components/seo/SeoPageShell'

const NeuroSnap = lazy(() => import('../../apps/NeuroSnap'))

const TITLE = 'Glasgow Coma Scale (GCS) Calculator | Shiftside'
const DESCRIPTION = 'Bedside GCS calculator — tap E/V/M components and get the total score with severity interpretation. Free, offline-capable tool for emergency and critical care clinicians.'
const CANONICAL = 'https://utils.clinicianid.com/gcs-calculator'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Glasgow Coma Scale (GCS) Calculator',
  description: DESCRIPTION,
  url: CANONICAL,
  applicationCategory: 'MedicalApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function GcsCalculator() {
  return (
    <SeoPageShell
      title={TITLE}
      description={DESCRIPTION}
      canonical={CANONICAL}
      schema={schema}
      relatedTools={[
        { label: 'ABG Interpreter', href: '/abg-calculator' },
        { label: 'IV Drip Rates', href: '/drip-rate-calculator' },
      ]}
    >
      <h1 className="text-3xl font-black text-white sm:text-4xl leading-tight mb-4">
        Glasgow Coma Scale (GCS) Calculator
      </h1>
      <p className="text-lg text-slate-400 leading-relaxed mb-8">
        Score eye opening, verbal response, and motor response — get the total GCS with severity
        classification in one tap. Designed for rapid neurological assessment at the bedside.
      </p>

      <Suspense fallback={<div className="h-64 rounded-2xl animate-pulse bg-slate-800/60" />}>
        <NeuroSnap embedded />
      </Suspense>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">GCS scoring reference</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04] text-slate-400">
                <th className="px-4 py-3 text-left font-medium">Component</th>
                <th className="px-4 py-3 text-left font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr><td className="px-4 py-3">Eye (E)</td><td className="px-4 py-3">4</td><td className="px-4 py-3">Spontaneous</td></tr>
              <tr><td className="px-4 py-3">Eye (E)</td><td className="px-4 py-3">3</td><td className="px-4 py-3">To voice</td></tr>
              <tr><td className="px-4 py-3">Eye (E)</td><td className="px-4 py-3">2</td><td className="px-4 py-3">To pain</td></tr>
              <tr><td className="px-4 py-3">Eye (E)</td><td className="px-4 py-3">1</td><td className="px-4 py-3">No response</td></tr>
              <tr><td className="px-4 py-3">Verbal (V)</td><td className="px-4 py-3">5</td><td className="px-4 py-3">Oriented</td></tr>
              <tr><td className="px-4 py-3">Verbal (V)</td><td className="px-4 py-3">4</td><td className="px-4 py-3">Confused</td></tr>
              <tr><td className="px-4 py-3">Verbal (V)</td><td className="px-4 py-3">3</td><td className="px-4 py-3">Inappropriate words</td></tr>
              <tr><td className="px-4 py-3">Verbal (V)</td><td className="px-4 py-3">2</td><td className="px-4 py-3">Incomprehensible sounds</td></tr>
              <tr><td className="px-4 py-3">Verbal (V)</td><td className="px-4 py-3">1</td><td className="px-4 py-3">No response</td></tr>
              <tr><td className="px-4 py-3">Motor (M)</td><td className="px-4 py-3">6</td><td className="px-4 py-3">Obeys commands</td></tr>
              <tr><td className="px-4 py-3">Motor (M)</td><td className="px-4 py-3">5</td><td className="px-4 py-3">Localizes pain</td></tr>
              <tr><td className="px-4 py-3">Motor (M)</td><td className="px-4 py-3">4</td><td className="px-4 py-3">Withdraws</td></tr>
              <tr><td className="px-4 py-3">Motor (M)</td><td className="px-4 py-3">3</td><td className="px-4 py-3">Abnormal flexion</td></tr>
              <tr><td className="px-4 py-3">Motor (M)</td><td className="px-4 py-3">2</td><td className="px-4 py-3">Extensor response</td></tr>
              <tr><td className="px-4 py-3">Motor (M)</td><td className="px-4 py-3">1</td><td className="px-4 py-3">No response</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-bold text-white pt-4">Severity classification</h3>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04] text-slate-400">
                <th className="px-4 py-3 text-left font-medium">Total GCS</th>
                <th className="px-4 py-3 text-left font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr><td className="px-4 py-3">13–15</td><td className="px-4 py-3 text-emerald-400">Mild</td></tr>
              <tr><td className="px-4 py-3">9–12</td><td className="px-4 py-3 text-amber-400">Moderate</td></tr>
              <tr><td className="px-4 py-3">3–8</td><td className="px-4 py-3 text-red-400">Severe</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently asked questions</h2>
        {[
          {
            q: 'What is the minimum and maximum GCS score?',
            a: 'GCS ranges from 3 (no response in any component) to 15 (fully alert and oriented). A score of 3 does not necessarily indicate brain death.',
          },
          {
            q: 'When is GCS used clinically?',
            a: 'GCS is used on initial assessment and serial monitoring for traumatic brain injury, altered mental status, post-resuscitation neuro checks, and intubation decision criteria (GCS ≤8 is a common threshold).',
          },
          {
            q: 'How do I score an intubated patient?',
            a: 'Document Verbal component as "T" (intubated/tube). Most scoring systems record this as 1T and note the limitation. The calculator allows manual entry for intubated patients.',
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
