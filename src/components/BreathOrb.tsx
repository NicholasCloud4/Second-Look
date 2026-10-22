import { useEffect, useRef, useState } from 'react'
import { REST_SCALE, type BreathPattern } from '../data/patterns'
import { playBowl } from '../lib/audio'

interface Props {
  pattern: BreathPattern
  running: boolean
  sound: boolean
  /** Stop automatically after this many seconds. */
  durationSec?: number
  onComplete?: () => void
  /** Called every tick with whole cycles finished and seconds elapsed in this run. */
  onProgress?: (cycles: number, seconds: number) => void
  idleText?: string
}

export function BreathOrb({ pattern, running, sound, durationSec, onComplete, onProgress, idleText = 'Ready when you are' }: Props) {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [remaining, setRemaining] = useState(pattern.phases[0].seconds)
  const soundRef = useRef(sound)
  const doneRef = useRef(onComplete)
  const progressRef = useRef(onProgress)

  useEffect(() => {
    soundRef.current = sound
    doneRef.current = onComplete
    progressRef.current = onProgress
  })

  useEffect(() => {
    const phases = pattern.phases
    if (!running) return

    const cycle = phases.reduce((s, p) => s + p.seconds, 0)
    const start = performance.now()
    let lastKey = ''
    let finished = false

    const tick = () => {
      const elapsed = (performance.now() - start) / 1000
      if (durationSec !== undefined && elapsed >= durationSec) {
        if (!finished) {
          finished = true
          doneRef.current?.()
        }
        return
      }
      const t = elapsed % cycle
      let acc = 0
      let idx = phases.length - 1
      for (let i = 0; i < phases.length; i++) {
        if (t < acc + phases[i].seconds) {
          idx = i
          break
        }
        acc += phases[i].seconds
      }
      setPhaseIdx(idx)
      setRemaining(Math.max(1, Math.ceil(acc + phases[idx].seconds - t)))
      progressRef.current?.(Math.floor(elapsed / cycle), Math.floor(elapsed))

      const key = `${Math.floor(elapsed / cycle)}:${idx}`
      if (key !== lastKey) {
        lastKey = key
        if (idx === 0 && soundRef.current) playBowl()
      }
    }

    tick()
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [running, pattern, durationSec])

  const phase = pattern.phases[running ? phaseIdx : 0] ?? pattern.phases[0]
  const scale = running ? phase.scale : REST_SCALE
  const seconds = running ? phase.seconds : 0.8

  return (
    <div>
      <div className="mx-auto grid aspect-square w-full max-w-72 place-items-center">
        <div className="col-start-1 row-start-1 size-full rounded-full border border-line" aria-hidden="true" />
        <div
          className="orb-halo col-start-1 row-start-1 size-full rounded-full"
          style={{ transform: `scale(${Math.min(1, scale + 0.1)})`, transition: `transform ${seconds}s ease-in-out` }}
          aria-hidden="true"
        />
        <div
          className="orb col-start-1 row-start-1 size-full rounded-full shadow-lg"
          style={{ transform: `scale(${scale})`, transition: `transform ${seconds}s ease-in-out` }}
          aria-hidden="true"
        />
        <p className="num relative col-start-1 row-start-1 font-display text-4xl font-semibold text-white" aria-hidden="true">
          {running ? remaining : pattern.phases[0].seconds}
        </p>
      </div>
      <div className="mt-6 min-h-16 text-center" aria-live="polite">
        <p className="font-display text-2xl font-semibold">{running ? phase.label : idleText}</p>
        <p className="hint mt-1">{running ? phase.cue : 'Sit comfortably. Drop your shoulders. Soften your jaw.'}</p>
      </div>
    </div>
  )
}
