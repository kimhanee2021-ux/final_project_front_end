import test from 'node:test'
import assert from 'node:assert/strict'
import { api } from '../src/pages/ai/aiApi.js'

test('이미지 파일은 multipart로 전송하고 브라우저가 boundary를 설정한다', async () => {
  const previous = globalThis.fetch
  const data = new FormData()
  data.append('image', new Blob(['image-bytes'], { type: 'image/png' }), 'game.png')
  data.append('type', 'play')
  const controller = new AbortController()
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/ai/screenshots')
    assert.equal(options.body, data)
    assert.equal(options.headers['Content-Type'], undefined)
    assert.equal(options.headers.Authorization, 'Bearer test-token')
    assert.equal(options.signal, controller.signal)
    return new Response(JSON.stringify({ summary: '화면 설명', isMock: false }))
  }
  try { assert.equal((await api('/ai/screenshots', { token: 'test-token', method: 'POST', body: data, signal: controller.signal })).isMock, false) }
  finally { globalThis.fetch = previous }
})

test('로그인 만료와 이용 제한 상태를 호출 화면에 전달한다', async () => {
  const previous = globalThis.fetch
  try {
    for (const status of [401, 429, 504]) {
      globalThis.fetch = async () => new Response(JSON.stringify({ error: '다시 시도해주세요.' }), { status })
      await assert.rejects(api('/ai/screenshots'), error => error.status === status && error.message === '다시 시도해주세요.')
    }
  } finally { globalThis.fetch = previous }
})

test('취소는 네트워크 실패로 바꾸지 않고 보존한다', async () => {
  const previous = globalThis.fetch
  globalThis.fetch = async () => { throw new DOMException('취소', 'AbortError') }
  try { await assert.rejects(api('/ai/screenshots'), error => error.name === 'AbortError') }
  finally { globalThis.fetch = previous }
})
