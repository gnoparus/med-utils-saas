/** Fires a haptic tick, honoring prefers-reduced-motion. Every navigator.vibrate call in the app should go through this. */
export function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  navigator.vibrate(pattern)
}
