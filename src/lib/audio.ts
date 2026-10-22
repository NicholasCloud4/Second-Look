let ctx: AudioContext | null = null

/** A soft singing-bowl tone built from three decaying sine partials. */
export function playBowl(base = 220, seconds = 4) {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    ctx ??= new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()

    const audio = ctx
    const now = audio.currentTime
    const master = audio.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.16, now + 0.03)
    master.gain.exponentialRampToValueAtTime(0.0001, now + seconds)
    master.connect(audio.destination)

    for (const [mult, gain] of [
      [1, 1],
      [2.76, 0.35],
      [5.4, 0.12],
    ]) {
      const osc = audio.createOscillator()
      const g = audio.createGain()
      osc.type = 'sine'
      osc.frequency.value = base * mult
      g.gain.value = gain
      osc.connect(g).connect(master)
      osc.start(now)
      osc.stop(now + seconds + 0.2)
    }
  } catch {
    // Audio is a nicety; never let it break the exercise.
  }
}
