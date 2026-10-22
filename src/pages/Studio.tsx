import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Lightbulb, Pause, Play, Save } from 'lucide-react'
import { BreathOrb } from '../components/BreathOrb'
import { CrisisNote } from '../components/CrisisNote'
import { ListInput } from '../components/ListInput'
import { ShiftMeter } from '../components/ShiftMeter'
import { Slider } from '../components/Slider'
import { DISTORTIONS, distortionById, distortionName } from '../data/distortions'
import { PATTERNS } from '../data/patterns'
import { EMOTION_OPTIONS, REFRAME_STYLES, TRIGGER_STARTERS, UNIVERSAL_QUESTIONS } from '../data/prompts'
import { meta, reliefLabel, reliefPercent } from '../lib/metrics'
import { addRecord, DRAFT_KEY } from '../lib/storage'
import { toast } from '../lib/ui'
import type { EmotionRating, ReframeStyle, ThoughtRecord } from '../types'

interface Draft {
  step: number
  maxStep: number
  situation: string
  automaticThought: string
  initialEmotions: EmotionRating[]
  distortions: string[]
  evidenceFor: string[]
  evidenceAgainst: string[]
  socraticAnswer: string
  rationalReframe: string
  reframeStyle: ReframeStyle | ''
  reratedEmotions: EmotionRating[]
  beliefInReframe: number
  groundingAnchor: string
  outcomeNotes: string
}

const EMPTY: Draft = {
  step: 0,
  maxStep: 0,
  situation: '',
  automaticThought: '',
  initialEmotions: [],
  distortions: [],
  evidenceFor: [],
  evidenceAgainst: [],
  socraticAnswer: '',
  rationalReframe: '',
  reframeStyle: '',
  reratedEmotions: [],
  beliefInReframe: 50,
  groundingAnchor: '',
  outcomeNotes: '',
}

const STEPS = ['Settle', 'Catch it', 'Feel', 'Name it', 'Test it', 'Reframe', 'Re-rate']

function loadDraft(preselect: string | null): Draft {
  let d = EMPTY
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) d = { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) }
  } catch {
    // fall through to a fresh draft
  }
  d = { ...d, step: Math.min(d.step, STEPS.length - 1), maxStep: Math.min(Math.max(d.maxStep, d.step), STEPS.length - 1) }
  if (preselect && distortionById(preselect) && !d.distortions.includes(preselect)) {
    d = { ...d, distortions: [...d.distortions, preselect] }
  }
  return d
}

const newId = () =>
  typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore
  }
}

export default function Studio() {
  const [params] = useSearchParams()
  const [draft, setDraft] = useState<Draft>(() => loadDraft(params.get('d')))
  const [saved, setSaved] = useState<ThoughtRecord | null>(null)
  const [breathing, setBreathing] = useState(false)
  const [customEmotion, setCustomEmotion] = useState('')

  useEffect(() => {
    if (saved) return
    const isEmpty = JSON.stringify({ ...draft, step: 0, maxStep: 0 }) === JSON.stringify(EMPTY)
    try {
      if (isEmpty) localStorage.removeItem(DRAFT_KEY)
      else localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // draft persistence is best-effort
    }
  }, [draft, saved])

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const go = (step: number) => {
    setBreathing(false)
    setDraft((d) => {
      // Entering re-rate: seed sliders from the "before" values, keeping edits already made.
      const reratedEmotions =
        step === 6
          ? d.initialEmotions.map((e) => d.reratedEmotions.find((r) => r.name === e.name) ?? { ...e })
          : d.reratedEmotions
      return { ...d, step, maxStep: Math.max(d.maxStep, step), reratedEmotions }
    })
    window.scrollTo({ top: 0 })
  }

  const blocker = [
    '',
    !draft.automaticThought.trim() ? 'Write down the thought to continue.' : '',
    draft.initialEmotions.length === 0 ? 'Choose at least one feeling to continue.' : '',
    '',
    '',
    !draft.rationalReframe.trim() ? 'Write a balanced thought to continue.' : '',
    '',
  ][draft.step]

  const save = () => {
    const rec: ThoughtRecord = {
      id: newId(),
      timestamp: new Date().toISOString(),
      situation: draft.situation.trim(),
      automaticThought: draft.automaticThought.trim(),
      initialEmotions: draft.initialEmotions,
      distortions: draft.distortions,
      evidenceFor: draft.evidenceFor,
      evidenceAgainst: draft.evidenceAgainst,
      socraticAnswer: draft.socraticAnswer.trim(),
      rationalReframe: draft.rationalReframe.trim(),
      reratedEmotions: draft.reratedEmotions,
      beliefInReframe: draft.beliefInReframe,
      ...(draft.reframeStyle ? { reframeStyle: draft.reframeStyle } : {}),
      ...(draft.groundingAnchor.trim() ? { groundingAnchor: draft.groundingAnchor.trim() } : {}),
      ...(draft.outcomeNotes.trim() ? { outcomeNotes: draft.outcomeNotes.trim() } : {}),
    }
    addRecord(rec)
    clearDraft()
    setSaved(rec)
    toast('Saved to your journal.')
    window.scrollTo({ top: 0 })
  }

  const startOver = () => {
    clearDraft()
    setSaved(null)
    setDraft(EMPTY)
  }

  if (saved) return <Summary record={saved} onAgain={startOver} />

  const toggleEmotion = (name: string) => {
    const has = draft.initialEmotions.some((e) => e.name === name)
    set({
      initialEmotions: has
        ? draft.initialEmotions.filter((e) => e.name !== name)
        : [...draft.initialEmotions, { name, intensity: 50 }],
    })
  }

  const addCustomEmotion = () => {
    const name = customEmotion.trim()
    if (!name) return
    if (!draft.initialEmotions.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
      set({ initialEmotions: [...draft.initialEmotions, { name, intensity: 50 }] })
    }
    setCustomEmotion('')
  }

  const setIntensity = (key: 'initialEmotions' | 'reratedEmotions', name: string, intensity: number) =>
    set({ [key]: draft[key].map((e) => (e.name === name ? { ...e, intensity } : e)) })

  const chosen = DISTORTIONS.filter((d) => draft.distortions.includes(d.id))
  const veryHigh = draft.initialEmotions.some((e) => e.intensity >= 90)
  const liveRelief = reliefPercent({ initialEmotions: draft.initialEmotions, reratedEmotions: draft.reratedEmotions } as ThoughtRecord)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper: visited steps are clickable */}
      <nav aria-label="Steps" className="mb-6">
        <ol className="flex gap-1.5">
          {STEPS.map((s, i) => {
            const current = i === draft.step
            const reachable = i <= draft.maxStep
            return (
              <li key={s} className="flex-1">
                <button
                  type="button"
                  disabled={!reachable || current}
                  onClick={() => go(i)}
                  aria-current={current ? 'step' : undefined}
                  className="group w-full text-left disabled:cursor-default"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-colors ${
                      current ? 'bg-sage' : reachable ? 'bg-sage/45 group-hover:bg-sage/70' : 'bg-line'
                    }`}
                  />
                  <span
                    className={`mt-2 hidden text-xs sm:block ${current ? 'font-semibold text-ink' : reachable ? 'text-muted group-hover:text-ink' : 'text-muted/60'}`}
                  >
                    {s}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <p className="mt-2 text-sm text-muted sm:hidden">
          Step <span className="num">{draft.step + 1}</span> of {STEPS.length} · {STEPS[draft.step]}
        </p>
      </nav>

      <section className="card p-6 sm:p-9">
        {draft.step === 0 && (
          <div className="text-center">
            <h1 className="text-3xl">Settle first</h1>
            <p className="hint mx-auto mt-2 max-w-md">
              A racing body makes every thought feel more true. Thirty seconds of slow breathing makes the next steps easier.
              This step is optional.
            </p>
            <div className="mx-auto my-8 max-w-64">
              <BreathOrb
                pattern={PATTERNS[0]}
                running={breathing}
                sound={false}
                durationSec={30}
                idleText="30 seconds"
                onComplete={() => go(1)}
              />
            </div>
            <button type="button" className="btn-primary" onClick={() => setBreathing((b) => !b)}>
              {breathing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              {breathing ? 'Pause' : 'Breathe for 30 seconds'}
            </button>
          </div>
        )}

        {draft.step === 1 && (
          <div className="space-y-7">
            <StepHeading title="Catch the thought" text="Write what happened and what your mind said, without editing either. Thoughts are events, not facts." />
            <div>
              <label className="label" htmlFor="situation">
                What happened? <span className="font-normal text-muted">(optional)</span>
              </label>
              <p className="hint mb-2">Just the facts a camera would see: where, when, who.</p>
              <textarea
                id="situation"
                className="field min-h-24"
                value={draft.situation}
                onChange={(e) => set({ situation: e.target.value })}
                placeholder="Sent the report to my manager four hours ago. No reply yet."
              />
              {!draft.situation && (
                <div className="mt-2 flex flex-wrap gap-x-1 gap-y-0.5">
                  <span className="mr-1 py-1.5 text-sm text-muted">Common:</span>
                  {TRIGGER_STARTERS.map((t) => (
                    <button key={t} type="button" className="rounded-md px-2 py-1.5 text-sm text-sage hover:bg-sage-wash" onClick={() => set({ situation: `${t}: ` })}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="label" htmlFor="thought">
                What went through your mind?
              </label>
              <p className="hint mb-2">Use your own words, even the harsh ones. Nobody else will see this.</p>
              <textarea
                id="thought"
                className="field min-h-28"
                value={draft.automaticThought}
                onChange={(e) => set({ automaticThought: e.target.value })}
                placeholder="They think my work is shallow. I'm not cut out for this."
              />
            </div>
          </div>
        )}

        {draft.step === 2 && (
          <div className="space-y-7">
            <StepHeading title="What do you feel?" text="Choose what fits, then rate how strong each feeling is right now." />
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Feelings">
              {EMOTION_OPTIONS.map((name) => {
                const on = draft.initialEmotions.some((e) => e.name === name)
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleEmotion(name)}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-4 text-[15px] transition-colors ${
                      on ? 'border-sage bg-sage text-on-sage' : 'border-line bg-surface hover:bg-sage-wash'
                    }`}
                  >
                    {on && <Check className="size-4" aria-hidden="true" />}
                    {name}
                  </button>
                )
              })}
            </div>
            <div className="flex max-w-md gap-2">
              <input
                className="field"
                value={customEmotion}
                placeholder="Something else…"
                aria-label="Add another feeling"
                onChange={(e) => setCustomEmotion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomEmotion()
                  }
                }}
              />
              <button type="button" className="btn-quiet shrink-0" onClick={addCustomEmotion} disabled={!customEmotion.trim()}>
                Add
              </button>
            </div>
            {draft.initialEmotions.length > 0 && (
              <div className="space-y-6 border-t border-line pt-6">
                {draft.initialEmotions.map((e) => (
                  <Slider
                    key={e.name}
                    label={e.name}
                    value={e.intensity}
                    step={5}
                    onChange={(v) => setIntensity('initialEmotions', e.name, v)}
                    onRemove={() => toggleEmotion(e.name)}
                  />
                ))}
              </div>
            )}
            {veryHigh && <CrisisNote />}
          </div>
        )}

        {draft.step === 3 && (
          <div className="space-y-6">
            <StepHeading
              title="Which thinking traps show up?"
              text="Tap any that sound like your thought. Most thoughts have one to three. Naming a pattern is a guess, not a verdict."
            />
            <ThoughtQuote text={draft.automaticThought} />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {DISTORTIONS.map((d) => {
                const on = draft.distortions.includes(d.id)
                return (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ distortions: on ? draft.distortions.filter((x) => x !== d.id) : [...draft.distortions, d.id] })}
                    className={`flex flex-col rounded-xl border p-4 text-left transition-colors ${
                      on ? 'border-sage bg-sage-wash ring-1 ring-sage' : 'border-line bg-surface hover:bg-sage-wash/60'
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-medium">{d.name}</span>
                      <span
                        className={`grid size-5 shrink-0 place-items-center rounded-full border ${on ? 'border-sage bg-sage text-on-sage' : 'border-line'}`}
                        aria-hidden="true"
                      >
                        {on && <Check className="size-3.5" />}
                      </span>
                    </span>
                    <span className="mt-1 text-sm text-muted">{d.shortDesc}</span>
                    <span className="mt-2 text-sm italic text-sage">{d.commonPhrase}</span>
                  </button>
                )
              })}
            </div>
            <p className="hint">
              Not sure? You can skip this, or{' '}
              <Link to="/codex" className="underline underline-offset-4">
                read about each trap
              </Link>{' '}
              (your progress is saved).
            </p>
          </div>
        )}

        {draft.step === 4 && (
          <div className="space-y-7">
            <StepHeading title="Put the thought on trial" text="Treat it as a claim to examine, not a fact to defend. Facts only, on both sides." />
            <ThoughtQuote text={draft.automaticThought} />
            <div className="grid gap-6 md:grid-cols-2">
              <ListInput
                label="Evidence for the thought"
                hint="What facts back it up?"
                placeholder="A fact that supports it"
                items={draft.evidenceFor}
                onChange={(evidenceFor) => set({ evidenceFor })}
              />
              <ListInput
                label="Evidence against it"
                hint="Exceptions, other explanations, things that went fine."
                placeholder="A fact that doesn't fit"
                items={draft.evidenceAgainst}
                onChange={(evidenceAgainst) => set({ evidenceAgainst })}
              />
            </div>

            <div className="rounded-xl bg-canvas p-5">
              <h2 className="flex items-center gap-2 text-lg">
                <Lightbulb className="size-5 text-ochre" aria-hidden="true" />
                Questions to sit with
              </h2>
              <ul className="mt-3 space-y-3 text-[15px]">
                {chosen.map((d) => (
                  <li key={d.id}>
                    <span className="font-medium">{d.name}:</span> {d.challengeQuestion}
                    <span className="hint block">{d.clinicalAntidote}</span>
                  </li>
                ))}
                {UNIVERSAL_QUESTIONS.map((q) => (
                  <li key={q.id}>
                    <span className="font-medium">{q.title}:</span> {q.text}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="label" htmlFor="socratic">
                What do you notice when you ask yourself these? <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                id="socratic"
                className="field min-h-24"
                value={draft.socraticAnswer}
                onChange={(e) => set({ socraticAnswer: e.target.value })}
                placeholder="If a friend said this, I'd remind them one slow reply doesn't mean anything about their work."
              />
            </div>
          </div>
        )}

        {draft.step === 5 && (
          <div className="space-y-7">
            <StepHeading title="Write a more balanced thought" text="Realistic and kind, not forced positivity. It only needs to be a little more true than the first one." />

            <fieldset>
              <legend className="label">Pick an angle (optional)</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {REFRAME_STYLES.map((s) => {
                  const on = draft.reframeStyle === s.style
                  return (
                    <button
                      key={s.style}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set({ reframeStyle: on ? '' : s.style })}
                      className={`rounded-xl border p-4 text-left transition-colors ${on ? 'border-sage bg-sage-wash ring-1 ring-sage' : 'border-line hover:bg-sage-wash/60'}`}
                    >
                      <span className="block font-medium">{s.style}</span>
                      <span className="mt-1 block text-sm text-muted">{s.question}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-line bg-canvas p-4">
                <p className="text-sm font-medium text-muted">Your first thought</p>
                <p className="mt-1 italic">“{draft.automaticThought}”</p>
              </div>
              <div>
                <label className="label" htmlFor="reframe">
                  Your second look
                </label>
                <textarea
                  id="reframe"
                  className="field min-h-32 border-sage/50 bg-surface"
                  value={draft.rationalReframe}
                  onChange={(e) => set({ rationalReframe: e.target.value })}
                  placeholder="Write it in your own words…"
                />
              </div>
            </div>

            {(() => {
              const style = REFRAME_STYLES.find((s) => s.style === draft.reframeStyle)
              const starters = style ? [style.starter] : REFRAME_STYLES.map((s) => s.starter)
              return (
                <div>
                  <p className="hint">Stuck? Tap an opener to drop it in, then fill the blanks.</p>
                  <ul className="mt-1">
                    {starters.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          className="btn-text min-h-9 text-left"
                          onClick={() => set({ rationalReframe: draft.rationalReframe ? `${draft.rationalReframe} ${s}` : s })}
                        >
                          + {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}

            <div>
              <label className="label" htmlFor="anchor">
                A pocket reminder <span className="font-normal text-muted">(optional)</span>
              </label>
              <p className="hint mb-2">A short line you can come back to next time this thought shows up.</p>
              <input
                id="anchor"
                className="field"
                value={draft.groundingAnchor}
                onChange={(e) => set({ groundingAnchor: e.target.value })}
                placeholder="I don't have to be perfect to be good at this."
              />
            </div>
          </div>
        )}

        {draft.step === 6 && (
          <div className="space-y-7">
            <StepHeading title="Take a second look" text="Read your balanced thought slowly. Then rate how you feel now. Any change counts, and no change is fine too." />
            <blockquote className="border-l-2 border-ochre pl-4 font-display text-xl leading-snug">{draft.rationalReframe}</blockquote>
            <Slider
              label="How much do you believe it?"
              value={draft.beliefInReframe}
              step={5}
              onChange={(v) => set({ beliefInReframe: v })}
              lowLabel="Not at all"
              highLabel="Completely"
            />
            <div className="space-y-6 border-t border-line pt-6">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg">How strong is each feeling now?</h2>
                {liveRelief !== null && liveRelief > 0 && <span className="num text-sm font-medium text-sage">{liveRelief}% lighter</span>}
              </div>
              {draft.reratedEmotions.map((e) => {
                const before = draft.initialEmotions.find((x) => x.name === e.name)?.intensity
                return (
                  <Slider
                    key={e.name}
                    label={e.name}
                    aside={before === undefined ? undefined : `was ${before}`}
                    value={e.intensity}
                    step={5}
                    onChange={(v) => setIntensity('reratedEmotions', e.name, v)}
                  />
                )
              })}
            </div>
            <div>
              <label className="label" htmlFor="notes">
                Anything else you noticed? <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea id="notes" className="field min-h-20" value={draft.outcomeNotes} onChange={(e) => set({ outcomeNotes: e.target.value })} />
            </div>
          </div>
        )}
      </section>

      <div className="mt-6 flex items-start justify-between gap-3">
        {draft.step > 0 ? (
          <button type="button" className="btn-text" onClick={() => go(draft.step - 1)}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </button>
        ) : (
          <Link to="/" className="btn-text">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </Link>
        )}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {draft.step === 0 && (
              <button type="button" className="btn-text" onClick={() => go(1)}>
                Skip
              </button>
            )}
            {draft.step < STEPS.length - 1 ? (
              <button type="button" className="btn-primary" disabled={!!blocker} onClick={() => go(draft.step + 1)}>
                {draft.step === 0 ? 'Continue' : `Next: ${STEPS[draft.step + 1]}`}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={save}>
                <Save className="size-4" aria-hidden="true" />
                Save to journal
              </button>
            )}
          </div>
          {blocker && <p className="text-sm text-muted">{blocker}</p>}
        </div>
      </div>

      {draft.maxStep > 0 && (
        <p className="hint mt-8 text-center">
          Your progress is saved on this device as you go.{' '}
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => window.confirm('Discard this reframe and start fresh?') && startOver()}
          >
            Start over
          </button>
        </p>
      )}
    </div>
  )
}

function StepHeading({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h1 className="text-3xl">{title}</h1>
      <p className="hint mt-2 text-base">{text}</p>
    </div>
  )
}

function ThoughtQuote({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-canvas px-4 py-3">
      <p className="text-sm text-muted">The thought</p>
      <p className="italic">“{text}”</p>
    </div>
  )
}

function Summary({ record, onAgain }: { record: ThoughtRecord; onAgain: () => void }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl">Saved. Here is your shift.</h1>
        <p className="hint mt-2">
          {meta(
            reliefLabel(record),
            record.distortions.map(distortionName).join(', '),
            `${record.beliefInReframe}% belief in the new thought`,
          )}
        </p>
      </div>

      <section className="card grid gap-6 p-6 sm:p-8 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-muted">First look</p>
          <p className="mt-1 italic text-muted">“{record.automaticThought}”</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">Second look{record.reframeStyle ? ` · ${record.reframeStyle}` : ''}</p>
          <p className="mt-1 border-l-2 border-ochre pl-4 font-display text-xl leading-snug">{record.rationalReframe}</p>
        </div>
        {record.groundingAnchor && (
          <p className="rounded-xl bg-sage-wash p-4 md:col-span-2">
            <span className="text-sm font-medium text-muted">Pocket reminder: </span>
            {record.groundingAnchor}
          </p>
        )}
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="mb-5 text-lg">How your feelings shifted</h2>
        <ShiftMeter before={record.initialEmotions} after={record.reratedEmotions} />
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/journal" className="btn-primary">
          Open journal
        </Link>
        <button type="button" className="btn-quiet" onClick={onAgain}>
          Reframe another thought
        </button>
        <Link to="/" className="btn-quiet">
          Home
        </Link>
      </div>
    </div>
  )
}
