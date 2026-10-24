import test from 'node:test'
import assert from 'node:assert/strict'
import { newsView, safeSourceUrl, formatNewsDate } from '../src/features/bbs/model/news.js'

const items = Array.from({ length: 14 }, (_, index) => ({
  id: String(18446744073709551615n - BigInt(index)), category: index % 2 ? 'PATCH' : 'EVENT',
}))

test('large Steam IDs survive selection and pagination without numeric conversion', () => {
  const view = newsView(items, 'ALL', '2', items[7].id)
  assert.equal(view.selected.id, items[7].id)
  assert.equal(view.visible[0].id, items[6].id)
  assert.equal(view.pageCount, 3)
})
test('filters only the requested category and defaults to its first article', () => {
  const view = newsView(items, 'PATCH', '1', null)
  assert.equal(view.filtered.length, 7)
  assert.ok(view.visible.every(article => article.category === 'PATCH'))
  assert.equal(view.selected.id, items[1].id)
})
test('unknown or old selection does not silently show a different article', () => {
  assert.equal(newsView(items, 'ALL', '1', 'missing').selected, undefined)
  assert.equal(newsView(items, 'PATCH', '1', items[0].id).selected, undefined)
})
test('invalid URLs, pages and empty categories recover', () => {
  assert.equal(newsView(items, 'garbage', '-50', null).currentPage, 1)
  assert.equal(newsView(items, 'ALL', '999', null).currentPage, 3)
  assert.deepEqual(newsView(items, 'DEV_NEWS', '1', null).visible, [])
  assert.equal(newsView([], 'ALL', '1', null).selected, undefined)
})
test('source links accept only HTTPS Steam hosts and dates use Korean time', () => {
  assert.equal(safeSourceUrl('https://steamstore-a.akamaihd.net/news/a'), 'https://steamstore-a.akamaihd.net/news/a')
  for (const value of ['javascript:alert(1)', 'https://steamcommunity.com.evil.test/a', 'https://evil@steamcommunity.com/a', 'https://pcgamer.com/a', 'http://steamcommunity.com/a'])
    assert.equal(safeSourceUrl(value), null)
  assert.match(formatNewsDate('2026-10-23T17:00:00Z'), /24/)
})
