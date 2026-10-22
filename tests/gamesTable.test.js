import test from 'node:test'
import assert from 'node:assert/strict'
import { filterByPlayState, isUnplayedPaid, maxPlayHours, searchGames, sortGames } from '../src/features/spending/model/gamesTable.js'

const game = overrides => ({ name: 'Game', amount: 10000, refund: 0, hours: 10, purchasedAt: '2026-09-15', ...overrides })

test('unplayed tab keeps only paid games that were never started', () => {
  const games = [game({ name: 'a', hours: 0 }), game({ name: 'b', hours: 0, amount: 0 }), game({ name: 'c' })]
  assert.deepEqual(filterByPlayState(games, 'unplayed').map(g => g.name), ['a'])
  assert.equal(filterByPlayState(games, 'all').length, 3)
  assert.equal(isUnplayedPaid(game({ hours: 0, refund: 10000 })), false)
})
test('search ignores letter case', () => {
  assert.deepEqual(searchGames([game({ name: 'Hades' }), game({ name: 'Celeste' })], 'hA').map(g => g.name), ['Hades'])
})
test('sorting puts missing values last and does not mutate the input', () => {
  const games = [game({ name: 'a', amount: null, hours: null, purchasedAt: null }), game({ name: 'b', amount: 5000, hours: 3, purchasedAt: '2026-01-01' }), game({ name: 'c', amount: 9000, hours: 1, purchasedAt: '2026-05-01' })]
  assert.deepEqual(sortGames(games, 'price').map(g => g.name), ['c', 'b', 'a'])
  assert.deepEqual(sortGames(games, 'hours').map(g => g.name), ['b', 'c', 'a'])
  assert.deepEqual(sortGames(games, 'recent').map(g => g.name), ['c', 'b', 'a'])
  assert.equal(games[0].name, 'a')
})
test('mini bar scale is the longest playtime, zero for an empty list', () => {
  assert.equal(maxPlayHours([game({ hours: 3 }), game({ hours: null }), game({ hours: 12 })]), 12)
  assert.equal(maxPlayHours([]), 0)
})
