// [추가] 위시리스트 스팀 게임 분석에 쓰는 백엔드 호출 모음.
// 로그인 없이 호출된다 (백엔드 /api/wishsales/** 허용).

// 백엔드 주소. VITE_API_BASE_URL이 없으면 같은 서버로 보낸다.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

// [추가] 같은 게임의 판단을 배지와 요약 줄이 각각 요청하지 않도록 appid별로 한 번만 가져온다
const adviceCache = new Map()

// 지금 살지 기다릴지 판단 (appId: 스팀 appid). 같은 appid는 캐시된 결과를 쓴다
export function fetchBuyAdvice(appId) {
  if (!adviceCache.has(appId)) {
    adviceCache.set(appId, fetch(`${API_BASE}/api/wishsales/buy-advice?appId=${appId}`).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    }))
  }
  return adviceCache.get(appId)
}

// [추가] AI 요약 한 번 호출 (appIds: 스팀 appid 배열). 위시리스트를 열 때 한 번 호출한다.
export async function fetchAiSummary(appIds) {
  const res = await fetch(`${API_BASE}/api/wishsales/ai-summary?appIds=${appIds.join(',')}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
