import type { LucideIcon } from 'lucide-react'
import {
  Baby,
  Brain,
  Droplets,
  FileText,
  FlaskConical,
  Zap,
} from 'lucide-react'

export type ShiftsideToolId =
  | 'dose'
  | 'abg'
  | 'drips'
  | 'lytes'
  | 'neuro'
  | 'notes'

export interface ShiftsideToolPreview {
  label: string
  value: string
  helper: string
  chips: string[]
  action: string
  footer: string
}

export interface ShiftsideTool {
  id: ShiftsideToolId
  name: string
  shortLabel: string
  subtitle: string
  description: string
  usedIn: string
  route: string
  icon: LucideIcon
  accent: string
  rgb: string
  preview?: ShiftsideToolPreview
}

export const shiftsideTools: ShiftsideTool[] = [
  {
    id: 'dose',
    name: 'Shiftside Dose',
    shortLabel: 'Dose',
    subtitle: 'Pediatric and weight-based dosing',
    description: 'Weight-based meds, resus dosing, and quick pediatric calculations without bedside arithmetic.',
    usedIn: 'ER / Pediatrics',
    route: '/neodose',
    icon: Baby,
    accent: '#67e8f9',
    rgb: '103,232,249',
    preview: {
      label: 'Weight',
      value: '18 kg',
      helper: 'Code blue essentials ready',
      chips: ['Epi 0.18 mg', 'Fluid 360 mL', 'Shock 36 J'],
      action: 'Copy dosing',
      footer: 'Built for resus moments',
    },
  },
  {
    id: 'abg',
    name: 'Shiftside ABG',
    shortLabel: 'ABG',
    subtitle: 'Acid-base and blood gas analysis',
    description: 'Interpret acid-base patterns and compensation faster when the gas needs a quick read.',
    usedIn: 'ER / ICU',
    route: '/tippingpoint',
    icon: FlaskConical,
    accent: '#fdba74',
    rgb: '253,186,116',
  },
  {
    id: 'drips',
    name: 'Shiftside Drips',
    shortLabel: 'Drips',
    subtitle: 'IV and pressor rate calculator',
    description: 'Convert mcg/kg/min into pump-ready rates with concentration-aware logic and faster bedside checks.',
    usedIn: 'ER / ICU',
    route: '/dripdrop',
    icon: Droplets,
    accent: '#7dd3fc',
    rgb: '125,211,252',
    preview: {
      label: 'Norepi',
      value: '18.9 mL/hr',
      helper: '0.12 mcg/kg/min at 70 kg',
      chips: ['Immediate rate', 'Concentration aware', 'Copy for chart'],
      action: 'Open drips',
      footer: 'Thumb-first titration',
    },
  },
  {
    id: 'lytes',
    name: 'Shiftside Lytes',
    shortLabel: 'Lytes',
    subtitle: 'Electrolyte repletion guidance',
    description: 'Move from abnormal values to bedside repletion guidance without digging through protocols.',
    usedIn: 'ICU / Wards',
    route: '/lytesout',
    icon: Zap,
    accent: '#fcd34d',
    rgb: '252,211,77',
  },
  {
    id: 'neuro',
    name: 'Shiftside Neuro',
    shortLabel: 'Neuro',
    subtitle: 'GCS, NIHSS, and neuro scoring',
    description: 'Tap through neuro checks quickly with mobile scoring that keeps the total and interpretation in view.',
    usedIn: 'ER / ICU / Wards',
    route: '/neurosnap',
    icon: Brain,
    accent: '#86efac',
    rgb: '134,239,172',
    preview: {
      label: 'GCS',
      value: '11 / 15',
      helper: 'Eyes 3 · Verbal 3 · Motor 5',
      chips: ['Running total', 'Readable severity', 'No form hunting'],
      action: 'Score exam',
      footer: 'Designed for one-handed use',
    },
  },
  {
    id: 'notes',
    name: 'Shiftside Notes',
    shortLabel: 'Notes',
    subtitle: 'Chart-ready clinical text',
    description: 'Turn scores and calculators into reusable chart language without breaking focus or switching contexts.',
    usedIn: 'ER / Wards',
    route: '/chartninja',
    icon: FileText,
    accent: '#fca5a5',
    rgb: '252,165,165',
    preview: {
      label: 'Chart-ready',
      value: 'Ready to copy',
      helper: 'Assessment phrasing generated',
      chips: ['WELLS low risk', 'GCS sentence', 'Electrolyte plan'],
      action: 'Copy note',
      footer: 'From result to note in seconds',
    },
  },
]

export const heroPreviewTools = shiftsideTools.filter(
  (tool): tool is ShiftsideTool & { preview: ShiftsideToolPreview } => Boolean(tool.preview),
)

export function getShiftsideTool(toolId: ShiftsideToolId) {
  const tool = shiftsideTools.find((entry) => entry.id === toolId)

  if (!tool) {
    throw new Error(`Unknown Shiftside tool id: ${toolId}`)
  }

  return tool
}

export function isShiftsideToolRoute(pathname: string, tool: ShiftsideTool) {
  return pathname === tool.route
}
