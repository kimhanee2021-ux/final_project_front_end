import test from 'node:test'
import assert from 'node:assert/strict'
import { componentJudgements, evaluationStatus, gradeOneLiner, overallGrade, unknownGradeHint } from '../src/features/performance/model/pcEvaluation.js'

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
  // 서버가 근거 부족(UNKNOWN)으로 돌려주면 분석 중이 아니라 판정 불가로 본다
  assert.equal(overallGrade({ overallGrade: 'UNKNOWN' }).unknown, true)
  assert.equal(overallGrade({ overallGrade: 'B' }).unknown, false)
  assert.equal(overallGrade(null).unknown, false)
})

test('등급을 판정할 수 없을 때 이유를 알려 준다', () => {
  assert.match(unknownGradeHint({ gpuModel: 'AMD Radeon(TM) Graphics' }), /모델 번호가 없어요/)
  assert.match(unknownGradeHint({ gpuModel: '' }), /GPU 모델이 입력되지 않아서/)
  assert.match(unknownGradeHint({ gpuModel: 'NVIDIA GeForce RTX 3070' }), /GPU·CPU 모델이나 RAM/)
})

test('종합 등급 아래 한 줄: 교체 검토 부품이 있으면 그것을, 없으면 확인 필요 부품을, 모두 유지 가능이면 충분하다는 말을 한다', () => {
  const advice = (category, status) => ({ category, status })
  const judged = list => componentJudgements({ explanationStatus: 'READY', componentAdvice: list })
  const upgrade = judged([advice('CPU', 'KEEP'), advice('GPU', 'UPGRADE'), advice('RAM', 'CHECK'), advice('SSD', 'UPGRADE')])
  assert.equal(gradeOneLiner(upgrade), 'AI 판단: GPU · 저장장치 교체를 검토해 보세요.')
  const check = judged([advice('CPU', 'KEEP'), advice('GPU', 'KEEP'), advice('RAM', 'CHECK'), advice('SSD', 'KEEP')])
  assert.equal(gradeOneLiner(check), 'AI 판단: RAM 상태를 한 번 확인해 보세요.')
  const keep = judged([advice('CPU', 'KEEP'), advice('GPU', 'KEEP'), advice('RAM', 'KEEP'), advice('SSD', 'KEEP')])
  assert.match(gradeOneLiner(keep), /모든 부품이 유지 가능/)
})

test('부품 판정이 아직 없으면 한 줄 설명은 빈 문자열이다', () => {
  assert.equal(gradeOneLiner(componentJudgements(null)), '')
})
