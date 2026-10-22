import test from 'node:test'
import assert from 'node:assert/strict'
import { confirmedSpecs, isAcceptedPhoto, providerSendText, reviewValuesOf } from '../src/features/performance/model/pcPhoto.js'

test('only small jpg, png and webp photos are accepted', () => {
  assert.equal(isAcceptedPhoto({ type: 'image/png', size: 1000 }), true)
  assert.equal(isAcceptedPhoto({ type: 'image/gif', size: 1000 }), false)
  assert.equal(isAcceptedPhoto({ type: 'image/jpeg', size: 10485761 }), false)
})
test('consent text names how each provider setup sends data', () => {
  assert.match(providerSendText('Gemini → Groq'), /Gemini에 우선 전송/)
  assert.equal(providerSendText(null), 'AI 서비스(확인 중)에 전송해')
  assert.equal(providerSendText('Groq'), 'Groq에 전송해')
})
test('laptop gpus are marked and a confirmed spec needs at least one known part', () => {
  const { values } = reviewValuesOf({ gpuModel: 'NVIDIA GeForce RTX 4060 Laptop GPU', gpuMemory: '8 GB' })
  assert.equal(values.deviceType, 'LAPTOP')
  assert.throws(() => confirmedSpecs({}, []), /CPU·GPU·RAM/)
})
