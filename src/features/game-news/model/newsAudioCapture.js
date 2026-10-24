export const CAPTURE_TIMING = { initial: 10000, silence: 2000, maximum: 30000, poll: 100, flush: 2000 }

// Audio stays in memory. Completion and cancellation always release microphone tracks.
export class NewsAudioCapture {
  constructor({ onReady, onFinal, onError, mediaDevices = globalThis.navigator?.mediaDevices,
    Recorder = globalThis.MediaRecorder, AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext,
    timing = CAPTURE_TIMING }) {
    Object.assign(this, { onReady, onFinal, onError, mediaDevices, Recorder, AudioContext, timing })
    this.closed = false
    this.chunks = []
    this.bytes = 0
  }
  clearTimers() {
    clearInterval(this.pollTimer)
    clearTimeout(this.initialTimer)
    clearTimeout(this.maximumTimer)
    clearTimeout(this.flushTimer)
  }
  release() {
    this.stream?.getTracks().forEach(track => track.stop())
    this.source?.disconnect()
    this.context?.close().catch(() => {})
  }
  cancel() {
    if (this.closed) return
    this.closed = true
    this.clearTimers()
    if (this.recorder) {
      this.recorder.ondataavailable = this.recorder.onstop = this.recorder.onerror = null
      try { if (this.recorder.state !== 'inactive') this.recorder.stop() } catch { /* already stopped */ }
    }
    this.release()
    this.chunks = []
  }
  fail(message) {
    if (this.closed) return
    this.cancel()
    this.onError(message)
  }
  async start() {
    try {
      const stream = await this.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false })
      if (this.closed) { stream.getTracks().forEach(track => track.stop()); return }
      this.stream = stream
      const mimeType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find(type => this.Recorder.isTypeSupported(type))
      if (!mimeType) { this.fail('이 브라우저에서는 녹음할 수 없어요. Chrome 또는 Edge를 이용해 주세요.'); return }
      this.recorder = new this.Recorder(stream, { mimeType })
      this.recorder.ondataavailable = event => {
        if (this.closed || !event.data.size) return
        this.bytes += event.data.size
        if (this.bytes > 4_000_000) { this.fail('음성은 4MB까지 입력할 수 있어요. 짧게 다시 말씀해 주세요.'); return }
        this.chunks.push(event.data)
      }
      this.recorder.onerror = () => this.fail('음성 녹음이 중단됐어요. 다시 시도해 주세요.')
      this.recorder.onstop = () => {
        if (this.closed) return
        const audio = new Blob(this.chunks, { type: this.recorder.mimeType })
        this.closed = true
        this.clearTimers()
        this.release()
        this.chunks = []
        if (!audio.size) this.onError('녹음된 음성이 없어요. 다시 말씀해 주세요.')
        else this.onFinal(audio)
      }
      this.context = new this.AudioContext()
      this.context.resume().catch(() => {})
      this.source = this.context.createMediaStreamSource(stream)
      const analyser = this.context.createAnalyser()
      analyser.fftSize = 2048
      this.source.connect(analyser)
      const samples = new Float32Array(analyser.fftSize)
      this.recorder.start(250)
      this.onReady()
      this.initialTimer = setTimeout(() => this.fail('음성이 들리지 않았어요. 입력 장치를 확인하고 다시 말씀해 주세요.'), this.timing.initial)
      this.maximumTimer = setTimeout(() => this.finish(), this.timing.maximum)
      this.pollTimer = setInterval(() => {
        analyser.getFloatTimeDomainData(samples)
        const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length)
        if (rms >= 0.008) {
          this.activeFrames = (this.activeFrames || 0) + 1
          this.lastSound = Date.now()
          if (this.activeFrames >= 2) { this.heard = true; clearTimeout(this.initialTimer) }
        } else if (this.heard && Date.now() - this.lastSound >= this.timing.silence) this.finish()
      }, this.timing.poll)
    } catch (error) {
      this.fail(error.name === 'NotAllowedError' ? '마이크 권한이 필요해요. 브라우저 권한을 확인해 주세요.'
        : error.name === 'NotFoundError' ? '마이크를 찾지 못했어요. 입력 장치를 확인해 주세요.'
          : '마이크를 시작하지 못했어요. 다시 시도하거나 검색창을 이용해 주세요.')
    }
  }
  finish() {
    if (this.closed || this.finishing || !this.recorder) return
    this.finishing = true
    this.clearTimers()
    this.flushTimer = setTimeout(() => this.fail('녹음을 마치지 못했어요. 다시 시도해 주세요.'), this.timing.flush)
    this.recorder.stop()
  }
}
