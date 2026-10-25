import test from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { VoiceRecorder } from '../src/features/bbs/model/voiceRecorder.js'

function fixture(extra = {}) {
  const data = { stopped: 0, ready: 0, audio: [], errors: [], energy: .02, closed: 0 }
  const stream = { getTracks: () => [{ stop: () => { data.stopped++ } }] }
  class Recorder {
    static isTypeSupported() { return true }
    constructor(stream, options) { this.state = 'inactive'; this.mimeType = options.mimeType }
    start() { this.state = 'recording' }
    stop() {
      this.state = 'inactive'
      this.ondataavailable?.({ data: new Blob([new Uint8Array(16)], { type: this.mimeType }) })
      this.onstop?.()
    }
  }
  class Context {
    state = 'running'
    async resume() {}
    async close() { this.state = 'closed'; data.closed++ }
    createMediaStreamSource() { return { connect() {}, disconnect() {} } }
    createAnalyser() { return { fftSize: 2048, getFloatTimeDomainData: samples => samples.fill(data.energy) } }
  }
  const deps = { mediaDevices: { getUserMedia: async () => stream }, MediaRecorder: Recorder, AudioContext: Context, ...extra }
  const capture = new VoiceRecorder({ onReady: () => data.ready++, onAudio: blob => data.audio.push(blob), onError: text => data.errors.push(text) }, deps)
  return { capture, data, stream }
}

test('permission accepted after cancellation closes microphone without starting recording', async () => {
  let resolve
  const { capture, data, stream } = fixture({ mediaDevices: { getUserMedia: () => new Promise(done => { resolve = done }) } })
  const started = capture.start()
  capture.cancel()
  resolve(stream)
  await started
  assert.equal(data.stopped, 1)
  assert.equal(data.ready, 0)
  assert.equal(data.audio.length, 0)
})

test('spoken input followed by silence submits once and releases all microphone resources', async () => {
  const { capture, data } = fixture({ limits: { silenceMs: 120, maximumMs: 2000 } })
  await capture.start()
  await delay(250)
  data.energy = 0
  await delay(250)
  capture.finish()
  capture.cancel()
  assert.equal(data.audio.length, 1)
  assert.equal(data.stopped, 1)
  assert.equal(data.closed, 1)
  assert.equal(data.errors.length, 0)
})

test('silence never sends an audio file for transcription', async () => {
  const { capture, data } = fixture({ limits: { initialMs: 150 } })
  data.energy = 0
  await capture.start()
  await delay(250)
  assert.equal(data.audio.length, 0)
  assert.equal(data.errors.length, 1)
  assert.equal(data.stopped, 1)
})

test('permission denial reports a user-facing message without uploading', async () => {
  const { capture, data } = fixture({ mediaDevices: { getUserMedia: async () => { throw Object.assign(new Error(), { name: 'NotAllowedError' }) } } })
  await capture.start()
  assert.match(data.errors[0], /권한/)
  assert.equal(data.audio.length, 0)
})

test('maximum duration submits once; oversize capture is rejected and closed', async () => {
  const first = fixture({ limits: { maximumMs: 350 } })
  await first.capture.start()
  await delay(450)
  assert.equal(first.data.audio.length, 1)
  assert.equal(first.data.stopped, 1)
  const second = fixture({ limits: { bytes: 8, maximumMs: 350 } })
  await second.capture.start()
  await delay(450)
  assert.equal(second.data.audio.length, 0)
  assert.equal(second.data.errors.length, 1)
  assert.equal(second.data.stopped, 1)
})
