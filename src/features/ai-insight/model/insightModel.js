// AI 분석 화면의 순수 로직 (네트워크·React 없이 테스트한다)

// 구매내역이 없어 일부 분석 태그가 빠졌을 때 보여주는 안내
export const PURCHASE_HISTORY_HINT = '구매내역을 가져오면 더 많은 분석이 가능해요.'

const ERROR_MESSAGES = {
  AI_NOT_CONFIGURED: 'AI 분석이 아직 준비되지 않았어요. 서버에 Gemini 키 설정이 필요해요.',
  AI_RATE_LIMITED: '요청이 몰려 있어요. 잠시 뒤에 다시 시도해 주세요.',
  AI_BUSY: '지금 AI 이용자가 많아요. 잠시 뒤에 다시 시도해 주세요.',
  AI_TIMEOUT: 'AI 응답이 늦어지고 있어요. 다시 시도해 주세요.',
  AI_INVALID_RESPONSE: 'AI 분석을 확인하지 못했어요. 다시 시도해 주세요.',
}

// 백엔드 에러 code에 맞는 안내 문구. 정해진 문구가 없으면 서버가 준 문구(fallback)를 쓴다.
export function insightErrorMessage(code, fallback) {
  return ERROR_MESSAGES[code] ?? fallback
}

// 처음에 보여줄 태그: 서버가 알려 준 순서의 첫 번째. 태그가 하나도 없으면 null
export function defaultTopic(topics) {
  return topics?.[0]?.key ?? null
}

// 결과 카드에 보여줄 줄. 비교할 값이 없어 comparison이 비어 있으면 그 줄은 뺀다.
export function insightRows(insight) {
  return [
    { id: 'reason', label: '이유', text: insight.reason },
    { id: 'comparison', label: '비교', text: insight.comparison },
    { id: 'action', label: '다음 행동', text: insight.action },
  ].filter(row => row.text)
}
