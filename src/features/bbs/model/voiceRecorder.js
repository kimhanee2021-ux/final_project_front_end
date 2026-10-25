export const VOICE_LIMITS = { bytes: 4_000_000, initialMs: 10_000, silenceMs: 2_000, maximumMs: 30_000 }

// Owns one microphone recording; closing also handles a permission prompt resolved later.
export class VoiceRecorder {
  constructor({ onReady, onAudio, onError }, dependencies = {}) {
    this.callbacks = { onReady, onAudio, onError }
    this.media = dependencies.mediaDevices ?? globalThis.navigator?.mediaDevices
    this.Recorder = dependencies.MediaRecorder ?? globalThis.MediaRecorder
    this.Context = dependencies.AudioContext ?? globalThis.AudioContext ?? globalThis.webkitAudioContext
    this.limits = { ...VOICE_LIMITS, ...dependencies.limits }
    this.closed = false
    this.finishing = false
    this.chunks = []
    this.size = 0
    this.heardSpeech = false
  }

  async start() {
    if (this.closed) return
    if (!this.media?.getUserMedia || !this.Recorder || !this.Context) {
      this.fail('이 브라우저에서는 음성 입력을 사용할 수 없어요. 최신 Chrome 또는 Edge에서 localhost나 HTTPS로 접속해 주세요.')
      return
    }
    try {
      const stream = await this.media.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      if (this.closed) { stream.getTracks().forEach(track => track.stop()); return }
      this.stream = stream
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(type => this.Recorder.isTypeSupported(type))
      if (!mimeType) { this.fail('지원하는 녹음 형식이 없어요. 최신 Chrome 또는 Edge에서 다시 시도해 주세요.'); return }
      this.context = new this.Context()
      await this.context.resume()
      if (this.closed) return
      this.source = this.context.createMediaStreamSource(stream)
      this.analyser = this.context.createAnalyser()
      this.analyser.fftSize = 2048
      this.source.connect(this.analyser)
      this.samples = new Float32Array(this.analyser.fftSize)
      this.recorder = new this.Recorder(stream, { mimeType })
      this.recorder.ondataavailable = event => {
        if (this.closed || !event.data.size) return
        this.size += event.data.size
        if (this.size > this.limits.bytes) { this.fail('음성 입력이 너무 길어요. 게임 이름만 짧게 말씀해 주세요.'); return }
        this.chunks.push(event.data)
      }
      this.recorder.onerror = () => this.fail('마이크 녹음이 중단됐어요. 다시 시도해 주세요.')
      this.recorder.onstop = () => {
        if (this.closed) return
        const audio = new Blob(this.chunks, { type: this.recorder.mimeType || mimeType })
        if (!this.heardSpeech || !audio.size) { this.fail('게임 이름이 잘 들리지 않았어요. 다시 말씀해 주세요.'); return }
        this.cancel()
        this.callbacks.onAudio(audio)
      }
      this.startedAt = performance.now()
      this.lastSpeechAt = this.startedAt
      this.activeFrames = 0
      this.recorder.start(250)
      this.interval = setInterval(() => this.measure(), 100)
      this.callbacks.onReady()
    } catch (error) {
      if (!this.closed) this.fail(error?.name === 'NotAllowedError'
        ? '마이크 권한이 필요해요. 브라우저에서 권한을 허용한 뒤 다시 시도해 주세요.'
        : error?.name === 'NotFoundError' ? '연결된 마이크를 찾지 못했어요.' : '마이크를 시작하지 못했어요. 다른 앱의 마이크 사용을 확인해 주세요.')
    }
  }

  measure() {
    if (this.closed || this.finishing) return
    this.analyser.getFloatTimeDomainData(this.samples)
    const energy = Math.sqrt(this.samples.reduce((sum, sample) => sum + sample * sample, 0) / this.samples.length)
    const now = performance.now()
    this.activeFrames = energy >= .008 ? this.activeFrames + 1 : 0
    if (this.activeFrames >= 2) { this.heardSpeech = true; this.lastSpeechAt = now }
    if (!this.heardSpeech && now - this.startedAt >= this.limits.initialMs) {
      this.fail('게임 이름이 잘 들리지 않았어요. 다시 말씀해 주세요.')
    } else if (now - this.startedAt >= this.limits.maximumMs || this.heardSpeech && now - this.lastSpeechAt >= this.limits.silenceMs) this.finish()
  }

  finish() {
    if (this.closed || this.finishing || !this.recorder) return
    if (!this.heardSpeech) { this.fail('게임 이름이 잘 들리지 않았어요. 다시 말씀해 주세요.'); return }
    this.finishing = true
    clearInterval(this.interval)
    this.flushTimer = setTimeout(() => this.fail('녹음을 마무리하지 못했어요. 다시 시도해 주세요.'), 2000)
    try { this.recorder.stop() } catch { this.fail('녹음이 중단됐어요. 다시 시도해 주세요.') }
  }

  fail(message) {
    if (this.closed) return
    this.cancel()
    this.callbacks.onError(message)
  }

  cancel() {
    if (this.closed) return
    this.closed = true
    clearInterval(this.interval)
    clearTimeout(this.flushTimer)
    if (this.recorder) {
      this.recorder.ondataavailable = this.recorder.onerror = this.recorder.onstop = null
      if (this.recorder.state !== 'inactive') { try { this.recorder.stop() } catch { /* Already stopped. */ } }
    }
    this.stream?.getTracks().forEach(track => track.stop())
    this.source?.disconnect()
    if (this.context && this.context.state !== 'closed') this.context.close().catch(() => {})
    this.chunks = []
  }
}
