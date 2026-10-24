import test from 'node:test'
import assert from 'node:assert/strict'
import { briefingPath, validateBriefing } from '../src/features/bbs/model/briefing.js'
const hash = 'a'.repeat(64)
const valid = { status: 'READY', briefing: { titleKo: '공식 소식', points: ['첫째', '둘째', '셋째'], narrationScript: '낭독 대본', sourceHash: hash, estimatedSeconds: 40 } }
test('uses exact Steam gid strings and validates source fingerprints', () => {
  assert.equal(briefingPath(730, { id: '18446744073709551615', sourceHash: hash }), '/api/games/bbs/730/news/18446744073709551615/briefing')
  assert.equal(briefingPath(730, { id: '../other', sourceHash: hash }), null)
  assert.equal(briefingPath(730, { id: '1' }), null)
})
test('rejects replies from a different source and incomplete summaries', () => {
  assert.equal(validateBriefing(valid, hash), valid)
  for (const changes of [{ sourceHash: 'b'.repeat(64) }, { points: ['하나', '둘'] }, { points: ['하나', '둘', null] }, { narrationScript: '' }, { estimatedSeconds: 100 }])
    assert.throws(() => validateBriefing({ ...valid, briefing: { ...valid.briefing, ...changes } }, hash))
})
test('never exposes stale payload as a current briefing', () => {
  for (const status of ['EMPTY', 'STALE', 'PROCESSING', 'UNAVAILABLE']) assert.equal(validateBriefing({ ...valid, status }, hash).briefing, null)
  assert.throws(() => validateBriefing({ status: 'unknown' }, hash))
})
