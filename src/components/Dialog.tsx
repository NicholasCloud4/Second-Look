import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/** Native <dialog>: focus trapping, Escape to close and inert background come for free. */
export function Dialog({ open, onClose, title, subtitle, icon, children, footer }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    else if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
      className="m-auto max-h-[90dvh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl"
    >
      {open && (
        <div className="flex max-h-[90dvh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div className="flex items-start gap-3">
              {icon && <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-sage-wash text-sage">{icon}</span>}
              <div>
                <h2 id="dialog-title" className="text-lg">
                  {title}
                </h2>
                {subtitle && <p className="hint">{subtitle}</p>}
              </div>
            </div>
            <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-sage-wash hover:text-ink" aria-label="Close">
              <X className="size-5" />
            </button>
          </header>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && <footer className="flex items-center justify-end gap-3 border-t border-line px-6 py-3">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
