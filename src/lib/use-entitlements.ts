import { useEffect, useState } from 'react'

const PAID_STATUSES = new Set(['active', 'trialing'])

export interface FeatureEntitlements {
  dripsCustomConcentrations: boolean
  lytesAdvancedProtocols: boolean
  notesCustomTemplates: boolean
  neuroNihss: boolean
  neodoseAdvancedPharmacy: boolean
}

type EntitlementFeatureKey = keyof FeatureEntitlements

interface EntitlementsResponse {
  plan?: string
  subscriptionStatus?: string
  features?: Partial<Record<EntitlementFeatureKey, boolean>>
}

const ALL_FEATURE_KEYS: EntitlementFeatureKey[] = [
  'dripsCustomConcentrations',
  'lytesAdvancedProtocols',
  'notesCustomTemplates',
  'neuroNihss',
  'neodoseAdvancedPharmacy',
]

export const FREE_ENTITLEMENTS: FeatureEntitlements = {
  dripsCustomConcentrations: false,
  lytesAdvancedProtocols: false,
  notesCustomTemplates: false,
  neuroNihss: false,
  neodoseAdvancedPharmacy: false,
}

const PRO_ENTITLEMENTS: FeatureEntitlements = {
  dripsCustomConcentrations: true,
  lytesAdvancedProtocols: true,
  notesCustomTemplates: true,
  neuroNihss: true,
  neodoseAdvancedPharmacy: true,
}

let cachedEntitlements: FeatureEntitlements | null = null
let inFlightRequest: Promise<FeatureEntitlements> | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parseEntitlementsResponse(payload: unknown): FeatureEntitlements {
  if (!isRecord(payload)) return FREE_ENTITLEMENTS

  const response = payload as EntitlementsResponse
  const isProPlan = response.plan === 'pro'
  const hasPaidStatus = typeof response.subscriptionStatus === 'string' && PAID_STATUSES.has(response.subscriptionStatus)

  const parsed: FeatureEntitlements = isProPlan || hasPaidStatus
    ? { ...PRO_ENTITLEMENTS }
    : { ...FREE_ENTITLEMENTS }

  const features = response.features
  if (!isRecord(features)) return parsed

  for (const key of ALL_FEATURE_KEYS) {
    const value = features[key]
    if (typeof value === 'boolean') parsed[key] = value
  }

  return parsed
}

async function fetchEntitlements(signal?: AbortSignal): Promise<FeatureEntitlements> {
  try {
    const response = await fetch('/api/entitlements', {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal,
    })
    if (!response.ok) return FREE_ENTITLEMENTS
    const payload = await response.json()
    return parseEntitlementsResponse(payload)
  } catch {
    return FREE_ENTITLEMENTS
  }
}

async function loadEntitlements(signal?: AbortSignal): Promise<FeatureEntitlements> {
  if (cachedEntitlements) return cachedEntitlements
  if (!inFlightRequest) {
    inFlightRequest = fetchEntitlements(signal)
      .then((entitlements) => {
        cachedEntitlements = entitlements
        return entitlements
      })
      .finally(() => {
        inFlightRequest = null
      })
  }
  return inFlightRequest
}

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<FeatureEntitlements>(cachedEntitlements ?? FREE_ENTITLEMENTS)
  const [isLoading, setIsLoading] = useState(cachedEntitlements === null)

  useEffect(() => {
    if (cachedEntitlements) return

    let active = true
    const controller = new AbortController()

    loadEntitlements(controller.signal).then((result) => {
      if (!active) return
      setEntitlements(result)
      setIsLoading(false)
    })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  const isPro = ALL_FEATURE_KEYS.some((key) => entitlements[key])

  return { entitlements, isLoading, isPro }
}
