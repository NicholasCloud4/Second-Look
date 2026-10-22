import type { EmotionRating } from '../types'

interface Props {
  before: EmotionRating[]
  after: EmotionRating[]
}

export function ShiftMeter({ before, after }: Props) {
  return (
    <ul className="space-y-5">
      {before.map((b) => {
        const a = after.find((x) => x.name === b.name)?.intensity ?? b.intensity
        return (
          <li key={b.name}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="font-medium">{b.name}</span>
              <span className="num text-sm text-muted">
                {b.intensity} → <span className="text-ink">{a}</span>
              </span>
            </div>
            <div className="space-y-1" aria-hidden="true">
              <div className="h-2 rounded-full bg-line">
                <div className="h-full rounded-full bg-muted/50" style={{ width: `${b.intensity}%` }} />
              </div>
              <div className="h-2 rounded-full bg-line">
                <div className="h-full rounded-full bg-sage" style={{ width: `${a}%` }} />
              </div>
            </div>
          </li>
        )
      })}
      <li className="flex gap-4 text-xs text-muted">
        <span>Grey: before</span>
        <span>Green: after</span>
      </li>
    </ul>
  )
}
