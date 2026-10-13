import test from 'node:test'
import assert from 'node:assert/strict'
import { makeChoice, validateRound } from '../src/features/ai-worldcup/worldcupModel.js'

test('복수 선택과 모름을 구분하고 선택 이유를 보존한다', () => {
  const pair = [{appId:1}, {appId:2}]
  assert.deepEqual(makeChoice(pair, 'both', ['전투', '분위기'], '탐험도 좋아요').selectedIds, [1,2])
  assert.deepEqual(makeChoice(pair, 'unknown', [], '').selectedIds, [])
  assert.equal(makeChoice(pair, 'unknown', [], '').verdict, 'unknown')
  assert.throws(() => makeChoice(pair, 'other', [], ''))
})
test('동일 게임과 이전에 나온 게임을 다음 대결에서 차단한다', () => {
  assert.throws(() => validateRound({pair:[{appId:1},{appId:1}]}, []))
  assert.throws(() => validateRound({pair:[{appId:1},{appId:2}]}, [{leftId:1,rightId:3}]))
  assert.equal(validateRound({pair:[{appId:2},{appId:4}], explanation:'다음 대결'}, [{leftId:1,rightId:3}]).pair.length,2)
})
