import test from 'node:test'
import assert from 'node:assert/strict'
import { toSpendingGame, valueRanking, genreLabel } from '../src/features/spending/model/spendingModel.js'
const api = overrides => ({ appId: 1, name: 'Test Game', genre: 'RPG', genres: ['Action', 'RPG'], thumbnailUrl: null, amount: 10000, amountSource: 'ESTIMATED', hours: 10, recentHours: 0, lastPlayedAt: '2026-10-01T20:00:00', ...overrides })
test('maps the backend response to dashboard games without purchase dates', () => {
  const game = toSpendingGame(api({ name: 'elden ring' }))
  assert.equal(game.id, 1); assert.equal(game.purchasedAt, null); assert.equal(game.refund, 0); assert.equal(game.bundleAllocated, false)
  assert.equal(toSpendingGame(api({ bundleAllocated: true })).bundleAllocated, true)
  assert.equal(game.lastPlayedAt, '2026-10-01'); assert.equal(game.initials, 'ER'); assert.deepEqual(game.genres, ['액션', 'RPG'])
})
test('genre labels fall back to the raw value and missing genres become 기타', () => {
  assert.equal(genreLabel('Strategy'), '전략'); assert.equal(genreLabel('Puzzle'), 'Puzzle'); assert.equal(genreLabel(null), '기타')
})
test('value ranking compares only paid games played at least an hour and never overlaps', () => {
  const games = [
    api({ appId: 1, amount: 10000, hours: 100 }), // 100/h
    api({ appId: 2, amount: 10000, hours: 10 }), // 1000/h
    api({ appId: 3, amount: 10000, hours: 0.5 }), // excluded: under an hour
    api({ appId: 4, amount: 0, amountSource: 'FREE', hours: 500 }), // excluded: free
    api({ appId: 5, amount: 20000, hours: 4 }), // 5000/h
  ].map(toSpendingGame)
  const { best, worst } = valueRanking(games, 2)
  assert.deepEqual(best.map(r => r.game.id), [1, 2]); assert.deepEqual(worst.map(r => r.game.id), [5])
  assert.equal(best[0].hourly, 100)
})
