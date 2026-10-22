import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { BreathOrb } from '../components/BreathOrb'
import { PATTERNS } from '../data/patterns'
import breatheImg from '../assets/images/breathe-stone.jpg'

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function Breathe() {
  const [patternId, setPatternId] = useState(PATTERNS[0].id)
  const [running, setRunning] = useState(false)
  const [sound, setSound] = useState(false)
  // Totals from earlier runs, plus the live run's progress.
  const [banked, setBanked] = useState({ cycles: 0, seconds: 0 })
  const [live, setLive] = useState({ cycles: 0, seconds: 0 })
  const pattern = PATTERNS.find((p) => p.id === patternId) ?? PATTERNS[0]

  const cycles = banked.cycles + live.cycles
  const seconds = banked.seconds + live.seconds
  const reachedTarget = cycles >= pattern.cyclesTarget

  const stop = () => {
    setBanked({ cycles, seconds })
    setLive({ cycles: 0, seconds: 0 })
    setRunning(false)
  }
  const reset = () => {
    setRunning(false)
    setBanked({ cycles: 0, seconds: 0 })
    setLive({ cycles: 0, seconds: 0 })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <section className="card relative overflow-hidden p-6 sm:p-10">
        <img src={breatheImg} alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-[0.07]" />
        <div className="relative">
          <h1 className="text-center text-4xl">Breathe</h1>
          <p className="hint mx-auto mt-2 max-w-md text-center">
            Your body settles first, then your thoughts follow. Follow the circle for a minute or two.
          </p>

          <div className="mt-10">
            <BreathOrb
              pattern={pattern}
              running={running}
              sound={sound}
              onProgress={(c, s) => setLive((prev) => (prev.cycles === c && prev.seconds === s ? prev : { cycles: c, seconds: s }))}
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <button type="button" className="btn-primary min-w-36" onClick={running ? stop : () => setRunning(true)}>
              {running ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              {running ? 'Pause' : seconds > 0 ? 'Resume' : 'Begin'}
            </button>
            <button type="button" className="btn-quiet px-3" onClick={reset} aria-label="Reset session" title="Reset">
              <RotateCcw className="size-5" />
            </button>
            <button
              type="button"
              className="btn-quiet px-3"
              onClick={() => setSound((s) => !s)}
              aria-pressed={sound}
              aria-label={sound ? 'Turn bowl sound off' : 'Turn bowl sound on'}
              title={sound ? 'Sound on' : 'Sound off'}
            >
              {sound ? <Volume2 className="size-5 text-sage" /> : <VolumeX className="size-5" />}
            </button>
          </div>

          <dl className="mx-auto mt-8 flex max-w-xs justify-around border-t border-line pt-4 text-center">
            <div>
              <dt className="text-sm text-muted">Cycles</dt>
              <dd className="num text-xl">
                {cycles} <span className="text-muted">/ {pattern.cyclesTarget}</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Time</dt>
              <dd className="num text-xl">{mmss(seconds)}</dd>
            </div>
          </dl>

          {reachedTarget && (
            <div className="mx-auto mt-6 max-w-md rounded-xl bg-sage-wash p-4 text-center">
              <p className="font-medium">Nice work. Notice how you feel now.</p>
              <p className="hint mt-1">Keep going as long as you like, or put this calmer state to use.</p>
              <Link to="/studio" className="btn-text mt-1">
                Take a second look at a thought <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <aside>
        <fieldset>
          <legend className="label text-lg">Choose a rhythm</legend>
          <div className="grid gap-2">
            {PATTERNS.map((p) => {
              const on = p.id === patternId
              return (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-sage ${
                    on ? 'border-sage bg-sage-wash' : 'border-line bg-surface hover:bg-sage-wash/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="pattern"
                    className="sr-only"
                    checked={on}
                    onChange={() => {
                      reset()
                      setPatternId(p.id)
                    }}
                  />
                  <span
                    className={`mt-1 grid size-4 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-sage' : 'border-line'}`}
                    aria-hidden="true"
                  >
                    {on && <span className="size-2 rounded-full bg-sage" />}
                  </span>
                  <span>
                    <span className="block font-medium">
                      {p.name} <span className="num ml-1 text-sm font-normal text-muted">{p.rhythm}</span>
                    </span>
                    <span className="block text-sm text-muted">{p.blurb}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
        <p className="hint mt-4">{pattern.why}</p>
        <p className="hint mt-3">If you feel lightheaded, stop and breathe normally.</p>
      </aside>
    </div>
  )
}
