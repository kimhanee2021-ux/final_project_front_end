import apiClient from '../../utils/apiClient'

// 백엔드 PurchaseController(/api/purchases) 연동.
// 보내는 것은 브라우저에서 파싱한 거래 목록뿐이다 (HTML 원본·결제 수단·잔액은 보내지 않음).
// 응답: { imported, duplicates, unmatchedItems: string[], unsupportedCurrencies: string[] }
export async function importPurchases(transactions) {
  // 환율 조회와 DLC 확인(스팀)이 요청 안에서 일어나서 처음 가져올 때는 오래 걸릴 수 있다
  const { data } = await apiClient.post('/api/purchases/import', { transactions }, { timeout: 120000 })
  return data
}

// 가져온 구매내역을 모두 지운다 (다시 가져오기 전 초기화). 응답: { deleted }
export async function deletePurchases() {
  const { data } = await apiClient.delete('/api/purchases')
  return data
}
