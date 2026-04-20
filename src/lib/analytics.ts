// Analytics utility — wraps window.gtag for GA4
// Guards against window undefined (SSR / vite-react-ssg build)

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

function gtag(...args: unknown[]): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args)
  }
}

// ─── Typed event catalog ──────────────────────────────────────────────────────

export function trackLandingCtaClicked(ctaLabel: string): void {
  gtag('event', 'landing_cta_clicked', { cta_label: ctaLabel })
}

export function trackToolOpened(toolId: string): void {
  gtag('event', 'tool_opened', { tool_id: toolId })
}

export function trackFirstResultCompleted(toolId: string): void {
  gtag('event', 'first_result_completed', { tool_id: toolId })
}

export function trackPaywallViewed(toolId: string, feature: string): void {
  gtag('event', 'paywall_viewed', { tool_id: toolId, feature })
}

export function trackCheckoutStarted(plan: 'monthly' | 'annual'): void {
  gtag('event', 'checkout_started', { plan })
}

export function trackPurchaseCompleted(plan?: 'monthly' | 'annual'): void {
  gtag('event', 'purchase_completed', { plan })
}
