import apiClient from '../../utils/apiClient'

// 백엔드 AnalysisController(/api/analysis) 연동.
// 응답: { asOf, priceBasis: 'KRW_LIST_PRICE', games: SpendingGame[] }
// SpendingGame: { appId, name, genre, genres, thumbnailUrl, amount(원|null), amountSource(ESTIMATED|FREE|UNKNOWN),
//                 currentPrice, discountPercent, hours, recentHours, lastPlayedAt }
// amount는 실제 결제액이 아니라 현재 한국 정가 기준 추정치다.
export async function fetchMySpending() {
  // 가격이 없는 보유 게임은 백엔드가 이 요청 안에서 스팀에 물어 채우므로, 처음 한 번은 기본(15초)보다 오래 걸릴 수 있다.
  const { data } = await apiClient.get('/api/analysis/spending', { timeout: 30000 })
  return data
}

export const STEAM_NOT_LINKED_CODE = 'STEAM_NOT_LINKED'
