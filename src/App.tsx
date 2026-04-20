import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NeoDose from './apps/NeoDose'
import DripDrop from './apps/DripDrop'
import TippingPoint from './apps/TippingPoint'
import LytesOut from './apps/LytesOut'
import NeuroSnap from './apps/NeuroSnap'
import ChartNinja from './apps/ChartNinja'
import { LandingPage } from './components/landing'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/neodose" element={<NeoDose />} />
        <Route path="/tippingpoint" element={<TippingPoint />} />
        <Route path="/dripdrop" element={<DripDrop />} />
        <Route path="/lytesout" element={<LytesOut />} />
        <Route path="/neurosnap" element={<NeuroSnap />} />
        <Route path="/chartninja" element={<ChartNinja />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
