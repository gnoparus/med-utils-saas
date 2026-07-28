import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { trackPurchaseCompleted } from '../lib/analytics'

export default function ThankYou() {
  useEffect(() => {
    trackPurchaseCompleted()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-black text-white mb-3">You're on Pro!</h1>
        <p className="text-base text-slate-400 leading-relaxed mb-8">
          Welcome to Shiftside Pro. Use your passwordless email sign-in to load your subscription entitlements across devices.
        </p>
        <Link
          to="/dripdrop"
          className="inline-flex items-center justify-center w-full rounded-2xl bg-cyan-300 px-6 py-3.5 text-sm font-black text-slate-950 hover:bg-cyan-200 transition-colors"
        >
          Open Drips
        </Link>
        <Link
          to="/"
          className="mt-3 block text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
