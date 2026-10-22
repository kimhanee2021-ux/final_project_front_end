import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_SORT, formatHours, formatPlayedDate, sortGames } from '../src/features/library/model/libraryList.js'

const games = [
  { appId: 1, name: 'B', playtimeForever: 600, playtime2Weeks: 0, lastPlayedAt: '2024-03-01T00:00:00Z' },
  { appId: 2, name: 'A', playtimeForever: 300, playtime2Weeks: 120, lastPlayedAt: '2024-05-12T00:00:00Z' },
  { appId: 3, name: 'C', playtimeForever: 900, playtime2Weeks: 30, lastPlayedAt: null },
]
const ids = list => list.map(game => game.appId)

test('총 플레이시간순이 기본이고 많은 순서로 정렬한다', () => {
  assert.equal(DEFAULT_SORT, 'playtime')
  assert.deepEqual(ids(sortGames(games, 'playtime')), [3, 1, 2])
})
test('최근 플레이순은 마지막 플레이가 가까운 순이고 기록 없는 게임은 맨 뒤다', () => {
  assert.deepEqual(ids(sortGames(games, 'recent')), [2, 1, 3])
})
test('게임별 인기순은 최근 2주 플레이시간이 많은 순이다', () => {
  assert.deepEqual(ids(sortGames(games, 'popular')), [2, 3, 1])
})
test('정렬은 원본을 바꾸지 않는다', () => {
  const before = ids(games)
  sortGames(games, 'recent')
  assert.deepEqual(ids(games), before)
})
test('표시 형식', () => {
  assert.equal(formatHours(9252), '154.2시간')
  assert.equal(formatPlayedDate('2024-05-12T12:00:00Z'), '2024.05.12')
  assert.equal(formatPlayedDate(null), '플레이 기록 없음')
})
