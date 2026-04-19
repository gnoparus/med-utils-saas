// ChartNinja: Smart Medical Snippet Generator
// Generates EHR-ready chart note snippets from structured clinical inputs.

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChipOption = {
  id: string
  label: string
  text: string // text inserted into snippet
}

export type FieldType = 'chips' | 'multi-chips' | 'text-input'

export type NoteField = {
  id: string
  label: string
  shortLabel: string
  type: FieldType
  placeholder?: string
  options?: ChipOption[]
  accent: string
  accentRgb: string
  accentBg: string
  accentBorder: string
  required: boolean
}

export type NoteTemplate = {
  id: string
  label: string
  shortLabel: string
  icon: string
  description: string
  accent: string
  accentRgb: string
  accentBg: string
  accentBorder: string
  fields: NoteField[]
  generate: (values: Record<string, string | string[]>) => string
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const NOTE_TEMPLATES: NoteTemplate[] = [
  // ── 1. Admission H&P ──────────────────────────────────────────────────────
  {
    id: 'admission',
    label: 'Admission H&P',
    shortLabel: 'H&P',
    icon: '🏥',
    description: 'Full admit note with CC, HPI, and plan',
    accent: '#38bdf8',
    accentRgb: '56,189,248',
    accentBg: 'rgba(56,189,248,0.12)',
    accentBorder: 'rgba(56,189,248,0.28)',
    fields: [
      {
        id: 'cc',
        label: 'Chief Complaint',
        shortLabel: 'CC',
        type: 'chips',
        accent: '#38bdf8', accentRgb: '56,189,248', accentBg: 'rgba(56,189,248,0.12)', accentBorder: 'rgba(56,189,248,0.28)',
        required: true,
        options: [
          { id: 'chest_pain', label: 'Chest Pain', text: 'chest pain' },
          { id: 'sob', label: 'Dyspnea', text: 'shortness of breath' },
          { id: 'altered', label: 'AMS', text: 'altered mental status' },
          { id: 'abdominal', label: 'Abd Pain', text: 'abdominal pain' },
          { id: 'syncope', label: 'Syncope', text: 'syncope' },
          { id: 'fever', label: 'Fever', text: 'fever' },
          { id: 'stroke', label: 'Stroke', text: 'acute neurological deficit' },
          { id: 'gi_bleed', label: 'GI Bleed', text: 'gastrointestinal bleeding' },
        ],
      },
      {
        id: 'onset',
        label: 'Onset',
        shortLabel: 'Onset',
        type: 'chips',
        accent: '#a78bfa', accentRgb: '167,139,250', accentBg: 'rgba(167,139,250,0.12)', accentBorder: 'rgba(167,139,250,0.28)',
        required: true,
        options: [
          { id: 'acute', label: 'Acute (<1h)', text: 'acute onset within 1 hour' },
          { id: 'subacute', label: 'Subacute', text: 'subacute onset over hours' },
          { id: 'gradual', label: 'Gradual', text: 'gradual onset over days' },
          { id: 'chronic', label: 'Chronic', text: 'chronic, worsening over weeks to months' },
        ],
      },
      {
        id: 'severity',
        label: 'Severity',
        shortLabel: 'Sev',
        type: 'chips',
        accent: '#fb7185', accentRgb: '251,113,133', accentBg: 'rgba(251,113,133,0.12)', accentBorder: 'rgba(251,113,133,0.28)',
        required: false,
        options: [
          { id: 'mild', label: 'Mild 1–3', text: 'mild (1–3/10)' },
          { id: 'moderate', label: 'Moderate 4–6', text: 'moderate (4–6/10)' },
          { id: 'severe', label: 'Severe 7–9', text: 'severe (7–9/10)' },
          { id: 'worst', label: 'Worst 10', text: '10/10 worst of life' },
        ],
      },
      {
        id: 'context',
        label: 'Context / Modifiers',
        shortLabel: 'Context',
        type: 'multi-chips',
        accent: '#34d399', accentRgb: '52,211,153', accentBg: 'rgba(52,211,153,0.12)', accentBorder: 'rgba(52,211,153,0.28)',
        required: false,
        options: [
          { id: 'exertion', label: 'With Exertion', text: 'exertional' },
          { id: 'rest', label: 'At Rest', text: 'at rest' },
          { id: 'radiation', label: 'Radiates', text: 'with radiation' },
          { id: 'pleuritic', label: 'Pleuritic', text: 'pleuritic' },
          { id: 'positional', label: 'Positional', text: 'positional' },
          { id: 'nausea', label: '+ Nausea', text: 'associated nausea/vomiting' },
          { id: 'diaphoresis', label: '+ Diaphoresis', text: 'associated diaphoresis' },
          { id: 'fever_assoc', label: '+ Fever', text: 'associated fever/chills' },
        ],
      },
      {
        id: 'disposition',
        label: 'Disposition Plan',
        shortLabel: 'Plan',
        type: 'chips',
        accent: '#f59e0b', accentRgb: '245,158,11', accentBg: 'rgba(245,158,11,0.12)', accentBorder: 'rgba(245,158,11,0.28)',
        required: true,
        options: [
          { id: 'admit_tele', label: 'Admit Tele', text: 'Admit to telemetry' },
          { id: 'admit_icu', label: 'Admit ICU', text: 'Admit to ICU' },
          { id: 'admit_floor', label: 'Admit Floor', text: 'Admit to medical floor' },
          { id: 'obs', label: 'Observation', text: 'Place in observation status' },
        ],
      },
    ],
    generate(v) {
      const cc = v.cc as string || 'presenting complaint'
      const onset = v.onset as string || 'unknown onset'
      const severity = v.severity as string
      const context = (v.context as string[]) || []
      const disposition = v.disposition as string || 'disposition pending'

      const severityStr = severity ? `, rated ${severity}` : ''
      const contextStr = context.length > 0 ? `, ${context.join(', ')}` : ''

      return [
        `ADMISSION NOTE`,
        ``,
        `CHIEF COMPLAINT: Patient presents with ${cc}.`,
        ``,
        `HISTORY OF PRESENT ILLNESS:`,
        `Patient is admitted for ${cc}. Symptoms are of ${onset}${severityStr}${contextStr}. Further history, review of systems, physical exam, and diagnostic workup detailed below.`,
        ``,
        `ASSESSMENT & PLAN:`,
        `1. ${cc.charAt(0).toUpperCase() + cc.slice(1)} — workup initiated, results pending.`,
        ``,
        `DISPOSITION: ${disposition}.`,
      ].join('\n')
    },
  },

  // ── 2. SOAP Note ─────────────────────────────────────────────────────────
  {
    id: 'soap',
    label: 'SOAP Note',
    shortLabel: 'SOAP',
    icon: '📋',
    description: 'Structured subjective-objective progress note',
    accent: '#a78bfa',
    accentRgb: '167,139,250',
    accentBg: 'rgba(167,139,250,0.12)',
    accentBorder: 'rgba(167,139,250,0.28)',
    fields: [
      {
        id: 'status',
        label: 'Clinical Status',
        shortLabel: 'Status',
        type: 'chips',
        accent: '#a78bfa', accentRgb: '167,139,250', accentBg: 'rgba(167,139,250,0.12)', accentBorder: 'rgba(167,139,250,0.28)',
        required: true,
        options: [
          { id: 'improving', label: 'Improving', text: 'improving' },
          { id: 'stable', label: 'Stable', text: 'clinically stable' },
          { id: 'unchanged', label: 'Unchanged', text: 'unchanged' },
          { id: 'worsening', label: 'Worsening', text: 'worsening' },
          { id: 'critical', label: 'Critical', text: 'critical' },
        ],
      },
      {
        id: 'complaints',
        label: 'Active Complaints',
        shortLabel: 'Sx',
        type: 'multi-chips',
        accent: '#38bdf8', accentRgb: '56,189,248', accentBg: 'rgba(56,189,248,0.12)', accentBorder: 'rgba(56,189,248,0.28)',
        required: false,
        options: [
          { id: 'pain', label: 'Pain', text: 'pain' },
          { id: 'sob2', label: 'Dyspnea', text: 'dyspnea' },
          { id: 'nausea2', label: 'Nausea', text: 'nausea' },
          { id: 'fatigue', label: 'Fatigue', text: 'fatigue' },
          { id: 'dizziness', label: 'Dizziness', text: 'dizziness' },
          { id: 'no_complaints', label: 'No Complaints', text: 'no active complaints' },
        ],
      },
      {
        id: 'vitals',
        label: 'Vital Sign Trend',
        shortLabel: 'Vitals',
        type: 'chips',
        accent: '#34d399', accentRgb: '52,211,153', accentBg: 'rgba(52,211,153,0.12)', accentBorder: 'rgba(52,211,153,0.28)',
        required: false,
        options: [
          { id: 'stable_vitals', label: 'Stable', text: 'Vitals stable' },
          { id: 'tachycardia', label: 'Tachycardia', text: 'Persistent tachycardia' },
          { id: 'hypotension', label: 'Hypotension', text: 'Hypotension noted' },
          { id: 'febrile', label: 'Febrile', text: 'Febrile' },
          { id: 'hypoxia', label: 'Hypoxia', text: 'Hypoxia on room air' },
        ],
      },
      {
        id: 'plan_action',
        label: 'Plan Actions',
        shortLabel: 'Plan',
        type: 'multi-chips',
        accent: '#f59e0b', accentRgb: '245,158,11', accentBg: 'rgba(245,158,11,0.12)', accentBorder: 'rgba(245,158,11,0.28)',
        required: false,
        options: [
          { id: 'continue', label: 'Continue Rx', text: 'Continue current regimen' },
          { id: 'labs', label: 'Repeat Labs', text: 'Repeat lab work' },
          { id: 'imaging', label: 'Imaging', text: 'Imaging ordered' },
          { id: 'consult', label: 'Consult', text: 'Specialist consult placed' },
          { id: 'discharge', label: 'DC Planning', text: 'Discharge planning initiated' },
          { id: 'npo', label: 'NPO', text: 'NPO for procedure/OR' },
        ],
      },
    ],
    generate(v) {
      const status = v.status as string || 'stable'
      const complaints = (v.complaints as string[]) || []
      const vitals = v.vitals as string
      const planActions = (v.plan_action as string[]) || []

      const sxStr = complaints.length > 0 ? complaints.join(', ') : 'no new complaints'
      const vitalsStr = vitals ? `${vitals}.` : 'Vitals reviewed.'
      const planStr = planActions.length > 0 ? planActions.join('. ') + '.' : 'Plan reviewed and unchanged.'

      return [
        `PROGRESS NOTE`,
        ``,
        `SUBJECTIVE: Patient is ${status}. Reports ${sxStr}.`,
        ``,
        `OBJECTIVE: ${vitalsStr} Physical exam reviewed; pertinent findings documented separately.`,
        ``,
        `ASSESSMENT: Patient remains ${status} with course as noted above.`,
        ``,
        `PLAN: ${planStr}`,
      ].join('\n')
    },
  },

  // ── 3. Procedure Note ────────────────────────────────────────────────────
  {
    id: 'procedure',
    label: 'Procedure Note',
    shortLabel: 'Proc',
    icon: '🔬',
    description: 'Bedside or OR procedure documentation',
    accent: '#fb7185',
    accentRgb: '251,113,133',
    accentBg: 'rgba(251,113,133,0.12)',
    accentBorder: 'rgba(251,113,133,0.28)',
    fields: [
      {
        id: 'procedure_type',
        label: 'Procedure',
        shortLabel: 'Proc',
        type: 'chips',
        accent: '#fb7185', accentRgb: '251,113,133', accentBg: 'rgba(251,113,133,0.12)', accentBorder: 'rgba(251,113,133,0.28)',
        required: true,
        options: [
          { id: 'central_line', label: 'Central Line', text: 'Central venous catheter placement' },
          { id: 'lp', label: 'Lumbar Puncture', text: 'Lumbar puncture' },
          { id: 'thoracentesis', label: 'Thoracentesis', text: 'Thoracentesis' },
          { id: 'paracentesis', label: 'Paracentesis', text: 'Paracentesis' },
          { id: 'intubation', label: 'Intubation', text: 'Endotracheal intubation' },
          { id: 'art_line', label: 'A-Line', text: 'Arterial line placement' },
          { id: 'chest_tube', label: 'Chest Tube', text: 'Chest tube placement' },
          { id: 'cardioversion', label: 'Cardioversion', text: 'Synchronized cardioversion' },
        ],
      },
      {
        id: 'indication',
        label: 'Indication',
        shortLabel: 'Ind',
        type: 'chips',
        accent: '#f97316', accentRgb: '249,115,22', accentBg: 'rgba(249,115,22,0.12)', accentBorder: 'rgba(249,115,22,0.28)',
        required: true,
        options: [
          { id: 'diagnostic', label: 'Diagnostic', text: 'diagnostic evaluation' },
          { id: 'therapeutic', label: 'Therapeutic', text: 'therapeutic intervention' },
          { id: 'hemodynamic', label: 'Hemodynamic Mon', text: 'hemodynamic monitoring' },
          { id: 'airway', label: 'Airway Mgmt', text: 'airway management' },
          { id: 'access', label: 'IV Access', text: 'vascular access' },
        ],
      },
      {
        id: 'consent',
        label: 'Consent',
        shortLabel: 'Consent',
        type: 'chips',
        accent: '#34d399', accentRgb: '52,211,153', accentBg: 'rgba(52,211,153,0.12)', accentBorder: 'rgba(52,211,153,0.28)',
        required: true,
        options: [
          { id: 'verbal', label: 'Verbal', text: 'verbal consent obtained' },
          { id: 'written', label: 'Written', text: 'written informed consent obtained' },
          { id: 'implied', label: 'Implied (Emergency)', text: 'implied consent — emergent procedure' },
          { id: 'surrogate', label: 'Surrogate', text: 'consent obtained from surrogate decision-maker' },
        ],
      },
      {
        id: 'outcome',
        label: 'Outcome',
        shortLabel: 'Outcome',
        type: 'chips',
        accent: '#a78bfa', accentRgb: '167,139,250', accentBg: 'rgba(167,139,250,0.12)', accentBorder: 'rgba(167,139,250,0.28)',
        required: true,
        options: [
          { id: 'successful', label: 'Successful', text: 'performed without complication' },
          { id: 'first_pass', label: '1st Pass Success', text: 'successful on first attempt' },
          { id: 'tolerated', label: 'Well Tolerated', text: 'tolerated well by patient' },
          { id: 'complication', label: 'Complication', text: 'with noted complication — see below' },
        ],
      },
    ],
    generate(v) {
      const proc = v.procedure_type as string || 'procedure'
      const indication = v.indication as string || 'clinical indication'
      const consent = v.consent as string || 'consent obtained'
      const outcome = v.outcome as string || 'performed without complication'

      return [
        `PROCEDURE NOTE`,
        ``,
        `PROCEDURE: ${proc}`,
        `INDICATION: ${indication.charAt(0).toUpperCase() + indication.slice(1)}.`,
        `CONSENT: ${consent.charAt(0).toUpperCase() + consent.slice(1)}.`,
        ``,
        `TECHNIQUE: Standard sterile technique employed. Appropriate monitoring in place throughout. Universal Protocol completed. Timeout performed.`,
        ``,
        `FINDINGS/OUTCOME: ${proc} ${outcome}.`,
        ``,
        `COMPLICATIONS: None beyond those stated above.`,
        ``,
        `POST-PROCEDURE PLAN: Patient tolerated procedure. Appropriate post-procedure care and monitoring initiated.`,
      ].join('\n')
    },
  },

  // ── 4. Discharge Summary ────────────────────────────────────────────────
  {
    id: 'discharge',
    label: 'Discharge Summary',
    shortLabel: 'Disch',
    icon: '🏠',
    description: 'Discharge summary with instructions',
    accent: '#34d399',
    accentRgb: '52,211,153',
    accentBg: 'rgba(52,211,153,0.12)',
    accentBorder: 'rgba(52,211,153,0.28)',
    fields: [
      {
        id: 'dx',
        label: 'Primary Diagnosis',
        shortLabel: 'Dx',
        type: 'chips',
        accent: '#34d399', accentRgb: '52,211,153', accentBg: 'rgba(52,211,153,0.12)', accentBorder: 'rgba(52,211,153,0.28)',
        required: true,
        options: [
          { id: 'chf', label: 'CHF Exacerbation', text: 'acute decompensated heart failure' },
          { id: 'pneumonia', label: 'Pneumonia', text: 'community-acquired pneumonia' },
          { id: 'uti', label: 'UTI/Urosepsis', text: 'urinary tract infection/urosepsis' },
          { id: 'acs', label: 'ACS/NSTEMI', text: 'acute coronary syndrome / NSTEMI' },
          { id: 'cellulitis', label: 'Cellulitis', text: 'cellulitis' },
          { id: 'copd', label: 'COPD Exacerbation', text: 'COPD exacerbation' },
          { id: 'sepsis', label: 'Sepsis', text: 'sepsis, source identified and treated' },
          { id: 'gi_bleed2', label: 'GI Bleed', text: 'gastrointestinal hemorrhage' },
        ],
      },
      {
        id: 'hospital_course',
        label: 'Hospital Course',
        shortLabel: 'Course',
        type: 'chips',
        accent: '#38bdf8', accentRgb: '56,189,248', accentBg: 'rgba(56,189,248,0.12)', accentBorder: 'rgba(56,189,248,0.28)',
        required: true,
        options: [
          { id: 'uncomplicated', label: 'Uncomplicated', text: 'uncomplicated hospital course' },
          { id: 'responded', label: 'Responded to Tx', text: 'responded well to treatment' },
          { id: 'prolonged', label: 'Prolonged', text: 'prolonged course with multiple issues addressed' },
          { id: 'icu_transfer', label: 'ICU Stay', text: 'required ICU-level care' },
        ],
      },
      {
        id: 'dc_condition',
        label: 'Condition at Discharge',
        shortLabel: 'Cond',
        type: 'chips',
        accent: '#f59e0b', accentRgb: '245,158,11', accentBg: 'rgba(245,158,11,0.12)', accentBorder: 'rgba(245,158,11,0.28)',
        required: true,
        options: [
          { id: 'good', label: 'Good', text: 'good' },
          { id: 'stable', label: 'Stable', text: 'stable' },
          { id: 'fair', label: 'Fair', text: 'fair' },
          { id: 'improved', label: 'Improved', text: 'improved from admission' },
        ],
      },
      {
        id: 'followup',
        label: 'Follow-up',
        shortLabel: 'F/U',
        type: 'chips',
        accent: '#a78bfa', accentRgb: '167,139,250', accentBg: 'rgba(167,139,250,0.12)', accentBorder: 'rgba(167,139,250,0.28)',
        required: false,
        options: [
          { id: 'fu_1w', label: '1 week', text: '1 week with PCP' },
          { id: 'fu_2w', label: '2 weeks', text: '2 weeks with PCP' },
          { id: 'fu_specialist', label: 'Specialist', text: 'with specialist as arranged' },
          { id: 'fu_urgent', label: 'Urgent (<48h)', text: 'urgently within 48 hours' },
        ],
      },
    ],
    generate(v) {
      const dx = v.dx as string || 'primary diagnosis'
      const course = v.hospital_course as string || 'uncomplicated hospital course'
      const condition = v.dc_condition as string || 'stable'
      const followup = v.followup as string

      const fuStr = followup ? `Follow-up scheduled ${followup}.` : 'Follow-up to be arranged as appropriate.'

      return [
        `DISCHARGE SUMMARY`,
        ``,
        `PRINCIPAL DIAGNOSIS: ${dx.charAt(0).toUpperCase() + dx.slice(1)}.`,
        ``,
        `HOSPITAL COURSE:`,
        `Patient admitted with ${dx}. Had a ${course}. Relevant workup, interventions, and responses documented in daily progress notes.`,
        ``,
        `CONDITION AT DISCHARGE: ${condition.charAt(0).toUpperCase() + condition.slice(1)}.`,
        ``,
        `DISCHARGE INSTRUCTIONS: Return precautions explained in detail. Medication reconciliation completed. ${fuStr}`,
      ].join('\n')
    },
  },

  // ── 5. Rapid Response / Code Note ────────────────────────────────────────
  {
    id: 'rapid_response',
    label: 'Rapid Response',
    shortLabel: 'RRT',
    icon: '🚨',
    description: 'RRT / code blue documentation',
    accent: '#f97316',
    accentRgb: '249,115,22',
    accentBg: 'rgba(249,115,22,0.12)',
    accentBorder: 'rgba(249,115,22,0.28)',
    fields: [
      {
        id: 'trigger',
        label: 'Activation Trigger',
        shortLabel: 'Trigger',
        type: 'chips',
        accent: '#f97316', accentRgb: '249,115,22', accentBg: 'rgba(249,115,22,0.12)', accentBorder: 'rgba(249,115,22,0.28)',
        required: true,
        options: [
          { id: 'hypoxia_t', label: 'Hypoxia', text: 'hypoxia (SpO₂ <90%)' },
          { id: 'hypotension_t', label: 'Hypotension', text: 'hypotension (SBP <90 mmHg)' },
          { id: 'bradycardia_t', label: 'Bradycardia', text: 'bradycardia (<40 bpm)' },
          { id: 'tachycardia_t', label: 'Tachycardia', text: 'tachycardia (>130 bpm)' },
          { id: 'ams_t', label: 'AMS', text: 'acute change in mental status' },
          { id: 'respiratory_t', label: 'Resp Distress', text: 'acute respiratory distress' },
          { id: 'arrest', label: 'Cardiac Arrest', text: 'cardiac arrest / pulseless rhythm' },
        ],
      },
      {
        id: 'interventions',
        label: 'Interventions',
        shortLabel: 'Interventions',
        type: 'multi-chips',
        accent: '#fb7185', accentRgb: '251,113,133', accentBg: 'rgba(251,113,133,0.12)', accentBorder: 'rgba(251,113,133,0.28)',
        required: false,
        options: [
          { id: 'o2', label: 'Supplemental O₂', text: 'supplemental oxygen applied' },
          { id: 'iv_access', label: 'IV Access', text: 'IV access obtained' },
          { id: 'fluids', label: 'IV Fluids', text: 'IV fluid bolus administered' },
          { id: 'intubated', label: 'Intubation', text: 'emergent intubation performed' },
          { id: 'cpr', label: 'CPR', text: 'CPR initiated' },
          { id: 'defib', label: 'Defibrillation', text: 'defibrillation delivered' },
          { id: 'vasopressors', label: 'Vasopressors', text: 'vasopressors initiated' },
          { id: 'epi', label: 'Epinephrine', text: 'epinephrine administered' },
        ],
      },
      {
        id: 'rrt_outcome',
        label: 'Outcome',
        shortLabel: 'Outcome',
        type: 'chips',
        accent: '#34d399', accentRgb: '52,211,153', accentBg: 'rgba(52,211,153,0.12)', accentBorder: 'rgba(52,211,153,0.28)',
        required: true,
        options: [
          { id: 'stabilized', label: 'Stabilized', text: 'patient stabilized' },
          { id: 'icu_transfer', label: 'ICU Transfer', text: 'transferred to ICU for higher level of care' },
          { id: 'rosc', label: 'ROSC', text: 'return of spontaneous circulation (ROSC) achieved' },
          { id: 'expired', label: 'Expired', text: 'patient expired despite resuscitative efforts' },
        ],
      },
    ],
    generate(v) {
      const trigger = v.trigger as string || 'clinical deterioration'
      const interventions = (v.interventions as string[]) || []
      const outcome = v.rrt_outcome as string || 'patient stabilized'

      const interventionsStr = interventions.length > 0
        ? interventions.join('; ')
        : 'standard supportive measures'

      return [
        `RAPID RESPONSE / CODE NOTE`,
        ``,
        `ACTIVATION TRIGGER: Rapid response activated for ${trigger}.`,
        ``,
        `TEAM RESPONSE: Rapid response team at bedside. Patient assessed. Monitors applied. IV access confirmed.`,
        ``,
        `INTERVENTIONS: ${interventionsStr.charAt(0).toUpperCase() + interventionsStr.slice(1)}.`,
        ``,
        `OUTCOME: ${outcome.charAt(0).toUpperCase() + outcome.slice(1)}.`,
        ``,
        `DISPOSITION: Attending physician notified. Plan updated per above.`,
      ].join('\n')
    },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTemplateById(id: string): NoteTemplate | undefined {
  return NOTE_TEMPLATES.find(t => t.id === id)
}

export function generateSnippet(templateId: string, values: Record<string, string | string[]>): string {
  const template = getTemplateById(templateId)
  if (!template) return ''
  return template.generate(values)
}

export function countFilledFields(template: NoteTemplate, values: Record<string, string | string[]>): number {
  return template.fields.filter(f => {
    const val = values[f.id]
    if (Array.isArray(val)) return val.length > 0
    return !!val
  }).length
}

export function isTemplateComplete(template: NoteTemplate, values: Record<string, string | string[]>): boolean {
  return template.fields
    .filter(f => f.required)
    .every(f => {
      const val = values[f.id]
      if (Array.isArray(val)) return val.length > 0
      return !!val
    })
}
