// ─── Broselow Band Data ───────────────────────────────────────────────────────
export const BROSELOW_BANDS = [
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
