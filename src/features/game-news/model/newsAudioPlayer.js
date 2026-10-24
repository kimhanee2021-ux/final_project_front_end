import { spokenGameNames } from './newsPronunciation.js'

export const INITIAL_SPEECH = { status: 'IDLE', message: '', text: '', canReplay: false }

// Each playback owns its request, context and scheduled sources; cancelled generations cannot restart.
export class NewsAudioPlayer {
  constructor({ stream, update, context = () => new (window.AudioContext || window.webkitAudioContext)() }) {
    Object.assign(this, { stream, update, context })
    this.generation = 0
    this.last = ''
    this.cached = null
    this.sources = new Set()
  }
  cancel(forget = false) {
    this.generation++
    this.controller?.abort()
    this.controller = null
    for (const source of this.sources) {
      source.onended = null
      try { source.stop() } catch { /* already ended */ }
      source.disconnect()
    }
    this.sources.clear()
    this.active?.close().catch(() => {})
    this.active = null
    if (forget) { this.last = ''; this.cached = null }
  }
  async say(input, remember = false) {
    this.cancel()
    const text = spokenGameNames(input)
    if (!text) return
    if (remember && this.last !== text) { this.last = text; this.cached = null }
    const generation = this.generation
    const current = () => this.generation === generation
    const publish = (status, message) => {
      if (current()) this.update({ status, message, text, canReplay: Boolean(this.last) })
    }
    publish('QUEUED', 'OpenAI 음성을 준비하고 있어요.')
    try {
      const audio = this.context()
      this.active = audio
      let timer
      try {
        await Promise.race([audio.resume(), new Promise((_, reject) => {
          timer = setTimeout(() => reject(Object.assign(new Error('Autoplay blocked'), { name: 'NotAllowedError' })), 3000)
        })])
      } finally { clearTimeout(timer) }
      if (!current()) return
      let next = audio.currentTime + 0.04, completed = false, started = false, carry = null, total = 0
      const chunks = []
      const finish = () => {
        if (!current() || !completed || this.sources.size) return
        this.cancel()
        this.update({ status: 'IDLE', message: remember ? '요약 낭독을 마쳤어요.' : '파동을 눌러 말씀해 주세요.', text, canReplay: Boolean(this.last) })
      }
      const receive = chunk => {
        if (!current()) return
        total += chunk.length
        if (total > 8_000_000) throw new Error('Speech too large')
        chunks.push(chunk.slice())
        let bytes = chunk
        if (carry !== null) {
          bytes = new Uint8Array(chunk.length + 1)
          bytes[0] = carry; bytes.set(chunk, 1); carry = null
        }
        if (bytes.length % 2) carry = bytes[bytes.length - 1]
        const length = Math.floor(bytes.length / 2)
        if (!length) return
        const buffer = audio.createBuffer(1, length, 24000)
        const samples = buffer.getChannelData(0)
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
        for (let i = 0; i < length; i++) samples[i] = view.getInt16(i * 2, true) / 32768
        const source = audio.createBufferSource()
        source.buffer = buffer
        source.connect(audio.destination)
        this.sources.add(source)
        source.onended = () => { source.disconnect(); this.sources.delete(source); finish() }
        next = Math.max(next, audio.currentTime + 0.04)
        source.start(next)
        next += buffer.duration
        if (!started) { started = true; publish('SPEAKING', remember ? '최신 소식의 저장된 요약을 읽고 있어요.' : '안내를 읽고 있어요.') }
      }
      if (this.last === text && this.cached) this.cached.forEach(receive)
      else {
        this.controller = new AbortController()
        await this.stream(text, this.controller.signal, receive)
      }
      if (!current()) return
      if (!started || carry !== null) throw new Error('Incomplete speech audio')
      if (remember) this.cached = chunks
      this.controller = null
      completed = true
      finish()
    } catch (error) {
      if (!current()) return
      this.cancel()
      this.update({ status: 'ERROR', text, canReplay: Boolean(this.last), message: error.name === 'NotAllowedError'
        ? '자동 재생이 제한됐어요. 다시 듣기를 눌러 주세요.'
        : error.speechMessage || '음성을 재생하지 못했어요. 다시 듣기를 눌러 주세요.' })
    }
  }
  stop(forget = false) {
    this.cancel(forget)
    this.update({ status: 'IDLE', message: '음성 재생을 중지했어요.', text: this.last, canReplay: Boolean(this.last) })
  }
  replay() { if (this.last) return this.say(this.last, true) }
}
