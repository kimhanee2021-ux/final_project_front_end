// Owns one article's audio, request and object URL. No playback survives dispose().
export class BriefingPlayer {
  constructor({ fetchAudio, onState, createAudio = () => new Audio(), urls = URL }) {
    Object.assign(this, { fetchAudio, onState, createAudio, urls })
    this.audio = null
    this.url = null
    this.request = null
    this.ticket = 0
    this.disposed = false
    this.wantPlaying = false
    this.state = { phase: 'IDLE', elapsed: 0, duration: 0, error: '' }
  }
  update(changes) {
    if (this.disposed) return
    this.state = { ...this.state, ...changes }
    this.onState(this.state)
  }
  releaseAudio() {
    if (this.audio) {
      this.audio.onplaying = this.audio.onpause = this.audio.onended = null
      this.audio.ontimeupdate = this.audio.onloadedmetadata = this.audio.onerror = null
      this.audio.pause()
      this.audio.removeAttribute('src')
      this.audio.load()
      this.audio = null
    }
    if (this.url) this.urls.revokeObjectURL(this.url)
    this.url = null
  }
  async play() {
    if (this.disposed || this.wantPlaying || this.request) return
    const ticket = ++this.ticket
    this.wantPlaying = true
    this.update({ phase: 'LOADING', error: '' })
    try {
      if (!this.audio) {
        const controller = new AbortController()
        this.request = controller
        const blob = await this.fetchAudio(controller.signal)
        if (this.disposed || ticket !== this.ticket) return
        this.request = null
        const audio = this.createAudio()
        this.audio = audio
        this.url = this.urls.createObjectURL(blob)
        audio.preload = 'auto'
        const current = () => !this.disposed && this.audio === audio
        audio.onloadedmetadata = () => {
          if (current() && Number.isFinite(audio.duration)) this.update({ duration: audio.duration })
        }
        audio.ontimeupdate = () => { if (current()) this.update({ elapsed: audio.currentTime }) }
        audio.onplaying = () => {
          if (!current() || !this.wantPlaying) { audio.pause(); return }
          this.update({ phase: 'PLAYING', error: '' })
        }
        audio.onpause = () => {
          if (current() && audio.paused && this.state.phase === 'PLAYING') {
            this.wantPlaying = false
            this.update({ phase: 'PAUSED' })
          }
        }
        audio.onended = () => {
          if (!current()) return
          this.wantPlaying = false
          audio.currentTime = 0
          this.update({ phase: 'READY', elapsed: 0 })
        }
        audio.onerror = () => {
          if (!current()) return
          this.wantPlaying = false
          this.ticket++
          this.releaseAudio()
          this.update({ phase: 'ERROR', elapsed: 0, duration: 0, error: '음성을 재생하지 못했어요. 다시 눌러 주세요.' })
        }
        audio.src = this.url
      }
      const audio = this.audio
      await audio.play()
      if (this.disposed || ticket !== this.ticket) {
        if (!this.wantPlaying || this.audio !== audio) audio.pause()
        return
      }
      this.update({ phase: 'PLAYING' })
    } catch (error) {
      if (this.disposed || ticket !== this.ticket) return
      this.request = null
      this.wantPlaying = false
      if (error.name === 'NotAllowedError') {
        this.update({ phase: 'READY', error: '음성이 준비됐어요. 브리핑 듣기를 한 번 더 눌러 주세요.' })
      } else {
        this.releaseAudio()
        this.update({ phase: 'ERROR', elapsed: 0, duration: 0, error: error.userMessage || '음성을 만들지 못했어요. 잠시 후 다시 눌러 주세요.' })
      }
    }
  }
  pause() {
    if (this.request) { this.stop(); return }
    if (!this.audio || !['PLAYING', 'LOADING'].includes(this.state.phase)) return
    this.wantPlaying = false
    this.ticket++
    this.audio?.pause()
    this.update({ phase: 'PAUSED', elapsed: this.audio.currentTime })
  }
  resume() {
    if (this.disposed || !this.audio || this.state.phase !== 'PAUSED') return false
    void this.play()
    return true
  }
  stop() {
    this.wantPlaying = false
    this.ticket++
    this.request?.abort()
    this.request = null
    this.audio?.pause()
    if (this.audio) this.audio.currentTime = 0
    this.update({ phase: this.audio ? 'READY' : 'IDLE', elapsed: 0, error: '' })
  }
  dispose() {
    this.disposed = true
    this.stop()
    this.releaseAudio()
  }
}

export function audioTime(seconds) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}
