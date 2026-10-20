import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_WEEK, describeRankChange, formatWeekPeriod, getSteamChartUrl, getTopGames, getWeekOptions, isValidWeek, readRankingSelection, shiftWeek } from '../src/features/rankings/model/weeklyRankings.js'
import { getAvailableRankingCountries, getAvailableRankingWeeks, getWeeklyRanking } from '../src/features/rankings/dataSource.js'

const countries = [{ code: 'KR' }, { code: 'US' }, { code: 'GB' }, { code: 'EG' }]

test('chart weeks are real calendar Tuesdays; date rollover is rejected', () => {
  assert.equal(isValidWeek('2026-10-06'), true)
  assert.equal(isValidWeek('2028-02-29'), true)
  for (const invalid of ['2026-10-07', '2026-02-31', '2026-13-01', '2026-10-6', '', null]) {
    assert.equal(isValidWeek(invalid), false, String(invalid))
  }
  assert.equal(shiftWeek('2026-12-29', 1), '2027-01-05')
  assert.equal(shiftWeek('2027-01-05', -1), '2026-12-29')
  assert.equal(formatWeekPeriod('2026-10-06'), '2026.10.06 – 2026.10.13')
})

test('URL selection preserves known country/week and explicitly flags invalid fields', () => {
  const selection = readRankingSelection(new URLSearchParams('country=gb&week=2026-09-22'), countries)
  assert.deepEqual(selection, { country: 'GB', week: '2026-09-22', invalidCountry: false, invalidWeek: false })
  assert.deepEqual(readRankingSelection(new URLSearchParams('country=XX&week=2026-02-31'), countries), {
    country: 'KR', week: DEFAULT_WEEK, invalidCountry: true, invalidWeek: true,
  })
  assert.equal(readRankingSelection(new URLSearchParams(), countries).week, '2026-10-06')
})

test('Steam links identify the selected country and exact week', () => {
  assert.equal(getSteamChartUrl('GB', '2026-10-06'), 'https://store.steampowered.com/charts/topsellers/GB/2026-10-6')
  assert.equal(getSteamChartUrl('../KR', '2026-10-06'), null)
  assert.equal(getSteamChartUrl('KR', '2026-10-07'), null)
})

test('missing countries and missing weeks never inherit a different ranking', () => {
  assert.equal(getWeeklyRanking({ country: 'EG', week: DEFAULT_WEEK }), null)
  assert.equal(getWeeklyRanking({ country: 'KR', week: '2026-10-13' }), null)
  assert.equal(getWeeklyRanking({ country: 'KR', week: '2026-02-31' }), null)
  assert.deepEqual(getAvailableRankingCountries('2026-10-13'), [])
})

test('new, returning, unchanged and unavailable change values remain distinct', () => {
  assert.equal(describeRankChange('NEW').tone, 'new')
  assert.equal(describeRankChange('RETURNING').tone, 'returning')
  assert.equal(describeRankChange(0).tone, 'same')
  assert.equal(describeRankChange(null).tone, 'unknown')
  assert.equal(describeRankChange(5).label, '전주 대비 5계단 상승')
  assert.equal(describeRankChange(-2).label, '전주 대비 2계단 하락')
  assert.notEqual(describeRankChange(null).text, describeRankChange(0).text)
})

test('historical deep links remain selectable without timezone-dependent week changes', () => {
  const options = getWeekOptions('2025-12-30', ['2026-09-15'], new Date('2026-10-20T00:30:00Z'))
  assert.ok(options.includes('2025-12-30'))
  assert.ok(options.includes('2025-12-23'))
  assert.ok(options.includes('2026-01-06'))
  assert.ok(options.includes('2026-09-15'))
  assert.equal(new Set(options).size, options.length)
  assert.ok(options.every(isValidWeek))
})

test('rankings remain empty for every selectable country and week before data connection', () => {
  for (const country of ['US', 'CN', 'GB', 'FR', 'JP', 'KR', 'AU', 'AE', 'NO', 'IT', 'ES', 'DE', 'IL', 'ID', 'IN', 'BR', 'ZA', 'EG', 'SA']) {
    assert.deepEqual(getAvailableRankingWeeks(country), [])
    for (const week of [DEFAULT_WEEK, '2026-09-15', '2026-10-20']) {
      assert.equal(getWeeklyRanking({ country, week }), null)
      assert.deepEqual(getAvailableRankingCountries(week), [])
    }
  }
})

test('ranking sorting preserves source positions without changing the input', () => {
  const entries = [{ sourceRank: 6 }, { sourceRank: 2 }, { sourceRank: 4 }]
  assert.deepEqual(getTopGames(entries, 2).map(entry => entry.sourceRank), [2, 4])
  assert.deepEqual(entries.map(entry => entry.sourceRank), [6, 2, 4])
})