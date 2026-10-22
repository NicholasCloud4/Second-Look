import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, PenLine, RefreshCw, Sun, Wind } from 'lucide-react'
import { BackupReminder } from '../components/BackupReminder'
import { DevTestData } from '../components/DevTestData'
import { DistortionBar } from '../components/DistortionBar'
import { MoodChart } from '../components/MoodChart'
import { GROUNDING_NOTES, moodLabel } from '../data/prompts'
import { averageRelief, distortionCounts, formatDate, meta, reliefLabel, reliefPercent } from '../lib/metrics'
import { DRAFT_KEY, localDay, useCheckIns, useRecords } from '../lib/storage'
import { openDialog } from '../lib/ui'
import heroImg from '../assets/images/hero-garden.jpg'

function hasDraft() {
  try {
    return !!localStorage.getItem(DRAFT_KEY)
  } catch {
    return false
  }
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

const PRACTICES = [
  {
    to: '/studio',
    icon: PenLine,
    title: 'Reframe a thought',
    text: 'Catch a painful thought, test it against the facts, and write a fairer version. About 10 minutes.',
    cta: 'Start',
  },
  {
    to: '/breathe',
    icon: Wind,
    title: 'Breathe',
    text: 'A guided breathing circle with four rhythms. One or two minutes is enough to take the edge off.',
    cta: 'Calm my body',
  },
  {
    to: '/codex',
    icon: BookOpen,
    title: 'Learn the thinking traps',
    text: 'Eleven common patterns, what they sound like, and what helps. Includes a short practice quiz.',
    cta: 'Explore',
  },
]

export default function Home() {
  const records = useRecords()
  const checkIns = useCheckIns()
  const [noteIdx, setNoteIdx] = useState(() => new Date().getDate() % GROUNDING_NOTES.length)

  const today = checkIns.find((c) => c.date === localDay())
  const avg = averageRelief(records)
  const top = distortionCounts(records)[0]
  const breakthroughs = records.filter((r) => (reliefPercent(r) ?? 0) > 0 && r.rationalReframe).slice(0, 3)
  const draft = hasDraft()

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="card grid overflow-hidden lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col justify-center p-7 sm:p-12">
          <p className="text-sm text-muted">{greeting()}</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Take a second look.</h1>
          <p className="mt-4 max-w-lg text-lg text-muted">
            When a thought is pulling you under, slow it down. Catch it, test it against the evidence, and write a fairer
            version. Private, and nothing ever leaves your browser.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/studio" className="btn-primary">
              {draft ? 'Continue your reframe' : 'Start a reframe'}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link to="/breathe" className="btn-quiet">
              <Wind className="size-4 text-sage" aria-hidden="true" />
              Breathe first
            </Link>
          </div>
        </div>
        <img
          src={heroImg}
          alt="A quiet raked-gravel garden with mossy stones in morning mist"
          className="h-56 w-full object-cover sm:h-72 lg:h-full"
        />
      </section>

      {/* Today */}
      <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl">
                <Sun className="size-5 text-ochre" aria-hidden="true" />
                {today ? 'Today\'s check-in' : 'How are you today?'}
              </h2>
              <p className="hint mt-1">
                {today
                  ? meta(`Mood ${today.mood} · ${moodLabel(today.mood)}`, `Energy ${today.energy}`, today.states.slice(0, 3).join(', '))
                  : 'Tap a number to start a quick check-in. 1 is very low, 10 is very good.'}
              </p>
            </div>
            {today && (
              <button type="button" className="btn-text shrink-0" onClick={() => openDialog('checkin')}>
                Edit
              </button>
            )}
          </div>
          {!today && (
            <div className="mt-4 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => openDialog('checkin', n)}
                  aria-label={`Mood ${n}, ${moodLabel(n)}`}
                  className="num h-11 rounded-lg border border-line bg-canvas text-[15px] transition-colors hover:border-sage hover:bg-sage-wash"
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card flex flex-col justify-between p-6">
          <p className="font-display text-xl leading-snug">{GROUNDING_NOTES[noteIdx]}</p>
          <button
            type="button"
            className="btn-text mt-4 self-start text-muted"
            onClick={() => setNoteIdx((i) => (i + 1) % GROUNDING_NOTES.length)}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Another reminder
          </button>
        </div>
      </section>

      <BackupReminder />

      {/* Mood trend */}
      {checkIns.length > 0 && (
        <section className="card p-6 sm:p-8">
          <h2 className="mb-4 text-2xl">Mood over time</h2>
          <MoodChart checkIns={checkIns} />
        </section>
      )}

      {import.meta.env.DEV && <DevTestData />}

      {/* Practices */}
      <section>
        <h2 className="text-2xl">Practices</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {PRACTICES.map((p) => (
            <li key={p.to}>
              <Link to={p.to} className="card group flex h-full flex-col p-6 transition-colors hover:border-sage">
                <span className="grid size-11 place-items-center rounded-xl bg-sage-wash text-sage transition-colors group-hover:bg-sage group-hover:text-on-sage">
                  <p.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg">{p.title}</h3>
                <p className="mt-1 flex-1 text-[15px] text-muted">{p.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 font-medium text-sage">
                  {p.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {records.length > 0 && (
        <>
          <section>
            <dl className="grid grid-cols-3 gap-4">
              <div className="card p-5">
                <dt className="text-sm text-muted">Reframes</dt>
                <dd className="num mt-1 text-3xl">{records.length}</dd>
              </div>
              <div className="card p-5">
                <dt className="text-sm text-muted">Average relief</dt>
                <dd className="num mt-1 text-3xl">{avg === null ? '—' : `${avg}%`}</dd>
              </div>
              <div className="card p-5">
                <dt className="text-sm text-muted">Most common trap</dt>
                <dd className="mt-1 font-display text-lg leading-tight">{top ? top.name : '—'}</dd>
              </div>
            </dl>
          </section>

          {breakthroughs.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl">Recent breakthroughs</h2>
                <Link to="/journal" className="btn-text">
                  See all <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="mt-4 grid gap-4 md:grid-cols-3">
                {breakthroughs.map((r) => (
                  <li key={r.id} className="card p-6">
                    <p className="text-sm text-muted">{meta(formatDate(r.timestamp), reliefLabel(r))}</p>
                    <p className="mt-3 line-clamp-2 text-[15px] italic text-muted">“{r.automaticThought}”</p>
                    <p className="mt-3 border-l-2 border-ochre pl-3 font-display text-lg leading-snug">{r.rationalReframe}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-6 sm:p-8">
            <h2 className="mb-5 text-2xl">Your thinking traps</h2>
            <DistortionBar records={records} />
          </section>
        </>
      )}
    </div>
  )
}
