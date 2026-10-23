// 위시리스트 스팀 게임 분석에 쓰는 백엔드 호출 모음. 로그인 없이 호출된다 (백엔드 /api/games/** 허용).
// AI 요약은 응답이 오래 걸릴 수 있어서, 시간 제한(15초)이 있는 apiClient 대신 fetch로 기다린다.
import { API_BASE_URL } from '@/shared/lib/apiClient'

async function getJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// 같은 appid는 한 번만 요청하고 결과(Promise)를 다시 쓴다 (배지와 요약 줄, 태그를 다시 눌렀을 때 등)
function cachedByAppId(load) {
  const cache = new Map()
  return appId => {
    if (!cache.has(appId)) cache.set(appId, load(appId))
    return cache.get(appId)
  }
}

// 지금 살지 기다릴지 판단 (appId: 스팀 appid)
export const fetchBuyAdvice = cachedByAppId(appId => getJson(`/api/games/buy-advice?appId=${appId}`))

// AI 요약 한 번 호출 (appIds: 스팀 appid 배열)
export function fetchAiSummary(appIds) {
  return getJson(`/api/games/ai-summary?appIds=${appIds.join(',')}`)
}

// 할인 달 전망 (appId: 스팀 appid). 작년 · 올해 30% 이상 할인한 달과 남은 달의 할인 확률(%).
// 응답: { status, reason, threshold, lastYearSaleMonths, thisYearSaleMonths, upcoming: [{ month, percent }] }
export const fetchDiscountOutlook = cachedByAppId(appId => getJson(`/api/games/discount-outlook?appId=${appId}`))
