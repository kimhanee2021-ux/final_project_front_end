import { briefingPath } from './briefing.js'
import { PAGE_SIZE, safeSourceUrl } from './news.js'

const activePhases = new Set(['INTERPRETING', 'CHOOSING', 'NEWS', 'SUMMARY'])
const problem = message => Object.assign(new Error(message), { userMessage: message })
const newsOrder = (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id)
export const emptyVoiceFlow = { phase: 'IDLE', transcript: '', candidates: [], target: null, briefing: null, message: '' }

export function validateCommand(value) {
  const statuses = ['SEARCH', 'RESOLVED', 'CHOOSE_GAME', 'NOT_FOUND', 'NEEDS_GAME', 'UNSUPPORTED', 'CONTROL']
  const validGame = game => Number.isSafeInteger(game?.appId) && game.appId > 0 && game.appId <= 4294967295 && typeof game.name === 'string' && game.name.trim()
  if (!statuses.includes(value?.status) || !['SEARCH', 'LATEST_BRIEFING', 'NEXT_BRIEFING', 'PAUSE', 'RESUME', 'UNSUPPORTED'].includes(value.action)
      || typeof value.query !== 'string' || value.query.length > 255 || !Array.isArray(value.candidates)
      || value.candidates.length > 12 || value.candidates.some(game => !validGame(game)) || typeof value.hasMore !== 'boolean') throw problem('음성 요청 결과를 확인하지 못했어요. 다시 말씀해 주세요.')
  if (value.status === 'RESOLVED' && (!validGame(value.game) || value.action !== 'LATEST_BRIEFING')
      || value.status === 'CHOOSE_GAME' && (value.action !== 'LATEST_BRIEFING' || !value.candidates.length)
      || value.status === 'SEARCH' && (value.action !== 'SEARCH' || !value.query.trim())) throw problem('음성 요청 결과가 올바르지 않아요. 다시 말씀해 주세요.')
  const control = ['NEXT_BRIEFING', 'PAUSE', 'RESUME'].includes(value.action)
  if (control !== (value.status === 'CONTROL') || control && (value.query || value.game || value.candidates.length || value.hasMore))
    throw problem('음성 제어 요청이 올바르지 않아요. 다시 말씀해 주세요.')
  return value
}

export function latestOfficial(news, appId, afterId = null) {
  if (news?.appId !== appId || !Array.isArray(news.items)) throw problem('공식 소식 목록을 확인하지 못했어요.')
  if (news.stale) throw problem('최신 공식 소식을 확인하지 못했어요. 잠시 후 다시 요청해 주세요.')
  if (!news.items.length) throw problem('이 게임에 등록된 공식 소식이 아직 없어요.')
  const items = news.items.filter(article => article.feedName === 'steam_community_announcements'
    && safeSourceUrl(article.sourceUrl) && Number.isFinite(Date.parse(article.publishedAt)) && briefingPath(appId, article))
  if (items.length !== news.items.length) throw problem('공식 소식 정보가 바뀌었어요. 목록을 다시 확인해 주세요.')
  const sorted = [...items].sort(newsOrder)
  if (!afterId) return sorted[0]
  const index = sorted.findIndex(article => article.id === afterId)
  if (index < 0) throw problem('현재 소식이 목록에서 바뀌었어요. 읽을 소식을 다시 선택해 주세요.')
  if (index === sorted.length - 1) throw problem('불러온 공식 소식 중 마지막 소식이에요. 이어서 들을 다음 소식이 없어요.')
  return sorted[index + 1]
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return }
    const abort = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, ms)
    signal.addEventListener('abort', abort, { once: true })
  })
}

// A voice request owns every subsequent step, including the one-time playback handoff.
// Only user actions start this flow; URL changes or component mounts cannot start paid work.
export class VoiceBriefingFlow {
  constructor({ api, onState, navigate, errorMessage, control = () => false, sleep = wait }) {
    Object.assign(this, { api, onState, navigate, errorMessage, control, sleep })
    this.state = emptyVoiceFlow
    this.active = null
    this.serial = 0
  }
  emit(changes) { this.state = { ...this.state, ...changes }; this.onState(this.state) }
  current(session) { return this.active === session && !session.controller.signal.aborted }
  cancel() {
    this.active?.controller.abort(); this.active = null
    this.emit(emptyVoiceFlow)
  }
  cancelPending() { if (activePhases.has(this.state.phase)) this.cancel() }
  dispose() { this.active?.controller.abort(); this.active = null }
  observeLocation(location) {
    if (!this.active) return false
    const pending = this.active.navigations.indexOf(location)
    if (pending >= 0) { this.active.navigations.splice(0, pending + 1); return false }
    if (this.active.location !== location) { this.cancel(); return true }
    return false
  }
  go(session, changes) {
    const next = this.navigate(changes)
    if (next !== session.location) session.navigations.push(next)
    session.location = next
  }
  async start(transcript, location, context = {}) {
    this.cancel()
    const session = { id: ++this.serial, controller: new AbortController(), location, navigations: [], taken: false }
    this.active = session
    this.emit({ ...emptyVoiceFlow, phase: 'INTERPRETING', transcript, requestId: session.id, message: '말씀하신 게임과 요청을 확인하고 있어요…' })
    try {
      const command = validateCommand(await this.api.resolve(transcript, session.controller.signal))
      if (!this.current(session)) return
      if (command.status === 'CONTROL') {
        if (command.action === 'NEXT_BRIEFING') {
          if (!context.game || !context.articleId) throw problem('먼저 게임과 소식 하나를 선택해 주세요. 선택한 소식의 다음 공식 소식을 읽어드릴게요.')
          await this.prepare(session, context.game, context.articleId)
        } else {
          const success = this.control(command.action === 'PAUSE' ? 'pause' : 'resume')
          this.emit({ phase: 'INFO', message: command.action === 'PAUSE'
            ? success ? '잠시 멈췄어요. “계속 읽어줘”라고 하면 멈춘 위치부터 이어서 읽어요.' : '지금 재생 중인 브리핑이 없어요.'
            : success ? '멈춘 위치부터 이어서 읽고 있어요.' : '이어서 읽을 브리핑이 없어요. 먼저 브리핑 듣기를 눌러 주세요.' })
        }
        return
      }
      if (command.status === 'RESOLVED') { await this.prepare(session, command.game); return }
      if (command.query) this.go(session, { q: command.query, appId: null, newsId: null, category: null, page: null })
      const messages = {
        SEARCH: '게임 검색 결과를 확인해 주세요.', CHOOSE_GAME: '비슷한 게임이 있어요. 아래에서 하나를 선택하면 최신 소식을 들려드릴게요.',
        NOT_FOUND: '등록된 게임을 찾지 못했어요. 다른 이름으로 말씀하거나 직접 검색해 주세요.',
        NEEDS_GAME: '어떤 게임인지 함께 말씀해 주세요. 예: “카운터스트라이크 2 최신 소식 들려줘”.',
        UNSUPPORTED: '게임 검색과 최신 공식 소식 1개 브리핑을 도와드려요. 게임 이름과 함께 요청해 주세요.',
      }
      this.emit({ phase: command.status === 'CHOOSE_GAME' ? 'CHOOSING' : 'INFO', candidates: command.candidates, message: messages[command.status] })
    } catch (error) { this.fail(session, error) }
  }
  choose(appId) {
    if (!this.active || this.state.phase !== 'CHOOSING') return false
    const game = this.state.candidates.find(candidate => candidate.appId === Number(appId))
    if (!game) return false
    const session = this.active
    void this.prepare(session, game).catch(error => this.fail(session, error))
    return true
  }
  async prepare(session, game, afterId = null) {
    if (!this.current(session)) return
    this.emit({ phase: 'NEWS', game, candidates: [], message: `${game.name}의 ${afterId ? '다음' : '최신'} 공식 소식 1개를 찾고 있어요…` })
    if (!afterId) {
      this.control('stop')
      this.go(session, { q: game.name, appId: game.appId, newsId: null, category: null, page: null })
    }
    const news = await this.api.news(game.appId, session.controller.signal)
    if (!this.current(session)) return
    const article = latestOfficial(news, game.appId, afterId)
    this.control('stop')
    const target = { appId: game.appId, article }
    this.emit({ phase: 'SUMMARY', target, message: '선택한 공식 소식의 핵심 3가지와 낭독 대본을 준비하고 있어요…' })
    const page = afterId ? Math.floor([...news.items].sort(newsOrder).findIndex(item => item.id === article.id) / PAGE_SIZE) + 1 : null
    this.go(session, { q: game.name, appId: game.appId, newsId: article.id, category: null, page })
    const path = briefingPath(game.appId, article), signal = session.controller.signal
    let result = await this.api.read(path, article.sourceHash, signal)
    if (!this.current(session)) return
    if (['EMPTY', 'STALE'].includes(result.status)) {
      try { result = await this.api.generate(path, article.sourceHash, signal) }
      catch (error) {
        if (error?.response?.data?.code !== 'BBS_BRIEFING_PROCESSING') throw error
        result = { status: 'PROCESSING' }
      }
    }
    // A different request may already be saving the same briefing. Poll GET only, never repeat POST.
    for (let attempt = 0; result.status === 'PROCESSING' && attempt < 30; attempt++) {
      if (!this.current(session)) return
      await this.sleep(2000, signal)
      if (!this.current(session)) return
      result = await this.api.read(path, article.sourceHash, signal)
    }
    if (!this.current(session)) return
    if (result.status !== 'READY') throw problem(result.status === 'PROCESSING'
      ? '요약을 아직 만들고 있어요. 아래에서 저장 결과를 확인해 주세요.'
      : '한국어 요약을 준비하지 못했어요. 아래 원문을 확인하거나 잠시 후 다시 요청해 주세요.')
    this.emit({ phase: 'READY', briefing: result.briefing, message: '공식 소식 1개의 요약을 준비했어요. 음성 브리핑으로 이어집니다.' })
  }
  takePlayback(appId, articleId, sourceHash, generatedAt) {
    const session = this.active, target = this.state.target
    if (!session || session.taken || this.state.phase !== 'READY' || !target || target.appId !== appId
        || target.article.id !== articleId || target.article.sourceHash !== sourceHash || this.state.briefing?.generatedAt !== generatedAt) return false
    session.taken = true
    return true
  }
  fail(session, error) {
    if (this.current(session)) this.emit({ phase: 'ERROR', message: error.userMessage || this.errorMessage(error) })
  }
}
