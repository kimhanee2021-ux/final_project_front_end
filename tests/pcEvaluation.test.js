import test from 'node:test'
import assert from 'node:assert/strict'
import { componentJudgements, evaluationStatus, overallGrade } from '../src/features/performance/model/pcEvaluation.js'

test('사양 → 로그인 → 동의 순서로 상태를 정한다', () => {
  assert.equal(evaluationStatus({ hasSavedSpecs: false, signedIn: true, aiConsent: true }), 'no-specs')
  assert.equal(evaluationStatus({ hasSavedSpecs: true, signedIn: false, aiConsent: true }), 'login')
  assert.equal(evaluationStatus({ hasSavedSpecs: true, signedIn: true, aiConsent: false }), 'consent')
  assert.equal(evaluationStatus({ hasSavedSpecs: true, signedIn: true, aiConsent: true }), 'ready')
})

test('부품 판정은 분석이 끝난 결과에서만 만든다', () => {
  assert.ok(componentJudgements(null).every(item => item.verdict === null && item.value === 0))
  const result = {
    explanationStatus: 'READY',
    componentAdvice: [
      { category: 'GPU', status: 'UPGRADE', reason: 'x' },
      { category: 'CPU', status: 'KEEP' },
    ],
  }
  const [cpu, gpu, ram] = componentJudgements(result)
  assert.equal(cpu.verdict.label, '유지 가능')
  assert.equal(gpu.verdict.label, '교체 검토')
  assert.equal(ram.verdict, null)
})

test('알 수 없는 등급은 null로 둔다', () => {
  assert.equal(overallGrade({ overallGrade: 'B' }).grade, 'B')
  assert.equal(overallGrade({ overallGrade: 'Z' }).grade, null)
  assert.equal(overallGrade(null).grade, null)
})
