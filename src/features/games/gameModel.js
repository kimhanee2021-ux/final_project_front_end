// 탐색 탭 장르 필터. 백엔드는 genre 컬럼("Action,Indie")에 부분 일치(LIKE)로 거른다.
export const GAME_GENRES = [
  'All',
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Simulation',
  'Casual',
  'Indie',
  'Sports',
  'Racing',
]

// 백엔드 GameSummary를 화면에서 쓰는 형태로 바꾼다.
export function toGame(summary) {
  return {
    id: summary.appId,
    name: summary.name,
    image: summary.thumbnailUrl,
    genres: summary.genre ? summary.genre.split(',').map(genre => genre.trim()).filter(Boolean) : [],
    price: summary.priceInfo,
    discountPercent: summary.discountPercent ?? 0,
    reviewCount: summary.reviewCount ?? 0,
    positiveRate: summary.positiveRate == null ? null : Number(summary.positiveRate),
    storeUrl: `https://store.steampowered.com/app/${summary.appId}`,
  }
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
export const formatReviewCount = count => compact.format(count)

// priceInfo는 스팀 기준 달러 금액 문자열("14.97", 무료는 "0.0")로 들어온다.
export function formatPrice(price) {
  const amount = Number.parseFloat(price)
  if (Number.isNaN(amount)) return price || ''
  return amount === 0 ? '무료' : `$${amount.toFixed(2)}`
}
