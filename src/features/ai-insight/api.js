import apiClient from '@/shared/lib/apiClient'

// 백엔드 CoachController(/api/ai/coach/insight) 연동.

// AI 분석 화면 개요. AI를 부르지 않아 바로 돌아온다.
// 응답: { hasPurchaseHistory: boolean, profile: { name, meaning }, topics: [{ key, label }] }
// profile은 AI가 아니라 서버가 규칙으로 정한 소비 유형 (수집가형·몰입형·세일 사냥꾼형·균형형)
// topics는 지금 고를 수 있는 분석 태그다. 구매내역이 있어야 하는 주제는 구매내역이 없으면 빠져 있다.
export async function fetchInsightOverview() {
  const { data } = await apiClient.get('/api/ai/coach/insight/overview', { timeout: 30000 })
  return data
}

// 주제 하나의 AI 결과 카드. topic: overview의 topics[].key
// 응답: { topic, verdict, reason, comparison, action, games: [{ appId, name, thumbnailUrl, reason }], evidence: [{ label, value }] }
// 문장 속 숫자는 서버가 소비 분석 데이터에서 채운 값이고, comparison은 비교할 값이 없으면 빈 문자열이다.
export async function fetchInsight(topic) {
  // 서버가 소비 분석을 계산하고 Gemini 답을 기다리므로 기본(15초)보다 길게 기다린다
  const { data } = await apiClient.get('/api/ai/coach/insight', { params: { topic }, timeout: 60000 })
  return data
}
