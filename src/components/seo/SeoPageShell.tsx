import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export interface RelatedTool {
  label: string
  href: string
}

interface SeoPageShellProps {
  /** <title> tag text */
  title: string
  /** meta description */
  description: string
  /** canonical URL */
  canonical: string
  /** JSON-LD schema object */
  schema?: Record<string, unknown>
  children: React.ReactNode
  relatedTools?: RelatedTool[]
}

export default function SeoPageShell({
  title,
  description,
  canonical,
  schema,
  children,
  relatedTools,
}: SeoPageShellProps) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    let descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!descMeta) {
      descMeta = document.createElement('meta')
      descMeta.name = 'description'
      document.head.appendChild(descMeta)
    }
    const prevDesc = descMeta.content
    descMeta.content = description

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonicalEl) {
      canonicalEl = document.createElement('link')
      canonicalEl.rel = 'canonical'
      document.head.appendChild(canonicalEl)
    }
    const prevCanonical = canonicalEl.href
    canonicalEl.href = canonical

    let schemaScript: HTMLScriptElement | null = null
    if (schema) {
      schemaScript = document.createElement('script')
      schemaScript.type = 'application/ld+json'
      schemaScript.textContent = JSON.stringify(schema)
      document.head.appendChild(schemaScript)
    }

    return () => {
      document.title = prevTitle
      if (descMeta) descMeta.content = prevDesc
      if (canonicalEl) canonicalEl.href = prevCanonical
      if (schemaScript) schemaScript.remove()
    }
  }, [title, description, canonical, schema])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            ← Shiftside
          </Link>
          <Link
            to="/dripdrop"
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200"
          >
            Open Tool <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {children}

        {/* Related tools */}
        {relatedTools && relatedTools.length > 0 && (
          <nav aria-label="Related calculators" className="mt-12 border-t border-white/8 pt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-4">Related calculators</p>
            <div className="flex flex-wrap gap-3">
              {relatedTools.map((t) => (
                <Link
                  key={t.href}
                  to={t.href}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:border-white/20 transition-colors"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Disclaimer */}
        <footer className="mt-10 rounded-[1.4rem] border border-red-400/14 bg-red-500/5 px-5 py-4">
          <div className="flex items-center gap-2 text-red-300 mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em]">Clinical Disclaimer</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            This calculator is designed to support clinical decision-making, not replace it. Always verify
            results against your institution's protocols, the patient's clinical context, and current drug
            references before making any clinical decisions. Never rely solely on automated calculations for
            critical medication dosing.
          </p>
        </footer>
      </main>
    </div>
  )
}
