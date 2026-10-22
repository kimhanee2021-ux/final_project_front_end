import test from 'node:test'
import assert from 'node:assert/strict'
import { countBy, describe, paidText, range } from '../src/features/purchase-import/model/importSummary.js'

test('counts and describes records by kind with labels, falling back to the raw key', () => {
  const counts = countBy([{ type: 'PURCHASE' }, { type: 'PURCHASE' }, { type: 'X' }], 'type')
  assert.deepEqual(counts, { PURCHASE: 2, X: 1 })
  assert.equal(describe(counts, { PURCHASE: '구매' }), '구매 2건 · X 1건')
})
test('paid amount keeps the original currency and marks full refunds', () => {
  assert.equal(paidText(null, 'USD'), '전액 환불')
  assert.equal(paidText(12.5, 'USD'), 'USD 12.5')
  assert.equal(paidText(5000), '5,000')
})
test('range spans the earliest and latest date regardless of order', () => {
  assert.equal(range(['2026-03-01', '2025-01-02', '2026-01-01']), range(['2025-01-02', '2026-03-01']))
})
