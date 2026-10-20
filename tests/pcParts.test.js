import test from 'node:test'
import assert from 'node:assert/strict'
import { partPriceLabel } from '../src/features/performance/model/pcParts.js'
test('확인되지 않은 가격을 0원처럼 표시하지 않는다', () => {
  assert.equal(partPriceLabel({ status: 'UNAVAILABLE', priceKrw: 0 }), '판매가 없음')
  assert.equal(partPriceLabel({ status: 'FAILED', priceKrw: null }), '가격 확인 불가')
  assert.equal(partPriceLabel({ status: 'OBSERVED', priceKrw: 326890 }), '326,890원')
})
