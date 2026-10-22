import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Download, Search, Sparkles, Trash, Upload } from 'lucide-react'
import { Dialog } from '../components/Dialog'
import { DistortionBar } from '../components/DistortionBar'
import { ShiftMeter } from '../components/ShiftMeter'
import { DISTORTIONS, distortionName } from '../data/distortions'
import { formatDate, meta, reliefLabel } from '../lib/metrics'
import { deleteRecord, download, importBackup, purgeAll, stamp, toCsv, toJson, useCheckIns, useRecords } from '../lib/storage'
import { toast } from '../lib/ui'
import journalImg from '../assets/images/journal-tea.jpg'

export default function Journal() {
  const records = useRecords()
  const checkIns = useCheckIns()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  const [confirmPurge, setConfirmPurge] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return records.filter((r) => {
      if (filter && !r.distortions.includes(filter)) return false
      if (!q) return true
      return [r.situation, r.automaticThought, r.rationalReframe, r.socraticAnswer, r.groundingAnchor ?? '', r.outcomeNotes ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [records, query, filter])

  const onImport = async (file: File | undefined) => {
    if (!file) return
    try {
      const n = importBackup(await file.text())
      const total = n.records + n.checkIns
      toast(
        total === 0
          ? 'Nothing new in that file.'
          : `Imported ${n.records} ${n.records === 1 ? 'entry' : 'entries'} and ${n.checkIns} check-in${n.checkIns === 1 ? '' : 's'}.`,
      )
    } catch (err) {
      toast(err instanceof Error && err.message.includes('Second Look') ? err.message : 'That file could not be read.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const onDelete = (id: string) => {
    const undo = deleteRecord(id)
    toast('Entry deleted.', { label: 'Undo', run: undo })
  }

  const hasData = records.length > 0 || checkIns.length > 0

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Journal</h1>
          <p className="hint mt-1">
            {records.length === 0
              ? 'Nothing here yet.'
              : `${records.length} ${records.length === 1 ? 'entry' : 'entries'}, stored only in this browser.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-quiet"
            disabled={!records.length}
            onClick={() => download(`secondlook-journal-${stamp()}.csv`, toCsv(records), 'text/csv;charset=utf-8')}
            title="A spreadsheet you can share with a therapist"
          >
            <Download className="size-4" aria-hidden="true" />
            CSV
          </button>
          <button
            type="button"
            className="btn-quiet"
            disabled={!hasData}
            onClick={() => download(`secondlook-backup-${stamp()}.json`, toJson(), 'application/json')}
            title="A full backup you can import later"
          >
            <Download className="size-4" aria-hidden="true" />
            Backup
          </button>
          <button type="button" className="btn-quiet" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" />
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-label="Import a JSON backup"
            onChange={(e) => onImport(e.target.files?.[0])}
          />
        </div>
      </div>

      {records.length === 0 ? (
        <div className="card mt-8 grid overflow-hidden md:grid-cols-2">
          <img src={journalImg} alt="" className="h-48 w-full object-cover md:h-full" />
          <div className="p-8">
            <h2 className="text-2xl">Your reframes will collect here.</h2>
            <p className="hint mt-2 text-base">
              Each one keeps the thought you caught, the evidence you weighed, and the fairer version you wrote, so you can
              see your patterns over time.
            </p>
            <Link to="/studio" className="btn-primary mt-6">
              Start your first reframe
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className="card mt-8 p-6">
            <h2 className="mb-4 text-lg">Your thinking traps</h2>
            <DistortionBar records={records} />
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="relative min-w-60 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                className="field pl-10"
                placeholder="Search thoughts, reframes, notes"
                aria-label="Search entries"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="field w-auto" aria-label="Filter by thinking trap" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All thinking traps</option>
              {DISTORTIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {shown.length === 0 ? (
            <p className="hint mt-6">
              No entries match.{' '}
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={() => {
                  setQuery('')
                  setFilter('')
                }}
              >
                Clear search
              </button>
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {shown.map((r) => (
                <li key={r.id} className="card p-6">
                  <p className="text-sm text-muted">
                    {meta(formatDate(r.timestamp), r.distortions.map(distortionName).join(', '), reliefLabel(r))}
                  </p>
                  {r.situation && <p className="mt-2 text-[15px] text-muted">{r.situation}</p>}
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-canvas p-4">
                      <p className="text-sm font-medium text-muted">First look</p>
                      <p className="mt-1 italic">“{r.automaticThought}”</p>
                    </div>
                    <div className="rounded-xl bg-sage-wash p-4">
                      <p className="text-sm font-medium text-muted">
                        Second look <span className="num font-normal">· {r.beliefInReframe}% belief</span>
                      </p>
                      <p className="mt-1 font-display text-lg leading-snug">{r.rationalReframe}</p>
                    </div>
                  </div>
                  {r.groundingAnchor && (
                    <p className="mt-3 flex items-start gap-2 text-[15px] text-sage">
                      <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {r.groundingAnchor}
                    </p>
                  )}

                  <details className="group mt-4 border-t border-line pt-3">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 font-medium text-sage [&::-webkit-details-marker]:hidden">
                      <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                      Full record
                    </summary>
                    <div className="mt-3 space-y-5 text-[15px]">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <List label="Evidence for" items={r.evidenceFor} />
                        <List label="Evidence against" items={r.evidenceAgainst} />
                      </div>
                      <Field label="Reflection" text={r.socraticAnswer} />
                      <Field label="Reframe angle" text={r.reframeStyle ?? ''} />
                      <Field label="Notes" text={r.outcomeNotes ?? ''} />
                      <div>
                        <p className="mb-3 text-sm font-medium text-muted">How the feelings shifted</p>
                        <ShiftMeter before={r.initialEmotions} after={r.reratedEmotions} />
                      </div>
                      <button type="button" className="btn-text text-danger" onClick={() => onDelete(r.id)}>
                        <Trash className="size-4" aria-hidden="true" />
                        Delete entry
                      </button>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {hasData && (
        <section className="mt-14 border-t border-line pt-6">
          <h2 className="text-lg">Your data</h2>
          <p className="hint mt-1 max-w-xl">
            Entries and check-ins live only in this browser. Clearing your browser data removes them, so download a backup now
            and then.
          </p>
          <button type="button" className="btn-text mt-2 text-danger" onClick={() => setConfirmPurge(true)}>
            <Trash className="size-4" aria-hidden="true" />
            Delete everything
          </button>
        </section>
      )}

      <Dialog
        open={confirmPurge}
        onClose={() => setConfirmPurge(false)}
        title="Delete everything?"
        subtitle="This cannot be undone."
        footer={
          <>
            <button type="button" className="btn-text" onClick={() => setConfirmPurge(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary bg-danger"
              onClick={() => {
                purgeAll()
                setConfirmPurge(false)
                toast('All data deleted.')
              }}
            >
              Delete everything
            </button>
          </>
        }
      >
        <p>
          This removes all {records.length} journal {records.length === 1 ? 'entry' : 'entries'}, {checkIns.length} check-in
          {checkIns.length === 1 ? '' : 's'}, and any unfinished reframe from this browser.
        </p>
        <button
          type="button"
          className="btn-text mt-2"
          onClick={() => download(`secondlook-backup-${stamp()}.json`, toJson(), 'application/json')}
        >
          <Download className="size-4" aria-hidden="true" />
          Download a backup first
        </button>
      </Dialog>
    </div>
  )
}

function Field({ label, text }: { label: string; text: string }) {
  if (!text) return null
  return (
    <div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="whitespace-pre-wrap">{text}</p>
    </div>
  )
}

function List({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted">{label}</p>
      {items.length === 0 ? (
        <p className="text-muted">None noted</p>
      ) : (
        <ul className="list-disc pl-5">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
