import test from 'node:test'
import assert from 'node:assert/strict'
import { coachErrorMessage, parseBudgetInput, toHistory } from '../src/features/ai-coach/coachModel.js'

test('대화 기록은 오류 말풍선을 빼고 최근 10개만 user/model 역할로 보낸다', () => {
  const messages = [
    { role: 'user', text: '얼마 썼어?' },
    { role: 'model', text: '4,000원이에요', games: [] },
    { role: 'model', text: '연결 실패', error: true },
    ...Array.from({ length: 12 }, (_, i) => ({ role: i % 2 ? 'model' : 'user', text: '질문 ' + i })),
  ]
  const history = toHistory(messages)
  assert.equal(history.length, 10)
  assert.ok(history.every(turn => turn.role === 'user' || turn.role === 'model'))
  assert.ok(!history.some(turn => turn.text === '연결 실패'))
  assert.deepEqual(history.at(-1), { role: 'model', text: '질문 11' })
})

test('정해진 에러 code는 안내 문구로, 나머지는 서버 문구를 그대로 쓴다', () => {
  assert.match(coachErrorMessage('AI_NOT_CONFIGURED', '서버'), /Gemini 키/)
  assert.match(coachErrorMessage('STEAM_NOT_LINKED', '서버'), /스팀 계정/)
  assert.equal(coachErrorMessage('AI_RATE_LIMITED', '질문이 많습니다'), '질문이 많습니다')
})

test('예산 입력은 쉼표·원·만 단위를 이해하고 범위를 벗어나면 null', () => {
  assert.equal(parseBudgetInput('30,000원'), 30000)
  assert.equal(parseBudgetInput('3만'), 30000)
  assert.equal(parseBudgetInput(' 0 '), 0)
  assert.equal(parseBudgetInput('1000만'), 10_000_000)
  assert.equal(parseBudgetInput('1001만'), null)
  assert.equal(parseBudgetInput('-500'), null)
  assert.equal(parseBudgetInput('삼만원'), null)
  assert.equal(parseBudgetInput(''), null)
})
