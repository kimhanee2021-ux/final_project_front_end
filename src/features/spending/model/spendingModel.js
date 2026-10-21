import { netAmount, isPaid, MIN_HOURS_FOR_HOURLY } from './spendingMetrics.js'

// 스팀 장르(영문) -> 화면 표시용 한글
const GENRE_LABELS = {
  Action: '액션',
  Adventure: '어드벤처',
  RPG: 'RPG',
  Strategy: '전략',
  Simulation: '시뮬레이션',
  Sports: '스포츠',
  Racing: '레이싱',
  Casual: '캐주얼',
  'Massively Multiplayer': 'MMO',
  Indie: '인디',
  'Free To Play': '무료',
  'Early Access': '앞서 해보기',
}

export const genreLabel = genre => (genre ? GENRE_LABELS[genre] ?? genre : '기타')

const initialsOf = name =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('')

// 백엔드 응답 한 건을 기존 대시보드 컴포넌트가 쓰는 게임 형태로 바꾼다.
// 스팀은 구매일/환불을 주지 않으므로 purchasedAt은 null, refund는 0이다.
export function toSpendingGame(game) {
  return {
    id: game.appId,
    appId: game.appId,
    name: game.name,
    genre: genreLabel(game.genre),
    genres: (game.genres ?? []).map(genreLabel),
    thumbnailUrl: game.thumbnailUrl,
    amount: game.amount,
    amountSource: game.amountSource,
    currentPrice: game.currentPrice,
    discountPercent: game.discountPercent,
    // 구매내역을 가져왔으면 실제 환불 금액과 첫 구매일, 아니면 0/null
    refund: game.refund ?? 0,
    purchasedAt: game.purchasedAt ?? null,
    listPrice: game.listPrice ?? null,
    dlcCount: game.dlcCount ?? 0,
    savedKrw: game.savedKrw ?? 0,
    // 여러 게임이 든 번들로 산 게임: amount는 번들 결제액을 정가 비율로 나눈 배분값
    bundleAllocated: Boolean(game.bundleAllocated),
    // 라이선스 페이지를 가져왔으면 계정에 처음 추가한 날과 방법 (선물·무료·제품 키 등)
    acquiredAt: game.acquiredAt ?? null,
    acquisitionMethod: game.acquisitionMethod ?? null,
    hours: game.hours,
    recentHours: game.recentHours ?? 0,
    lastPlayedAt: game.lastPlayedAt ? game.lastPlayedAt.slice(0, 10) : null,
    platform: 'Steam',
    art: 'steam',
    initials: initialsOf(game.name),
  }
}

const hourlyCost = game =>
  isPaid(game) && game.hours > 0 ? netAmount(game) / game.hours : null

// 시간당 비용 순위. 금액을 알고 1시간 이상 플레이한 유료 게임만 대상으로 한다
// (몇 분 켜본 게임이 "최악의 가성비"로 잡히지 않게).
export function valueRanking(games, size = 3) {
  const ranked = games
    .filter(game => isPaid(game) && game.hours >= MIN_HOURS_FOR_HOURLY)
    .map(game => ({ game, hourly: hourlyCost(game) }))
    .sort((a, b) => a.hourly - b.hourly)
  const best = ranked.slice(0, size)
  const worst = ranked
    .slice(best.length)
    .reverse()
    .slice(0, size)
  // all: 구간 분포처럼 전체 목록이 필요한 쪽을 위해 정렬된 전체도 내보낸다
  return { best, worst, all: ranked }
}





