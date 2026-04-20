// Server-side render entry for prerendering SEO pages.
// Each SEO page component is rendered directly (no App routing) so that
// StaticRouter context is cleanly consumed by Link/NavLink components.
// Used by scripts/prerender.js during the build process only.
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { Writable } from 'node:stream'
import { StaticRouter } from 'react-router-dom'

// Direct (non-lazy) imports for SSR — tool components inside pages are lazy-gated
import { LandingPage } from './components/landing'
import DripRateCalculator from './pages/seo/DripRateCalculator'
import McgKgMinCalculator from './pages/seo/McgKgMinCalculator'
import PresssorRateCalculator from './pages/seo/PresssorRateCalculator'
import NorepinephrineDripCalculator from './pages/seo/NorepinephrineDripCalculator'
import EpinephrineDripCalculator from './pages/seo/EpinephrineDripCalculator'
import GcsCalculator from './pages/seo/GcsCalculator'
import AbgCalculator from './pages/seo/AbgCalculator'
import PediatricDoseCalculator from './pages/seo/PediatricDoseCalculator'

const PAGE_MAP: Record<string, React.ComponentType> = {
  '/': LandingPage,
  '/drip-rate-calculator': DripRateCalculator,
  '/mcg-kg-min-to-ml-hr-calculator': McgKgMinCalculator,
  '/pressor-rate-calculator': PresssorRateCalculator,
  '/norepinephrine-drip-calculator': NorepinephrineDripCalculator,
  '/epinephrine-drip-calculator': EpinephrineDripCalculator,
  '/gcs-calculator': GcsCalculator,
  '/abg-calculator': AbgCalculator,
  '/pediatric-dose-calculator': PediatricDoseCalculator,
}

export function render(url: string): Promise<string> {
  const PageComponent = PAGE_MAP[url]
  if (!PageComponent) return Promise.resolve('')

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    const writable = new Writable({
      write(chunk: Buffer | string, _encoding: string, callback: () => void) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        callback()
      },
      final(callback: () => void) {
        resolve(Buffer.concat(chunks).toString('utf-8'))
        callback()
      },
    })

    const { pipe } = renderToPipeableStream(
      <StaticRouter location={url}>
        <PageComponent />
      </StaticRouter>,
      {
        onShellReady() {
          pipe(writable)
        },
        onShellError(err: unknown) {
          reject(err)
        },
      },
    )
  })
}
