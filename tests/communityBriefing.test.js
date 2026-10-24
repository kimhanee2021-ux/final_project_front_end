import test from 'node:test'
import assert from 'node:assert/strict'
import { safeSourceUrl, categoryLabel, readableText, BRIEFING_GROUPS, topicsForGroup } from '../src/features/community-briefing/model/briefingModel.js'

test('three entrances contain twelve short topic names without status labels', () => {
  assert.equal(BRIEFING_GROUPS.length, 3)
  const topics=BRIEFING_GROUPS.flatMap(group=>topicsForGroup(group.id))
  assert.equal(topics.length,12)
  assert.equal(new Set(topics.map(topic=>topic.id)).size,12)
  assert.ok(topics.every(topic=>topic.label.length<=3))
})

test('source links only open Steam hosts, never injected URLs', () => {
  assert.equal(safeSourceUrl('javascript:alert(1)'), null)
  assert.equal(safeSourceUrl('https://steamcommunity.com.evil.test/x'), null)
  assert.equal(safeSourceUrl('https://steamcommunity.com/games/570/announcements'), 'https://steamcommunity.com/games/570/announcements')
})
test('unrecognized categories do not invent urgency and source markup stays text', () => {
  assert.equal(categoryLabel('CHANGE'), '중요한 변화')
  assert.equal(categoryLabel('invented'), '공식 소식')
  assert.equal(readableText(null), '')
})

test('source dates describe age without asserting event expiration', async () => {
  const { sourcePeriod } = await import('../src/features/community-briefing/model/briefingModel.js')
  const item = { sourceIds: ['a'] }
  assert.match(sourcePeriod(item, [{ gid: 'a', publishedAt: '2020-01-01' }], Date.parse('2026-10-24')), /30일 이전 발표.*현재 상태 미확인/)
  assert.match(sourcePeriod(item, [], Date.parse('2026-10-24')), /시점 확인 필요/)
})
