// Synthesized photocopier "scan" sound (no audio asset needed). A buzzy stepper
// motor whir (with tremolo) + a rising carriage whine + a band-passed mechanical
// slide. Played on export, in sync with the scan-bar sweep. Best-effort: silently
// no-ops if Web Audio is unavailable or blocked.
export function playScanSound(ms = 850): void {
  const Ctx: typeof AudioContext | undefined =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return

  let ctx: AudioContext
  try {
    ctx = new Ctx()
  } catch {
    return
  }

  const now = ctx.currentTime
  const dur = ms / 1000
  const end = now + dur

  // Master with quick fade in/out so it doesn't click.
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, now)
  master.gain.linearRampToValueAtTime(0.8, now + 0.03)
  master.gain.setValueAtTime(0.8, end - 0.1)
  master.gain.linearRampToValueAtTime(0, end)
  master.connect(ctx.destination)

  // Stepper-motor whir: sawtooth that spins up then settles, low-passed, with a
  // square-wave tremolo for the characteristic buzz.
  const motor = ctx.createOscillator()
  motor.type = 'sawtooth'
  motor.frequency.setValueAtTime(78, now)
  motor.frequency.linearRampToValueAtTime(116, now + dur * 0.5)
  motor.frequency.linearRampToValueAtTime(96, end)
  const motorLP = ctx.createBiquadFilter()
  motorLP.type = 'lowpass'
  motorLP.frequency.value = 540
  const motorGain = ctx.createGain()
  motorGain.gain.value = 0.10
  const lfo = ctx.createOscillator()
  lfo.type = 'square'
  lfo.frequency.value = 44
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.045
  lfo.connect(lfoGain)
  lfoGain.connect(motorGain.gain)
  motor.connect(motorLP)
  motorLP.connect(motorGain)
  motorGain.connect(master)

  // Rising carriage whine.
  const whine = ctx.createOscillator()
  whine.type = 'triangle'
  whine.frequency.setValueAtTime(680, now)
  whine.frequency.linearRampToValueAtTime(980, now + dur * 0.5)
  whine.frequency.linearRampToValueAtTime(720, end)
  const whineGain = ctx.createGain()
  whineGain.gain.value = 0.016
  whine.connect(whineGain)
  whineGain.connect(master)

  // Mechanical slide: band-passed white noise.
  const buf = ctx.createBuffer(1, Math.max(1, Math.ceil(ctx.sampleRate * dur)), ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buf
  const noiseBP = ctx.createBiquadFilter()
  noiseBP.type = 'bandpass'
  noiseBP.frequency.value = 1500
  noiseBP.Q.value = 0.8
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.03
  noise.connect(noiseBP)
  noiseBP.connect(noiseGain)
  noiseGain.connect(master)

  motor.start(now); whine.start(now); lfo.start(now); noise.start(now)
  motor.stop(end); whine.stop(end); lfo.stop(end); noise.stop(end)

  // Release the audio context shortly after the sound ends.
  window.setTimeout(() => { ctx.close().catch(() => {}) }, ms + 250)
}
