import apiClient from '../../utils/apiClient'

// 백엔드 CoachController(/api/ai/coach) 연동.
// 응답: { answer: string, games: [{ appId, name, thumbnailUrl, reason }] } (games는 내 보유 게임 중 최대 3개)
export async function askCoach(message, history) {
  // 서버가 소비 분석을 다시 계산하고 Gemini 답을 기다리므로 기본(15초)보다 길게 기다린다
  const { data } = await apiClient.post('/api/ai/coach/chat', { message, history }, { timeout: 60000 })
  return data
}

// 백엔드 BudgetController(/api/budgets) 연동. 응답: { month: '2026-10', limitAmount: number | null }
export async function fetchBudget() {
  const { data } = await apiClient.get('/api/budgets/current')
  return data
}

export async function saveBudget(limitAmount) {
  const { data } = await apiClient.put('/api/budgets/current', { limitAmount })
  return data
}
