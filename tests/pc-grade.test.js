import test from 'node:test'
import assert from 'node:assert/strict'
import {
  gamePerformanceGrade,
  overallPerformanceExplanation,
  latestOverallResult,
  resolutionTarget,
} from '../src/features/performance/model/pcGrade.js'
const result = grade => ({
  explanationStatus: 'READY',
  resolutions: [
    {
      name: 'FHD',
      target: {
        grade,
        method: 'AI_TARGET_BAND_V1',
        reason: '조건부 비교 추정',
        preset: '낮음 옵션',
        confidence: 'LOW',
      },
    },
  ],
})
test('only new completed AI estimates produce grades', () => {
  assert.equal(gamePerformanceGrade(result('C')).grade, 'C')
  assert.equal(gamePerformanceGrade(result('UNKNOWN')), null)
  assert.equal(gamePerformanceGrade({ ...result('A'), explanationStatus: 'UNAVAILABLE' }), null)
  assert.equal(gamePerformanceGrade({}), null)
})
test('rate limit is a service state rather than insufficient evidence', () => {
  assert.match(resolutionTarget({ explanationStatus: 'RATE_LIMITED' }, 'FHD').label, /이용 한도/)
  assert.equal(resolutionTarget(result('UNKNOWN'), 'FHD').label, '추정 어려움')
})
test('missing resolution does not reuse FHD grade for 4K', () => {
  assert.equal(resolutionTarget(result('A'), '4K').grade, null)
})

test('overall explanation requires actual PC-wide AI text, not game fragments', () => {
  const a = { ...result('A'), summary: '짧은 게임 판정', settings: [] }
  assert.match(overallPerformanceExplanation({ a })[0], /이전 분석/)
  const overallExplanation = [
    'CPU와 GPU의 게임별 부담을 분석했어요.',
    '고해상도에서는 GPU의 처리 부담이 커져요.',
    '그림자 품질을 낮춰 GPU 부담을 줄이세요.',
    '교체 전 전원과 장착 공간을 확인하세요.',
  ]
  const lines = overallPerformanceExplanation({ a, b: { ...result('B'), overallExplanation } })
  assert.equal(lines.length, 4)
  assert.match(lines[0], /현재 성능: CPU와 GPU/)
  assert.match(lines[2], /설정 조언: 그림자 품질/)
  assert.doesNotMatch(lines.join(' '), /짧은 게임 판정/)
  assert.match(overallPerformanceExplanation({})[0], /AI 분석이 완료되면/)
})

test('most recent AI explanation is selected with an explicit game scope', () => {
  const old = {
    ...result('A'),
    summaryBatch: 100,
    summaryGames: ['old'],
    overallExplanation: ['old', 'old', 'old', 'old'],
  }
  const current = {
    ...result('C'),
    summaryBatch: 200,
    summaryGames: ['new'],
    overallExplanation: ['new', 'new', 'new', 'new'],
  }
  assert.equal(latestOverallResult({ old, current }), current)
  assert.match(overallPerformanceExplanation({ old, current })[0], /new/)
})
