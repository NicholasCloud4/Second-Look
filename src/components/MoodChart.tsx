import { useState } from 'react'
import { moodLabel } from '../data/prompts'
import { localDay } from '../lib/storage'
import type { CheckIn } from '../types'

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
]

const W = 640
const H = 200
const PAD_L = 28
const PAD_R = 12
const PAD_T = 12
const PAD_B = 28

const parseDay = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function MoodChart({ checkIns }: { checkIns: CheckIn[] }) {
  const [days, setDays] = useState(7)
  const [picked, setPicked] = useState<string | null>(null)
  const [today] = useState(() => new Date())

  // One slot per calendar day, so gaps between check-ins stay visible.
  const slots = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - i))
    return localDay(d)
  })
  const byDate = new Map(checkIns.map((c) => [c.date, c]))
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const x = (i: number) => PAD_L + (days === 1 ? innerW / 2 : (i / (days - 1)) * innerW)
  const y = (v: number) => PAD_T + (1 - (v - 1) / 9) * innerH

  const points = slots
    .map((date, i) => ({ date, i, c: byDate.get(date) }))
    .filter((p): p is { date: string; i: number; c: CheckIn } => !!p.c)

  const line = (key: 'mood' | 'energy') => points.map((p, k) => `${k ? 'L' : 'M'}${x(p.i)},${y(p.c[key])}`).join(' ')
  const selected = points.find((p) => p.date === picked) ?? points[points.length - 1]

  const inRange = points.map((p) => p.c)
  const avg = (k: 'mood' | 'energy') =>
    inRange.length ? (inRange.reduce((s, c) => s + c[k], 0) / inRange.length).toFixed(1) : '—'

  let trend = ''
  if (inRange.length >= 4) {
    const half = Math.floor(inRange.length / 2)
    const a = inRange.slice(0, half)
    const b = inRange.slice(-half)
    const diff = b.reduce((s, c) => s + c.mood, 0) / b.length - a.reduce((s, c) => s + c.mood, 0) / a.length
    trend = diff >= 0.75 ? `Up ${diff.toFixed(1)}` : diff <= -0.75 ? `Down ${Math.abs(diff).toFixed(1)}` : 'Steady'
  }

  const tickEvery = days <= 7 ? 1 : days <= 14 ? 2 : 5

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded bg-sage" aria-hidden="true" /> Mood
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t-2 border-dashed border-ochre" aria-hidden="true" /> Energy
          </span>
        </div>
        <div className="flex rounded-lg border border-line p-0.5 text-sm" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              aria-pressed={days === r.days}
              onClick={() => {
                setDays(r.days)
                setPicked(null)
              }}
              className={`min-h-9 rounded-md px-3 ${days === r.days ? 'bg-sage-wash font-medium text-ink' : 'text-muted hover:text-ink'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {points.length === 0 ? (
        <p className="hint py-10 text-center">No check-ins in the last {days} days.</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label={`Mood and energy over the last ${days} days`}>
          {[1, 5, 10].map((v) => (
            <g key={v}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} style={{ stroke: 'var(--line)' }} strokeDasharray={v === 5 ? undefined : '3 4'} />
              <text x={PAD_L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" style={{ fill: 'var(--muted)' }}>
                {v}
              </text>
            </g>
          ))}
          {slots.map((date, i) =>
            i % tickEvery === 0 || i === days - 1 ? (
              <text key={date} x={x(i)} y={H - 8} textAnchor={i === days - 1 ? 'end' : i === 0 ? 'start' : 'middle'} fontSize="11" style={{ fill: 'var(--muted)' }}>
                {parseDay(date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
              </text>
            ) : null,
          )}
          {points.length > 1 && (
            <>
              <path d={line('energy')} fill="none" strokeWidth="2" strokeDasharray="5 5" style={{ stroke: 'var(--ochre)' }} opacity="0.8" />
              <path d={line('mood')} fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" style={{ stroke: 'var(--sage)' }} />
            </>
          )}
          {points.map((p) => {
            const on = p.date === selected?.date
            return (
              <g key={p.date} className="cursor-pointer" onClick={() => setPicked(p.date)} onMouseEnter={() => setPicked(p.date)}>
                <circle cx={x(p.i)} cy={y(p.c.mood)} r="14" fill="transparent" />
                <circle
                  cx={x(p.i)}
                  cy={y(p.c.mood)}
                  r={on ? 6 : 4}
                  strokeWidth="2"
                  style={{ fill: on ? 'var(--ink)' : 'var(--sage)', stroke: 'var(--surface)' }}
                />
              </g>
            )
          })}
        </svg>
      )}

      {selected && (
        <div className="mt-3 rounded-xl bg-canvas p-4">
          <label className="sr-only" htmlFor="mood-day">
            Choose a day
          </label>
          <select
            id="mood-day"
            className="sr-only"
            value={selected.date}
            onChange={(e) => setPicked(e.target.value)}
          >
            {points.map((p) => (
              <option key={p.date} value={p.date}>
                {p.date}
              </option>
            ))}
          </select>
          <p className="font-medium">
            {parseDay(selected.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            <span className="num ml-2 font-normal text-muted">
              Mood {selected.c.mood} ({moodLabel(selected.c.mood)}) · Energy {selected.c.energy}
            </span>
          </p>
          {(selected.c.states.length > 0 || selected.c.bodyNote) && (
            <p className="mt-1 text-[15px] text-muted">
              {[selected.c.states.join(', '), selected.c.bodyNote].filter(Boolean).join(' · ')}
            </p>
          )}
          {selected.c.gratitude && <p className="mt-1 text-[15px] italic">Good thing: {selected.c.gratitude}</p>}
        </div>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <dt className="text-sm text-muted">Average mood</dt>
          <dd className="num text-2xl">{avg('mood')}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Average energy</dt>
          <dd className="num text-2xl">{avg('energy')}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Trend</dt>
          <dd className="text-lg font-medium">{trend || <span className="text-muted">Need 4+ days</span>}</dd>
        </div>
      </dl>
    </div>
  )
}
