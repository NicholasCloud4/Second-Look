export interface EmotionRating {
  name: string
  intensity: number // 0 to 100
}

export type ReframeStyle = 'Realistic' | 'Self-compassionate' | 'Constructive'

export interface ThoughtRecord {
  id: string
  timestamp: string // ISO string
  situation: string
  automaticThought: string
  initialEmotions: EmotionRating[]
  distortions: string[] // DistortionDefinition ids
  evidenceFor: string[]
  evidenceAgainst: string[]
  socraticAnswer: string
  rationalReframe: string
  reframeStyle?: ReframeStyle
  reratedEmotions: EmotionRating[]
  beliefInReframe: number // 0 to 100
  groundingAnchor?: string
  outcomeNotes?: string
}

export interface DistortionDefinition {
  id: string
  name: string
  shortDesc: string
  clinicalAntidote: string
  example: string
  challengeQuestion: string
  commonPhrase: string
}

export interface CheckIn {
  id: string
  date: string // local YYYY-MM-DD
  timestamp: string // ISO string of last edit
  mood: number // 1 to 10
  energy: number // 1 to 10
  states: string[]
  bodyNote?: string
  gratitude?: string
}
