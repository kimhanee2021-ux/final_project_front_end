import test from 'node:test'
import assert from 'node:assert/strict'
import { safeSourceUrl, categoryLabel, BRIEFING_GROUPS, topicLabel } from '../src/features/community-briefing/model/briefingModel.js'

test('three groups with twelve short topic names, unknown topics fall back to a neutral label', () => {
  assert.deepEqual(BRIEFING_GROUPS.map(group => group.id), ['NOTICE', 'UPDATE', 'EVENT'])
  const ids = ['OPERATION', 'MAINTENANCE', 'INCIDENT', 'CORRECTION', 'CONTENT', 'BALANCE', 'FIX', 'DEVELOPMENT', 'EVENT', 'BENEFIT', 'TRIAL', 'RECRUITMENT']
  assert.ok(ids.every(id => topicLabel(id) !== '소식' && topicLabel(id).length <= 3))
  assert.equal(topicLabel('invented'), '소식')
})

test('source links only open Steam hosts, never injected URLs', () => {
  assert.equal(safeSourceUrl('javascript:alert(1)'), null)
  assert.equal(safeSourceUrl('https://steamcommunity.com.evil.test/x'), null)
  assert.equal(safeSourceUrl('https://steamcommunity.com/games/570/announcements'), 'https://steamcommunity.com/games/570/announcements')
})

test('unrecognized categories do not invent urgency', () => {
  assert.equal(categoryLabel('CHANGE'), '중요한 변화')
  assert.equal(categoryLabel('invented'), '공식 소식')
})
