export const NEWS_CATEGORIES = [
  { id: 'ALL', label: '전체' },
  { id: 'NOTICE', label: '공식 소식' },
  { id: 'PATCH', label: '패치' },
  { id: 'EVENT', label: '이벤트' },
  { id: 'DEV_NEWS', label: '개발 소식' },
]
export const PAGE_SIZE = 6
export const categoryLabel = value => NEWS_CATEGORIES.find(item => item.id === value)?.label ?? '공식 소식'
export function newsView(items, category, page, newsId) {
  const activeCategory = NEWS_CATEGORIES.some(item => item.id === category) ? category : 'ALL'
  const filtered = activeCategory === 'ALL' ? items : items.filter(item => item.category === activeCategory)
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageNumber = /^\d{1,3}$/.test(page ?? '') ? Number(page) : 1
  const currentPage = Math.min(pageCount, Math.max(1, pageNumber))
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const selected = newsId ? filtered.find(item => item.id === newsId) : visible[0]
  return { activeCategory, filtered, pageCount, currentPage, visible, selected }
}

export function formatNewsDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
}

// Defense in depth: source URLs come from the validated official Steam feed.
export function safeSourceUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && ['steamcommunity.com', 'store.steampowered.com', 'steamstore-a.akamaihd.net'].includes(url.hostname) ? url.href : null
  } catch { return null }
}
