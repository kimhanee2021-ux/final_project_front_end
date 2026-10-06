import test from 'node:test'
import assert from 'node:assert/strict'
import { summarize, filterPeriod, monthlySpending, genreSpending } from '../src/features/dashboard/spendingMetrics.js'
const game = overrides => ({ amount: 10000, refund: 0, hours: 10, genre: 'RPG', purchasedAt: '2026-09-15', ...overrides })
test('unknown prices and free or fully refunded games do not distort paid averages', () => {
  const result = summarize([game({}), game({ amount: null, hours: 200 }), game({ amount: 0, hours: 100 }), game({ refund: 10000 })])
  assert.equal(result.total, 10000); assert.equal(result.average, 10000); assert.equal(result.hourly, 1000); assert.equal(result.unknownCount, 1)
})
test('unplayed costs are included, unknown hours are excluded from matched hourly totals', () => {
  const result = summarize([game({}), game({ hours: 0 }), game({ amount: 50000, hours: null })])
  assert.equal(result.total, 70000); assert.equal(result.hourly, 2000); assert.equal(result.unplayedAmount, 10000)
})
test('no time or no games never produces Infinity or NaN', () => {
  assert.equal(summarize([game({ hours: 0 })]).hourly, null); assert.equal(summarize([]).average, null)
})
test('partial refunds change every monetary aggregate consistently', () => {
  const result = summarize([game({ refund: 3000 })]); assert.equal(result.total, 7000); assert.equal(result.average, 7000); assert.equal(result.hourly, 700)
})
test('six-month periods cross years correctly and exclude future purchases', () => {
  const games = [game({ purchasedAt: '2025-09-30' }), game({ purchasedAt: '2025-10-01' }), game({ purchasedAt: '2026-03-31' }), game({ purchasedAt: '2026-04-01' })]
  assert.equal(filterPeriod(games, 'six', '2026-03-31').length, 2)
  const months = monthlySpending(games, 'six', '2026-03-31')
  assert.equal(months.length, 6); assert.equal(months[0].key, '2025-10'); assert.equal(months[1].total, 0)
})
test('monthly and genre totals reconcile with selected spending', () => {
  const games = [game({}), game({ genre: '액션', amount: 20000 }), game({ amount: null })]
  assert.equal(monthlySpending(games, 'month', '2026-09-30')[0].total, summarize(games).total)
  assert.equal(genreSpending(games).reduce((sum, g) => sum + g.amount, 0), summarize(games).total)
})
