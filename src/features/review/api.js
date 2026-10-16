// 프록시(vite)를 쓰므로 기본값은 빈 문자열이다.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export async function fetchReviewSummary(appId) {
  const res = await fetch(`${API_BASE}/api/games/${appId}/reviews/summary`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// language: all | korean | english (백엔드 @Pattern과 같아야 한다)
export async function fetchReviews(appId, { sort = 'RECENT', type = 'ALL', language = 'all', cursor = '*', size = 10 } = {}) {
  const params = new URLSearchParams({ sort, type, language, cursor, size: String(size) })
  const res = await fetch(`${API_BASE}/api/games/${appId}/reviews?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
