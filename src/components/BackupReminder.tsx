import { useReducer } from 'react'
import { Download } from 'lucide-react'
import { formatDate } from '../lib/metrics'
import { backupReminder, downloadBackup, snoozeBackupReminder, useCheckIns, useRecords } from '../lib/storage'
import { toast } from '../lib/ui'

/** A gentle, dismissible nudge to download a backup once enough is at stake. Never blocks anything. */
export function BackupReminder() {
  // Re-check whenever entries or check-ins change.
  useRecords()
  useCheckIns()
  const [, refresh] = useReducer((n: number) => n + 1, 0)
  const due = backupReminder()
  if (!due) return null

  return (
    <section className="card flex flex-wrap items-center justify-between gap-4 p-6" aria-label="Backup reminder">
      <div className="flex max-w-2xl items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sage-wash text-sage">
          <Download className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg">Save a backup</h2>
          <p className="hint mt-1">
            {due.last
              ? `${due.changed} new or edited since your last backup on ${formatDate(due.last)}.`
              : `You have ${due.changed} entries and check-ins and no backup yet.`}{' '}
            Everything lives only in this browser, so a backup file is how you get it back if browser data is cleared.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            downloadBackup()
            refresh()
            toast('Backup downloaded. Keep the file somewhere private.')
          }}
        >
          Download backup
        </button>
        <button
          type="button"
          className="btn-text"
          onClick={() => {
            snoozeBackupReminder()
            refresh()
          }}
        >
          Not now
        </button>
      </div>
    </section>
  )
}
