import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSteamLicenses, isLicensesPage } from '../src/features/purchaseImport/parseSteamLicenses.js'

// 실제 라이선스 페이지와 같은 구조의 가짜 데이터 (개인정보 없음)
const row = (date, name, method, free = false) => `
<tr role="button"><td class="license_date_col">${date}</td>
<td>${free ? '<div class="free_license_remove_link"><a href="javascript:RemoveFreeLicense( 123, \'eA==\' );">Remove</a></div>' : ''} ${name} </td>
<td class="license_acquisition_col"> ${method} </td></tr>`
const page = rows => `<div class="block_content account_table_ctn"><table class="account_table"><tr><th class="license_date_col">Date</th><th>Item</th><th class="license_acquisition_col">Acquisition Method</th></tr>${rows.join('')}</table></div>`

const sample = page([
  row('7 Jan, 2026', 'Pummel Party', 'Steam Store'),
  row('27 Mar, 2022', 'Hollow Knight', 'Gift/Guest Pass'),
  row('20 Oct, 2020', 'Slapshot', 'Complimentary', true),
  row('2019년 3월 8일', 'Stardew Valley', '소매'),
  row('8 Mar, 2019', 'Stardew Valley', 'Retail'),
])

test('reads acquisition date, name and method and skips the header row', () => {
  const { licenses, warnings } = parseSteamLicenses(sample)
  assert.equal(licenses.length, 5)
  assert.deepEqual(warnings, [])
  assert.deepEqual(licenses.map(l => l.method), ['STORE', 'GIFT', 'COMPLIMENTARY', 'KEY', 'KEY'])
  assert.deepEqual(licenses[1], { ...licenses[1], acquiredAt: '2022-03-27', name: 'Hollow Knight' })
})

test('removes the free license "Remove" link from the name and flags it', () => {
  const slapshot = parseSteamLicenses(sample).licenses[2]
  assert.equal(slapshot.name, 'Slapshot')
  assert.equal(slapshot.freeLicense, true)
})

test('identical rows on the same day still get distinct keys', () => {
  const twice = parseSteamLicenses(page([row('1 Jan, 2024', 'Game', 'Steam Store'), row('1 Jan, 2024', 'Game', 'Steam Store')]))
  assert.equal(new Set(twice.licenses.map(l => l.externalKey)).size, 2)
})

test('detects the page type and warns on other pages', () => {
  assert.equal(isLicensesPage(sample), true)
  assert.equal(isLicensesPage('<table class="wallet_history_table"></table> <a href="/account/licenses/">licenses</a>'), false)
  assert.equal(parseSteamLicenses('<html></html>').warnings.length, 1)
})
