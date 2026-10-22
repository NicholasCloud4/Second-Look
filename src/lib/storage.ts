import { useSyncExternalStore } from 'react'
import { distortionName } from '../data/distortions'
import type { CheckIn, EmotionRating, ReframeStyle, ThoughtRecord } from '../types'
import { reliefPercent } from './metrics'

const RECORDS_KEY = 'secondlook:records'
const CHECKINS_KEY = 'secondlook:checkins'
export const DRAFT_KEY = 'secondlook:draft'

// ---------- normalizing untrusted data (storage or imported files) ----------

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
const clamp = (n: unknown, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Math.round(typeof n === 'number' && isFinite(n) ? n : lo)))
const STYLES: ReframeStyle[] = ['Realistic', 'Self-compassionate', 'Constructive']

function emotions(v: unknown): EmotionRating[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((e): e is { name: string; intensity: unknown } => !!e && typeof e === 'object' && typeof e.name === 'string')
    .map((e) => ({ name: e.name, intensity: clamp(e.intensity) }))
}

export function normalizeRecord(x: unknown): ThoughtRecord | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  if (typeof o.id !== 'string' || !o.id || typeof o.timestamp !== 'string') return null
  const rec: ThoughtRecord = {
    id: o.id,
    timestamp: o.timestamp,
    situation: str(o.situation),
    automaticThought: str(o.automaticThought),
    initialEmotions: emotions(o.initialEmotions),
    distortions: strList(o.distortions),
    evidenceFor: strList(o.evidenceFor),
    evidenceAgainst: strList(o.evidenceAgainst),
    socraticAnswer: str(o.socraticAnswer),
    rationalReframe: str(o.rationalReframe),
    reratedEmotions: emotions(o.reratedEmotions),
    beliefInReframe: clamp(o.beliefInReframe),
  }
  const style = STYLES.find((s) => s === o.reframeStyle)
  if (style) rec.reframeStyle = style
  const anchor = str(o.groundingAnchor)
  if (anchor) rec.groundingAnchor = anchor
  const notes = str(o.outcomeNotes)
  if (notes) rec.outcomeNotes = notes
  return rec
}

export function normalizeCheckIn(x: unknown): CheckIn | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.date)) return null
  const c: CheckIn = {
    id: o.id,
    date: o.date,
    timestamp: str(o.timestamp) || `${o.date}T12:00:00`,
    mood: clamp(o.mood, 1, 10),
    energy: clamp(o.energy, 1, 10),
    states: strList(o.states),
  }
  const body = str(o.bodyNote)
  if (body) c.bodyNote = body
  const grat = str(o.gratitude)
  if (grat) c.gratitude = grat
  return c
}

// ---------- persisted list store ----------

function createListStore<T extends { id: string }>(key: string, normalize: (x: unknown) => T | null) {
  let cache: T[] | null = null
  const listeners = new Set<() => void>()

  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(key)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      if (!Array.isArray(parsed)) return []
      return parsed.map(normalize).filter((r): r is T => r !== null)
    } catch {
      return []
    }
  }

  const get = () => (cache ??= read())

  const set = (next: T[]) => {
    cache = next
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // Storage full or blocked; the in-memory copy still works this session.
    }
    listeners.forEach((l) => l())
  }

  const subscribe = (cb: () => void) => {
    listeners.add(cb)
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) {
        cache = null
        cb()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(cb)
      window.removeEventListener('storage', onStorage)
    }
  }

  const use = () => useSyncExternalStore(subscribe, get)

  /** Adds items whose id is not already present. Returns how many were added. */
  const merge = (incoming: T[], sort: (a: T, b: T) => number) => {
    const have = new Set(get().map((r) => r.id))
    const fresh = incoming.filter((r) => !have.has(r.id))
    if (fresh.length) set([...fresh, ...get()].sort(sort))
    return fresh.length
  }

  return { get, set, use, merge }
}

const records = createListStore(RECORDS_KEY, normalizeRecord)
const checkIns = createListStore(CHECKINS_KEY, normalizeCheckIn)

// ---------- records ----------

/** All saved records, newest first. */
export const useRecords = records.use

export function addRecord(r: ThoughtRecord) {
  records.set([r, ...records.get().filter((x) => x.id !== r.id)])
}

/** Deletes a record and returns a function that puts it back. */
export function deleteRecord(id: string) {
  const before = records.get()
  records.set(before.filter((r) => r.id !== id))
  return () => records.set(before)
}

// ---------- check-ins ----------

/** All check-ins, oldest first. */
export const useCheckIns = checkIns.use

export function saveCheckIn(c: CheckIn) {
  const rest = checkIns.get().filter((x) => x.date !== c.date)
  checkIns.set([...rest, c].sort((a, b) => a.date.localeCompare(b.date)))
}

/** Adds check-ins on days that don't have one yet, so a day never ends up with two. Returns how many were added. */
export function addCheckIns(incoming: CheckIn[]) {
  const taken = new Set(checkIns.get().map((c) => c.date))
  const fresh = incoming.filter((c) => !taken.has(c.date) && !!taken.add(c.date))
  return checkIns.merge(fresh, (a, b) => a.date.localeCompare(b.date))
}

/** Removes check-ins whose id starts with the prefix. Returns how many were removed. */
export function removeCheckIns(idPrefix: string) {
  const before = checkIns.get()
  const kept = before.filter((c) => !c.id.startsWith(idPrefix))
  if (kept.length !== before.length) checkIns.set(kept)
  return before.length - kept.length
}

/** Today's date in the user's own time zone, as YYYY-MM-DD. */
export function localDay(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// ---------- everything ----------

export function purgeAll() {
  records.set([])
  checkIns.set([])
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore
  }
}

/** Merges a JSON backup. Accepts a Second Look export or a bare array of records. */
export function importBackup(text: string) {
  const parsed: unknown = JSON.parse(text)
  let recs: unknown[] | null = null
  let cis: unknown[] = []
  if (Array.isArray(parsed)) recs = parsed
  else if (parsed && typeof parsed === 'object') {
    const o = parsed as { records?: unknown; checkIns?: unknown }
    if (Array.isArray(o.records)) recs = o.records
    if (Array.isArray(o.checkIns)) cis = o.checkIns
  }
  if (!recs) throw new Error('This file is not a Second Look backup.')
  return {
    records: records.merge(
      recs.map(normalizeRecord).filter((r): r is ThoughtRecord => r !== null),
      (a, b) => b.timestamp.localeCompare(a.timestamp),
    ),
    checkIns: addCheckIns(cis.map(normalizeCheckIn).filter((c): c is CheckIn => c !== null)),
  }
}

// ---------- export ----------

export const toJson = () =>
  JSON.stringify(
    { app: 'second-look', version: 2, exportedAt: new Date().toISOString(), records: records.get(), checkIns: checkIns.get() },
    null,
    2,
  )

/** Guards against spreadsheet formula injection, then quotes. */
const cell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v
  return `"${safe.replace(/"/g, '""')}"`
}

export function toCsv(list: ThoughtRecord[]) {
  const head = [
    'Date',
    'Situation',
    'Automatic thought',
    'Emotions before',
    'Thinking traps',
    'Evidence for',
    'Evidence against',
    'Reflection',
    'Balanced thought',
    'Reframe style',
    'Emotions after',
    'Belief in reframe',
    'Relief %',
    'Pocket reminder',
    'Notes',
  ]
  const emo = (e: EmotionRating[]) => e.map((x) => `${x.name} ${x.intensity}`).join('; ')
  const rows = list.map((r) => {
    const relief = reliefPercent(r)
    return [
      r.timestamp,
      r.situation,
      r.automaticThought,
      emo(r.initialEmotions),
      r.distortions.map(distortionName).join('; '),
      r.evidenceFor.join('; '),
      r.evidenceAgainst.join('; '),
      r.socraticAnswer,
      r.rationalReframe,
      r.reframeStyle ?? '',
      emo(r.reratedEmotions),
      String(r.beliefInReframe),
      relief === null ? '' : String(relief),
      r.groundingAnchor ?? '',
      r.outcomeNotes ?? '',
    ]
      .map(cell)
      .join(',')
  })
  return [head.map(cell).join(','), ...rows].join('\r\n')
}

export function download(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export const stamp = () => localDay()
