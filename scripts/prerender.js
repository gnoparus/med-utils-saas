// Post-build script: pre-renders SEO pages using Vite SSR.
// Generates static HTML files that search crawlers can index.
// Run after: vite build && vite build --ssr src/entry-server.tsx --outDir dist/server

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

const SEO_ROUTES = [
  '/',
  '/drip-rate-calculator',
  '/mcg-kg-min-to-ml-hr-calculator',
  '/pressor-rate-calculator',
  '/norepinephrine-drip-calculator',
  '/epinephrine-drip-calculator',
  '/gcs-calculator',
  '/abg-calculator',
  '/pediatric-dose-calculator',
]

async function run() {
  const templatePath = resolve(rootDir, 'dist/index.html')
  const serverEntryPath = resolve(rootDir, '.ssr/entry-server.js')

  if (!existsSync(templatePath)) {
    console.error('Error: dist/index.html not found. Run `vite build` first.')
    process.exit(1)
  }
  if (!existsSync(serverEntryPath)) {
    console.error('Error: .ssr/entry-server.js not found. Run `vite build --ssr src/entry-server.tsx --outDir .ssr` first.')
    process.exit(1)
  }

  const template = readFileSync(templatePath, 'utf-8')
  const { render } = await import(serverEntryPath)

  // Snapshot the original Vite-built template before the loop overwrites dist/index.html
  const originalTemplate = template

  for (const route of SEO_ROUTES) {
    try {
      const appHtml = await render(route)
      // Inject server-rendered HTML into the root div
      const html = originalTemplate.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)

      const segments = route === '/' ? [] : route.split('/').filter(Boolean)
      const dir = resolve(rootDir, 'dist', ...segments)

      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

      writeFileSync(resolve(dir, 'index.html'), html, 'utf-8')
      console.log(`✓ Prerendered ${route}`)
    } catch (err) {
      console.error(`✗ Failed to prerender ${route}:`, err)
    }
  }

  console.log('\nPrerendering complete.')
}

run()
