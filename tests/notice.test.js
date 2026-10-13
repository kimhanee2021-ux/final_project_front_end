import test from 'node:test'
import assert from 'node:assert/strict'
import { createNoticeApi } from '../src/features/notices/noticeApi.js'
import { normalizeNotice, noticeOwner } from '../src/features/notices/noticeModel.js'
import { mockNotices, mockNoticePage } from '../src/features/notices/mocks/noticeMock.js'

test('공지 목록·상세·저장·삭제를 공통 클라이언트에 요청하고 204를 처리한다', async () => {
  const requests = []
  const client = { request: async config => {
    requests.push(config)
    return config.method === 'DELETE' ? { status: 204 } : { status: 200, data: { id: 1 } }
  } }
  const api = createNoticeApi(client)
  const controller = new AbortController()
  await api.page(2, controller.signal)
  await api.find(1, controller.signal)
  await api.save(null, { title: '안내', content: '본문' })
  await api.save(1, { title: '수정', content: '본문' })
  assert.equal(await api.remove(1), null)
  assert.deepEqual(requests.map(r => [r.method, r.url]), [['GET','/api/notices'],['GET','/api/notices/1'],['POST','/api/notices'],['PUT','/api/notices/1'],['DELETE','/api/notices/1']])
  assert.equal(requests[0].params.page, 2)
  assert.equal(requests[0].signal, controller.signal)
  assert.ok(requests.every(r => !r.headers?.Authorization))
})

test('공지 오류 코드·필드 오류·취소를 보존한다', async () => {
  const api = createNoticeApi({ request: async () => { throw { response: { status: 403, data: { code: 'NOTICE_FORBIDDEN', error: '작성자만 수정할 수 있습니다.', errors: {title:'제목 오류'} } } } } })
  await assert.rejects(api.find(1), e => e.status === 403 && e.code === 'NOTICE_FORBIDDEN' && e.fields.title === '제목 오류')
  await assert.rejects(createNoticeApi({ request: async () => { throw { code: 'ERR_CANCELED' } } }).page(0), e => e.name === 'AbortError')
})

test('빈 제목·내용과 길이 제한을 검증하고 작성자 권한을 판별한다', () => {
  assert.deepEqual(normalizeNotice(' 제목 ', ' 내용 '), { title:'제목',content:'내용' })
  assert.throws(() => normalizeNotice(' ', '본문'))
  assert.throws(() => normalizeNotice('x'.repeat(256), '본문'))
  assert.throws(() => normalizeNotice('제목', 'x'.repeat(10001)))
  assert.equal(noticeOwner({authorId:7},{id:7}),true)
  assert.equal(noticeOwner({authorId:7},{id:8}),false)
  assert.equal(noticeOwner({authorId:null},{id:7}),false)
})

test('샘플은 12개 읽기 전용 목록으로 두 페이지에 중복 없이 나뉜다', () => {
  const first = mockNoticePage(0), last = mockNoticePage(1)
  assert.equal(mockNotices.length,12)
  assert.equal(first.content.length,10)
  assert.equal(last.content.length,2)
  assert.equal(last.last,true)
  assert.equal(new Set([...first.content,...last.content].map(n=>n.id)).size,12)
  assert.ok(mockNotices.every(n=>n.authorId===null))
})
