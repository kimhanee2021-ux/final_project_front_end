import test from 'node:test'
import assert from 'node:assert/strict'
import { BriefingPlayer, audioTime } from '../src/features/bbs/model/briefingPlayer.js'

function setup(fetchAudio = async () => new Blob(['wav'])) {
  const states = [], revoked = []
  let calls = 0
  const audio = { currentTime: 0, duration: 42, paused: true,
    async play() { this.paused = false; this.onplaying?.() },
    pause() { this.paused = true; this.onpause?.() }, removeAttribute() { this.src = '' }, load() {},
  }
  const player = new BriefingPlayer({ fetchAudio: (...args) => { calls++; return fetchAudio(...args) },
    onState: state => states.push(state), createAudio: () => audio,
    urls: { createObjectURL: () => 'blob:test', revokeObjectURL: url => revoked.push(url) },
  })
  return { player, audio, states, revoked, calls: () => calls }
}
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }

test('play, pause/resume, stop and replay reuse one generated audio', async () => {
  const { player, audio, calls, revoked } = setup()
  await player.play(); assert.equal(player.state.phase, 'PLAYING')
  audio.onloadedmetadata(); audio.currentTime = 12; audio.ontimeupdate()
  player.pause(); assert.equal(player.state.phase, 'PAUSED'); assert.equal(audio.currentTime, 12)
  await player.play(); assert.equal(audio.currentTime, 12)
  player.stop(); assert.equal(audio.currentTime, 0); assert.equal(player.state.phase, 'READY')
  await player.play(); audio.onended(); assert.equal(player.state.phase, 'READY')
  assert.equal(calls(), 1); player.dispose(); assert.deepEqual(revoked, ['blob:test']); assert.equal(audio.src, '')
})
test('stop during generation aborts and ignores late audio; retry owns its own request', async () => {
  const old = deferred(), next = deferred(); let signal; let count = 0
  const { player, audio } = setup(s => { signal = s; return ++count === 1 ? old.promise : next.promise })
  const first = player.play(); await player.play(); assert.equal(count, 1)
  player.stop(); assert.ok(signal.aborted)
  const second = player.play(); old.resolve(new Blob(['old'])); await first
  assert.equal(player.state.phase, 'LOADING'); assert.equal(audio.src, undefined)
  next.resolve(new Blob(['new'])); await second; assert.equal(player.state.phase, 'PLAYING')
  player.dispose()
})
test('article unmount cancels pending audio without notifications or URL allocation', async () => {
  const pending = deferred(); const { player, states, revoked, audio } = setup(() => pending.promise)
  const promise = player.play(); player.dispose(); const count = states.length
  pending.resolve(new Blob(['late'])); await promise
  assert.equal(states.length, count); assert.equal(audio.src, undefined); assert.deepEqual(revoked, [])
})
test('autoplay denial preserves ready audio for an explicit retry', async () => {
  const { player, audio, calls } = setup(); const normal = audio.play
  audio.play = async () => { throw Object.assign(new Error(), { name: 'NotAllowedError' }) }
  await player.play(); assert.equal(player.state.phase, 'READY'); assert.match(player.state.error, /한 번 더/)
  audio.play = normal; await player.play(); assert.equal(player.state.phase, 'PLAYING'); assert.equal(calls(), 1)
  player.dispose()
})
test('stop while play promise is pending cannot restart playback', async () => {
  const pending = deferred(); const { player, audio } = setup()
  audio.play = () => pending.promise
  const promise = player.play(); await Promise.resolve(); player.stop()
  audio.paused = false; pending.resolve(); await promise
  assert.equal(audio.paused, true); assert.equal(player.state.phase, 'READY')
  player.dispose()
})
test('provider and decoder failures surface errors and release resources', async () => {
  const failing = setup(async () => { throw Object.assign(new Error(), { userMessage: '요청이 많아요.' }) })
  await failing.player.play(); assert.equal(failing.player.state.error, '요청이 많아요.'); failing.player.dispose()
  const { player, audio, revoked } = setup(); await player.play(); audio.onerror()
  assert.equal(player.state.phase, 'ERROR'); assert.deepEqual(revoked, ['blob:test'])
  player.dispose(); assert.deepEqual(revoked, ['blob:test'])
})
test('time display uses actual duration safely', () => {
  assert.equal(audioTime(62.9), '1:02'); assert.equal(audioTime(NaN), '0:00'); assert.equal(audioTime(-1), '0:00')
})

test('voice resume only reuses paused audio; interruption during pending play retains its exact position', async () => {
  const { player, audio, calls } = setup()
  assert.equal(player.resume(), false); assert.equal(calls(), 0)
  await player.play(); audio.currentTime = 17.25; player.pause()
  assert.equal(player.resume(), true); await Promise.resolve(); assert.equal(audio.currentTime, 17.25); assert.equal(calls(), 1)
  player.pause(); const pending = deferred(); audio.play = () => pending.promise
  const playing = player.play(); player.pause(); pending.resolve(); await playing
  assert.equal(player.state.phase, 'PAUSED'); assert.equal(audio.currentTime, 17.25); assert.ok(audio.paused)
  player.stop(); assert.equal(player.resume(), false); player.dispose(); assert.equal(player.resume(), false)
})
