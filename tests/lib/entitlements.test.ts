import { describe, expect, it } from 'vitest'
import { FREE_ENTITLEMENTS, parseEntitlementsResponse } from '../../src/lib/use-entitlements'

describe('parseEntitlementsResponse', () => {
  it('returns free entitlements when payload is invalid', () => {
    expect(parseEntitlementsResponse(null)).toEqual(FREE_ENTITLEMENTS)
    expect(parseEntitlementsResponse('bad payload')).toEqual(FREE_ENTITLEMENTS)
  })

  it('enables all pro features for active subscriptions', () => {
    const parsed = parseEntitlementsResponse({
      subscriptionStatus: 'active',
    })

    expect(parsed).toEqual({
      dripsCustomConcentrations: true,
      lytesAdvancedProtocols: true,
      notesCustomTemplates: true,
      neuroNihss: true,
      neodoseAdvancedPharmacy: true,
    })
  })

  it('allows server feature overrides', () => {
    const parsed = parseEntitlementsResponse({
      plan: 'pro',
      features: {
        notesCustomTemplates: false,
      },
    })

    expect(parsed.notesCustomTemplates).toBe(false)
    expect(parsed.dripsCustomConcentrations).toBe(true)
    expect(parsed.neuroNihss).toBe(true)
  })
})
