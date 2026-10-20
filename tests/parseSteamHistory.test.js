import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSteamHistory, parseDate, parseMoney, hashKey } from '../src/features/purchaseImport/parseSteamHistory.js'

// 실제 스팀 구매내역 페이지와 같은 구조의 가짜 데이터 (개인정보 없음)
const row = ({ id, date, items, type, total = '', base = '', appid, refunded = false }) => `
<tr role="button" class="wallet_table_row wallet_table_row_amt_change" onclick="location.href='https://help.steampowered.com/en/wizard/HelpWithTransaction?transid=${id}${appid ? `&amp;appid=${appid}` : ''}'">
  <td class="wht_date">${date}</td>
  <td data-tooltip-text="Click to get help" class="wht_items ">${items}${refunded ? '<div class="wth_item_refunded"> Refund </div>' : ''}</td>
  <td class="wht_type "><div>${type}</div><div class="wth_payment">Visa ****1234</div></td>
  <td class="wht_base_price">${base}</td><td class="wht_tax"></td><td class="wht_shipping"></td>
  <td class="wht_total ">${total}</td>
  <td class="wht_wallet_change wallet_column">-</td><td class="wht_wallet_balance wallet_column">₩ 99,999</td>
</tr>`
const game = name => `<div style="clear: both"> ${name} </div>`
const page = rows => `<html><body><table class="wallet_history_table"><tbody>${rows.join('')}</tbody></table>
<div class="load_more_history_area"><div id="load_more_button" class="btn" style="display: none">Load More</div></div></body></html>`

const sample = page([
  row({ id: 1, date: '12 Oct, 2025', type: 'Purchase', total: '₹ 452', items: game('Risk of Rain 2: Seekers of the Storm') + game('Risk of Rain 2 - Survivors of the Void'),
    base: '<div class="wht_base_price_discounted"><div class="wht_discount_pct">-35%</div><div><span class="wht_original_price">₹ 698</span><span class="wht_discounted_price">₹ 452</span></div></div>' }),
  row({ id: 2, date: '23 Aug, 2025', type: 'Purchase', total: '₩ 50,000', items: 'Purchased ₩ 50,000 Wallet Credit' }),
  row({ id: 3, date: '23 Aug, 2025', type: 'Conversion', items: 'Currency Conversion to INR (India, 37)' }),
  row({ id: 4, date: '16 Sep, 2023', type: 'Market Transaction', total: '₹ 1.03 Credit', items: 'Steam Community Market' }),
  row({ id: 5, date: '23 Jul, 2024', type: 'Refund', total: '₹ 479', items: game('Lovers in a Dangerous Spacetime'), refunded: true }),
  row({ id: 5, date: '23 Jul, 2024', type: 'Purchase', total: '₹ 479', items: game('Lovers in a Dangerous Spacetime') }),
  row({ id: 6, date: '11 Feb, 2022', type: 'In-Game Purchase', total: '₩ 36,000', appid: 1449850, items: '<div>Yu-Gi-Oh! Master Duel</div><div class="wth_payment">Visa ****1234</div>' }),
  row({ id: 7, date: '26 Dec, 2020', type: 'Refund', items: game('Journey'), refunded: true }),
  row({ id: 7, date: '26 Dec, 2020', type: 'Purchase', total: '₩ 10,070', items: game('Journey') }),
  row({ id: 8, date: '2019년 3월 8일', type: '구매', total: '₩ 16,000', items: game('Stardew Valley') }),
])

test('keeps purchases, refunds and in-game purchases and excludes wallet credit, conversion and market rows', () => {
  const result = parseSteamHistory(sample)
  assert.equal(result.transactions.length, 7)
  assert.deepEqual(result.excluded, { WALLET_CREDIT: 1, CONVERSION: 1, MARKET: 1 })
  assert.deepEqual(result.warnings, [])
})

test('reads bundles, discounts, currencies and the app id of in-game purchases', () => {
  const [bundle, , , inGame] = parseSteamHistory(sample).transactions
  assert.deepEqual(bundle.items, ['Risk of Rain 2: Seekers of the Storm', 'Risk of Rain 2 - Survivors of the Void'])
  assert.equal(bundle.purchasedAt, '2025-10-12')
  assert.deepEqual([bundle.amount, bundle.currency, bundle.discountPercent, bundle.originalAmount], [452, 'INR', 35, 698])
  assert.deepEqual([inGame.type, inGame.appId, inGame.amount, inGame.currency], ['IN_GAME', 1449850, 36000, 'KRW'])
})

test('refunds share the purchase group key but get their own external key; an empty refund total means a full refund', () => {
  const list = parseSteamHistory(sample).transactions
  const refund = list.find(t => t.type === 'REFUND' && t.items[0] === 'Journey')
  const purchase = list.find(t => t.type === 'PURCHASE' && t.items[0] === 'Journey')
  assert.equal(refund.groupKey, purchase.groupKey)
  assert.notEqual(refund.externalKey, purchase.externalKey)
  assert.equal(refund.amount, null)
  assert.equal(new Set(list.map(t => t.externalKey)).size, list.length)
})

test('never puts payment details, wallet balance or raw transaction ids into the result', () => {
  const json = JSON.stringify(parseSteamHistory(sample))
  assert.ok(!json.includes('1234'))
  assert.ok(!json.includes('99,999'))
  assert.ok(!json.includes('transid'))
})

test('parses English and Korean dates and several money formats', () => {
  assert.equal(parseDate('7 Jan, 2026'), '2026-01-07')
  assert.equal(parseDate('Jan 7, 2026'), '2026-01-07')
  assert.equal(parseDate('2026년 1월 7일'), '2026-01-07')
  assert.deepEqual(parseMoney('₩ 50,000'), { amount: 50000, currency: 'KRW' })
  assert.deepEqual(parseMoney('₹ 1,234.56'), { amount: 1234.56, currency: 'INR' })
  assert.deepEqual(parseMoney('12,99€'), { amount: 12.99, currency: 'EUR' })
  assert.deepEqual(parseMoney('$19.99'), { amount: 19.99, currency: 'USD' })
  assert.equal(parseMoney(''), null)
})

test('warns when the page is not a purchase history or older rows were not loaded', () => {
  assert.equal(parseSteamHistory('<html>login</html>').warnings.length, 1)
  const notLoaded = sample.replace('style="display: none"', '')
  assert.ok(parseSteamHistory(notLoaded).warnings.some(w => w.includes('더 보기')))
  assert.equal(hashKey('a'), hashKey('a'))
})
