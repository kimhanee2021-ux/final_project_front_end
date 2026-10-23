import test from 'node:test'
import assert from 'node:assert/strict'

// localStorage가 없는 Node에서 쓸 간단한 저장소
const data = new Map()
globalThis.localStorage = {
  getItem: key => (data.has(key) ? data.get(key) : null),
  setItem: (key, value) => data.set(key, String(value)),
  removeItem: key => data.delete(key),
}
const { loadEvaluation, saveEvaluation } = await import('../src/features/performance/model/pcEvaluationStore.js')

const pc = { cpuModel: 'Ryzen 7 7800X3D', gpuModel: 'RTX 3070', ramGB: 32 }
const ready = { explanationStatus: 'READY', gameName: 'A' }

test('저장한 평가를 같은 사양과 계정으로 다시 꺼낸다', () => {
  data.clear()
  saveEvaluation(1, pc, { overview: { key: 'k', result: { explanationStatus: 'READY', overallGrade: 'B' } } })
  saveEvaluation(1, pc, { results: { 10: ready } })
  const loaded = loadEvaluation(1, pc)
  assert.equal(loaded.overview.result.overallGrade, 'B')
  assert.equal(loaded.overview.key, 'k')
  assert.deepEqual(Object.keys(loaded.results), ['10'])
})

test('사양이 바뀌면 저장본을 쓰지 않고, 다른 계정의 것도 쓰지 않는다', () => {
  data.clear()
  saveEvaluation(1, pc, { results: { 10: ready } })
  assert.deepEqual(loadEvaluation(1, { ...pc, gpuModel: 'RTX 4090' }), { overview: null, results: {} })
  assert.deepEqual(loadEvaluation(2, pc), { overview: null, results: {} })
  assert.deepEqual(loadEvaluation(null, pc), { overview: null, results: {} })
})

test('사양을 바꿔 저장하면 이전 사양의 평가는 버린다', () => {
  data.clear()
  saveEvaluation(1, pc, { results: { 10: ready } })
  const changed = { ...pc, gpuModel: 'RTX 4090' }
  saveEvaluation(1, changed, { results: { 20: ready } })
  assert.deepEqual(Object.keys(loadEvaluation(1, changed).results), ['20'])
  assert.deepEqual(loadEvaluation(1, pc).results, {})
})

test('실패하거나 끝나지 않은 결과는 저장하지 않는다', () => {
  data.clear()
  saveEvaluation(1, pc, {
    results: { 10: ready, 11: { explanationStatus: 'RATE_LIMITED' }, 12: { explanationStatus: 'UNAVAILABLE' } },
    overview: { key: 'k', result: { explanationStatus: 'RATE_LIMITED' } },
  })
  const loaded = loadEvaluation(1, pc)
  assert.deepEqual(Object.keys(loaded.results), ['10'])
  assert.equal(loaded.overview, null)
})

test('저장본이 깨져 있어도 빈 값으로 시작한다', () => {
  data.clear()
  data.set('gamesense-pc-evaluation-v1:1', '{깨진 json')
  assert.deepEqual(loadEvaluation(1, pc), { overview: null, results: {} })
})
