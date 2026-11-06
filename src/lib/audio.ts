let context: AudioContext | undefined
export function playSound(status: string) {
  try {
    context ??= new AudioContext()
    const active = context
    void active.resume().then(() => {
      const notes = status === "won" ? [523, 659, 784] : status === "lost" ? [220, 165] : [392]
      notes.forEach((frequency, i) => {
        const oscillator = active.createOscillator(), gain = active.createGain()
        const start = active.currentTime + i * .09
        oscillator.type = "sine"
        oscillator.frequency.value = frequency
        gain.gain.setValueAtTime(.0001, start)
        gain.gain.exponentialRampToValueAtTime(.035, start + .01)
        gain.gain.exponentialRampToValueAtTime(.0001, start + .13)
        oscillator.connect(gain); gain.connect(active.destination)
        oscillator.start(start); oscillator.stop(start + .15)
      })
    }).catch(() => {})
  } catch { /* 不支持音频时保持静音。 */ }
}
