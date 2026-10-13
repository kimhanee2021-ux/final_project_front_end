import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { samples, validateUpload } from '../src/features/ai-screenshots/mocks/screenshotSamples.js'

test('세 유형을 고르게 제공하며 실제 분석으로 오인하지 않는다', () => {
  assert.equal(samples.length, 30)
  assert.equal(new Set(samples.map(s => s.id)).size, 30)
  for (const type of ['item', 'play', 'error']) {
    assert.equal(samples.filter(s => s.type === type).length, 10)
  }
  for (const sample of samples) {
    assert.equal(sample.isMock, true)
    assert.ok(sample.summary && sample.actions.length && sample.screen.length)
  }
})

test('실제 이미지가 로컬 파일과 일치하고 가짜 능력치를 사용하지 않는다', () => {
  const images = samples.filter(s => s.image)
  assert.equal(images.length, 30)
  for (const sample of images) {
    assert.ok(existsSync(new URL(`../public${sample.image}`, import.meta.url)))
    assert.match(sample.sourceUrl, /^https:\/\/(store\.steampowered\.com|help\.steampowered\.com|www\.epicgames\.com|help\.guildwars2\.com)\//)
    assert.doesNotMatch(JSON.stringify(sample), /공격력 120|치명타 \+8%|회복 20|서리의 검/)
  }
  assert.ok(samples.filter(s => s.type === 'error').every(s => s.image && s.imageStatus === 'real-screenshot'))
})

test('업로드는 지원 이미지와 크기를 확인한다', () => {
  assert.equal(validateUpload({ type: 'image/png', size: 1024 }), '')
  assert.ok(validateUpload({ type: 'image/svg+xml', size: 1024 }))
  assert.ok(validateUpload({ type: 'image/jpeg', size: 11 * 1024 * 1024 }))
  assert.ok(validateUpload({ type: 'image/webp', size: 0 }))
})
