import { describe, it, expect, vi, afterEach } from 'vitest'
import { triggerHaptic } from '../../src/lib/haptics'

describe('triggerHaptic', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls navigator.vibrate when reduced motion is not requested', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) })

    triggerHaptic(10)

    expect(vibrate).toHaveBeenCalledWith(10)
    vi.unstubAllGlobals()
  })

  it('does not call navigator.vibrate when prefers-reduced-motion is set', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) })

    triggerHaptic(10)

    expect(vibrate).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
