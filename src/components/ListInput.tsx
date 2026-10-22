import { useState } from 'react'

interface Props {
  label: string
  hint?: string
  placeholder?: string
  items: string[]
  onChange: (items: string[]) => void
}

export function ListInput({ label, hint, placeholder, items, onChange }: Props) {
  const [text, setText] = useState('')

  const add = () => {
    const t = text.trim()
    if (!t) return
    onChange([...items, t])
    setText('')
  }

  return (
    <div>
      <label className="label" htmlFor={`li-${label}`}>
        {label}
      </label>
      {hint && <p className="hint mb-2">{hint}</p>}
      {items.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex items-start justify-between gap-3 rounded-lg bg-sage-wash px-3 py-2 text-[15px]">
              <span>{it}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="shrink-0 text-sm text-muted underline-offset-4 hover:underline"
                aria-label={`Remove: ${it}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={`li-${label}`}
          className="field"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
        />
        <button type="button" className="btn-quiet shrink-0" onClick={add} disabled={!text.trim()}>
          Add
        </button>
      </div>
    </div>
  )
}
