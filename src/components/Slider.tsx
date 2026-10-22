import type { CSSProperties } from 'react'

interface Props {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  lowLabel?: string
  highLabel?: string
  /** Optional trailing text after the value, e.g. "was 80". */
  aside?: string
  onRemove?: () => void
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  lowLabel = 'None',
  highLabel = 'Overwhelming',
  aside,
  onRemove,
}: Props) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{label}</span>
        <span className="flex items-baseline gap-3">
          {aside && <span className="num text-sm text-muted">{aside}</span>}
          <span className="num text-lg">{value}</span>
          {onRemove && (
            <button type="button" onClick={onRemove} className="text-sm text-muted underline-offset-4 hover:underline" aria-label={`Remove ${label}`}>
              Remove
            </button>
          )}
        </span>
      </div>
      <input
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={`${label}, ${min} to ${max}`}
        style={{ '--fill': `${fill}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-xs text-muted">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}
