import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HapticSlider } from '../../components/ui/HapticSlider'

export default function NeoDose() {
  const [weight, setWeight] = useState(10)

  // Broselow color pure logic
  const getBroselowColor = (kg: number) => {
    if (kg < 5) return 'text-slate-400' // Preemie/Newborn (no color on broselow)
    if (kg < 6) return 'text-pink-500' // Pink (6-7 kg usually, simplifying)
    if (kg < 8) return 'text-red-500'
    if (kg < 10) return 'text-purple-500'
    if (kg < 12) return 'text-yellow-500'
    if (kg < 15) return 'text-white'
    if (kg < 19) return 'text-blue-500'
    if (kg < 24) return 'text-orange-500'
    if (kg <= 36) return 'text-green-500'
    return 'text-slate-400' // Adult
  }

  // Pure function for meds
  const meds = useMemo(() => [
    {
      name: 'Epinephrine (Code)',
      doseStr: '0.01 mg/kg',
      calcDose: weight * 0.01,
      unit: 'mg',
      volume: (weight * 0.01) / 0.1, // of 0.1mg/mL concentration
      volUnit: 'mL',
      color: 'bg-red-500/10 border-red-500/30 text-red-400'
    },
    {
      name: 'Amiodarone (Stat)',
      doseStr: '5 mg/kg',
      calcDose: weight * 5,
      unit: 'mg',
      volume: (weight * 5) / 50, // of 50mg/mL
      volUnit: 'mL',
      color: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
    },
    {
      name: 'Defibrillation (Shock)',
      doseStr: '2 Joules/kg',
      calcDose: weight * 2,
      unit: 'J',
      volume: null,
      volUnit: '',
      color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
    },
    {
      name: 'Fluid Bolus (NS)',
      doseStr: '20 mL/kg',
      calcDose: weight * 20,
      unit: 'mL',
      volume: null,
      volUnit: '',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    }
  ], [weight])

  return (
    <div className="h-screen w-screen flex flex-col pt-12">
      <div className="px-6 flex items-center justify-between mb-4">
        <Link to="/" className="text-slate-400 hover:text-white glass px-4 py-2 rounded-full text-sm font-semibold clickable">
          &larr; Back
        </Link>
        <h1 className="font-bold text-xl tracking-tight text-white">NeoDose</h1>
        <div className="w-20"></div>
      </div>

      <div className="px-6 pb-6 shadow-xl z-10 border-b border-white/5">
        <HapticSlider 
          label="Est. Weight" 
          unit="kg" 
          min={1} 
          max={40} 
          value={weight} 
          onChange={setWeight}
          colorClass={getBroselowColor(weight).replace('text-', 'bg-')}
        />
        <div className={`text-center font-bold uppercase tracking-wider text-sm mt-2 ${getBroselowColor(weight)}`}>
          Broselow Zone
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-4">
        <h2 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Code Blue (Free)</h2>
        <AnimatePresence>
          {meds.map((med, i) => (
            <motion.div 
              key={med.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass ${med.color} p-5 rounded-3xl flex flex-col justify-center`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-lg text-slate-200">{med.name}</span>
                <span className="text-xs font-mono opacity-60 bg-black/20 px-2 py-1 rounded">{med.doseStr}</span>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                <div>
                  <span className="text-3xl font-black text-white">{med.calcDose.toFixed(1)}</span>
                  <span className="text-sm font-bold ml-1 opacity-80">{med.unit}</span>
                </div>
                {med.volume !== null && (
                  <div className="text-right bg-white/5 px-3 py-1 rounded-xl">
                    <span className="text-sm text-slate-400 block mb-px">Volume</span>
                    <span className="text-xl font-bold">{med.volume.toFixed(1)}</span>
                    <span className="text-xs ml-1">{med.volUnit}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div className="pt-8 text-center pb-8">
            <button className="glass border-green-500/30 bg-green-500/10 text-green-400 px-8 py-4 rounded-full font-bold text-lg clickable flex items-center justify-center gap-2 w-full mx-auto max-w-sm">
              <span>Unlock Advanced Pharmacy</span>
              <span className="bg-green-500 text-slate-900 text-xs px-2 py-0.5 rounded-full">$14.99</span>
            </button>
        </div>
      </div>
    </div>
  )
}
