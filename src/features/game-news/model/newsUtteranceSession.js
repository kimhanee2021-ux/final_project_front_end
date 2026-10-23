export const VOICE_TIMING = { silence: 3000, initial: 8000, maximum: 30000, flush: 1000, restart: 150, maxRestarts: 3 }

// Result indexes are stable within one recognition run. Interim hypotheses are never submitted.
export class NewsUtteranceSession {
  constructor({ Recognition, onPreview, onFinal, onError, timing = VOICE_TIMING }) {
    Object.assign(this, { Recognition, onPreview, onFinal, onError, timing })
    this.finals = new Map()
    this.prefix = []
    this.interim = ''
    this.restarts = 0
    this.closed = false
  }
  text() {
    const current = [...this.finals.entries()].sort(([a], [b]) => a - b).map(([, text]) => text)
    if (this.prefix.length && current.length) {
      const previous = this.prefix.join(' ').split(/\s+/), next = current[0].split(/\s+/)
      for (let size = Math.min(previous.length, next.length); size > 0; size--) {
        if (previous.slice(-size).join(' ') === next.slice(0, size).join(' ')) {
          current[0] = next.slice(size).join(' '); break
        }
      }
    }
    return [...this.prefix, ...current].filter(Boolean).join(' ').trim()
  }
  clearTimers() { for (const key of ['silence', 'initial', 'maximum', 'restart', 'flush']) clearTimeout(this[key + 'Timer']) }
  detach() {
    if (!this.instance) return
    for (const key of ['onresult', 'onerror', 'onend', 'onspeechstart', 'onspeechend']) this.instance[key] = null
  }
  cancel() {
    this.closed = true
    this.clearTimers()
    this.detach()
    try { this.instance?.abort() } catch { /* already disconnected */ }
  }
  fail(message) { if (!this.closed) { this.cancel(); this.onError(message) } }
  preview() { this.onPreview([this.text(), this.interim].filter(Boolean).join(' ')) }
  scheduleSilence() {
    clearTimeout(this.silenceTimer)
    this.silenceTimer = setTimeout(() => this.finish(), this.timing.silence)
  }
  start() {
    this.initialTimer = setTimeout(() => this.fail('음성이 들리지 않았어요. 파동을 2초간 눌러 다시 말씀해 주세요.'), this.timing.initial)
    this.maximumTimer = setTimeout(() => this.finish(), this.timing.maximum)
    this.connect()
  }
  connect() {
    if (this.closed || this.finishing) return
    const instance = new this.Recognition()
    this.instance = instance
    instance.lang = 'ko-KR'; instance.continuous = true; instance.interimResults = true; instance.maxAlternatives = 1
    instance.onspeechstart = () => {
      if (this.closed || this.finishing) return
      clearTimeout(this.initialTimer); clearTimeout(this.silenceTimer)
    }
    instance.onspeechend = () => { if (!this.closed && !this.finishing) this.scheduleSilence() }
    instance.onresult = event => {
      if (this.closed || this.instance !== instance) return
      clearTimeout(this.initialTimer)
      const interim = []
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i], text = result[0]?.transcript?.trim() || ''
        if (result.isFinal) { if (text) this.finals.set(i, text) }
        else if (text) interim.push(text)
      }
      this.interim = interim.join(' ')
      if (this.text().length + this.interim.length > 500) { this.fail('한 번에 500자까지 말씀해 주세요. 게임명과 소식 분류를 짧게 다시 말씀해 주세요.'); return }
      this.preview()
      if (!this.finishing) this.scheduleSilence()
    }
    instance.onerror = event => {
      if (this.closed || this.instance !== instance) return
      if (event.error === 'no-speech') return // onend can reconnect within the bounded listening window.
      const messages = { 'not-allowed': '마이크 권한이 필요해요. 브라우저 권한을 확인해 주세요.', 'service-not-allowed': '음성 인식 서비스 사용 권한을 확인해 주세요.', 'audio-capture': '마이크를 찾지 못했어요.', network: '음성 인식 서비스에 연결하지 못했어요.' }
      this.fail(messages[event.error] || '음성 인식이 중단됐어요. 파동을 2초간 눌러 다시 말씀해 주세요.')
    }
    instance.onend = () => {
      if (this.closed || this.instance !== instance) return
      if (this.finishing) { this.submit(); return }
      this.detach(); this.instance = null
      if (this.interim) { this.fail('마지막 말을 확정하지 못했어요. 화면의 인식 내용을 확인하고 다시 말씀해 주세요.'); return }
      if (this.restarts++ < this.timing.maxRestarts) {
        const text = this.text(); this.prefix = text ? [text] : []; this.finals.clear()
        this.restartTimer = setTimeout(() => this.connect(), this.timing.restart)
      } else if (this.text()) this.scheduleSilence()
      else this.fail('음성 인식이 반복해서 종료됐어요. 파동을 2초간 눌러 다시 말씀해 주세요.')
    }
    try { instance.start() } catch { this.fail('마이크를 시작하지 못했어요. 기존 검색창을 이용해 주세요.') }
  }
  finish() {
    if (this.closed || this.finishing) return
    this.finishing = true
    clearTimeout(this.restartTimer); clearTimeout(this.silenceTimer)
    if (!this.instance) { this.submit(); return }
    this.flushTimer = setTimeout(() => this.submit(), this.timing.flush)
    try { this.instance.stop() } catch { this.submit() }
  }
  submit() {
    if (this.closed) return
    if (this.interim) { this.fail('마지막 말을 확정하지 못했어요. 화면의 인식 내용을 확인하고 다시 말씀해 주세요.'); return }
    const text = this.text()
    if (!text) { this.fail('인식된 말이 없어요. 파동을 2초간 눌러 다시 말씀해 주세요.'); return }
    this.cancel()
    this.onFinal(text)
  }
}
