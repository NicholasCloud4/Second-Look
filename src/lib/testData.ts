import type { CheckIn } from '../types'

// Dev-only sample check-ins for checking the mood chart. Fixed values, not random, so the
// averages and trend the chart shows can be worked out by hand. Never shipped to users.

export const TEST_ID_PREFIX = 'test-'

// Oldest first; the last entry is today. null means no check-in that day, to show gaps.
const MOOD = [4, 5, null, 4, 3, 5, 6, null, 5, 4, 6, 5, null, 6, 7, 6, null, 5, 6, 7, null, 6, 7, 8, 7, null, 7, 8, 7, 8]
const ENERGY = [3, 4, null, 4, 3, 4, 5, null, 5, 5, 5, 4, null, 6, 6, 5, null, 5, 6, 6, null, 5, 6, 7, 7, null, 6, 7, 7, 7]
const STATES = [['Tired', 'Low'], ['Tense'], ['Reflective'], ['Calm', 'Hopeful'], ['Content'], ['Restless', 'Tired']]
const NOTES: Record<number, { bodyNote?: string; gratitude?: string }> = {
  4: { bodyNote: 'Tight shoulders' },
  14: { gratitude: 'Walk in the sun' },
  23: { bodyNote: 'Slept well', gratitude: 'Call with a friend' },
  29: { gratitude: 'Test entry for today' },
}

const day = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function testCheckIns(today = new Date()): CheckIn[] {
  const out: CheckIn[] = []
  MOOD.forEach((mood, i) => {
    const energy = ENERGY[i]
    if (mood === null || energy === null) return
    const date = day(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (MOOD.length - 1 - i)))
    out.push({
      id: `${TEST_ID_PREFIX}${date}`,
      date,
      timestamp: `${date}T20:00:00`,
      mood,
      energy,
      states: STATES[i % STATES.length],
      ...NOTES[i],
    })
  })
  return out
}
