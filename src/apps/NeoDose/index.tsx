import { useState, useMemo, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
  useReducedMotion,
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
import { Numpad } from "../../components/ui/Numpad";
import { HapticSlider } from "../../components/ui/HapticSlider";
import { trackToolOpened, trackFirstResultCompleted } from "../../lib/analytics";
import { triggerHaptic } from "../../lib/haptics";
import { BROSELOW_BANDS, getBand, WEIGHT_PRESETS } from "./broselow";

// Tool accent (dose-cyan) — see DESIGN.md One Signal Rule.
const DOSE_CYAN = "#67E8F9"

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
  const reduceMotion = useReducedMotion();

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
          animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.6, 0, 0.6] }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
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
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
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

// ─── Main NeoDose Component ───────────────────────────────────────────────────
export default function NeoDose({ embedded }: { embedded?: boolean } = {}) {
  const ContentTag = embedded ? 'div' : 'main'
  const [weight, setWeight] = useState(10);
  const [showNumpad, setShowNumpad] = useState(false);
  const [rawWeight, setRawWeight] = useState<string | null>(null);
  const band = getBand(weight);
  const firstResultFired = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => { trackToolOpened('dose'); }, []);

  const closeNumpad = () => {
    setShowNumpad(false);
    setRawWeight(null);
  };

  const handleSlider = (v: number) => {
    if (!firstResultFired.current) {
      firstResultFired.current = true;
      trackFirstResultCompleted('dose');
    }
    setWeight(v);
  };

  const commitWeight = (str: string) => {
    const parsed = parseFloat(str);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) setWeight(parsed);
  };

  // First keypress after opening the numpad starts a fresh entry rather than
  // appending onto the currently-committed weight.
  const handleNumpadKey = (k: string) => {
    setRawWeight((prev) => {
      const base = prev ?? "";
      let next = base;
      if (k === ".") {
        next = base.includes(".") ? base : `${base}.`;
      } else {
        next = base === "" || base === "0" ? k : base + k;
        if (next.length > 4) return base;
      }
      commitWeight(next);
      return next;
    });
  };

  const handleNumpadBackspace = () => {
    setRawWeight((prev) => {
      const base = prev ?? "";
      const next = base.length > 1 ? base.slice(0, -1) : "";
      commitWeight(next);
      return next;
    });
  };

  const meds = useMemo(
    () => [
      // ── FREE TIER ─────────────────────────────────────────────
      // ponytail: all meds share dose-cyan (One Signal Rule) — cards are
      // differentiated by container alpha tier, not by hue, per DESIGN.md.
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
        accent: DOSE_CYAN,
        accentBg: "rgba(103,232,249,0.08)",
        accentBorder: "rgba(103,232,249,0.32)",
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
        accent: DOSE_CYAN,
        accentBg: "rgba(103,232,249,0.11)",
        accentBorder: "rgba(103,232,249,0.36)",
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
        accent: DOSE_CYAN,
        accentBg: "rgba(103,232,249,0.14)",
        accentBorder: "rgba(103,232,249,0.4)",
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
        accent: DOSE_CYAN,
        accentBg: "rgba(103,232,249,0.08)",
        accentBorder: "rgba(103,232,249,0.32)",
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
        accent: DOSE_CYAN,
        accentBg: "rgba(103,232,249,0.11)",
        accentBorder: "rgba(103,232,249,0.36)",
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
        accent: DOSE_CYAN,
        accentBg: "rgba(103,232,249,0.14)",
        accentBorder: "rgba(103,232,249,0.4)",
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
      <div className={embedded ? 'relative flex h-full w-full flex-col' : 'relative mx-auto flex h-full w-full max-w-md flex-col'}>
      {!embedded && <AppShellHeader toolId="dose" />}

      <ContentTag id={embedded ? undefined : 'main-content'} tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">
      {/* ── Broselow color hero header ─────────────────────────── */}
      <motion.div
        className="shrink-0 px-5 pb-5 relative overflow-hidden"
        animate={{ borderBottomColor: band.border }}
        style={{ borderBottom: `1px solid ${band.border}` }}
      >
        {/* Ambient glow behind header — tool accent, not Broselow-band (page chrome, not device data) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 90% at 50% 0%, ${DOSE_CYAN}1f 0%, transparent 80%)`,
          }}
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
              onClick={() => (showNumpad ? closeNumpad() : setShowNumpad(true))}
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
                  triggerHaptic(10);
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
          <HapticSlider
            value={weight}
            min={1}
            max={50}
            step={0.5}
            onChange={handleSlider}
            accentColor={band.color}
            ariaLabel="Estimated weight in kilograms"
          />

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
              <span className="text-[10px] text-slate-400 font-semibold">
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
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="mb-3 rounded-2xl border border-white/8 bg-slate-950/80 px-4 py-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                  Manual Weight Entry
                </div>
                <div className="mt-2 text-3xl font-black tabular-nums text-white">
                  {rawWeight === null ? weight.toFixed(1) : rawWeight || "0"}
                  <span className="ml-1 text-sm font-bold text-slate-500">kg</span>
                </div>
              </div>
              <Numpad
                accentStyle={{
                  background: `${band.color}18`,
                  borderColor: `${band.color}40`,
                  color: band.color,
                }}
                nextLabel="Done"
                onKeyPress={handleNumpadKey}
                onBackspace={handleNumpadBackspace}
                onNext={closeNumpad}
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

        <AnimatePresence>
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
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            Shiftside Pro
          </span>
        </div>

        <AnimatePresence>
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
                "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(103,232,249,0.2))",
              border: "1px solid rgba(6,182,212,0.4)",
            }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      background: [
                        "linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.04) 50%, transparent 80%)",
                        "linear-gradient(100deg, transparent 60%, rgba(255,255,255,0.04) 90%, transparent 100%)",
                      ],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 2.5, repeat: Infinity, ease: "linear" }
              }
            />
            <Lock size={16} className="text-cyan-300" />
            <span className="text-slate-100">Unlock Shiftside Pro</span>
            <span className="bg-cyan-300 text-slate-950 text-xs px-3 py-1 rounded-full font-black">
              Full toolkit
            </span>
          </motion.button>
        </div>
      </div>
      </ContentTag>
      </div>
    </div>
  );
}
