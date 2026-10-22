import { useSyncExternalStore } from 'react'

/** A tiny in-memory value store for app-wide UI state. */
function signal<T>(initial: T) {
  let value = initial
  const listeners = new Set<() => void>()
  const subscribe = (cb: () => void) => {
    listeners.add(cb)
    return () => listeners.delete(cb)
  }
  return {
    get: () => value,
    set: (next: T) => {
      value = next
      listeners.forEach((l) => l())
    },
    use: () => useSyncExternalStore(subscribe, () => value),
  }
}

// ---------- dialogs ----------

export interface DialogState {
  name: 'crisis' | 'checkin' | null
  /** Check-in only: a mood already tapped on the home page. */
  mood?: number
}
const dialog = signal<DialogState>({ name: null })
export const useOpenDialog = dialog.use
export const openDialog = (name: 'crisis' | 'checkin', mood?: number) => dialog.set({ name, mood })
export const closeDialog = () => dialog.set({ name: null })

// ---------- toasts ----------

export interface Toast {
  id: number
  message: string
  action?: { label: string; run: () => void }
}

const toasts = signal<Toast[]>([])
let nextId = 1
export const useToasts = toasts.use

export function dismissToast(id: number) {
  toasts.set(toasts.get().filter((t) => t.id !== id))
}

export function toast(message: string, action?: Toast['action']) {
  const id = nextId++
  toasts.set([...toasts.get().slice(-2), { id, message, action }])
  window.setTimeout(() => dismissToast(id), action ? 7000 : 4000)
}
