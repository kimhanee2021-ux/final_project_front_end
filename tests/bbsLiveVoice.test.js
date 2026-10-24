import test from 'node:test'
import assert from 'node:assert/strict'
import { LiveVoice } from '../src/features/bbs/model/liveVoice.js'

function setup(options = {}) {
  const events = [], sent = [], tracks = [{ stop() { this.stopped = true } }]
  const node = () => ({ connect() {}, disconnect() { this.disconnected = true } })
  class Context {
    sampleRate = 24000
    audioWorklet = { addModule: async () => {} }
    async resume() {}
    createMediaStreamSource() { return node() }
    async close() { this.state = 'closed' }
  }
  class Worklet { port = { close() {} }; connect() {}; disconnect() {} }
  class Socket {
    readyState = 1; bufferedAmount = 0
    send(data) { sent.push(data) }
    close() { this.closed = true }
  }
  const callbacks = Object.fromEntries(['Ready', 'Partial', 'Finishing', 'Transcript', 'Error'].map(name => [`on${name}`, value => events.push({ name, value })]))
  const live = new LiveVoice(callbacks, { AudioContext: Context, AudioWorkletNode: Worklet, WebSocket: Socket,
    location: { href: 'http://localhost:9191/bbs' }, mediaDevices: { getUserMedia: async () => ({ getTracks: () => tracks }) }, ...options })
  const receive = event => live.receive(JSON.stringify(event))
  const speak = () => { for (let i = 0; i < 3; i++) live.append({ pcm: new ArrayBuffer(4800), energy: .1 }) }
  return { live, receive, speak, events, sent, tracks }
}
test('live captions arrive before commit; only final executes once and releases the microphone', async () => {
  const { live, receive, speak, events, sent, tracks } = setup()
  await live.start(); receive({ type: 'ready' }); speak()
  receive({ type: 'partial', text: '다음 소식' }); receive({ type: 'partial', text: '다음 소식 들려줘' })
  assert.deepEqual(events.map(e => e.name), ['Ready', 'Partial', 'Partial'])
  live.finish(); live.finish()
  assert.equal(sent.filter(x => typeof x === 'string').length, 1)
  assert.ok(tracks[0].stopped); assert.equal(live.context.state, 'closed')
  receive({ type: 'final', text: '다음 소식 들려줘' }); receive({ type: 'final', text: 'ignored' })
  assert.equal(events.filter(e => e.name === 'Transcript').length, 1); assert.ok(live.socket.closed)
})
test('cancel ignores late captions/final and a permission response received after cancellation', async () => {
  const one = setup(); await one.live.start(); one.receive({ type: 'ready' }); one.speak(); one.live.cancel()
  one.receive({ type: 'partial', text: 'late' }); one.receive({ type: 'final', text: 'late' })
  assert.equal(one.events.length, 1); assert.ok(one.tracks[0].stopped)
  let resolve, stopped = false
  const two = setup({ mediaDevices: { getUserMedia: () => new Promise(yes => { resolve = yes }) } })
  const pending = two.live.start(); two.live.cancel(); resolve({ getTracks: () => [{ stop() { stopped = true } }] }); await pending
  assert.ok(stopped); assert.equal(two.events.length, 0)
})
test('silence never executes and speech needs two seconds of silence before committing', async () => {
  const empty = setup(); await empty.live.start(); empty.receive({ type: 'ready' }); empty.live.started -= 10001; empty.live.measure()
  assert.equal(empty.events.at(-1).name, 'Error'); assert.equal(empty.sent.length, 0)
  const talking = setup(); await talking.live.start(); talking.receive({ type: 'ready' }); talking.speak()
  talking.live.lastSpeech -= 1000; talking.live.measure(); assert.equal(talking.live.finishing, false)
  talking.live.lastSpeech -= 1100; talking.live.measure(); assert.equal(talking.live.finishing, true); talking.live.cancel()
})
test('provider close, malformed frames, premature final and congested connection fail closed', async () => {
  for (const trigger of [s => s.live.socket.onclose(), s => s.receive({ type: 'final', text: '멈춰' }),
    s => s.live.append({ pcm: new ArrayBuffer(3), energy: 1 }),
    s => { s.live.socket.send = () => { throw new Error('disconnected') }; s.speak() },
    s => { s.live.socket.bufferedAmount = 96001; s.speak() }]) {
    const s = setup(); await s.live.start(); s.receive({ type: 'ready' }); trigger(s)
    assert.equal(s.events.at(-1).name, 'Error'); assert.ok(s.tracks[0].stopped); assert.ok(s.live.socket.closed)
    assert.ok(!s.events.some(e => e.name === 'Transcript'))
  }
})
test('thirty second capture is bounded; permission denial creates no websocket', async () => {
  const s = setup(); await s.live.start(); s.receive({ type: 'ready' }); s.speak(); s.live.started -= 30001; s.live.measure()
  assert.ok(s.live.finishing); s.live.cancel()
  const denied = setup({ mediaDevices: { getUserMedia: async () => { throw new DOMException('denied', 'NotAllowedError') } } })
  await denied.live.start(); assert.match(denied.events[0].value, /권한/); assert.equal(denied.live.socket, undefined)
})
