import test from 'node:test'
import assert from 'node:assert/strict'
import { NewsAudioPlayer } from './src/features/game-news/model/newsAudioPlayer.js'
import { readSpeechEvents } from './src/features/game-news/model/newsPcmStream.js'

const tick = () => new Promise(resolve => setImmediate(resolve))
function harness(stream) {
  const states = [], sources = [], contexts = [], calls = []
  const player = new NewsAudioPlayer({
    stream: (...args) => { calls.push(args); return stream(...args) }, update: state => states.push(state),
    context: () => {
      const audio = {
        currentTime: 0, destination: {}, resume: async () => {}, close: async () => { audio.closed = true },
        createBuffer: (_, length, rate) => ({ duration: length / rate, getChannelData: () => new Float32Array(length) }),
        createBufferSource: () => {
          const source = { connect() {}, disconnect() {}, start(time) { this.started = time }, stop() { this.stopped = true } }
          sources.push(source); return source
        },
      }
      contexts.push(audio); return audio
    },
  })
  return { player, states, sources, contexts, calls }
}

test('playback starts on the first streamed chunk before generation finishes', async () => {
  let writer
  const body = new ReadableStream({ start(controller) { writer = controller } })
  const response = new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })
  const h = harness((_, signal, receive) => readSpeechEvents(response, receive))
  const pending = h.player.say('도타 투 소식', true)
  await tick()
  const encoder = new TextEncoder()
  writer.enqueue(encoder.encode('event:audio\ndata:{"pcm":"AAABAA=="}\n\n'))
  await tick()
  assert.equal(h.states.at(-1).status, 'SPEAKING'); assert.equal(h.sources.length, 1)
  writer.enqueue(encoder.encode('event:done\ndata:{"done":true}\n\n')); writer.close()
  await pending
  h.sources[0].onended()
  assert.equal(h.states.at(-1).status, 'IDLE')
})

test('stop aborts the stream and queued audio; late chunks cannot restart it', async () => {
  let receive, finish
  const h = harness((_, signal, chunk) => { receive = chunk; return new Promise(resolve => { finish = resolve }) })
  const pending = h.player.say('저장된 요약', true)
  await tick(); receive(new Uint8Array([0, 0, 1, 0]))
  const signal = h.calls[0][1]
  h.player.stop()
  assert(signal.aborted); assert(h.sources.every(source => source.stopped)); assert(h.contexts[0].closed)
  receive(new Uint8Array([0, 0])); finish(); await pending
  assert.equal(h.sources.length, 1); assert.equal(h.states.at(-1).status, 'IDLE')
})

test('replay uses completed audio without another generation request', async () => {
  const h = harness(async (_, signal, receive) => { receive(new Uint8Array([0, 0, 1, 0])) })
  await h.player.say('저장된 요약', true)
  h.sources[0].onended()
  await h.player.replay()
  assert.equal(h.calls.length, 1); assert.equal(h.sources.length, 2); assert.equal(h.states.at(-1).status, 'SPEAKING')
  h.player.stop(true)
  assert.equal(h.states.at(-1).canReplay, false)
})
