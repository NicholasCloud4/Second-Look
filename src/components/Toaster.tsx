import { CheckCircle2, X } from 'lucide-react'
import { dismissToast, useToasts } from '../lib/ui'

export function Toaster() {
  const toasts = useToasts()
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in pointer-events-auto flex max-w-md items-center gap-3 rounded-xl bg-ink px-4 py-3 text-[15px] text-canvas shadow-lg"
        >
          <CheckCircle2 className="size-5 shrink-0 text-sage-soft" aria-hidden="true" />
          <span className="flex-1">{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="font-semibold underline underline-offset-4"
              onClick={() => {
                t.action?.run()
                dismissToast(t.id)
              }}
            >
              {t.action.label}
            </button>
          )}
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
