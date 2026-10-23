import { spokenGameNames } from './newsPronunciation.js'

export const INITIAL_SPEECH = { status: 'IDLE', message: '', text: '', canReplay: false }

// Owns one playback and one remembered summary. Stale fetches/events cannot resume audio.
export class NewsAudioPlayer {
  constructor({ request, update, audio = () => new Audio(), createUrl = blob => URL.createObjectURL(blob), revokeUrl = url => URL.revokeObjectURL(url) }) {
    Object.assign(this, { request, update, audio, createUrl, revokeUrl })
    this.generation = 0
    this.last = ''
    this.cached = null
  }
  cancel(forget = false) {
    this.generation++
    this.controller?.abort()
    this.controller = null
    clearTimeout(this.timer)
    if (this.active) {
      this.active.onplaying = this.active.onended = this.active.onerror = null
      this.active.pause()
      this.active.removeAttribute('src')
      this.active.load()
      this.active = null
    }
    if (this.url) { this.revokeUrl(this.url); this.url = null }
    if (forget) { this.last = ''; this.cached = null }
  }
  async say(input, remember = false) {
    this.cancel()
    const text = spokenGameNames(input)
    if (!text) return
    if (remember && this.last !== text) { this.last = text; this.cached = null }
    const generation = this.generation
    const publish = (status, message) => {
      if (this.generation === generation) this.update({ status, message, text, canReplay: Boolean(this.last) })
    }
    const fail = message => {
      if (this.generation !== generation) return
      this.cancel()
      this.update({ status: 'ERROR', message, text, canReplay: Boolean(this.last) })
    }
    publish('QUEUED', 'OpenAI 음성을 준비하고 있어요.')
    try {
      this.controller = new AbortController()
      const blob = (this.last === text && this.cached) || await this.request(text, this.controller.signal)
      if (this.generation !== generation) return
      if (remember) this.cached = blob
      this.controller = null
      this.url = this.createUrl(blob)
      const playback = this.audio()
      this.active = playback
      playback.src = this.url
      playback.onplaying = () => {
        if (this.generation !== generation) return
        clearTimeout(this.timer)
        publish('SPEAKING', remember ? '최신 소식의 저장된 요약을 읽고 있어요.' : '안내를 읽고 있어요.')
      }
      playback.onended = () => {
        if (this.generation !== generation) return
        this.cancel()
        this.update({ status: 'IDLE', message: remember ? '요약 낭독을 마쳤어요.' : '파동을 눌러 말씀해 주세요.', text, canReplay: Boolean(this.last) })
      }
      playback.onerror = () => fail('음성을 재생하지 못했어요. 다시 듣기를 누르거나 화면의 요약을 확인해 주세요.')
      this.timer = setTimeout(() => fail('음성 재생을 시작하지 못했어요. 다시 듣기를 눌러 주세요.'), 8000)
      await playback.play()
    } catch (error) {
      if (this.generation !== generation) return
      fail(error.name === 'NotAllowedError'
        ? '자동 재생이 제한됐어요. 다시 듣기를 눌러 음성을 재생해 주세요.'
        : error.speechMessage || '음성을 준비하지 못했어요. 잠시 후 다시 듣기를 누르거나 화면의 요약을 확인해 주세요.')
    }
  }
  stop(forget = false) {
    this.cancel(forget)
    this.update({ status: 'IDLE', message: '음성 재생을 중지했어요.', text: this.last, canReplay: Boolean(this.last) })
  }
  replay() { if (this.last) return this.say(this.last, true) }
}
