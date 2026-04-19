// NeuroSnap: GCS & NIHSS Calculator
// Clinical references: Teasdale & Jennett (GCS), Brott et al. NIHSS, MDCalc, UpToDate

// ─── GCS ─────────────────────────────────────────────────────────────────────

export interface GcsItem {
  id: string
  label: string
  description: string
  score: number
}

export interface GcsCategory {
  id: 'eyes' | 'verbal' | 'motor'
  label: string
  abbrev: string
  maxScore: number
  accent: string
  accentRgb: string
  accentBg: string
  accentBorder: string
  items: GcsItem[]
}

export const GCS_CATEGORIES: GcsCategory[] = [
  {
    id: 'eyes',
    label: 'Eye Opening',
    abbrev: 'E',
    maxScore: 4,
    accent: '#38bdf8',
    accentRgb: '56,189,248',
    accentBg: 'rgba(56,189,248,0.12)',
    accentBorder: 'rgba(56,189,248,0.28)',
    items: [
      { id: 'E1', label: 'No Response', description: 'No eye opening to any stimulus', score: 1 },
      { id: 'E2', label: 'To Pain', description: 'Eyes open to painful stimulus only', score: 2 },
      { id: 'E3', label: 'To Voice', description: 'Eyes open to verbal command', score: 3 },
      { id: 'E4', label: 'Spontaneous', description: 'Eyes open without external stimulus', score: 4 },
    ],
  },
  {
    id: 'verbal',
    label: 'Verbal Response',
    abbrev: 'V',
    maxScore: 5,
    accent: '#a78bfa',
    accentRgb: '167,139,250',
    accentBg: 'rgba(167,139,250,0.12)',
    accentBorder: 'rgba(167,139,250,0.28)',
    items: [
      { id: 'V1', label: 'No Response', description: 'No verbal output', score: 1 },
      { id: 'V2', label: 'Sounds', description: 'Incomprehensible moaning or groaning', score: 2 },
      { id: 'V3', label: 'Words', description: 'Inappropriate single words', score: 3 },
      { id: 'V4', label: 'Confused', description: 'Disoriented, conversational speech', score: 4 },
      { id: 'V5', label: 'Oriented', description: 'Fully oriented, accurate conversation', score: 5 },
    ],
  },
  {
    id: 'motor',
    label: 'Motor Response',
    abbrev: 'M',
    maxScore: 6,
    accent: '#fb7185',
    accentRgb: '251,113,133',
    accentBg: 'rgba(251,113,133,0.12)',
    accentBorder: 'rgba(251,113,133,0.28)',
    items: [
      { id: 'M1', label: 'No Response', description: 'No movement to any stimulus', score: 1 },
      { id: 'M2', label: 'Decerebrate', description: 'Extension posturing (extensor response)', score: 2 },
      { id: 'M3', label: 'Decorticate', description: 'Flexion posturing (flexor response)', score: 3 },
      { id: 'M4', label: 'Withdrawal', description: 'Pulls limb away from painful stimulus', score: 4 },
      { id: 'M5', label: 'Localizes', description: 'Moves toward and identifies pain source', score: 5 },
      { id: 'M6', label: 'Obeys', description: 'Follows simple commands accurately', score: 6 },
    ],
  },
]

export type GcsSeverity = 'severe' | 'moderate' | 'mild' | 'normal'

export interface GcsAnalysis {
  eyes: number
  verbal: number
  motor: number
  total: number
  severity: GcsSeverity
  severityLabel: string
  severityNote: string
  glowState: 'red' | 'amber' | 'green'
  chartNote: string
}

export function analyzeGcs(eyes: number, verbal: number, motor: number): GcsAnalysis {
  const total = eyes + verbal + motor

  let severity: GcsSeverity
  let severityLabel: string
  let severityNote: string
  let glowState: 'red' | 'amber' | 'green'

  if (total <= 8) {
    severity = 'severe'
    severityLabel = 'Severe TBI'
    severityNote = 'Immediate airway management. Neurosurgery consult. Consider ICP monitoring.'
    glowState = 'red'
  } else if (total <= 12) {
    severity = 'moderate'
    severityLabel = 'Moderate TBI'
    severityNote = 'Head CT stat. Serial GCS every 30 min. Low threshold for intubation.'
    glowState = 'amber'
  } else if (total <= 14) {
    severity = 'mild'
    severityLabel = 'Mild TBI'
    severityNote = 'Observe 4–6 hours. CT at clinical discretion. Discharge criteria apply.'
    glowState = 'amber'
  } else {
    severity = 'normal'
    severityLabel = 'GCS Normal'
    severityNote = 'Full neurological function detected. Continue monitoring for deterioration.'
    glowState = 'green'
  }

  const chartNote =
    `GCS ${total}/15 (E${eyes}V${verbal}M${motor}) — ${severityLabel}. ${severityNote}`

  return { eyes, verbal, motor, total, severity, severityLabel, severityNote, glowState, chartNote }
}

// ─── NIHSS ───────────────────────────────────────────────────────────────────

export interface NihssItem {
  score: number
  label: string
  description: string
}

export interface NihssCategory {
  id: string
  label: string
  shortLabel: string
  maxScore: number
  accent: string
  accentRgb: string
  accentBg: string
  accentBorder: string
  items: NihssItem[]
}

export const NIHSS_CATEGORIES: NihssCategory[] = [
  {
    id: 'loc',
    label: 'Level of Consciousness',
    shortLabel: 'LOC',
    maxScore: 3,
    accent: '#f97316',
    accentRgb: '249,115,22',
    accentBg: 'rgba(249,115,22,0.12)',
    accentBorder: 'rgba(249,115,22,0.28)',
    items: [
      { score: 0, label: 'Alert', description: 'Keenly responsive' },
      { score: 1, label: 'Not Alert', description: 'Drowsy but arousable by minor stimulation' },
      { score: 2, label: 'Obtunded', description: 'Requires repeated stimulation to attend' },
      { score: 3, label: 'Unresponsive', description: 'No movement (other than reflexive) to noxious stimulation' },
    ],
  },
  {
    id: 'loc_questions',
    label: 'LOC Questions',
    shortLabel: 'LOC Q',
    maxScore: 2,
    accent: '#f59e0b',
    accentRgb: '245,158,11',
    accentBg: 'rgba(245,158,11,0.12)',
    accentBorder: 'rgba(245,158,11,0.28)',
    items: [
      { score: 0, label: 'Both Correct', description: 'Answers month and age correctly' },
      { score: 1, label: 'One Correct', description: 'Answers one question correctly' },
      { score: 2, label: 'Neither Correct', description: 'Cannot answer either' },
    ],
  },
  {
    id: 'loc_commands',
    label: 'LOC Commands',
    shortLabel: 'LOC C',
    maxScore: 2,
    accent: '#eab308',
    accentRgb: '234,179,8',
    accentBg: 'rgba(234,179,8,0.12)',
    accentBorder: 'rgba(234,179,8,0.28)',
    items: [
      { score: 0, label: 'Both Correct', description: 'Performs both commands correctly' },
      { score: 1, label: 'One Correct', description: 'Performs one command' },
      { score: 2, label: 'Neither Correct', description: 'Performs neither' },
    ],
  },
  {
    id: 'gaze',
    label: 'Best Gaze',
    shortLabel: 'Gaze',
    maxScore: 2,
    accent: '#38bdf8',
    accentRgb: '56,189,248',
    accentBg: 'rgba(56,189,248,0.12)',
    accentBorder: 'rgba(56,189,248,0.28)',
    items: [
      { score: 0, label: 'Normal', description: 'No gaze palsy' },
      { score: 1, label: 'Partial Palsy', description: 'Gaze abnormal in one or both eyes; no forced deviation' },
      { score: 2, label: 'Forced Deviation', description: 'Tonic eye deviation or total gaze paresis' },
    ],
  },
  {
    id: 'visual',
    label: 'Visual Fields',
    shortLabel: 'Visual',
    maxScore: 3,
    accent: '#818cf8',
    accentRgb: '129,140,248',
    accentBg: 'rgba(129,140,248,0.12)',
    accentBorder: 'rgba(129,140,248,0.28)',
    items: [
      { score: 0, label: 'No Visual Loss', description: 'Normal by confrontation testing' },
      { score: 1, label: 'Partial Hemianopia', description: 'Partial hemianopia present' },
      { score: 2, label: 'Complete Hemianopia', description: 'Complete hemianopia' },
      { score: 3, label: 'Bilateral Blindness', description: 'Bilateral hemianopia including cortical blindness' },
    ],
  },
  {
    id: 'facial',
    label: 'Facial Palsy',
    shortLabel: 'Face',
    maxScore: 3,
    accent: '#ec4899',
    accentRgb: '236,72,153',
    accentBg: 'rgba(236,72,153,0.12)',
    accentBorder: 'rgba(236,72,153,0.28)',
    items: [
      { score: 0, label: 'Normal', description: 'Normal symmetrical movement' },
      { score: 1, label: 'Minor Palsy', description: 'Flattened nasolabial fold, asymmetric smile' },
      { score: 2, label: 'Partial Palsy', description: 'Complete or near-complete paralysis of lower face' },
      { score: 3, label: 'Complete Palsy', description: 'Absent movement in upper and lower face' },
    ],
  },
  {
    id: 'left_arm',
    label: 'Left Arm Motor',
    shortLabel: 'L Arm',
    maxScore: 4,
    accent: '#fb7185',
    accentRgb: '251,113,133',
    accentBg: 'rgba(251,113,133,0.12)',
    accentBorder: 'rgba(251,113,133,0.28)',
    items: [
      { score: 0, label: 'No Drift', description: 'Arm holds 90° (or 45°) for full 10 seconds' },
      { score: 1, label: 'Drift', description: 'Arm drifts before 10 s; no bed contact' },
      { score: 2, label: 'Some Effort', description: 'Arm cannot reach 90°; drifts to bed' },
      { score: 3, label: 'No Effort', description: 'Arm falls immediately; gravity overcome' },
      { score: 4, label: 'No Movement', description: 'No movement' },
    ],
  },
  {
    id: 'right_arm',
    label: 'Right Arm Motor',
    shortLabel: 'R Arm',
    maxScore: 4,
    accent: '#f87171',
    accentRgb: '248,113,113',
    accentBg: 'rgba(248,113,113,0.12)',
    accentBorder: 'rgba(248,113,113,0.28)',
    items: [
      { score: 0, label: 'No Drift', description: 'Arm holds 90° (or 45°) for full 10 seconds' },
      { score: 1, label: 'Drift', description: 'Arm drifts before 10 s; no bed contact' },
      { score: 2, label: 'Some Effort', description: 'Arm cannot reach 90°; drifts to bed' },
      { score: 3, label: 'No Effort', description: 'Arm falls immediately; gravity overcome' },
      { score: 4, label: 'No Movement', description: 'No movement' },
    ],
  },
  {
    id: 'left_leg',
    label: 'Left Leg Motor',
    shortLabel: 'L Leg',
    maxScore: 4,
    accent: '#34d399',
    accentRgb: '52,211,153',
    accentBg: 'rgba(52,211,153,0.12)',
    accentBorder: 'rgba(52,211,153,0.28)',
    items: [
      { score: 0, label: 'No Drift', description: 'Leg holds 30° for full 5 seconds' },
      { score: 1, label: 'Drift', description: 'Leg drifts before 5 s; no bed contact' },
      { score: 2, label: 'Some Effort', description: 'Leg falls to bed by 5 s; some effort' },
      { score: 3, label: 'No Effort', description: 'Leg falls immediately against gravity' },
      { score: 4, label: 'No Movement', description: 'No movement' },
    ],
  },
  {
    id: 'right_leg',
    label: 'Right Leg Motor',
    shortLabel: 'R Leg',
    maxScore: 4,
    accent: '#4ade80',
    accentRgb: '74,222,128',
    accentBg: 'rgba(74,222,128,0.12)',
    accentBorder: 'rgba(74,222,128,0.28)',
    items: [
      { score: 0, label: 'No Drift', description: 'Leg holds 30° for full 5 seconds' },
      { score: 1, label: 'Drift', description: 'Leg drifts before 5 s; no bed contact' },
      { score: 2, label: 'Some Effort', description: 'Leg falls to bed by 5 s; some effort' },
      { score: 3, label: 'No Effort', description: 'Leg falls immediately against gravity' },
      { score: 4, label: 'No Movement', description: 'No movement' },
    ],
  },
  {
    id: 'ataxia',
    label: 'Limb Ataxia',
    shortLabel: 'Ataxia',
    maxScore: 2,
    accent: '#a3e635',
    accentRgb: '163,230,53',
    accentBg: 'rgba(163,230,53,0.12)',
    accentBorder: 'rgba(163,230,53,0.28)',
    items: [
      { score: 0, label: 'Absent', description: 'No ataxia' },
      { score: 1, label: 'One Limb', description: 'Present in one limb' },
      { score: 2, label: 'Two Limbs', description: 'Present in two or more limbs' },
    ],
  },
  {
    id: 'sensory',
    label: 'Sensory',
    shortLabel: 'Sensory',
    maxScore: 2,
    accent: '#facc15',
    accentRgb: '250,204,21',
    accentBg: 'rgba(250,204,21,0.12)',
    accentBorder: 'rgba(250,204,21,0.28)',
    items: [
      { score: 0, label: 'Normal', description: 'No sensory loss' },
      { score: 1, label: 'Mild–Moderate Loss', description: 'Less sharp or dull on affected side' },
      { score: 2, label: 'Severe–Total Loss', description: 'Patient unaware of being touched in face/arm/leg' },
    ],
  },
  {
    id: 'language',
    label: 'Best Language',
    shortLabel: 'Language',
    maxScore: 3,
    accent: '#c084fc',
    accentRgb: '192,132,252',
    accentBg: 'rgba(192,132,252,0.12)',
    accentBorder: 'rgba(192,132,252,0.28)',
    items: [
      { score: 0, label: 'No Aphasia', description: 'Normal; no aphasia' },
      { score: 1, label: 'Mild–Moderate', description: 'Some obvious loss of fluency or comprehension' },
      { score: 2, label: 'Severe Aphasia', description: 'Nearly all expression or comprehension impossible' },
      { score: 3, label: 'Mute / Global', description: 'Mute; no usable speech or auditory comprehension' },
    ],
  },
  {
    id: 'dysarthria',
    label: 'Dysarthria',
    shortLabel: 'Dysarthria',
    maxScore: 2,
    accent: '#67e8f9',
    accentRgb: '103,232,249',
    accentBg: 'rgba(103,232,249,0.12)',
    accentBorder: 'rgba(103,232,249,0.28)',
    items: [
      { score: 0, label: 'Normal', description: 'Normal articulation' },
      { score: 1, label: 'Mild–Moderate', description: 'Slurs some words; can be understood with difficulty' },
      { score: 2, label: 'Severe / Mute', description: 'So slurred as to be unintelligible or mute' },
    ],
  },
  {
    id: 'extinction',
    label: 'Extinction / Neglect',
    shortLabel: 'Neglect',
    maxScore: 2,
    accent: '#f0abfc',
    accentRgb: '240,171,252',
    accentBg: 'rgba(240,171,252,0.12)',
    accentBorder: 'rgba(240,171,252,0.28)',
    items: [
      { score: 0, label: 'No Abnormality', description: 'No neglect' },
      { score: 1, label: 'Visual / Tactile Neglect', description: 'Inattention to bilateral simultaneous stimulation' },
      { score: 2, label: 'Profound Neglect', description: 'Does not recognize own hand; orients to only one side' },
    ],
  },
]

export type NihssSeverity = 'no_stroke' | 'minor' | 'moderate' | 'moderate_severe' | 'severe'

export interface NihssAnalysis {
  scores: Record<string, number>
  total: number
  severity: NihssSeverity
  severityLabel: string
  severityNote: string
  glowState: 'green' | 'amber' | 'red'
  chartNote: string
}

export function analyzeNihss(scores: Record<string, number>): NihssAnalysis {
  const total = NIHSS_CATEGORIES.reduce((sum, c) => sum + (scores[c.id] ?? 0), 0)

  let severity: NihssSeverity
  let severityLabel: string
  let severityNote: string
  let glowState: 'green' | 'amber' | 'red'

  if (total === 0) {
    severity = 'no_stroke'
    severityLabel = 'No Stroke Symptoms'
    severityNote = 'No deficits detected. Low pre-test probability.'
    glowState = 'green'
  } else if (total <= 4) {
    severity = 'minor'
    severityLabel = 'Minor Stroke'
    severityNote = 'Minor symptoms. Evaluate tPA eligibility (NIHSS ≥ 4 threshold). Neurology consult.'
    glowState = 'green'
  } else if (total <= 15) {
    severity = 'moderate'
    severityLabel = 'Moderate Stroke'
    severityNote = 'Moderate deficits. tPA candidate if within window. Activate stroke team.'
    glowState = 'amber'
  } else if (total <= 20) {
    severity = 'moderate_severe'
    severityLabel = 'Moderate–Severe'
    severityNote = 'Significant deficits. Thrombectomy evaluation. Emergent neuroimaging.'
    glowState = 'amber'
  } else {
    severity = 'severe'
    severityLabel = 'Severe Stroke'
    severityNote = 'Major stroke syndrome. Neurology at bedside. Emergent intervention.'
    glowState = 'red'
  }

  const scoreEntries = NIHSS_CATEGORIES.map(c => `${c.shortLabel}:${scores[c.id] ?? 0}`).join(' ')
  const chartNote = `NIHSS ${total}/42 — ${severityLabel}. (${scoreEntries}). ${severityNote}`

  return { scores, total, severity, severityLabel, severityNote, glowState, chartNote }
}
