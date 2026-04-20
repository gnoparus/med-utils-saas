import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import NeoDose from './apps/NeoDose'
import DripDrop from './apps/DripDrop'
import TippingPoint from './apps/TippingPoint'
import LytesOut from './apps/LytesOut'
import NeuroSnap from './apps/NeuroSnap'
import ChartNinja from './apps/ChartNinja'
import { LandingPage } from './components/landing'

// SEO pages — lazy loaded to keep client bundle lean
const DripRateCalculator       = lazy(() => import('./pages/seo/DripRateCalculator'))
const McgKgMinCalculator        = lazy(() => import('./pages/seo/McgKgMinCalculator'))
const PresssorRateCalculator    = lazy(() => import('./pages/seo/PresssorRateCalculator'))
const NorepinephrineDripCalc    = lazy(() => import('./pages/seo/NorepinephrineDripCalculator'))
const EpinephrineDripCalc       = lazy(() => import('./pages/seo/EpinephrineDripCalculator'))
const GcsCalculator             = lazy(() => import('./pages/seo/GcsCalculator'))
const AbgCalculator             = lazy(() => import('./pages/seo/AbgCalculator'))
const PediatricDoseCalculator   = lazy(() => import('./pages/seo/PediatricDoseCalculator'))
const ThankYou                  = lazy(() => import('./pages/ThankYou'))

const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-cyan-300/30 border-t-cyan-300 animate-spin" />
  </div>
)

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/neodose" element={<NeoDose />} />
      <Route path="/tippingpoint" element={<TippingPoint />} />
      <Route path="/dripdrop" element={<DripDrop />} />
      <Route path="/lytesout" element={<LytesOut />} />
      <Route path="/neurosnap" element={<NeuroSnap />} />
      <Route path="/chartninja" element={<ChartNinja />} />
      {/* SEO landing pages */}
      <Route path="/drip-rate-calculator" element={<Suspense fallback={<PageLoader />}><DripRateCalculator /></Suspense>} />
      <Route path="/mcg-kg-min-to-ml-hr-calculator" element={<Suspense fallback={<PageLoader />}><McgKgMinCalculator /></Suspense>} />
      <Route path="/pressor-rate-calculator" element={<Suspense fallback={<PageLoader />}><PresssorRateCalculator /></Suspense>} />
      <Route path="/norepinephrine-drip-calculator" element={<Suspense fallback={<PageLoader />}><NorepinephrineDripCalc /></Suspense>} />
      <Route path="/epinephrine-drip-calculator" element={<Suspense fallback={<PageLoader />}><EpinephrineDripCalc /></Suspense>} />
      <Route path="/gcs-calculator" element={<Suspense fallback={<PageLoader />}><GcsCalculator /></Suspense>} />
      <Route path="/abg-calculator" element={<Suspense fallback={<PageLoader />}><AbgCalculator /></Suspense>} />
      <Route path="/pediatric-dose-calculator" element={<Suspense fallback={<PageLoader />}><PediatricDoseCalculator /></Suspense>} />
      <Route path="/thank-you" element={<Suspense fallback={<PageLoader />}><ThankYou /></Suspense>} />
    </Routes>
  )
}

export default App
