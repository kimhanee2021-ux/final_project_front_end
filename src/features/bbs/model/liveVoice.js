const CONNECTION_ERROR = '실시간 음성 인식을 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'
const NO_SPEECH = '말씀이 잘 들리지 않았어요. 다시 말씀해 주세요.'

// A single utterance owns the mic, socket, audio nodes and all callbacks. No partial text executes a command.
export class LiveVoice {
  constructor(callbacks, dependencies = {}) {
    this.callbacks = callbacks
    this.media = dependencies.mediaDevices ?? globalThis.navigator?.mediaDevices
    this.Context = dependencies.AudioContext ?? globalThis.AudioContext ?? globalThis.webkitAudioContext
    this.Worklet = dependencies.AudioWorkletNode ?? globalThis.AudioWorkletNode
    this.Socket = dependencies.WebSocket ?? globalThis.WebSocket
    this.location = dependencies.location ?? globalThis.location
    this.closed = false
    this.finishing = false
    this.ready = false
    this.heard = false
    this.bytes = 0
  }
  async start() {
    if (this.closed) return
    if (!this.media?.getUserMedia || !this.Context || !this.Worklet || !this.Socket) {
      this.fail('최신 Chrome 또는 Edge에서 localhost나 HTTPS로 접속해 주세요.'); return
    }
    try {
      const stream = await this.media.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } })
      if (this.closed) { stream.getTracks().forEach(track => track.stop()); return }
      this.stream = stream
      stream.getTracks().forEach(track => { track.onended = () => this.fail('마이크 연결이 끊겼어요. 다시 시도해 주세요.') })
      this.context = new this.Context({ sampleRate: 24000 })
      await this.context.resume()
      if (this.closed) return
      if (this.context.sampleRate !== 24000) throw new Error('Unsupported sample rate')
      await this.context.audioWorklet.addModule(new URL('../audio/voiceCapture.worklet.js', import.meta.url))
      if (this.closed) return
      const url = new URL('/api/games/bbs/voice/live', this.location.href)
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      const socket = new this.Socket(url.href)
      this.socket = socket
      this.deadline = setTimeout(() => this.fail(CONNECTION_ERROR), 12000)
      socket.onmessage = event => this.receive(event.data)
      socket.onerror = () => this.fail(CONNECTION_ERROR)
      socket.onclose = () => this.fail('음성 연결이 종료됐어요. 다시 말씀해 주세요.')
    } catch (error) {
      this.fail(error.name === 'NotAllowedError' ? '마이크 권한이 필요해요. 브라우저에서 권한을 허용해 주세요.'
        : error.name === 'NotFoundError' ? '연결된 마이크를 찾지 못했어요.' : CONNECTION_ERROR)
    }
  }
  receive(data) {
    if (this.closed) return
    try {
      if (typeof data !== 'string' || data.length > 4096) throw new Error('Invalid event')
      const event = JSON.parse(data)
      if (event.type === 'ready') {
        if (this.ready) throw new Error('Duplicate ready')
        this.ready = true
        clearTimeout(this.deadline)
        this.source = this.context.createMediaStreamSource(this.stream)
        this.capture = new this.Worklet(this.context, 'bbs-voice-capture')
        this.capture.port.onmessage = event => this.append(event.data)
        this.source.connect(this.capture)
        this.capture.connect(this.context.destination)
        this.started = performance.now()
        this.lastSpeech = this.started
        this.frames = 0
        this.interval = setInterval(() => this.measure(), 100)
        this.callbacks.onReady()
      } else if (event.type === 'partial') {
        if (!this.ready || typeof event.text !== 'string' || event.text.length > 1024) throw new Error('Invalid partial')
        if (!this.finishing) this.callbacks.onPartial(event.text)
      } else if (event.type === 'final') {
        if (!this.finishing || typeof event.text !== 'string' || !event.text.trim() || event.text.length > 255) throw new Error('Invalid final')
        this.cancel()
        this.callbacks.onTranscript(event.text.trim())
      } else if (event.type === 'error') this.fail(typeof event.message === 'string' ? event.message : CONNECTION_ERROR)
      else throw new Error('Unknown event')
    } catch { this.fail(CONNECTION_ERROR) }
  }
  append({ pcm, energy }) {
    if (this.closed || this.finishing) return
    if (!(pcm instanceof ArrayBuffer) || pcm.byteLength !== 4800 || !Number.isFinite(energy)) { this.fail(CONNECTION_ERROR); return }
    if (this.socket.readyState !== 1 || this.socket.bufferedAmount > 96000) { this.fail('음성 연결이 느려졌어요. 다시 시도해 주세요.'); return }
    if (this.bytes + pcm.byteLength > 1440000) { this.finish(); return }
    this.bytes += pcm.byteLength
    try { this.socket.send(pcm) } catch { this.fail(CONNECTION_ERROR); return }
    this.frames = energy >= .008 ? this.frames + 1 : 0
    if (this.frames >= 2) { this.heard = true; this.lastSpeech = performance.now() }
  }
  measure() {
    if (this.closed || this.finishing) return
    const now = performance.now()
    if (!this.heard && now - this.started >= 10000) this.fail(NO_SPEECH)
    else if (now - this.started >= 30000 || this.heard && now - this.lastSpeech >= 2000) this.finish()
  }
  finish() {
    if (this.closed || this.finishing) return
    if (!this.heard || this.bytes < 4800) { this.fail(NO_SPEECH); return }
    this.finishing = true
    this.releaseMic()
    this.callbacks.onFinishing()
    this.deadline = setTimeout(() => this.fail('인식 결과가 늦어지고 있어요. 다시 말씀해 주세요.'), 15000)
    try { this.socket.send(JSON.stringify({ type: 'commit' })) } catch { this.fail(CONNECTION_ERROR) }
  }
  releaseMic() {
    clearInterval(this.interval)
    if (this.capture) { this.capture.port.onmessage = null; this.capture.disconnect(); this.capture.port.close() }
    this.source?.disconnect()
    this.stream?.getTracks().forEach(track => { track.onended = null; track.stop() })
    if (this.context && this.context.state !== 'closed') this.context.close().catch(() => {})
    this.capture = this.source = this.stream = null
  }
  cancel() {
    if (this.closed) return
    this.closed = true
    clearTimeout(this.deadline)
    this.releaseMic()
    if (this.socket) {
      this.socket.onmessage = this.socket.onclose = this.socket.onerror = null
      this.socket.close()
    }
  }
  fail(message) {
    if (this.closed) return
    this.cancel()
    this.callbacks.onError(message)
  }
}
