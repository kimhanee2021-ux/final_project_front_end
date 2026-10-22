import test from 'node:test'
import assert from 'node:assert/strict'
import { createAiRequest } from '../src/shared/lib/aiRequest.js'

test('공통 클라이언트로 이미지와 인증을 전달하고 AI 응답 대기는 화면 취소 타이머가 제어한다', async () => {
  const body = new FormData()
  body.append('image', new Blob(['image-bytes']), 'game.png')
  const controller = new AbortController()
  const api = createAiRequest({ request: async config => {
    assert.equal(config.url, '/api/ai/screenshots')
    assert.equal(config.data, body)
    assert.equal(config.headers['Content-Type'], undefined)
    assert.equal(config.headers.Authorization, 'Bearer test-token')
    assert.equal(config.signal, controller.signal)
    assert.equal(config.timeout, 0)
    return { status: 200, data: { isMock: false } }
  } })
  assert.equal((await api('/ai/screenshots', { token: 'test-token', method: 'POST', body, signal: controller.signal })).isMock, false)
})

test('서버 인증·한도·타임아웃 오류 상태와 사용자 문구를 유지한다', async () => {
  for (const status of [401, 429, 504]) {
    const api = createAiRequest({ request: async () => { throw { response: { status, data: { error: '다시 시도해주세요.' } } } } })
    await assert.rejects(api('/ai/screenshots'), e => e.status === status && e.message === '다시 시도해주세요.')
  }
})

test('Axios 취소를 화면이 처리하는 AbortError로 변환한다', async () => {
  const api = createAiRequest({ request: async () => { throw { code: 'ERR_CANCELED' } } })
  await assert.rejects(api('/ai/screenshots'), e => e.name === 'AbortError')
})

test('삭제 204 응답과 서버 연결 실패를 구분한다', async () => {
  assert.equal(await createAiRequest({ request: async () => ({ status: 204 }) })('/ai/manager/records/1'), null)
  await assert.rejects(createAiRequest({ request: async () => { throw new Error('offline') } })('/ai/manager'), /서버에 연결하지 못했습니다/)
})
