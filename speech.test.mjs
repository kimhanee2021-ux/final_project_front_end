import test from 'node:test'
import assert from 'node:assert/strict'
import { NewsAudioPlayer } from './src/features/game-news/model/newsAudioPlayer.js'
import { spokenGameNames, spokenNewsDate } from './src/features/game-news/model/newsPronunciation.js'

function harness(request = async () => new Blob(['audio'], { type: 'audio/wav' })) {
  const states = [], sounds = [], revoked = [], calls = []
  const player = new NewsAudioPlayer({
    request: (...args) => { calls.push(args); return request(...args) },
    update: state => states.push(state), createUrl: () => 'blob:test', revokeUrl: url => revoked.push(url),
    audio: () => {
      const sound = { paused: false, play() { this.onplaying(); return Promise.resolve() }, pause() { this.paused = true }, removeAttribute() {}, load() {} }
      sounds.push(sound); return sound
    },
  })
  return { player, states, sounds, revoked, calls }
}
test('natural game hints and Korean date never confuse another sequel', () => {
  assert.equal(spokenGameNames('Dota 2. Counter-Strike 2. Team Fortress 2.'), '도타 투. 카운터 스트라이크 투. 팀 포트리스 투.')
  assert.equal(spokenGameNames('Dota 20, xDota 2, 도타2'), 'Dota 20, xDota 2, 도타 투')
  assert.equal(spokenGameNames('도타2의 패치. Dota 2D.'), '도타 투의 패치. Dota 2D.')
  assert.equal(spokenNewsDate('2026-10-23T16:00:00Z'), '2026년 10월 24일')
})
test('stop releases audio; replay reuses blob and original script', async () => {
  const h = harness(); await h.player.say('Dota 2. 저장된 요약 7.40.', true)
  assert.equal(h.states.at(-1).status, 'SPEAKING'); assert.equal(h.calls[0][0], '도타 투. 저장된 요약 7.40.')
  h.player.stop(); assert(h.sounds[0].paused); assert.equal(h.states.at(-1).canReplay, true)
  await h.player.replay(); assert.equal(h.calls.length, 1); assert.equal(h.sounds.length, 2)
  h.sounds[1].onended(); assert.equal(h.states.at(-1).status, 'IDLE'); assert.equal(h.revoked.length, 2)
  h.player.stop(true); assert.equal(h.states.at(-1).canReplay, false)
})
test('cancelling preparation aborts request and late audio cannot start', async () => {
  let resolve; const h = harness(() => new Promise(done => { resolve = done }))
  const pending = h.player.say('소식', true); const signal = h.calls[0][1]
  h.player.stop(true); assert(signal.aborted)
  resolve(new Blob(['late'])); await pending
  assert.equal(h.sounds.length, 0); assert.equal(h.states.at(-1).canReplay, false)
})
test('errors keep text and replay; autoplay rejection retains prepared audio', async () => {
  const error = new Error(); error.speechMessage = 'OpenAI 음성 키가 아직 설정되지 않았어요.'
  const h = harness(async () => { throw error }); await h.player.say('저장된 요약', true)
  assert.equal(h.states.at(-1).status, 'ERROR'); assert.match(h.states.at(-1).message, /키/)
  assert.equal(h.states.at(-1).text, '저장된 요약'); assert(h.states.at(-1).canReplay)
  const a = harness(); a.player.audio = () => ({ play: () => Promise.reject({ name: 'NotAllowedError' }), pause() {}, removeAttribute() {}, load() {} })
  await a.player.say('요약', true); assert.match(a.states.at(-1).message, /자동 재생/)
  a.player.audio = () => ({ play() { this.onplaying(); return Promise.resolve() }, pause() {}, removeAttribute() {}, load() {} })
  await a.player.replay(); assert.equal(a.calls.length, 1); assert.equal(a.states.at(-1).status, 'SPEAKING'); a.player.stop(true)
})
