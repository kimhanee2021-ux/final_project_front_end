import test from 'node:test'
import assert from 'node:assert/strict'
import { authLink, safeReturnTo } from '../src/features/auth/model/authSession.js'

test('return navigation preserves filters and rejects external destinations and auth loops', () => {
  assert.equal(safeReturnTo('/library?status=playing#games'), '/library?status=playing#games')
  for (const path of ['https://example.com', '//example.com', '/\\example.com', '/%2f%2fexample.com', '/%5cexample.com', '/login', '/LOGIN/', '/signup?next=/wishlist', '/forgot-password', '/%6cogin', '/explore/../login', '/\nexample.com', null, '%']) {
    assert.equal(safeReturnTo(path), '/', String(path))
  }
  assert.equal(authLink('login', '/wishlist?genre=RPG'), '/login?next=%2Fwishlist%3Fgenre%3DRPG')
  assert.equal(authLink('signup', '/login'), '/signup')
})

