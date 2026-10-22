import test from 'node:test'
import assert from 'node:assert/strict'
import { donutSlices } from '../src/shared/ui/charts/donutSlices.js'

test('조각은 값의 비율대로 둘레(100)를 나누고 앞 조각이 끝나는 곳에서 다음 조각이 시작한다', () => {
  const slices = donutSlices([{ label: '액션', value: 50 }, { label: 'RPG', value: 30 }, { label: '전략', value: 20 }])
  assert.deepEqual(slices.map(slice => slice.percent), [50, 30, 20])
  assert.deepEqual(slices.map(slice => slice.start), [0, 50, 80])
  assert.deepEqual(slices.map(slice => slice.length), [50, 30, 20])
})

test('값이 0 이하인 항목은 조각에서 빼고, 전체가 0이면 빈 배열이다', () => {
  const slices = donutSlices([{ label: '액션', value: 10 }, { label: '스포츠', value: 0 }])
  assert.deepEqual(slices.map(slice => slice.label), ['액션'])
  assert.equal(slices[0].percent, 100)
  assert.deepEqual(donutSlices([{ label: 'a', value: 0 }]), [])
  assert.deepEqual(donutSlices([]), [])
})

test('비율은 반올림해서 보여주고, 둘레 길이는 소수 그대로 둔다', () => {
  const [first, second] = donutSlices([{ label: 'a', value: 1 }, { label: 'b', value: 2 }])
  assert.equal(first.percent, 33)
  assert.equal(second.percent, 67)
  assert.ok(Math.abs(first.length - 100 / 3) < 1e-9)
})
