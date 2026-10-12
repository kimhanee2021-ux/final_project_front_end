import apiClient from '../../utils/apiClient'

// 백엔드 AnalysisController(/api/analysis) 연동.
// 응답: { asOf, priceBasis: 'KRW_LIST_PRICE', games: SpendingGame[] }
// SpendingGame: { appId, name, genre, genres, thumbnailUrl, amount(원|null), amountSource(ESTIMATED|FREE|UNKNOWN),
//                 currentPrice, discountPercent, hours, recentHours, lastPlayedAt }
// amount는 실제 결제액이 아니라 현재 한국 정가 기준 추정치다.
export async function fetchMySpending() {
  const { data } = await apiClient.get('/api/analysis/spending')
  return data
}

export const STEAM_NOT_LINKED_CODE = 'STEAM_NOT_LINKED'
