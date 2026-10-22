import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyForm, toForm, toPayload } from '../src/features/board/model/postForm.js'

test('a new post starts in the first category and is not anonymous', () => {
  assert.equal(emptyForm.isAnonymous, false)
  assert.equal(emptyForm.title, '')
})
test('payload trims text, turns an empty tag into null and survives a form round trip', () => {
  const payload = toPayload({ category: '세일공유', tag: '  ', title: ' 제목 ', content: ' 내용 ', isAnonymous: true })
  assert.deepEqual(payload, { category: '세일공유', appId: null, tag: null, title: '제목', content: '내용', isAnonymous: true, expiresAt: null })
  assert.equal(toForm({ ...payload, tag: null }).tag, '')
})
