import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Baby, 
  Droplets, 
  Zap, 
  Brain, 
  FileText 
} from 'lucide-react'
import NeoDose from './apps/NeoDose'
import DripDrop from './apps/DripDrop'

// Home Screen with grid of tools
const Home = () => {
  const tools = [
    { title: 'NeoDose', path: '/neodose', icon: <Baby size={32} className="text-pink-400" />, desc: 'Peds Resuscitation', color: 'border-pink-500/30' },
    { title: 'DripDrop', path: '/dripdrop', icon: <Droplets size={32} className="text-blue-400" />, desc: 'IV Configurator', color: 'border-blue-500/30' },
    { title: 'LytesOut', path: '/lytesout', icon: <Zap size={32} className="text-yellow-400" />, desc: 'Electrolyte Guide', color: 'border-yellow-500/30' },
    { title: 'NeuroSnap', path: '/neurosnap', icon: <Brain size={32} className="text-purple-400" />, desc: 'GCS & NIHSS', color: 'border-purple-500/30' },
    { title: 'ChartNinja', path: '/chartninja', icon: <FileText size={32} className="text-emerald-400" />, desc: 'Smart Note Snippets', color: 'border-emerald-500/30' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col p-6 items-center justify-center overflow-y-auto pt-12 pb-12">
      <div className="text-center mb-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">MedUtils</h1>
        <p className="text-slate-400 mt-2 text-sm font-medium">Core Clinical Micro-SaaS Suite</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {tools.map((tool, i) => (
          <Link to={tool.path} key={tool.path}>
            <motion.div 
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass ${tool.color} p-5 rounded-3xl flex flex-col items-center justify-center gap-3 aspect-square h-full`}
            >
              <div className="p-3 bg-slate-800/80 rounded-full shadow-inner shadow-black/50">
                {tool.icon}
              </div>
              <div className="text-center">
                <h2 className="font-bold text-slate-100">{tool.title}</h2>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">{tool.desc}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Placeholder for tools
const PlaceholderApp = ({ title }: { title: string }) => (
  <div className="h-screen w-screen flex flex-col items-center justify-center relative">
    <Link to="/" className="absolute top-6 left-6 text-slate-400">
      <div className="glass px-4 py-2 rounded-full text-sm font-semibold clickable hover:text-white">
        &larr; Back
      </div>
    </Link>
    <div className="glass p-8 rounded-3xl text-center border-dashed border-2 border-slate-700">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-slate-500">Coming soon in phase 2.</p>
    </div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/neodose" element={<NeoDose />} />
        <Route path="/dripdrop" element={<DripDrop />} />
        <Route path="/lytesout" element={<PlaceholderApp title="LytesOut" />} />
        <Route path="/neurosnap" element={<PlaceholderApp title="NeuroSnap" />} />
        <Route path="/chartninja" element={<PlaceholderApp title="ChartNinja" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
