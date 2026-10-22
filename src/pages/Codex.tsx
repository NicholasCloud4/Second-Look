import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, HelpCircle, Search, Sparkles, X } from 'lucide-react'
import { DISTORTIONS, distortionName, SPOTTER_SCENARIOS } from '../data/distortions'
import type { DistortionDefinition } from '../types'

export default function Codex() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(DISTORTIONS[0].id)

  const q = query.trim().toLowerCase()
  const list = DISTORTIONS.filter((d) =>
    [d.name, d.shortDesc, d.commonPhrase, d.example].some((s) => s.toLowerCase().includes(q)),
  )
  const selected = list.find((d) => d.id === selectedId) ?? list[0]

  return (
    <div className="space-y-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-4xl">Thinking traps</h1>
          <p className="hint mt-2 max-w-xl text-base">
            Common patterns from cognitive behavioral therapy that bend facts into painful stories. Everyone falls into them.
            Spotting the pattern loosens its grip.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            className="field pl-10"
            placeholder="Search traps or phrases"
            aria-label="Search thinking traps"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {list.length === 0 ? (
        <p className="hint">Nothing matches “{query}”.</p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <ul className="space-y-2">
            {list.map((d) => {
              const on = d.id === selected?.id
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setSelectedId(d.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      on ? 'border-sage bg-surface ring-1 ring-sage' : 'border-line bg-surface/60 hover:bg-surface'
                    }`}
                  >
                    <span className="font-medium">{d.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">{d.commonPhrase}</span>
                  </button>
                  {/* On small screens the detail opens right under the item. */}
                  {on && (
                    <div className="mt-2 lg:hidden">
                      <Detail d={d} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          {selected && (
            <div className="sticky top-24 hidden lg:block">
              <Detail d={selected} />
            </div>
          )}
        </div>
      )}

      <Spotter />
    </div>
  )
}

function Detail({ d }: { d: DistortionDefinition }) {
  return (
    <article className="card space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="text-2xl">{d.name}</h2>
        <p className="mt-2">{d.shortDesc}</p>
      </div>
      <div className="rounded-xl bg-canvas p-4">
        <p className="text-sm font-medium text-muted">What it sounds like</p>
        <p className="mt-1 italic">{d.example}</p>
      </div>
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted">
          <HelpCircle className="size-4 text-sage" aria-hidden="true" /> Ask yourself
        </p>
        <p className="mt-1 text-lg">{d.challengeQuestion}</p>
      </div>
      <div className="rounded-xl bg-sage-wash p-4">
        <p className="flex items-center gap-1.5 text-sm font-medium text-sage">
          <Sparkles className="size-4" aria-hidden="true" /> What helps
        </p>
        <p className="mt-1">{d.clinicalAntidote}</p>
      </div>
      <Link to={`/studio?d=${d.id}`} className="btn-primary">
        Reframe a thought with this trap
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  )
}

function Spotter() {
  const [idx, setIdx] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const s = SPOTTER_SCENARIOS[idx]
  const right = answer !== null && s.accepted.includes(answer)

  return (
    <section className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl">Practice: spot the trap</h2>
        <span className="num text-sm text-muted">
          {idx + 1} of {SPOTTER_SCENARIOS.length}
        </span>
      </div>
      <p className="hint mt-1">Reading other people&apos;s thoughts is a low-stakes way to train your eye.</p>

      <blockquote className="mt-5 rounded-xl bg-canvas p-4 text-lg italic">{s.thought}</blockquote>

      <fieldset className="mt-5">
        <legend className="label">Which trap is doing the most work here?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {s.options.map((id) => {
            const picked = answer === id
            const isBest = id === s.best
            const showRight = answer !== null && (isBest || (picked && s.accepted.includes(id)))
            const showWrong = picked && !s.accepted.includes(id)
            return (
              <button
                key={id}
                type="button"
                disabled={answer !== null}
                onClick={() => setAnswer(id)}
                className={`flex min-h-12 items-center justify-between gap-2 rounded-xl border px-4 text-left transition-colors ${
                  showRight
                    ? 'border-sage bg-sage-wash font-medium'
                    : showWrong
                      ? 'border-danger/60 text-muted'
                      : 'border-line hover:bg-sage-wash/60 disabled:opacity-60'
                }`}
              >
                {distortionName(id)}
                {showRight && <Check className="size-5 text-sage" aria-label="correct" />}
                {showWrong && <X className="size-5 text-danger" aria-label="not quite" />}
              </button>
            )
          })}
        </div>
      </fieldset>

      {answer !== null && (
        <div className="mt-5 rounded-xl border border-line p-4" role="status">
          <p className="font-medium">
            {right
              ? answer === s.best
                ? 'Yes, that\'s the main one.'
                : `That fits too. The main one is ${distortionName(s.best)}.`
              : `Not quite. The main one is ${distortionName(s.best)}.`}
          </p>
          <p className="mt-1 text-muted">{s.explanation}</p>
          <button
            type="button"
            className="btn-text mt-2"
            onClick={() => {
              setIdx((i) => (i + 1) % SPOTTER_SCENARIOS.length)
              setAnswer(null)
            }}
          >
            Next example <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}
