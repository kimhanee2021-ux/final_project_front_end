import test from 'node:test'
import assert from 'node:assert/strict'
import { isNoPlayedGames, recommendationErrorMessage, storeUrl, toCard } from '../src/features/recommendations/model/recommendationModel.js'

const apiError = (status, data) => ({ response: { status, data } })

test('추천 항목을 카드 모양으로 바꾼다', () => {
  const card = toCard({ rank: 2, app_id: 374320, score: 0.9, source: 'new', game: { name: 'DARK SOULS III', genre: 'RPG', thumbnail_url: 'x.jpg' } })
  assert.deepEqual(card, { appId: 374320, rank: 2, name: 'DARK SOULS III', genre: 'RPG', image: 'x.jpg', isNew: true, storeUrl: storeUrl(374320) })
})

test('게임 카탈로그에 없는 추천도 앱 번호로 카드를 만든다', () => {
  const card = toCard({ rank: 1, app_id: 99, score: 0.1, source: 'main', game: null })
  assert.equal(card.name, '게임 99')
  assert.equal(card.isNew, false)
  assert.equal(card.image, '')
})

test('플레이한 게임이 없으면 오류가 아니라 안내로 다룬다', () => {
  const error = apiError(409, { code: 'NO_PLAYED_GAMES', error: '...' })
  assert.equal(isNoPlayedGames(error), true)
  assert.match(recommendationErrorMessage(error), /플레이한 게임이 아직 없어요/)
  assert.equal(isNoPlayedGames(apiError(500, { code: 'INTERNAL_ERROR' })), false)
})

test('추천 서버가 꺼져 있거나 응답이 없으면 연결 안내를 보여준다', () => {
  assert.match(recommendationErrorMessage({ request: {} }), /추천 서버에 연결할 수 없어요/)
  assert.match(recommendationErrorMessage(apiError(502, null)), /추천 서버에 연결할 수 없어요/)
})

test('서버가 준 문구가 있으면 그대로 쓴다', () => {
  assert.equal(recommendationErrorMessage(apiError(400, { code: 'VALIDATION_ERROR', error: '잘못된 요청' })), '잘못된 요청')
})
