import test from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers'
import { VoiceBriefingFlow, latestOfficial, validateCommand } from '../src/features/bbs/model/voiceBriefingFlow.js'

const game = { appId: 730, name: 'Counter-Strike 2' }
const article = (id, date) => ({ id, publishedAt: date, sourceHash: 'a'.repeat(64), sourceUrl: 'https://steamcommunity.com/games/730/announcements/detail/123', feedName: 'steam_community_announcements' })
const old = article('18446744073709551614', '2026-10-21T01:00:00Z'), latest = article('18446744073709551615', '2026-10-24T01:00:00Z')
const ready = { status: 'READY', briefing: { sourceHash: latest.sourceHash, generatedAt: '2026-10-25T00:00:00Z', narrationScript: '저장된 대본' } }
const result = (status = 'RESOLVED', overrides = {}) => ({ status, action: 'LATEST_BRIEFING', query: game.name, game, candidates: [], hasMore: false, ...overrides })
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes }); return { promise, resolve } }
function setup(overrides = {}, control) {
  const calls = [], states = [], navigation = []
  const methods = { resolve: async () => result(), news: async () => ({ appId: 730, stale: false, items: [old, latest] }), read: async () => ({ status: 'EMPTY' }), generate: async () => ready, ...overrides }
  const api = Object.fromEntries(Object.entries(methods).map(([key, value]) => [key, (...args) => { calls.push({ key, args }); return value(...args) }]))
  const flow = new VoiceBriefingFlow({ api, control, onState: state => states.push(state), navigate: changes => { navigation.push(changes); return JSON.stringify(changes) }, errorMessage: () => '요청 실패', sleep: async () => {} })
  return { flow, calls, states, navigation }
}
const run = flow => flow.start('카운터스트라이크 2 최신 소식 들려줘', 'initial')

test('latest official story is selected by time and prepares exactly one summary and one playback handoff', async () => {
  const { flow, calls, navigation } = setup(); await run(flow)
  assert.equal(flow.state.phase, 'READY'); assert.equal(flow.state.target.article.id, latest.id)
  assert.equal(navigation.at(-1).newsId, latest.id); assert.equal(navigation.at(-1).category, null)
  assert.deepEqual(calls.map(c => c.key), ['resolve', 'news', 'read', 'generate'])
  assert.equal(flow.takePlayback(730, old.id, latest.sourceHash, ready.briefing.generatedAt), false)
  assert.equal(flow.takePlayback(730, latest.id, latest.sourceHash, ready.briefing.generatedAt), true)
  assert.equal(flow.takePlayback(730, latest.id, latest.sourceHash, ready.briefing.generatedAt), false)
})
test('stored summaries are reused and plain game names only search', async () => {
  const cached = setup({ read: async () => ready }); await run(cached.flow)
  assert.ok(!cached.calls.some(c => c.key === 'generate'))
  const search = setup({ resolve: async () => result('SEARCH', { action: 'SEARCH' }) }); await run(search.flow)
  assert.deepEqual(search.calls.map(c => c.key), ['resolve']); assert.equal(search.flow.state.phase, 'INFO')
  assert.equal(search.navigation[0].q, game.name)
})
test('ambiguous games require explicit candidate selection before news or paid summary', async () => {
  const second = { appId: 731, name: 'Another game' }
  const { flow, calls } = setup({ resolve: async () => result('CHOOSE_GAME', { game: null, candidates: [game, second] }) })
  await run(flow); assert.equal(flow.state.phase, 'CHOOSING'); assert.equal(calls.length, 1)
  assert.equal(flow.choose(999), false); assert.equal(calls.length, 1)
  assert.equal(flow.choose(730), true); await new Promise(resolve => setImmediate(resolve))
  assert.equal(flow.state.phase, 'READY'); assert.equal(flow.state.target.appId, 730)
  assert.equal(flow.choose(731), false)
})
test('unknown, missing and unsupported requests never enter news or summary generation', async () => {
  for (const status of ['NOT_FOUND', 'NEEDS_GAME', 'UNSUPPORTED']) {
    const { flow, calls } = setup({ resolve: async () => result(status, { game: null, query: status === 'NOT_FOUND' ? 'unknown' : '', action: status === 'UNSUPPORTED' ? 'UNSUPPORTED' : 'LATEST_BRIEFING' }) })
    await run(flow); assert.equal(flow.state.phase, 'INFO'); assert.equal(calls.length, 1)
  }
})
test('empty/stale/invalid news never falls back to an older or external article', async () => {
  for (const news of [{ appId: 730, items: [] }, { appId: 730, stale: true, items: [old] }, { appId: 731, items: [latest] }, { appId: 730, items: [{ ...latest, feedName: 'external_news' }] }]) {
    const { flow, calls } = setup({ news: async () => news }); await run(flow)
    assert.equal(flow.state.phase, 'ERROR'); assert.ok(!calls.some(c => c.key === 'generate' || c.key === 'read'))
  }
  assert.equal(latestOfficial({ appId: 730, items: [old, latest] }, 730).id, latest.id)
})
test('cancel during interpretation, news or generation ignores every late reply', async () => {
  for (const key of ['resolve', 'news', 'generate']) {
    const pending = deferred(); const { flow, calls } = setup({ [key]: () => pending.promise })
    const running = run(flow); await new Promise(resolve => setImmediate(resolve))
    const signal = calls.at(-1).args.at(-1); flow.cancel(); assert.ok(signal.aborted)
    pending.resolve(key === 'resolve' ? result() : key === 'news' ? { appId: 730, items: [latest] } : ready)
    await running; assert.equal(flow.state.phase, 'IDLE'); assert.equal(flow.takePlayback(730, latest.id, latest.sourceHash, ready.briefing.generatedAt), false)
  }
})
test('new utterance and browser history navigation cancel old work without a late playback', async () => {
  const pending = deferred(); let count = 0
  const { flow } = setup({ resolve: () => ++count === 1 ? pending.promise : Promise.resolve(result('SEARCH', { action: 'SEARCH' })) })
  const first = run(flow); await run(flow); pending.resolve(result()); await first; assert.equal(flow.state.phase, 'INFO')
  const next = setup(); await run(next.flow); assert.equal(next.flow.observeLocation('different'), true); assert.equal(next.flow.state.phase, 'IDLE')
})
test('batched internal navigation can render intermediate game selection without cancelling the final article; back still cancels', async () => {
  const { flow, navigation } = setup(); await run(flow)
  assert.equal(flow.observeLocation(JSON.stringify(navigation[0])), false)
  assert.equal(flow.observeLocation(JSON.stringify(navigation[1])), false)
  assert.equal(flow.state.phase, 'READY')
  assert.equal(flow.observeLocation(JSON.stringify(navigation[0])), true)
  assert.equal(flow.state.phase, 'IDLE')
})
test('processing polls GET only and has a bounded wait', async () => {
  let reads = 0
  const { flow, calls } = setup({ read: async () => ++reads < 3 ? { status: 'PROCESSING' } : ready })
  await run(flow); assert.equal(flow.state.phase, 'READY'); assert.equal(reads, 3); assert.ok(!calls.some(c => c.key === 'generate'))
  const stuck = setup({ read: async () => ({ status: 'PROCESSING' }) }); await run(stuck.flow)
  assert.equal(stuck.flow.state.phase, 'ERROR'); assert.equal(stuck.calls.filter(c => c.key === 'read').length, 31)
})
test('a summary failure stops before playback and malformed model result is rejected', async () => {
  const { flow, calls } = setup({ generate: async () => { throw new Error('provider failed') } }); await run(flow)
  assert.equal(flow.state.phase, 'ERROR'); assert.equal(calls.filter(c => c.key === 'generate').length, 1)
  for (const bad of [{}, result('RESOLVED', { game: { appId: -1, name: 'fake' } }), result('CHOOSE_GAME', { candidates: [] }), result('SEARCH', { action: 'LATEST_BRIEFING' })]) assert.throws(() => validateCommand(bad))
})

const controlResult = action => result('CONTROL', { action, query: '', game: null })
test('pause/resume control existing audio without navigation, summary or speech generation', async () => {
  for (const action of ['PAUSE', 'RESUME']) {
    const controls = []
    const { flow, calls, navigation } = setup({ resolve: async () => controlResult(action) }, value => { controls.push(value); return true })
    await run(flow); assert.equal(flow.state.phase, 'INFO'); assert.deepEqual(controls, [action.toLowerCase()])
    assert.equal(calls.length, 1); assert.equal(navigation.length, 0)
  }
})
test('next stops old audio and chooses the following official article, never wraps or chooses another game', async () => {
  const controls = []
  const s = setup({ resolve: async () => controlResult('NEXT_BRIEFING') }, action => controls.push(action))
  await s.flow.start('다음 소식 들려줘', 'initial', { game, articleId: latest.id })
  assert.equal(s.flow.state.target.article.id, old.id); assert.deepEqual(controls, ['stop'])
  assert.equal(s.navigation.length, 1); assert.equal(s.navigation[0].newsId, old.id)
  for (const context of [{}, { game, articleId: old.id }, { game, articleId: 'removed' }]) {
    const end = setup({ resolve: async () => controlResult('NEXT_BRIEFING') })
    await end.flow.start('다음 소식', 'initial', context); assert.equal(end.flow.state.phase, 'ERROR')
    assert.equal(end.navigation.length, 0); assert.ok(!end.calls.some(c => ['generate', 'read'].includes(c.key)))
  }
})
test('cancelled control cannot resume audio and malformed controls are rejected', async () => {
  const pending = deferred(), controls = []
  const s = setup({ resolve: () => pending.promise }, action => controls.push(action))
  const work = run(s.flow); s.flow.cancel(); pending.resolve(controlResult('RESUME')); await work
  assert.deepEqual(controls, [])
  for (const bad of [controlResult('LATEST_BRIEFING'), { ...controlResult('PAUSE'), query: 'Counter-Strike' }, result('INFO', { action: 'RESUME' })]) assert.throws(() => validateCommand(bad))
})

test('next article advances the visible list page across the page boundary', async () => {
  const items = Array.from({ length: 7 }, (_, i) => article(String(i + 1), `2026-10-${String(20 - i).padStart(2, '0')}T00:00:00Z`))
  const s = setup({ resolve: async () => controlResult('NEXT_BRIEFING'), news: async () => ({ appId: 730, items }) })
  await s.flow.start('다음 소식', 'initial', { game, articleId: '6' })
  assert.equal(s.navigation.at(-1).newsId, '7'); assert.equal(s.navigation.at(-1).page, 2)
})
