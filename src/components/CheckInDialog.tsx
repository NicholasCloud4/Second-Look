import { useState } from 'react'
import { Check, Sun } from 'lucide-react'
import { CHECKIN_STATES, moodLabel } from '../data/prompts'
import { localDay, saveCheckIn, useCheckIns } from '../lib/storage'
import { closeDialog, toast } from '../lib/ui'
import type { CheckIn } from '../types'
import { Dialog } from './Dialog'
import { Slider } from './Slider'

export function CheckInDialog({ open, initialMood }: { open: boolean; initialMood?: number }) {
  const today = localDay()
  const existing = useCheckIns().find((c) => c.date === today)

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      title={existing ? 'Update today\'s check-in' : 'Daily check-in'}
      subtitle="Thirty seconds to notice how you are, before you do anything about it."
      icon={<Sun className="size-5" />}
    >
      {/* Remounts each time it opens, so the form starts from the saved values. */}
      {open && <CheckInForm existing={existing} initialMood={initialMood} date={today} />}
    </Dialog>
  )
}

function CheckInForm({ existing, initialMood, date }: { existing?: CheckIn; initialMood?: number; date: string }) {
  const [mood, setMood] = useState(initialMood ?? existing?.mood ?? 0)
  const [energy, setEnergy] = useState(existing?.energy ?? 5)
  const [states, setStates] = useState<string[]>(existing?.states ?? [])
  const [bodyNote, setBodyNote] = useState(existing?.bodyNote ?? '')
  const [gratitude, setGratitude] = useState(existing?.gratitude ?? '')

  const save = () => {
    saveCheckIn({
      id: existing?.id ?? `checkin-${date}`,
      date,
      timestamp: new Date().toISOString(),
      mood,
      energy,
      states,
      ...(bodyNote.trim() ? { bodyNote: bodyNote.trim() } : {}),
      ...(gratitude.trim() ? { gratitude: gratitude.trim() } : {}),
    })
    closeDialog()
    toast(existing ? 'Check-in updated.' : 'Check-in saved.')
  }

  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="label">How is your mood right now?</legend>
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={mood === n}
              aria-label={`${n}, ${moodLabel(n)}`}
              onClick={() => setMood(n)}
              className={`num h-11 rounded-lg border text-[15px] transition-colors ${
                mood === n ? 'border-sage bg-sage text-on-sage' : 'border-line bg-canvas hover:bg-sage-wash'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-muted">
          <span>1 · Very low</span>
          <span className="font-medium text-ink">{mood ? moodLabel(mood) : 'Tap a number'}</span>
          <span>Very good · 10</span>
        </div>
      </fieldset>

      <Slider label="Energy" value={energy} onChange={setEnergy} min={1} max={10} lowLabel="Running on empty" highLabel="Lots of energy" />

      <fieldset>
        <legend className="label">
          Words that fit <span className="font-normal text-muted">(optional, pick any)</span>
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {CHECKIN_STATES.map((s) => {
            const on = states.includes(s)
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setStates(on ? states.filter((x) => x !== s) : [...states, s])}
                className={`min-h-10 rounded-lg border px-3 text-[15px] transition-colors ${
                  on ? 'border-sage bg-sage text-on-sage' : 'border-line bg-canvas hover:bg-sage-wash'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div>
        <label className="label" htmlFor="ci-body">
          Anything in your body? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="ci-body" className="field" value={bodyNote} onChange={(e) => setBodyNote(e.target.value)} placeholder="Tight shoulders, slept badly, calm stomach…" />
      </div>
      <div>
        <label className="label" htmlFor="ci-grat">
          One small good thing <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="ci-grat" className="field" value={gratitude} onChange={(e) => setGratitude(e.target.value)} placeholder="Morning coffee in the quiet" />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <button type="button" className="btn-text" onClick={closeDialog}>
          Cancel
        </button>
        <div className="flex flex-col items-end">
          <button type="button" className="btn-primary" disabled={!mood} onClick={save}>
            <Check className="size-4" aria-hidden="true" />
            {existing ? 'Update' : 'Save check-in'}
          </button>
          {!mood && <span className="mt-1 text-xs text-muted">Pick a mood number first.</span>}
        </div>
      </div>
    </div>
  )
}
