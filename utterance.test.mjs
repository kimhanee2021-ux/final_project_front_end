import test from 'node:test'
import assert from 'node:assert/strict'
import { NewsUtteranceSession } from './src/features/game-news/model/newsUtteranceSession.js'

function harness(t) {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
  const instances = [], final = [], preview = [], errors = []
  class Recognition {
    constructor() { instances.push(this) }
    start() {}
    stop() { if (!this.deferStop) this.onend?.() }
    abort() { this.aborted = true; this.onend?.() }
    emit(entries) { this.onresult?.({ results: entries.map(([transcript, isFinal]) => Object.assign([{ transcript }], { isFinal })) }) }
  }
  const session = new NewsUtteranceSession({ Recognition, onFinal: value => final.push(value), onPreview: value => preview.push(value), onError: value => errors.push(value) })
  session.start(); t.after(() => session.cancel())
  return { session, instances, final, preview, errors, tick: ms => t.mock.timers.tick(ms) }
}
test('continuous/interim enabled; repeated result indexes replace rather than append', t => {
  const h = harness(t), r = h.instances[0]
  assert(r.continuous && r.interimResults)
  r.emit([['도타2', true], ['패', false]])
  r.emit([['도타2', true], ['패치', false]])
  r.emit([['도타2', true], ['패치', true]])
  r.emit([['도타2', true], ['패치', true]])
  h.tick(2999); assert.deepEqual(h.final, [])
  h.tick(1); assert.deepEqual(h.final, ['도타2 패치']); assert.equal(h.preview.at(-1), '도타2 패치')
})
test('short pause and later correction are one request with all final segments', t => {
  const h = harness(t), r = h.instances[0]
  r.emit([['도타2 패치', true]]); h.tick(2000)
  r.onspeechstart(); h.tick(1500); assert.deepEqual(h.final, [])
  r.emit([['도타2 패치', true], ['아니 이벤트 알려줘', true]])
  h.tick(3000); assert.deepEqual(h.final, ['도타2 패치 아니 이벤트 알려줘'])
})
test('automatic disconnect restarts and deduplicates overlap across recognition runs', t => {
  const h = harness(t), r = h.instances[0]
  r.emit([['도타2', true]]); h.tick(500); r.onend(); h.tick(150)
  assert.equal(h.instances.length, 2)
  h.instances[1].emit([['도타2', true], ['패치 알려줘', true]])
  h.tick(3000); assert.deepEqual(h.final, ['도타2 패치 알려줘'])
})
test('overlapping full prefix on restart is not counted twice', t => {
  const h = harness(t)
  h.instances[0].emit([['도타2', true]]); h.instances[0].onend(); h.tick(150)
  h.instances[1].emit([['도타2 패치', true]]); h.tick(3000)
  assert.deepEqual(h.final, ['도타2 패치'])
})
test('cancel detaches callbacks and prevents queued restart and late submission', t => {
  const h = harness(t), r = h.instances[0], late = r.onresult
  r.emit([['도타2', true]]); r.onend(); h.session.cancel(); h.tick(30000)
  late({ results: [Object.assign([{ transcript: '도타2 패치' }], { isFinal: true })] })
  assert.equal(h.instances.length, 1); assert.deepEqual(h.final, []); assert.deepEqual(h.errors, [])
})
test('permission/network failures do not restart or submit partial queries', t => {
  const h = harness(t)
  h.instances[0].emit([['도타2', true]]); h.instances[0].onerror({ error: 'not-allowed' }); h.tick(30000)
  assert.equal(h.errors.length, 1); assert.deepEqual(h.final, []); assert.equal(h.instances.length, 1)
})
test('unconfirmed correction is never silently dropped from a final query', t => {
  const h = harness(t)
  h.instances[0].emit([['도타2 패치', true], ['아니 이벤트', false]])
  h.tick(3000); assert.deepEqual(h.final, []); assert.match(h.errors[0], /확정하지 못/)
})
test('stop flush can turn the remaining interim into a final result', t => {
  const h = harness(t), r = h.instances[0]; r.deferStop = true
  r.emit([['도타2', false]]); h.tick(3000)
  r.emit([['도타2', true]]); r.onend()
  assert.deepEqual(h.final, ['도타2']); h.tick(1000); assert.equal(h.final.length, 1)
})
test('empty input, overlong input and repeated disconnects are bounded', t => {
  const h = harness(t); h.tick(8000); assert.equal(h.errors.length, 1); assert.deepEqual(h.final, [])
})
test('overlong recognition text is rejected before an API request', t => {
  const h = harness(t); h.instances[0].emit([['가'.repeat(501), true]])
  assert.equal(h.errors.length, 1); assert.deepEqual(h.final, [])
})
test('browser auto-end retries at most three times without receiving audio', t => {
  const h = harness(t)
  for (let i = 0; i < 4; i++) { h.instances.at(-1).onend(); h.tick(150) }
  assert.equal(h.instances.length, 4); assert.equal(h.errors.length, 1); assert.deepEqual(h.final, [])
})
