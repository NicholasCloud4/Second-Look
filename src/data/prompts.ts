import type { ReframeStyle } from '../types'

export const EMOTION_OPTIONS = [
  'Anxiety',
  'Overwhelm',
  'Self-doubt',
  'Guilt',
  'Sadness',
  'Frustration',
  'Shame',
  'Dread',
  'Anger',
  'Loneliness',
]

export const TRIGGER_STARTERS = [
  'Critical feedback at work',
  'A message that hasn\'t been answered',
  'Before a presentation or big conversation',
  'A worrying body symptom',
  'Too many deadlines at once',
]

/** Questions that apply to almost any automatic thought. */
export const UNIVERSAL_QUESTIONS = [
  {
    id: 'double_standard',
    title: 'Double standard',
    text: 'If a friend told me this exact thought, what would I say to them?',
  },
  {
    id: 'decatastrophize',
    title: 'Worst, best, likely',
    text: 'What is the worst that could happen? The best? What is most realistic, and how would I cope?',
  },
  {
    id: 'zoom_out',
    title: 'Zoom out',
    text: 'Will this matter in a week? In a year?',
  },
]

export const REFRAME_STYLES: { style: ReframeStyle; question: string; starter: string }[] = [
  {
    style: 'Realistic',
    question: 'What do the facts actually support?',
    starter: 'The evidence shows ___. It does not show ___.',
  },
  {
    style: 'Self-compassionate',
    question: 'What would a kind friend or mentor say to you?',
    starter: 'It makes sense that I feel ___ because ___. That does not mean ___.',
  },
  {
    style: 'Constructive',
    question: 'What is in your control right now?',
    starter: 'I can\'t control ___, but I can ___ next.',
  },
]

export const CHECKIN_STATES = [
  'Calm',
  'Grounded',
  'Hopeful',
  'Content',
  'Clear-headed',
  'Reflective',
  'Tense',
  'Tired',
  'Overwhelmed',
  'Restless',
  'Low',
  'Irritable',
]

export const MOOD_LABELS: { max: number; label: string }[] = [
  { max: 2, label: 'Very low' },
  { max: 4, label: 'Low' },
  { max: 6, label: 'Steady' },
  { max: 8, label: 'Good' },
  { max: 10, label: 'Very good' },
]

export const moodLabel = (n: number) => MOOD_LABELS.find((m) => n <= m.max)?.label ?? ''

/** Short, unattributed grounding notes for the home page. */
export const GROUNDING_NOTES = [
  'A thought is something you have, not something you are.',
  'Feelings are real. They are not always accurate.',
  'You can notice a thought without obeying it.',
  'Between what happens and how you respond, there is room to pause.',
  'Slow is fine. One honest step counts.',
  'You have handled hard days before. This one is allowed to be hard too.',
]

export const CRISIS_LINES = [
  { name: '988 Suicide & Crisis Lifeline', where: 'US & Canada', how: 'Call or text 988, any time.', icon: 'phone' },
  { name: 'Crisis Text Line', where: 'US', how: 'Text HOME to 741741.', icon: 'message' },
  { name: 'The Trevor Project', where: 'LGBTQ+ young people, US', how: 'Call 1-866-488-7386 or text START to 678-678.', icon: 'shield' },
  { name: 'Samaritans', where: 'UK & Ireland', how: 'Call 116 123, free, any time.', icon: 'phone' },
  { name: 'Find a helpline', where: 'Everywhere else', how: 'findahelpline.com lists free lines by country.', icon: 'globe' },
] as const
