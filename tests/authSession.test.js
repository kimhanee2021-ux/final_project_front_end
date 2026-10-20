import test from 'node:test'
import assert from 'node:assert/strict'
import { authLink, safeReturnTo, readDemoSession, saveDemoSession, clearDemoSession, DEMO_SESSION_KEY } from '../src/features/auth/model/authSession.js'

function storage() {
  const data = new Map()
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }
}

test('return navigation preserves filters and rejects external destinations and auth loops', () => {
  assert.equal(safeReturnTo('/library?status=playing#games'), '/library?status=playing#games')
  for (const path of ['https://example.com', '//example.com', '/\\example.com', '/%2f%2fexample.com', '/%5cexample.com', '/login', '/LOGIN/', '/signup?next=/wishlist', '/forgot-password', '/%6cogin', '/explore/../login', '/\nexample.com', null, '%']) {
    assert.equal(safeReturnTo(path), '/', String(path))
  }
  assert.equal(authLink('login', '/wishlist?genre=RPG'), '/login?next=%2Fwishlist%3Fgenre%3DRPG')
  assert.equal(authLink('signup', '/login'), '/signup')
})

test('remember choice changes storage, logout removes only the demo marker', () => {
  const stores = [storage(), storage()]
  stores[1].setItem('gamesense-wishlist', '["elden"]')
  saveDemoSession(stores, false)
  assert.equal(readDemoSession(stores), true)
  assert.equal(stores[1].getItem(DEMO_SESSION_KEY), null)
  saveDemoSession(stores, true)
  assert.equal(stores[0].getItem(DEMO_SESSION_KEY), null)
  assert.deepEqual(JSON.parse(stores[1].getItem(DEMO_SESSION_KEY)), { mode: 'demo', version: 1 })
  clearDemoSession(stores)
  assert.equal(readDemoSession(stores), false)
  assert.equal(stores[1].getItem('gamesense-wishlist'), '["elden"]')
})

test('malformed and unavailable browser storage never crash the demo', () => {
  const local = storage()
  const blocked = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') }, removeItem() { throw new Error('blocked') } }
  local.setItem(DEMO_SESSION_KEY, '{bad json')
  assert.equal(readDemoSession([blocked, local]), false)
  local.setItem(DEMO_SESSION_KEY, '{"mode":"real","version":1}')
  assert.equal(readDemoSession([null, local]), false)
  assert.doesNotThrow(() => saveDemoSession([blocked, blocked], true))
  assert.doesNotThrow(() => clearDemoSession([null, blocked]))
})
