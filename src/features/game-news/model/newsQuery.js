export const NEWS_CATEGORIES = [
  { value: '', label: '전체 소식' },
  { value: 'NOTICE', label: '공지·운영 안내' },
  { value: 'PATCH', label: '업데이트·패치' },
  { value: 'EVENT', label: '이벤트·행사' },
  { value: 'MAINTENANCE', label: '점검·장애' },
  { value: 'DEV_NEWS', label: '개발 소식' },
  { value: 'OTHER', label: '기타' },
]

// 바로 보기 링크의 게임 식별자. 목록·요약·본문은 모두 서버에서 읽는다.
export const QUICK_GAMES = [
  { appId: '570', name: 'Dota 2' },
  { appId: '730', name: 'Counter-Strike 2' },
  { appId: '440', name: 'Team Fortress 2' },
]
export const PAGE_SIZES = [5, 10, 20, 50]
export const categoryLabel = value => NEWS_CATEGORIES.find(item => item.value === value)?.label || '기타'

export function validId(value, max = 4294967295n) {
  return /^\d{1,19}$/.test(String(value)) && BigInt(value) > 0n && BigInt(value) <= max
}

export function parseNewsQuery(search) {
  const params = new URLSearchParams(search)
  const rawAppId = params.get('appId') || ''
  const appId = validId(rawAppId) ? String(Number(rawAppId)) : ''
  const rawCategory = (params.get('category') || '').trim().toUpperCase()
  const category = NEWS_CATEGORIES.some(item => item.value === rawCategory) ? rawCategory : ''
  const rawSize = Number(params.get('size'))
  const size = PAGE_SIZES.includes(rawSize) ? rawSize : 5
  const rawPage = params.get('page') || '0'
  const page = /^\d+$/.test(rawPage) && Number.isSafeInteger(Number(rawPage)) && Number(rawPage) * size <= 2147483647 ? Number(rawPage) : 0
  return { appId, category, page, size }
}

export function newsSearch(query) {
  const params = new URLSearchParams()
  if (query.appId) params.set('appId', query.appId)
  if (query.category) params.set('category', query.category)
  params.set('page', String(query.page))
  params.set('size', String(query.size))
  return params.toString()
}

export function newsListApi(query) {
  const params = new URLSearchParams(newsSearch(query))
  params.delete('appId')
  return query.appId ? `/api/games/${query.appId}/news?${params}` : `/api/games/news?${params}`
}

export function newsDetailApi(appId, newsId) {
  return validId(appId) && validId(newsId, 9223372036854775807n) ? `/api/games/${appId}/news/${newsId}` : null
}

export function pageNumbers(page, totalPages) {
  const start = Math.max(0, Math.min(page - 2, totalPages - 5))
  return Array.from({ length: Math.max(0, Math.min(totalPages, 5)) }, (_, index) => start + index)
}

export function formatNewsDate(value, withTime = false) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '날짜 미제공'
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}) }).format(new Date(value))
}

export function safeSourceUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch { return null }
}

export function freshnessMessage(item) {
  if (!item?.stale) return ''
  return item.generationStatus === 'FAILED'
    ? '최신 소식 반영이 지연되어 이전 브리핑을 보여드리고 있어요. 최신 내용은 공식 원문에서 확인해 주세요.'
    : '공식 원문이 변경되어 브리핑을 갱신할 예정이에요. 현재는 이전 브리핑을 보여드려요.'
}
