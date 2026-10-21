import test from 'node:test'
import assert from 'node:assert/strict'
import { PURCHASE_HISTORY_HINT, defaultTopic, insightErrorMessage, insightRows } from '../src/features/ai-insight/insightModel.js'

test('정해진 에러 code는 안내 문구로, 나머지는 서버 문구를 그대로 쓴다', () => {
  assert.match(insightErrorMessage('AI_NOT_CONFIGURED', '서버'), /Gemini 키/)
  assert.match(insightErrorMessage('AI_BUSY', '서버'), /이용자가 많아요/)
  assert.equal(insightErrorMessage('UNKNOWN', '서버 문구'), '서버 문구')
  assert.equal(insightErrorMessage(undefined, '연결 실패'), '연결 실패')
})

test('처음 보여줄 태그는 서버가 알려 준 첫 번째이고, 태그가 없으면 null이다', () => {
  assert.equal(defaultTopic([{ key: 'spending', label: '소비 패턴' }, { key: 'library', label: '라이브러리 분석' }]), 'spending')
  assert.equal(defaultTopic([{ key: 'library', label: '라이브러리 분석' }]), 'library')
  assert.equal(defaultTopic([]), null)
  assert.equal(defaultTopic(undefined), null)
})

test('결과 카드는 이유 · 비교 · 다음 행동 순서이고, 비교할 값이 없어 비어 있으면 그 줄을 뺀다', () => {
  const full = { reason: '이유예요', comparison: '비교예요', action: '행동이에요' }
  assert.deepEqual(insightRows(full).map(row => row.id), ['reason', 'comparison', 'action'])
  assert.deepEqual(insightRows({ ...full, comparison: '' }).map(row => row.id), ['reason', 'action'])
})

test('구매내역 안내 문구는 더 많은 분석이 가능하다는 말을 담는다', () => {
  assert.match(PURCHASE_HISTORY_HINT, /구매내역/)
  assert.match(PURCHASE_HISTORY_HINT, /더 많은 분석/)
})
