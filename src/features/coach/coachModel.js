// AI 게임 소비 코치 화면의 순수 로직 (네트워크·React 없이 테스트한다)

export const MAX_MESSAGE_LENGTH = 500
// 백엔드는 최근 10개까지 받고 그중 6개만 AI에 보낸다
const MAX_HISTORY = 10
const MAX_TURN_LENGTH = 2000
export const MAX_BUDGET = 10_000_000

export const SUGGESTED_QUESTIONS = [
  '이번 달 얼마 썼어?',
  '가성비 제일 좋은 게임은 뭐야?',
  '사 놓고 안 한 게임 중에 뭐부터 할까?',
  '나 세일 때 너무 많이 사는 편이야?',
  '지금 환불할 수 있는 게임 있어?',
  '작년이랑 올해 지출 비교해 줘',
]

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
