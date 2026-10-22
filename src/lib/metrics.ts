import { distortionName } from '../data/distortions'
import type { EmotionRating, ThoughtRecord } from '../types'

const total = (e: EmotionRating[]) => e.reduce((s, x) => s + x.intensity, 0)

/** Percent drop in total emotional intensity after the reframe. Null if nothing was rated. */
export function reliefPercent(r: ThoughtRecord): number | null {
  const before = total(r.initialEmotions)
  if (before === 0) return null
  return Math.round(((before - total(r.reratedEmotions)) / before) * 100)
}

export function averageRelief(records: ThoughtRecord[]): number | null {
  const vals = records.map(reliefPercent).filter((v): v is number => v !== null)
  if (vals.length === 0) return null
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
}

export function distortionCounts(records: ThoughtRecord[]) {
  const counts = new Map<string, number>()
  for (const r of records) for (const d of r.distortions) counts.set(d, (counts.get(d) ?? 0) + 1)
  return [...counts.entries()]
    .map(([id, count]) => ({ id, name: distortionName(id), count }))
    .sort((a, b) => b.count - a.count)
}

export function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

export function reliefLabel(r: ThoughtRecord) {
  const p = reliefPercent(r)
  if (p === null) return ''
  return p > 0 ? `${p}% relief` : 'no relief yet'
}

/** Joins non-empty parts with typographic interpuncts. */
export const meta = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' · ')
