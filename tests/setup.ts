/**
 * tests/setup.ts
 *
 * Global test setup for Vitest + Testing Library.
 * - Registers jest-dom matchers via @testing-library/jest-dom
 * - Provides a few lightweight DOM mocks commonly needed in JSDOM tests:
 *   - window.matchMedia
 *   - global ResizeObserver
 *
 * This file is referenced by vitest.config.ts -> setupFiles
 */

import '@testing-library/jest-dom'
import { beforeAll, afterAll } from 'vitest'

/**
 * Minimal matchMedia polyfill useful for components that read prefers-reduced-motion
 * or other media queries during render.
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {}, // deprecated
        removeListener: () => {}, // deprecated
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }
    },
  })
}

/**
 * Lightweight ResizeObserver mock for tests that mount components using layout effects
 * or libraries that rely on ResizeObserver. Tests can override this mock via vi.spyOn
 * or provide a more advanced implementation where needed.
 */
declare global {
  // allow assigning on globalThis in TypeScript
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      ResizeObserver?: any
    }
  }
}

if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  class FakeResizeObserver {
    observe(_: Element) {
      return
    }
    unobserve(_: Element) {
      return
    }
    disconnect() {
      return
    }
  }
  ;(globalThis as any).ResizeObserver = FakeResizeObserver
}

/**
 * Optionally silence excessive console output during tests by uncommenting these.
 * You can re-enable specific logs in individual tests with `vi.restoreAllMocks()`.
 */
// const originalConsoleError = console.error
// beforeAll(() => {
//   // console.error = (...args: unknown[]) => { /* swallow or route to test logger */ }
// })
// afterAll(() => {
//   console.error = originalConsoleError
// })

export {}
