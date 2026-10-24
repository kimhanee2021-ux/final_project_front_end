import test from 'node:test'
import assert from 'node:assert/strict'
import { NewsAudioCapture } from './src/features/game-news/model/newsAudioCapture.js'

function harness(t, overrides = {}) {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] })
  const h = { final: [], errors: [], ready: 0, stopped: 0, signal: 0 }
  h.stream = { getTracks: () => [{ stop: () => h.stopped++ }] }
  class Recorder {
    static isTypeSupported(type) { return type.startsWith('audio/webm') }
    constructor(_stream, { mimeType }) { this.mimeType = mimeType; this.state = 'inactive'; h.recorder = this }
    start() { this.state = 'recording' }
    stop() {
      this.state = 'inactive'
      this.ondataavailable?.({ data: new Blob(['recorded audio'], { type: this.mimeType }) })
      this.onstop?.()
    }
  }
  class Context {
    resume() { return Promise.resolve() }
    close() { return Promise.resolve() }
    createMediaStreamSource() { return { connect() {}, disconnect() {} } }
    createAnalyser() { return { getFloatTimeDomainData(samples) { samples.fill(h.signal) } } }
  }
  h.capture = new NewsAudioCapture({
    onReady: () => h.ready++, onFinal: blob => h.final.push(blob), onError: message => h.errors.push(message),
    mediaDevices: { getUserMedia: async () => h.stream }, Recorder, AudioContext: Context, ...overrides,
  })
  h.tick = ms => { for (let i = 0; i < ms; i += 100) t.mock.timers.tick(Math.min(100, ms - i)) }
  t.after(() => h.capture.cancel())
  return h
}
test('manual completion releases microphone and sends one audio blob', async t => {
  const h = harness(t); await h.capture.start()
  assert.equal(h.ready, 1)
  h.capture.finish(); h.capture.finish(); h.tick(40000)
  assert.equal(h.final.length, 1); assert(h.final[0].size > 0); assert.equal(h.stopped, 1)
  assert.deepEqual(h.errors, [])
})
test('three seconds of silence after audio completes recording once', async t => {
  const h = harness(t); await h.capture.start()
  h.signal = 0.03; h.tick(500); h.signal = 0; h.tick(2900)
  assert.equal(h.final.length, 0); h.tick(100); assert.equal(h.final.length, 1)
})
test('silent microphone fails without sending an audio blob', async t => {
  const h = harness(t); await h.capture.start(); h.tick(10000)
  assert.equal(h.errors.length, 1); assert.equal(h.stopped, 1); assert.equal(h.final.length, 0)
})
test('cancel while permission is pending releases late microphone without starting', async t => {
  let grant
  const h = harness(t, { mediaDevices: { getUserMedia: () => new Promise(resolve => { grant = resolve }) } })
  const pending = h.capture.start(); h.capture.cancel(); grant(h.stream); await pending
  assert.equal(h.ready, 0); assert.equal(h.stopped, 1); assert.equal(h.final.length, 0)
})
test('cancel detaches final callbacks and stops recording', async t => {
  const h = harness(t); await h.capture.start(); const lateStop = h.recorder.onstop
  h.capture.cancel(); lateStop(); h.tick(40000)
  assert.equal(h.stopped, 1); assert.equal(h.final.length, 0); assert.deepEqual(h.errors, [])
})
test('permission denial gives actionable message', async t => {
  const h = harness(t, { mediaDevices: { getUserMedia: async () => { throw Object.assign(new Error(), { name: 'NotAllowedError' }) } } })
  await h.capture.start(); assert.match(h.errors[0], /권한/); assert.equal(h.final.length, 0)
})
test('audio limit cancels capture instead of uploading oversized data', async t => {
  const h = harness(t); await h.capture.start()
  h.recorder.ondataavailable({ data: new Blob([new Uint8Array(4_000_001)]) })
  assert.match(h.errors[0], /4MB/); assert.equal(h.final.length, 0); assert.equal(h.stopped, 1)
})
