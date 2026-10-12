import test from 'node:test'
import assert from 'node:assert/strict'
import { toSpendingGame, valueRanking, recentFocus, amountSourceCounts, genreLabel, spendingBuckets, filterTransactions } from '../src/features/spending/spendingModel.js'
import { summarize, genreSpending } from '../src/features/dashboard/spendingMetrics.js'
const api = overrides => ({ appId: 1, name: 'Test Game', genre: 'RPG', genres: ['Action', 'RPG'], thumbnailUrl: null, amount: 10000, amountSource: 'ESTIMATED', hours: 10, recentHours: 0, lastPlayedAt: '2026-10-01T20:00:00', ...overrides })
test('maps the backend response to dashboard games without purchase dates', () => {
  const game = toSpendingGame(api({ name: 'elden ring' }))
  assert.equal(game.id, 1); assert.equal(game.purchasedAt, null); assert.equal(game.refund, 0)
  assert.equal(game.lastPlayedAt, '2026-10-01'); assert.equal(game.initials, 'ER'); assert.deepEqual(game.genres, ['액션', 'RPG'])
})
test('genre labels fall back to the raw value and missing genres become 기타', () => {
  assert.equal(genreLabel('Strategy'), '전략'); assert.equal(genreLabel('Puzzle'), 'Puzzle'); assert.equal(genreLabel(null), '기타')
})
test('free and unknown prices stay out of paid totals', () => {
  const games = [api({}), api({ appId: 2, amount: 0, amountSource: 'FREE', hours: 100 }), api({ appId: 3, amount: null, amountSource: 'UNKNOWN' })].map(toSpendingGame)
  const summary = summarize(games)
  assert.equal(summary.total, 10000); assert.equal(summary.paidCount, 1); assert.equal(summary.unknownCount, 1)
  assert.deepEqual(amountSourceCounts(games), { CONFIRMED: 0, ESTIMATED: 1, FREE: 1, NO_RECORD: 0, UNKNOWN: 1 })
  assert.equal(genreSpending(games).reduce((sum, g) => sum + g.amount, 0), summary.total)
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
test('recent focus picks the most played game in the last two weeks or nothing', () => {
  const games = [api({ appId: 1, recentHours: 2 }), api({ appId: 2, recentHours: 9 })].map(toSpendingGame)
  assert.equal(recentFocus(games).id, 2); assert.equal(recentFocus([toSpendingGame(api({}))]), null)
})
test('spending buckets follow purchase dates, subtract refunds and switch to years for long ranges', () => {
  const tx = [
    { purchasedAt: '2026-09-10', amountKrw: 20000 },
    { purchasedAt: '2026-09-20', amountKrw: -5000 },
    { purchasedAt: '2026-07-01', amountKrw: 10000 },
    { purchasedAt: '2017-10-29', amountKrw: 30000 },
  ]
  const six = spendingBuckets(tx, 'six', '2026-10-12')
  assert.equal(six.unit, 'month')
  assert.deepEqual(six.buckets.map(b => b.key), ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'])
  assert.equal(six.buckets.find(b => b.key === '2026-09').total, 15000)
  const all = spendingBuckets(tx, 'all', '2026-10-12')
  assert.equal(all.unit, 'year')
  assert.equal(all.buckets[0].key, '2017')
  assert.equal(all.buckets.at(-1).total, 25000)
  assert.equal(filterTransactions(tx, 'month', '2026-10-12').length, 0)
})
