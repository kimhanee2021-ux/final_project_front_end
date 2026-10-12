import { netAmount, isPaid, MIN_HOURS_FOR_HOURLY } from '../dashboard/spendingMetrics.js'

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
    hours: game.hours,
    recentHours: game.recentHours ?? 0,
    lastPlayedAt: game.lastPlayedAt ? game.lastPlayedAt.slice(0, 10) : null,
    platform: 'Steam',
    art: 'steam',
    initials: initialsOf(game.name),
  }
}

export const hourlyCost = game =>
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
  return { best, worst }
}

// 최근 2주 동안 가장 많이 플레이한 게임
export function recentFocus(games) {
  return games.reduce(
    (top, game) => (game.recentHours > 0 && game.recentHours > (top?.recentHours ?? 0) ? game : top),
    null
  )
}

export function amountSourceCounts(games) {
  return games.reduce(
    (counts, game) => ({ ...counts, [game.amountSource]: (counts[game.amountSource] ?? 0) + 1 }),
    { CONFIRMED: 0, ESTIMATED: 0, FREE: 0, NO_RECORD: 0, UNKNOWN: 0 }
  )
}

// 기간 필터의 시작일 ('month' 이번 달 / 'six' 최근 6개월 / 'all' 전체)
export function periodStart(period, asOf) {
  if (period === 'all') return '0000-01-01'
  if (period === 'month') return asOf.slice(0, 7) + '-01'
  const year = Number(asOf.slice(0, 4)),
    month = Number(asOf.slice(5, 7)) - 1
  return new Date(Date.UTC(year, month - 5, 1)).toISOString().slice(0, 10)
}

export const filterTransactions = (transactions, period, asOf) =>
  transactions.filter(t => t.purchasedAt >= periodStart(period, asOf) && t.purchasedAt <= asOf)

// 구매내역 거래를 차트 막대로 묶는다. 2년(24개월)이 넘는 전체 기간은 연도별로 묶어 막대가 너무 많아지지 않게 한다.
// 환불은 음수라 그 달 합계에서 빠지고, 합계가 음수면 0으로 그린다.
export function spendingBuckets(transactions, period, asOf) {
  const selected = filterTransactions(transactions, period, asOf)
  const firstMonth =
    period === 'all'
      ? selected.reduce((min, t) => (t.purchasedAt < min ? t.purchasedAt : min), asOf).slice(0, 7)
      : periodStart(period, asOf).slice(0, 7)
  const endMonth = asOf.slice(0, 7)
  const monthsBetween =
    (Number(endMonth.slice(0, 4)) - Number(firstMonth.slice(0, 4))) * 12 +
    Number(endMonth.slice(5)) - Number(firstMonth.slice(5)) + 1
  const sumWhere = prefix =>
    Math.max(0, selected.filter(t => t.purchasedAt.startsWith(prefix)).reduce((sum, t) => sum + t.amountKrw, 0))

  if (monthsBetween > 24) {
    const buckets = []
    for (let year = Number(firstMonth.slice(0, 4)); year <= Number(endMonth.slice(0, 4)); year++) {
      const key = String(year)
      buckets.push({ key, label: key.slice(2) + '년', title: key + '년 구매 금액', total: sumWhere(key) })
    }
    return { unit: 'year', buckets }
  }
  const buckets = []
  const cursor = new Date(firstMonth + '-01T00:00:00Z')
  while (cursor.toISOString().slice(0, 7) <= endMonth) {
    const key = cursor.toISOString().slice(0, 7)
    buckets.push({ key, label: Number(key.slice(5)) + '월', title: key.replace('-', '년 ') + '월 구매 금액', total: sumWhere(key) })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return { unit: 'month', buckets }
}
