import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Numpad } from '../../components/ui/Numpad'
import { BalanceScale } from './BalanceScale'
import { analyzeABG, generateChartNote } from '../../lib/abg-analyzer'
import { Check, Copy } from 'lucide-react'

export default function TippingPoint() {
  const [phStr, setPhStr] = useState('')
  const [pco2Str, setPco2Str] = useState('')
  const [hco3Str, setHco3Str] = useState('')
  const [activeField, setActiveField] = useState<'ph' | 'pco2' | 'hco3'>('ph')
  const [copied, setCopied] = useState(false)

  const handleKeyPress = (k: string) => {
    if (activeField === 'ph') setPhStr(prev => prev + k)
    else if (activeField === 'pco2') setPco2Str(prev => prev + k)
    else setHco3Str(prev => prev + k)
  }

  const handleBackspace = () => {
    if (activeField === 'ph') setPhStr(prev => prev.slice(0, -1))
    else if (activeField === 'pco2') setPco2Str(prev => prev.slice(0, -1))
    else setHco3Str(prev => prev.slice(0, -1))
  }

  const handleNext = () => {
    if (activeField === 'ph') setActiveField('pco2')
    else if (activeField === 'pco2') setActiveField('hco3')
    else setActiveField('ph')
  }

  const ph = parseFloat(phStr) || 0
  const pco2 = parseFloat(pco2Str) || 0
  const hco3 = parseFloat(hco3Str) || 0

  const result = useMemo(() => analyzeABG(ph, pco2, hco3), [ph, pco2, hco3])

  const copyToChart = () => {
    const text = generateChartNote(ph, pco2, hco3, result)
    if (text) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20, 50, 20])
      }
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col pt-12 text-slate-100 overflow-hidden">
      <div className="px-6 flex items-center justify-between mb-2 shrink-0">
        <Link to="/" className="text-slate-400 hover:text-white glass px-4 py-2 rounded-full text-sm font-semibold clickable">
          &larr; Back
        </Link>
        <h1 className="font-bold text-xl tracking-tight text-white">TippingPoint</h1>
        <div className="w-20"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <BalanceScale angle={result.tipAngle} glowColor={result.glowColor} />

        <div className="px-6 text-center min-h-[4rem]">
          <motion.h2 
            key={result.primary}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-2xl font-black ${result.glowColor}`}
          >
            {result.primary}
          </motion.h2>
          <div className="text-slate-400 font-medium text-sm mt-1 min-h-[1.25rem]">
             {result.compensation}
          </div>
        </div>

        <div className="px-4 mt-6 mb-6 flex gap-2 max-w-sm mx-auto w-full">
          <div 
            onClick={() => setActiveField('ph')}
            className={`flex-1 glass p-3 rounded-2xl text-center border-2 transition-colors ${activeField === 'ph' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5'}`}
          >
            <div className="text-xs font-bold text-slate-500 uppercase">pH</div>
            <div className="text-xl font-bold h-7">{phStr || '-'}</div>
          </div>
          <div 
            onClick={() => setActiveField('pco2')}
            className={`flex-1 glass p-3 rounded-2xl text-center border-2 transition-colors ${activeField === 'pco2' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5'}`}
          >
            <div className="text-xs font-bold text-slate-500 uppercase">pCO2</div>
            <div className="text-xl font-bold h-7">{pco2Str || '-'}</div>
          </div>
          <div 
            onClick={() => setActiveField('hco3')}
            className={`flex-1 glass p-3 rounded-2xl text-center border-2 transition-colors ${activeField === 'hco3' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5'}`}
          >
            <div className="text-xs font-bold text-slate-500 uppercase">HCO3</div>
            <div className="text-xl font-bold h-7">{hco3Str || '-'}</div>
          </div>
        </div>

        <div className="px-6 w-full max-w-sm mx-auto">
          <Numpad 
            onKeyPress={handleKeyPress} 
            onBackspace={handleBackspace} 
            onNext={handleNext}
            nextLabel={activeField === 'ph' ? 'Next: pCO2' : activeField === 'pco2' ? 'Next: HCO3' : 'Next: pH'}
          />
          
          <button 
            onClick={copyToChart}
            disabled={result.primary === "Awaiting Values"}
            className="mt-6 w-full glass bg-green-500/20 border border-green-500/40 text-green-400 p-4 rounded-3xl font-bold text-lg clickable flex items-center justify-center gap-2 active:bg-green-500/30 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied' : 'Copy for Chart'}
          </button>

          <div className="pt-6 text-center pb-8">
              <button className="glass border-indigo-500/30 bg-indigo-500/10 text-indigo-400 px-6 py-3 rounded-full font-bold text-sm clickable flex items-center justify-center gap-2 w-full mx-auto">
                <span>Unlock Triple Dagger Mode</span>
                <span className="bg-indigo-500 text-slate-900 text-xs px-2 py-0.5 rounded-full">$9.99</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  )
}
