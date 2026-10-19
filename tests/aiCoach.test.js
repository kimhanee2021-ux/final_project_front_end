import test from 'node:test'
import assert from 'node:assert/strict'
import { barPercent, buildEvidenceBlocks, coachErrorMessage, parseBudgetInput, toHistory } from '../src/features/ai-coach/coachModel.js'

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

test('다른 화면에서 코치로 넘어가는 주소는 질문을 인코딩하고 길이를 제한한다', async () => {
  const { coachLink, MAX_MESSAGE_LENGTH } = await import('../src/features/ai-coach/coachModel.js')
  assert.equal(coachLink(), '/ai-coach')
  assert.equal(coachLink('  '), '/ai-coach')
  assert.equal(coachLink('이번 달 얼마 썼어?'), '/ai-coach?q=' + encodeURIComponent('이번 달 얼마 썼어?'))
  const long = decodeURIComponent(coachLink('a'.repeat(900)).split('?q=')[1])
  assert.equal(long.length, MAX_MESSAGE_LENGTH)
})

test('근거 보기: 같은 묶음 숫자는 막대 비교, %는 하나여도 막대, 나머지는 글자 줄', () => {
  const items = [
    { label: '작년 지출', value: '87,765원', amount: 87765, unit: '원', group: 'spendingByYear.*.spentKrw' },
    { label: '올해 지출', value: '11,117원', amount: 11117, unit: '원', group: 'spendingByYear.*.spentKrw' },
    { label: '할인 비중', value: '40%', amount: 40, unit: '%', group: 'patterns.discountReliance' },
    { label: '총 지출', value: '454,023원', amount: 454023, unit: '원', group: 'totals' },
    { label: '가장 많이 쓴 해 연도', value: '2024년' },
  ]
  const blocks = buildEvidenceBlocks(items)
  assert.deepEqual(blocks.map(b => b.type), ['chart', 'bar', 'row', 'row'])
  assert.equal(blocks[0].items.length, 2)
  assert.equal(blocks[2].item.label, '총 지출')
})

test('막대 길이: 원·시간은 묶음 최댓값 기준, %는 100 기준, 0은 0', () => {
  const group = [{ amount: 87765 }, { amount: 11117 }]
  assert.equal(barPercent(87765, '원', group), 100)
  assert.equal(barPercent(11117, '원', group), 13)
  assert.equal(barPercent(40, '%'), 40)
  assert.equal(barPercent(0, '원', group), 0)
  assert.equal(barPercent(1, '원', [{ amount: 100000 }]), 3)
})
