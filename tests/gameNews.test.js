import test from 'node:test'
import assert from 'node:assert/strict'
import { parseNewsQuery, newsSearch, newsListApi, newsDetailApi, pageNumbers, safeSourceUrl, formatNewsDate, freshnessMessage } from '../src/features/game-news/model/newsQuery.js'

test('filters and paging survive a detail/list round trip', () => {
  const query = parseNewsQuery('appId=570&category=patch&page=2&size=10')
  assert.deepEqual(query, { appId: '570', category: 'PATCH', page: 2, size: 10 })
  assert.deepEqual(parseNewsQuery(newsSearch(query)), query)
  assert.equal(newsListApi(query), '/api/games/570/news?category=PATCH&page=2&size=10')
  assert.equal(newsListApi(parseNewsQuery('')), '/api/games/news?page=0&size=5')
})

test('invalid URL filters and offsets normalize to safe defaults', () => {
  for (const page of ['-1', 'abc', 'Infinity', '999999999999999999', '2147483647', '1.5']) {
    assert.equal(parseNewsQuery(`page=${page}`).page, 0)
  }
  assert.deepEqual(parseNewsQuery('appId=4294967296&category=bogus&size=101'), { appId: '', category: '', page: 0, size: 5 })
  assert.equal(parseNewsQuery('appId=000570').appId, '570')
})

test('detail IDs stay lossless and cannot form arbitrary API paths', () => {
  assert.equal(newsDetailApi('570', '9223372036854775807'), '/api/games/570/news/9223372036854775807')
  for (const id of ['0', '-1', '1.5', '../auth', '9223372036854775808', 'abc']) assert.equal(newsDetailApi('570', id), null)
  assert.equal(newsDetailApi('4294967296', '4'), null)
})

test('pagination is bounded at beginning, middle and last pages', () => {
  assert.deepEqual(pageNumbers(0, 3), [0, 1, 2])
  assert.deepEqual(pageNumbers(5, 10), [3, 4, 5, 6, 7])
  assert.deepEqual(pageNumbers(9, 10), [5, 6, 7, 8, 9])
  assert.deepEqual(pageNumbers(100, 3), [0, 1, 2])
  assert.deepEqual(pageNumbers(0, 0), [])
})

test('source links allow web URLs only', () => {
  assert.equal(safeSourceUrl('https://steamcommunity.com/news/4'), 'https://steamcommunity.com/news/4')
  for (const url of ['javascript:alert(1)', 'data:text/html,test', '/api/logout', '', undefined]) assert.equal(safeSourceUrl(url), null)
})

test('timestamps explicitly use Korea time and tolerate missing dates', () => {
  assert.match(formatNewsDate('2026-10-23T18:00:00Z'), /2026.*10.*24/)
  assert.match(formatNewsDate('2026-10-23T18:00:00Z', true), /03:00/)
  assert.equal(formatNewsDate(null), '날짜 미제공')
  assert.equal(formatNewsDate('invalid'), '날짜 미제공')
})

test('stale briefings distinguish failed regeneration from pending work', () => {
  assert.equal(freshnessMessage({ stale: false, generationStatus: 'FAILED' }), '')
  assert.match(freshnessMessage({ stale: true, generationStatus: 'PENDING' }), /갱신할 예정/)
  assert.match(freshnessMessage({ stale: true, generationStatus: 'FAILED' }), /반영이 지연/)
})
