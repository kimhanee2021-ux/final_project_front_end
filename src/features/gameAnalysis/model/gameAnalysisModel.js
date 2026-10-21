import { genreSpending, hourlyText, isPaid, netAmount, summarize, valueRanking } from '@/features/spending'
import { money, number } from '@/shared/utils/formatters'
import { hl, plain } from '@/shared/utils/headline'
import { groupMinorGenres } from './groupMinorGenres'

const DAY = 24 * 60 * 60 * 1000
const MAX_ACTIVITY = 8

export { groupMinorGenres }

// 장르별 보유 게임: 금액순 장르 목록과 상단 요약 문구에 쓸 값.
// 게임 수 비율(42%)과 금액(₩186,000)을 같이 말해야 해서 상위 장르의 게임 수도 센다.
export function genreOverview(games) {
  const genres = genreSpending(games)
  const top = genres[0]
  if (!top) return { genres, chartGenres: [], top: null }
  const paid = games.filter(isPaid)
  const topCount = paid.filter(game => game.genre === top.name).length
  return {
    genres,
    chartGenres: groupMinorGenres(genres),
    top: { ...top, countPercent: Math.round((topCount / paid.length) * 100) },
  }
}

export function genreHeadline({ top }) {
  if (!top) return ['아직 금액이 확인된 보유 게임이 없어요.']
  return [`보유 게임의 ${top.countPercent}%가 ${top.name}이고, 금액으로는 `, hl(money(top.amount)), '이에요.']
}

// 가성비 랭킹: 시간당 비용이 낮은 순 상위 N개 (1시간 이상 플레이한 유료 게임만)
export const bestValueList = (games, size = 5) => valueRanking(games, size).best

export function valueHeadline(list) {
  if (!list.length) return ['가성비를 비교할 만큼 플레이한 유료 게임이 아직 없어요.']
  return ['플레이 시간 대비 가격이 가장 낮은 건 ', hl(list[0].game.name), '예요.']
}

// 오늘 기준 며칠 전인지 문구로 바꾼다
function relativeDay(date, asOf) {
  const diff = Math.round((new Date(asOf) - new Date(date)) / DAY)
  if (diff <= 0) return '오늘'
  if (diff === 1) return '어제'
  return `${diff}일 전`
}

// 최근 활동 타임라인: 마지막 플레이와 구매를 날짜 내림차순으로 섞는다.
export function recentActivities(games, asOf) {
  const plays = games
    .filter(game => game.lastPlayedAt)
    .map(game => ({
      id: `play-${game.id}`,
      type: 'play',
      date: game.lastPlayedAt,
      parts: game.recentHours > 0
        ? [hl(game.name), '을(를) ', hl(`${number(game.recentHours)}시간`), ' 플레이했어요']
        : [hl(game.name), '을(를) 플레이했어요'],
    }))
  const buys = games
    .filter(game => game.purchasedAt && isPaid(game))
    .map(game => ({
      id: `buy-${game.id}`,
      type: 'buy',
      date: game.purchasedAt,
      parts: [hl(game.name), '을(를) ', hl(money(netAmount(game))), '에 구매했어요'],
    }))
  return [...plays, ...buys]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_ACTIVITY)
    .map(item => ({ ...item, text: plain(item.parts), when: relativeDay(item.date, asOf) }))
}

export function activityHeadline(activities) {
  if (!activities.length) return ['아직 최근 활동 기록이 없어요.']
  return [`${activities[0].when} `, ...activities[0].parts, '.']
}

// 플레이 시간 & 가성비 목록: 플레이 시간이 긴 순
export const playtimeList = games =>
  [...games].sort((a, b) => (b.hours ?? 0) - (a.hours ?? 0)).map(game => ({ game, hourly: hourlyText(game) }))

// 장르 분석: 금액이 아니라 '몇 개 가졌고 얼마나 했는지' 기준. 무료 게임도 포함한다.
export function genreCounts(games) {
  const groups = {}
  games.forEach(game => {
    const group = (groups[game.genre] ??= { name: game.genre, count: 0, hours: 0 })
    group.count += 1
    group.hours += game.hours || 0
  })
  const list = Object.values(groups).sort((a, b) => b.count - a.count)
  return list.map(item => ({ ...item, percent: (item.count / games.length) * 100 }))
}

export function genreCountHeadline(list) {
  if (!list.length) return ['아직 보유 게임이 없어요.']
  const mostPlayed = [...list].sort((a, b) => b.hours - a.hours)[0]
  return [
    `가장 많이 가진 장르는 ${list[0].name}(${list[0].count}개)이고, 가장 오래 플레이한 장르는 `,
    hl(`${mostPlayed.name}(${number(mostPlayed.hours)}시간)`),
    '이에요.',
  ]
}

// 게임 가성비: 시간당 비용 구간별 게임 수와 그 구간에 속한 게임 목록 (1시간 이상 플레이한 유료 게임만)
const VALUE_BANDS = [
  { id: 'great', label: '시간당 1,000원 미만', max: 1000 },
  { id: 'good', label: '1,000 ~ 3,000원', max: 3000 },
  { id: 'fair', label: '3,000 ~ 10,000원', max: 10000 },
  { id: 'poor', label: '10,000원 이상', max: Infinity },
]

export function valueBands(games) {
  const hourlyList = valueRanking(games, Infinity).all
  let min = 0
  return VALUE_BANDS.map(band => {
    const items = hourlyList.filter(item => item.hourly >= min && item.hourly < band.max)
    min = band.max
    return { ...band, count: items.length, items }
  })
}

export function valueBandHeadline(bands) {
  const total = bands.reduce((sum, band) => sum + band.count, 0)
  if (!total) return ['가성비를 비교할 만큼 플레이한 유료 게임이 아직 없어요.']
  const good = bands[0].count + bands[1].count
  return [`플레이한 유료 게임 ${total}개 중 `, hl(`${good}개`), '가 시간당 3,000원 이하예요.']
}

// 종합 분석: 5개 지표 (총 소비 금액, 시간당 가성비, 총 플레이타임, 평균 정가, 미플레이 게임)
const PRICE_BANDS = [
  { label: '1만원 미만', max: 10000 },
  { label: '1 ~ 3만원', max: 30000 },
  { label: '3 ~ 5만원', max: 50000 },
  { label: '5만원 이상', max: Infinity },
]

export function overallStats(games) {
  const summary = summarize(games)
  const paid = games.filter(isPaid)
  const topSpent = [...paid].sort((a, b) => netAmount(b) - netAmount(a)).slice(0, 5)
  const topHours = [...games].sort((a, b) => (b.hours || 0) - (a.hours || 0)).slice(0, 5)
  let min = 0
  const priceBands = PRICE_BANDS.map(band => {
    const count = paid.filter(game => netAmount(game) >= min && netAmount(game) < band.max).length
    min = band.max
    return { label: band.label, count }
  })
  return {
    summary,
    topSpent,
    topHours,
    priceBands,
    unplayed: [...summary.unplayed].sort((a, b) => netAmount(b) - netAmount(a)),
    ranking: valueRanking(games, 3),
  }
}
