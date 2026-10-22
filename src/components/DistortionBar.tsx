import { distortionCounts } from '../lib/metrics'
import type { ThoughtRecord } from '../types'

// Sage tints, darkest to lightest, so adjacent segments stay distinguishable.
const SHADES = ['#2f5242', '#3d6351', '#56876e', '#7aa890', '#a3c4b1', '#c9dccf']

export function DistortionBar({ records }: { records: ThoughtRecord[] }) {
  const counts = distortionCounts(records)
  if (counts.length === 0) return <p className="hint">No distortions named yet.</p>
  const total = counts.reduce((s, c) => s + c.count, 0)

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-line" role="img" aria-label={counts.map((c) => `${c.name} ${c.count}`).join(', ')}>
        {counts.map((c, i) => (
          <div key={c.id} style={{ width: `${(c.count / total) * 100}%`, background: SHADES[Math.min(i, SHADES.length - 1)] }} />
        ))}
      </div>
      <ul className="mt-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {counts.map((c, i) => (
          <li key={c.id} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ background: SHADES[Math.min(i, SHADES.length - 1)] }} aria-hidden="true" />
              {c.name}
            </span>
            <span className="num text-muted">{c.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
