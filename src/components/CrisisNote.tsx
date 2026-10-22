import { Globe, HeartHandshake, MessageSquare, Phone, Shield } from 'lucide-react'
import { CRISIS_LINES } from '../data/prompts'
import { openDialog } from '../lib/ui'

const ICONS = { phone: Phone, message: MessageSquare, shield: Shield, globe: Globe }

export function CrisisLines() {
  return (
    <ul className="space-y-2">
      {CRISIS_LINES.map((l) => {
        const Icon = ICONS[l.icon]
        return (
          <li key={l.name} className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-3.5">
            <Icon className="mt-0.5 size-5 shrink-0 text-sage" aria-hidden="true" />
            <div>
              <p className="font-medium">
                {l.name} <span className="text-sm font-normal text-muted">· {l.where}</span>
              </p>
              <p className="text-[15px] text-muted">{l.how}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Shown inline when ratings are very high. */
export function CrisisNote() {
  return (
    <div className="rounded-xl border border-sage bg-sage-wash p-5">
      <p className="flex items-center gap-2 font-medium">
        <HeartHandshake className="size-5 text-sage" aria-hidden="true" />
        These feelings are very strong right now.
      </p>
      <p className="mt-1 text-[15px] text-muted">
        That is worth taking seriously. If you feel unsafe or are thinking about hurting yourself, please reach out to someone now.
        You can keep going here too.
      </p>
      <button type="button" className="btn-quiet mt-3" onClick={() => openDialog('crisis')}>
        See support lines
      </button>
    </div>
  )
}
