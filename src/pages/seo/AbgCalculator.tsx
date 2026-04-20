import { lazy, Suspense } from 'react'
import SeoPageShell from '../../components/seo/SeoPageShell'

const TippingPoint = lazy(() => import('../../apps/TippingPoint'))

const TITLE = 'ABG Interpreter & Acid-Base Calculator | Shiftside'
const DESCRIPTION = 'Interpret arterial blood gas (ABG) results instantly. Identifies primary disturbance, expected compensation, and mixed disorders. Free bedside tool for ER, ICU, and hospitalists.'
const CANONICAL = 'https://utils.clinicianid.com/abg-calculator'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ABG Interpreter and Acid-Base Calculator',
  description: DESCRIPTION,
  url: CANONICAL,
  applicationCategory: 'MedicalApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function AbgCalculator() {
  return (
    <SeoPageShell
      title={TITLE}
      description={DESCRIPTION}
      canonical={CANONICAL}
      schema={schema}
      relatedTools={[
        { label: 'GCS Calculator', href: '/gcs-calculator' },
        { label: 'IV Drip Rates', href: '/drip-rate-calculator' },
        { label: 'Vasopressor Rates', href: '/pressor-rate-calculator' },
      ]}
    >
      <h1 className="text-3xl font-black text-white sm:text-4xl leading-tight mb-4">
        ABG Interpreter &amp; Acid-Base Calculator
      </h1>
      <p className="text-lg text-slate-400 leading-relaxed mb-8">
        Enter pH, PaCO₂, HCO₃⁻, and PaO₂ — get the primary disturbance, expected compensation,
        mixed disorder detection, and A-a gradient in seconds.
      </p>

      <Suspense fallback={<div className="h-64 rounded-2xl animate-pulse bg-slate-800/60" />}>
        <TippingPoint embedded />
      </Suspense>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">Acid-base interpretation steps</h2>
        <ol className="list-decimal list-outside pl-5 space-y-3 text-slate-400 text-sm leading-relaxed">
          <li><strong className="text-slate-200">Step 1 — Is the pH normal?</strong> &lt;7.35 = acidemia, &gt;7.45 = alkalemia</li>
          <li><strong className="text-slate-200">Step 2 — What is the primary disturbance?</strong> ↑PaCO₂ = respiratory acidosis; ↓PaCO₂ = respiratory alkalosis; ↓HCO₃⁻ = metabolic acidosis; ↑HCO₃⁻ = metabolic alkalosis</li>
          <li><strong className="text-slate-200">Step 3 — Is compensation appropriate?</strong> Use Winter's formula for metabolic acidosis, or the expected pCO₂ ranges for metabolic alkalosis.</li>
          <li><strong className="text-slate-200">Step 4 — Check for mixed disorders.</strong> If compensation is not as expected, a second primary process may be present.</li>
          <li><strong className="text-slate-200">Step 5 — Calculate anion gap</strong> if metabolic acidosis is present. AG = Na⁺ − (Cl⁻ + HCO₃⁻). Normal ≈ 12 ± 2.</li>
        </ol>

        <h3 className="text-lg font-bold text-white pt-4">Winter's formula (metabolic acidosis expected compensation)</h3>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-6 py-5 font-mono text-sm text-cyan-200">
          Expected PaCO₂ = 1.5 × HCO₃⁻ + 8 (±2)
        </div>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently asked questions</h2>
        {[
          {
            q: 'What values does the ABG calculator need?',
            a: 'pH, PaCO₂ (mmHg), HCO₃⁻ (mEq/L), and optionally PaO₂ (mmHg) and FiO₂ for A-a gradient calculation.',
          },
          {
            q: 'Can it detect mixed acid-base disorders?',
            a: 'Yes. The interpreter checks whether compensation falls within expected ranges using standard formulas. If it doesn\'t, it flags a possible mixed disorder.',
          },
          {
            q: 'What is the A-a gradient and why does it matter?',
            a: 'The alveolar-arterial oxygen gradient helps differentiate hypoxemia causes: a normal A-a gradient suggests hypoventilation, while an elevated gradient points toward V/Q mismatch, diffusion impairment, or shunt.',
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
