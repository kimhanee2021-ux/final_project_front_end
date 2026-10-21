// AI 게임 소비 코치 화면의 순수 로직 (네트워크·React 없이 테스트한다)

export const COACH_NAME = '코치 세나'
export const COACH_PATH = '/ai-coach'
// 코치 세나 사진 (AI 이미지 도구로 만든 가상 인물, 실존 인물 아님). 바꾸려면 public/images의 파일만 교체
// PORTRAIT: 코치 화면 왼쪽 큰 사진(세로 3:4), FACE: 말풍선 옆 동그란 얼굴용으로 얼굴만 잘라 둔 정사각형
export const COACH_PORTRAIT = '/images/ai-coach-sena.jpg'
export const COACH_FACE = '/images/ai-coach-sena-face.jpg'
// 사진 파일이 없을 때 대신 쓰는 직접 그린 일러스트
export const COACH_AVATAR_FALLBACK = '/images/ai-coach-avatar.svg'
export const COACH_CHARACTER_FALLBACK = '/images/ai-coach-character.svg'

export const MAX_MESSAGE_LENGTH = 500
// 백엔드는 최근 10개까지 받고 그중 6개만 AI에 보낸다
const MAX_HISTORY = 10
const MAX_TURN_LENGTH = 2000
export const MAX_BUDGET = 10_000_000

// 구매 내역이 없어도 답할 수 있는 질문 (보유 게임·플레이 시간·정가 추정 기준)
export const BASIC_QUESTIONS = [
  '내 소비 패턴을 분석해 줘',
  '가성비 제일 좋은 게임은 뭐야?',
  '사 놓고 안 한 게임 중에 뭐부터 할까?',
]
// 실제 결제일·금액이 있어야 답할 수 있는 질문. 구매 내역을 가져온 뒤에만 추천한다.
export const HISTORY_QUESTIONS = [
  '이번 달 얼마 썼어?',
  '나 세일 때 너무 많이 사는 편이야?',
  '작년이랑 올해 지출 비교해 줘',
  '지금 환불할 수 있는 게임 있어?',
]

// 구매 내역을 가져왔는지에 따라 보여줄 추천 질문
export function suggestedQuestions(hasHistory) {
  return hasHistory ? [...BASIC_QUESTIONS, ...HISTORY_QUESTIONS] : BASIC_QUESTIONS
}

// 다른 화면(소비 패턴 등)에서 질문을 들고 코치로 넘어갈 때 쓰는 주소. 코치 화면이 열리면 이 질문을 바로 보낸다.
export function coachLink(question) {
  const text = String(question ?? '').trim().slice(0, MAX_MESSAGE_LENGTH)
  return text ? COACH_PATH + '?q=' + encodeURIComponent(text) : COACH_PATH
}

const ERROR_MESSAGES = {
  AI_NOT_CONFIGURED: 'AI 코치가 아직 준비되지 않았어요. 서버에 Gemini 키 설정이 필요해요.',
  STEAM_NOT_LINKED: '스팀 계정을 연동하면 코치가 내 소비를 분석해 드려요.',
}

// 화면에 쌓인 대화를 백엔드 history 형식으로 바꾼다. 오류 말풍선은 빼고 최근 것만 보낸다.
export function toHistory(messages) {
  return messages
    .filter(message => !message.error && message.text)
    .map(message => ({ role: message.role === 'user' ? 'user' : 'model', text: message.text.slice(0, MAX_TURN_LENGTH) }))
    .slice(-MAX_HISTORY)
}

// 백엔드 에러 code에 맞는 안내 문구. 정해진 문구가 없으면 서버가 준 문구(fallback)를 쓴다.
export function coachErrorMessage(code, fallback) {
  return ERROR_MESSAGES[code] ?? fallback
}

// "30,000원", "3만" 같은 입력을 원 단위 정수로 바꾼다. 범위를 벗어나거나 숫자가 아니면 null
export function parseBudgetInput(text) {
  const trimmed = String(text ?? '').replace(/[,\s원]/g, '')
  const match = trimmed.match(/^(\d+)(만)?$/)
  if (!match) return null
  const amount = Number(match[1]) * (match[2] ? 10_000 : 1)
  return Number.isSafeInteger(amount) && amount <= MAX_BUDGET ? amount : null
}

// "근거 보기"를 그래프로 보여주기 위해 근거를 묶는다.
// 숫자(amount)와 단위(unit)가 있고 같은 group·unit인 근거가 2개 이상이면 막대 비교(chart),
// %는 하나뿐이어도 0~100% 막대(bar), 나머지는 글자 줄(row)로 둔다. 순서는 처음 나온 근거 기준.
export function buildEvidenceBlocks(items = []) {
  const blocks = []
  const charts = new Map()
  for (const item of items) {
    const hasNumber = typeof item.amount === 'number' && item.unit && item.group
    if (!hasNumber) {
      blocks.push({ type: 'row', item })
      continue
    }
    const key = item.group + '|' + item.unit
    if (!charts.has(key)) {
      const block = { type: 'chart', unit: item.unit, items: [] }
      charts.set(key, block)
      blocks.push(block)
    }
    charts.get(key).items.push(item)
  }
  return blocks.map(block => {
    if (block.type !== 'chart') return block
    if (block.items.length >= 2) return block
    return block.unit === '%' ? { type: 'bar', item: block.items[0] } : { type: 'row', item: block.items[0] }
  })
}

// 막대 길이(0~100). %는 100을 기준, 그 외 단위는 같은 묶음의 최댓값을 기준으로 한다. 아주 작은 값도 보이게 최소 길이를 둔다.
export function barPercent(amount, unit, items = []) {
  const max = unit === '%' ? 100 : Math.max(...items.map(item => item.amount), 0)
  if (!max || amount <= 0) return 0
  return Math.min(100, Math.max(3, Math.round((amount / max) * 100)))
}
