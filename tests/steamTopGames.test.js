import test from 'node:test'
import assert from 'node:assert/strict'
import { STEAM_TOP_GAMES } from '../src/features/performance/model/steamTopGames.js'

test('스팀 판매 순위 상위 목록은 중복 없는 게임 5개다', () => {
  assert.equal(STEAM_TOP_GAMES.length, 5)
  assert.equal(new Set(STEAM_TOP_GAMES.map(game => game.appId)).size, 5)
  assert.ok(
    STEAM_TOP_GAMES.every(
      game => Number.isInteger(game.appId) && game.name && game.headerImage.includes(String(game.appId))
    )
  )
})
