export interface BreathPhase {
  label: string
  cue: string
  seconds: number
  /** Orb scale at the end of this phase (REST_SCALE = rested, 1 = full). */
  scale: number
}

export interface BreathPattern {
  id: string
  name: string
  rhythm: string
  blurb: string
  why: string
  cyclesTarget: number
  phases: BreathPhase[]
}

export const REST_SCALE = 0.55

const IN = 'Through your nose, low into your belly.'
const HOLD = 'Stay soft. No straining.'
const OUT = 'Slowly, through relaxed lips.'

export const PATTERNS: BreathPattern[] = [
  {
    id: '478',
    name: 'Relaxing breath',
    rhythm: '4 · 7 · 8',
    blurb: 'A long exhale to slow a racing heart.',
    why: 'Breathing out for longer than you breathe in nudges your heart rate down. Good before you write.',
    cyclesTarget: 4,
    phases: [
      { label: 'Breathe in', cue: IN, seconds: 4, scale: 1 },
      { label: 'Hold', cue: HOLD, seconds: 7, scale: 1 },
      { label: 'Breathe out', cue: OUT, seconds: 8, scale: REST_SCALE },
    ],
  },
  {
    id: 'box',
    name: 'Box breathing',
    rhythm: '4 · 4 · 4 · 4',
    blurb: 'Even and steady, for feeling level again.',
    why: 'Equal counts give your attention something simple to hold onto when thoughts are scattered.',
    cyclesTarget: 5,
    phases: [
      { label: 'Breathe in', cue: IN, seconds: 4, scale: 1 },
      { label: 'Hold', cue: HOLD, seconds: 4, scale: 1 },
      { label: 'Breathe out', cue: OUT, seconds: 4, scale: REST_SCALE },
      { label: 'Hold', cue: 'Rest at the bottom of the breath.', seconds: 4, scale: REST_SCALE },
    ],
  },
  {
    id: 'sigh',
    name: 'Physiological sigh',
    rhythm: '2 · 1 · 6',
    blurb: 'Two inhales, one long exhale. A fast reset.',
    why: 'A double inhale followed by a long sigh out is one of the quickest ways to take the edge off.',
    cyclesTarget: 5,
    phases: [
      { label: 'Breathe in', cue: IN, seconds: 2, scale: 0.85 },
      { label: 'Sip in more', cue: 'A short extra breath on top.', seconds: 1, scale: 1 },
      { label: 'Long sigh out', cue: 'Let it all go, slowly.', seconds: 6, scale: REST_SCALE },
    ],
  },
  {
    id: 'coherence',
    name: 'Steady rhythm',
    rhythm: '5 · 5',
    blurb: 'Gentle and even, for reflection or journaling.',
    why: 'About six breaths a minute is a comfortable, calming pace that you can keep up for a while.',
    cyclesTarget: 6,
    phases: [
      { label: 'Breathe in', cue: IN, seconds: 5, scale: 1 },
      { label: 'Breathe out', cue: OUT, seconds: 5, scale: REST_SCALE },
    ],
  },
]
