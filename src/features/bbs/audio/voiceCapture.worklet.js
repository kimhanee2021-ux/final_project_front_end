/* global AudioWorkletProcessor, registerProcessor */
// The AudioContext resamples the microphone to 24 kHz. Never route input to speakers.
class BbsVoiceCapture extends AudioWorkletProcessor {
  constructor() {
    super()
    this.frame = new Int16Array(2400)
    this.offset = 0
    this.energy = 0
  }
  process(inputs) {
    const samples = inputs[0]?.[0]
    if (!samples) return true
    for (const sample of samples) {
      const value = Math.max(-1, Math.min(1, sample))
      this.frame[this.offset++] = Math.round(value * (value < 0 ? 32768 : 32767))
      this.energy += value * value
      if (this.offset === this.frame.length) {
        const pcm = this.frame.buffer
        this.port.postMessage({ pcm, energy: Math.sqrt(this.energy / this.offset) }, [pcm])
        this.frame = new Int16Array(2400)
        this.offset = 0
        this.energy = 0
      }
    }
    return true
  }
}
registerProcessor('bbs-voice-capture', BbsVoiceCapture)
