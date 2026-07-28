import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Zap,
  Droplets,
  Pill,
  Heart,
  AlertTriangle,
  ChevronRight,
  Lock,
} from "lucide-react";
import { AppShellHeader } from "../../components/app-shell";
import { trackToolOpened, trackFirstResultCompleted } from "../../lib/analytics";

// ─── Broselow Band Data ───────────────────────────────────────────────────────
const BROSELOW_BANDS = [
  {
    name: "Grey",
    label: "GREY",
    min: 3,
    max: 5,
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.15)",
    border: "rgba(156,163,175,0.4)",
  },
  {
    name: "Pink",
    label: "PINK",
    min: 5,
    max: 7,
    color: "#f472b6",
    bg: "rgba(244,114,182,0.15)",
    border: "rgba(244,114,182,0.4)",
  },
  {
    name: "Red",
    label: "RED",
    min: 7,
    max: 9,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.4)",
  },
  {
    name: "Purple",
    label: "PURPLE",
    min: 9,
    max: 11,
    color: "#a855f7",
    bg: "rgba(168,85,247,0.15)",
    border: "rgba(168,85,247,0.4)",
  },
  {
    name: "Yellow",
    label: "YELLOW",
    min: 11,
    max: 14,
    color: "#eab308",
    bg: "rgba(234,179,8,0.15)",
    border: "rgba(234,179,8,0.4)",
  },
  {
    name: "White",
    label: "WHITE",
    min: 14,
    max: 18,
    color: "#e2e8f0",
    bg: "rgba(226,232,240,0.15)",
    border: "rgba(226,232,240,0.4)",
  },
  {
    name: "Blue",
    label: "BLUE",
    min: 18,
    max: 25,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
    border: "rgba(59,130,246,0.4)",
  },
  {
    name: "Orange",
    label: "ORANGE",
    min: 25,
    max: 36,
    color: "#f97316",
    bg: "rgba(249,115,22,0.15)",
    border: "rgba(249,115,22,0.4)",
  },
  {
    name: "Green",
    label: "GREEN",
    min: 36,
    max: 50,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.4)",
  },
];

export function getBand(kg: number) {
  return (
    BROSELOW_BANDS.find((b) => kg >= b.min && kg < b.max) ??
    (kg < 3 ? BROSELOW_BANDS[0] : BROSELOW_BANDS[BROSELOW_BANDS.length - 1])
  );
}

// Quick-weight presets (common peds weights)
export const WEIGHT_PRESETS = [3, 5, 7, 10, 12, 15, 20, 25, 30];

// ─── Med Card Component ───────────────────────────────────────────────────────
interface MedCardProps {
  med: {
    name: string;
    sub: string;
    icon: React.ReactNode;
    doseStr: string;
    calcDose: number;
    unit: string;
    volume: number | null;
    volUnit: string;
    concentration?: string;
    accent: string;
    accentBg: string;
    accentBorder: string;
    pulse?: boolean;
    locked?: boolean;
  };
  index: number;
}

function MedCard({ med, index }: MedCardProps) {
  const spring = useSpring(med.calcDose, { stiffness: 200, damping: 20 });
  const displayDose = useTransform(spring, (v) => v.toFixed(1));

  useEffect(() => {
    spring.set(med.calcDose);
  }, [med.calcDose, spring]);

  return (
    <motion.div
      key={`${med.name}-${index}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        type: "spring",
        stiffness: 280,
        damping: 24,
      }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: med.accentBg,
        border: `1px solid ${med.accentBorder}`,
      }}
    >
      {/* Pulse ring for epinephrine */}
      {med.pulse && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ border: `2px solid ${med.accent}` }}
          animate={{ opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Locked overlay */}
      {med.locked && (
        <div className="absolute inset-0 rounded-3xl z-20 backdrop-blur-sm bg-slate-950/60 flex flex-col items-center justify-center gap-2">
          <Lock size={20} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Shiftside Pro
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: `${med.accent}22`, color: med.accent }}
            >
              {med.icon}
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm leading-tight">
                {med.name}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                {med.sub}
              </div>
            </div>
          </div>
          <span
            className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full"
            style={{ background: `${med.accent}20`, color: med.accent }}
          >
            {med.doseStr}
          </span>
        </div>

        {/* Big dose number */}
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1.5">
            <motion.span
              className="text-4xl font-black tabular-nums leading-none"
              style={{ color: med.accent }}
            >
              {displayDose}
            </motion.span>
            <span className="text-sm font-bold text-slate-400 mb-0.5">
              {med.unit}
            </span>
          </div>

          {med.volume !== null && (
            <div
              className="text-right px-3 py-2 rounded-2xl"
              style={{
                background: `${med.accent}10`,
                border: `1px solid ${med.accent}20`,
              }}
            >
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                Volume
              </div>
              <div className="flex items-baseline gap-0.5">
                <span
                  className="text-xl font-black"
                  style={{ color: med.accent }}
                >
                  {med.volume.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {med.volUnit}
                </span>
              </div>
              {med.concentration && (
                <div className="text-[9px] text-slate-600 font-mono mt-0.5">
                  {med.concentration}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subtle color bar at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40"
        style={{
          background: `linear-gradient(to right, transparent, ${med.accent}, transparent)`,
        }}
      />
    </motion.div>
  );
}

// ─── Broselow Tape Visual ─────────────────────────────────────────────────────
function BroselowTape({ weight }: { weight: number }) {
  const total = 50 - 3;
  return (
    <div className="flex w-full h-3 rounded-full overflow-hidden gap-px">
      {BROSELOW_BANDS.map((band) => {
        const size = band.max - band.min;
        const isActive = weight >= band.min && weight < band.max;
        return (
          <motion.div
            key={band.name}
            className="relative flex-shrink-0 rounded-sm"
            style={{
              width: `${(size / total) * 100}%`,
              background: band.color,
              opacity: isActive ? 1 : 0.2,
            }}
            animate={{
              opacity: isActive ? 1 : 0.2,
              scaleY: isActive ? 1.4 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          />
        );
      })}
    </div>
  );
}

// ─── Weight Numpad (quick entry) ──────────────────────────────────────────────
function NumpadWeight({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [inputStr, setInputStr] = useState(String(value));
  const [active, setActive] = useState(false);

  const commit = useCallback(
    (str: string) => {
      const parsed = parseFloat(str);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
        onChange(parsed);
      }
    },
    [onChange],
  );

  const handleDigit = (d: string) => {
    setInputStr((prev) => {
      let next = active ? prev : String(value);
      if (d === "⌫") {
        next = next.length > 1 ? next.slice(0, -1) : "0";
      } else if (d === ".") {
        next = next.includes(".") ? next : next + ".";
      } else {
        next = next === "0" ? d : next + d;
        if (next.length > 4) return active ? prev : String(value);
      }
      commit(next);
      return next;
    });
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(8);
  };

  const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫"];

  return (
    <div>
      <div className="mb-3 rounded-2xl border border-white/8 bg-slate-950/80 px-4 py-3 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
          Manual Weight Entry
        </div>
        <div className="mt-2 text-3xl font-black tabular-nums text-white">
          {active ? inputStr : String(value)}
          <span className="ml-1 text-sm font-bold text-slate-500">kg</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.88 }}
            onPointerDown={() => {
              setActive(true);
              handleDigit(k);
            }}
            onPointerUp={() => setActive(false)}
            className="h-12 rounded-2xl bg-slate-800/80 border border-white/5 text-slate-100 font-bold text-lg active:bg-slate-700/80 flex items-center justify-center"
          >
            {k === "⌫" ? "⌫" : k}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Main NeoDose Component ───────────────────────────────────────────────────
export default function NeoDose({ embedded }: { embedded?: boolean } = {}) {
  const ContentTag = embedded ? 'div' : 'main'
  const [weight, setWeight] = useState(10);
  const [showNumpad, setShowNumpad] = useState(false);
  const band = getBand(weight);
  const firstResultFired = useRef(false);

  useEffect(() => { trackToolOpened('dose'); }, []);

  // Slider percentage
  const sliderPct = ((weight - 1) / (50 - 1)) * 100;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!firstResultFired.current) {
      firstResultFired.current = true;
      trackFirstResultCompleted('dose');
    }
    setWeight(v);
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(6);
  };

  const meds = useMemo(
    () => [
      // ── FREE TIER ─────────────────────────────────────────────
      {
        name: "Epinephrine",
        sub: "Code Blue / PALS",
        icon: <Heart size={16} />,
        doseStr: "0.01 mg/kg",
        calcDose: weight * 0.01,
        unit: "mg",
        volume: (weight * 0.01) / 0.1,
        volUnit: "mL",
        concentration: "0.1 mg/mL (1:10,000)",
        accent: "#ef4444",
        accentBg: "rgba(239,68,68,0.08)",
        accentBorder: "rgba(239,68,68,0.3)",
        pulse: true,
      },
      {
        name: "Defibrillation",
        sub: "1st Shock (VF/pVT)",
        icon: <Zap size={16} />,
        doseStr: "2 J/kg",
        calcDose: weight * 2,
        unit: "J",
        volume: null,
        volUnit: "",
        accent: "#f59e0b",
        accentBg: "rgba(245,158,11,0.08)",
        accentBorder: "rgba(245,158,11,0.3)",
      },
      {
        name: "Fluid Bolus",
        sub: "Normal Saline / LR",
        icon: <Droplets size={16} />,
        doseStr: "20 mL/kg",
        calcDose: weight * 20,
        unit: "mL",
        volume: null,
        volUnit: "",
        accent: "#3b82f6",
        accentBg: "rgba(59,130,246,0.08)",
        accentBorder: "rgba(59,130,246,0.3)",
      },
      // ── PRO TIER (locked) ──────────────────────────────────────
      {
        name: "Amiodarone",
        sub: "VF / pulseless VT",
        icon: <AlertTriangle size={16} />,
        doseStr: "5 mg/kg",
        calcDose: weight * 5,
        unit: "mg",
        volume: (weight * 5) / 50,
        volUnit: "mL",
        concentration: "50 mg/mL",
        accent: "#a855f7",
        accentBg: "rgba(168,85,247,0.08)",
        accentBorder: "rgba(168,85,247,0.3)",
        locked: true,
      },
      {
        name: "Atropine",
        sub: "Symptomatic Bradycardia",
        icon: <Pill size={16} />,
        doseStr: "0.02 mg/kg",
        calcDose: Math.max(weight * 0.02, 0.1),
        unit: "mg",
        volume: Math.max(weight * 0.02, 0.1) / 0.1,
        volUnit: "mL",
        concentration: "0.1 mg/mL",
        accent: "#06b6d4",
        accentBg: "rgba(6,182,212,0.08)",
        accentBorder: "rgba(6,182,212,0.3)",
        locked: true,
      },
      {
        name: "Dextrose 10%",
        sub: "Hypoglycemia",
        icon: <Pill size={16} />,
        doseStr: "5 mL/kg",
        calcDose: weight * 5,
        unit: "mL",
        volume: null,
        volUnit: "",
        accent: "#10b981",
        accentBg: "rgba(16,185,129,0.08)",
        accentBorder: "rgba(16,185,129,0.3)",
        locked: true,
      },
    ],
    [weight],
  );

  const freeMeds = meds.filter((m) => !m.locked);
  const proMeds = meds.filter((m) => m.locked);

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: "hsl(222,40%,5%)" }}
    >
      {!embedded && <AppShellHeader toolId="dose" />}

      <ContentTag id={embedded ? undefined : 'main-content'} tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">
      {/* ── Broselow color hero header ─────────────────────────── */}
      <motion.div
        className="shrink-0 px-5 pb-5 relative overflow-hidden"
        animate={{ borderBottomColor: band.border }}
        style={{ borderBottom: `1px solid ${band.border}` }}
      >
        {/* Ambient glow behind header */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: `radial-gradient(ellipse 70% 90% at 50% 0%, ${band.color}22 0%, transparent 80%)`,
          }}
          transition={{ duration: 0.6 }}
        />

        {/* Weight display + slider */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Est. Weight
            </span>
            {/* Tappable big weight number → opens numpad */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setShowNumpad((v) => !v)}
              className="flex items-baseline gap-1.5 px-4 py-1.5 rounded-2xl"
              style={{
                background: `${band.color}18`,
                border: `1px solid ${band.color}40`,
              }}
            >
              <motion.span
                key={weight.toFixed(1)}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-black tabular-nums"
                style={{ color: band.color }}
              >
                {weight.toFixed(1)}
              </motion.span>
              <span className="text-sm font-bold text-slate-400">kg</span>
              <ChevronRight
                size={14}
                className="text-slate-500 transition-transform"
                style={{
                  transform: showNumpad ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </motion.button>
          </div>

          {/* Quick presets */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
            {WEIGHT_PRESETS.map((w) => (
              <motion.button
                key={w}
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  setWeight(w);
                  if (typeof navigator !== "undefined" && navigator.vibrate)
                    navigator.vibrate(10);
                }}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={
                  weight === w
                    ? {
                        background: band.color,
                        color: "#000",
                        border: `1px solid ${band.color}`,
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        color: "rgb(148,163,184)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                {w} kg
              </motion.button>
            ))}
          </div>

          {/* Slider track */}
          <div className="relative h-12 flex items-center">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 bottom-0 rounded-full"
                  style={{ width: `${sliderPct}%`, background: band.color }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={0.5}
              value={weight}
              onChange={handleSlider}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10 touch-none"
            />
            {/* Thumb */}
            <motion.div
              className="absolute pointer-events-none w-8 h-8 rounded-full shadow-lg flex items-center justify-center"
              style={{
                left: `calc(${sliderPct}% - 16px)`,
                background: band.color,
                boxShadow: `0 0 16px ${band.color}80`,
              }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 1.2 }}
            >
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-black/40 rounded-full" />
                <div className="w-0.5 h-3 bg-black/40 rounded-full" />
              </div>
            </motion.div>
          </div>

          {/* Broselow tape */}
          <div className="mt-3">
            <BroselowTape weight={weight} />
            <div className="flex justify-between items-center mt-2">
              <motion.div
                key={band.label}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: band.color }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    background: band.color,
                    boxShadow: `0 0 6px ${band.color}`,
                  }}
                />
                {band.label} ZONE · {band.min}–{band.max} kg
              </motion.div>
              <span className="text-[10px] text-slate-600 font-semibold">
                Broselow Tape
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Numpad overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {showNumpad && (
          <motion.div
            key="numpad"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="shrink-0 overflow-hidden bg-slate-900/95 border-b border-white/5"
          >
            <div className="p-4">
              <NumpadWeight
                value={weight}
                onChange={(v) => {
                  setWeight(v);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scrollable Med Cards ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 pb-24">
        {/* Section: Free */}
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Code Blue Essentials
          </span>
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Free
          </span>
        </div>

        <AnimatePresence mode="wait">
          {freeMeds.map((med, i) => (
            <MedCard key={med.name} med={med} index={i} />
          ))}
        </AnimatePresence>

        {/* Section: Pro */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Advanced Pharmacy
          </span>
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Shiftside Pro
          </span>
        </div>

        <AnimatePresence mode="wait">
          {proMeds.map((med, i) => (
            <MedCard key={med.name} med={med} index={freeMeds.length + i} />
          ))}
        </AnimatePresence>

        {/* Unlock CTA */}
        <div className="pt-4 pb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-3xl font-bold text-base flex items-center justify-center gap-3 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(16,185,129,0.2))",
              border: "1px solid rgba(124,58,237,0.4)",
            }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: [
                  "linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.04) 50%, transparent 80%)",
                  "linear-gradient(100deg, transparent 60%, rgba(255,255,255,0.04) 90%, transparent 100%)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
            <Lock size={16} className="text-purple-300" />
            <span className="text-slate-100">Unlock Shiftside Pro</span>
            <span className="bg-gradient-to-r from-purple-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-black">
              Full toolkit
            </span>
          </motion.button>
        </div>
      </div>
      </ContentTag>
    </div>
  );
}
