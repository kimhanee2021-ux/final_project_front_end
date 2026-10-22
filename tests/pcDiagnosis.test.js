import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeSpecs, ownedPage } from '../src/features/performance/model/pcDiagnosis.js'
test('미확인 용량은 0으로 만들지 않고 null로 유지한다', () => {
  assert.equal(normalizeSpecs({ ramGB: '' }).ramGB, null)
})
test('남은 공간/유효하지 않은 숫자를 거부한다', () => {
  assert.throws(() => normalizeSpecs({ ramGB: 'NaN' }))
  assert.throws(() => normalizeSpecs({ storageTotalGB: '100', storageFreeGB: '101' }))
})
test('플레이시간 상위5개, 펼치면10개 단위로 표시한다', () => {
  const games = Array.from({ length: 31 }, (_, i) => ({ appId: i + 1, name: `Game ${i}`, playtimeForever: i * 10 }))
  assert.equal(ownedPage(games, false, 0).games.length, 5)
  assert.equal(ownedPage(games, false, 0).games[0].appId, 31)
  assert.equal(ownedPage(games, true, 3).games.length, 1)
})
test('실제 기록이 없는 게임을 많이 플레이했다고 표시하지 않는다', () => {
  assert.equal(ownedPage([{ appId: 1, name: 'A' }], false, 0).hasPlaytime, false)
})
