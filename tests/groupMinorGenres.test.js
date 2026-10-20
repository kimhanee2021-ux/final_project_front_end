import test from 'node:test'
import assert from 'node:assert/strict'
import { groupMinorGenres } from '../src/features/gameAnalysis/model/groupMinorGenres.js'

test('상위 장르에 기타가 있어도 기타 항목은 하나만 남는다', () => {
  const genres = ['RPG', '기타', '액션', '전략', '퍼즐', '레이싱'].map(name => ({ name, amount: 10, count: 1, hours: 1, percent: 10 }))
  const result = groupMinorGenres(genres)
  assert.equal(result.filter(item => item.name === '기타').length, 1)
  assert.equal(result.find(item => item.name === '기타').amount, 30)
  assert.equal(result.length, 4)
})

test('장르가 적으면 그대로 돌려준다', () => {
  const genres = [{ name: 'RPG' }, { name: '기타' }]
  assert.equal(groupMinorGenres(genres), genres)
})
