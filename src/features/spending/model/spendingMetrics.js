import { money, number } from '../../../shared/utils/formatters.js'

// 시간당 비용은 최소 1시간으로 나눈다. 1시간이 안 된 게임(미플레이 포함)은 구매 금액이 그대로 시간당 비용이다.
// 몇 분만 켜 본 게임을 그대로 나누면 6분 플레이에 5,930원이 시간당 59,300원처럼 튀어 오해를 만든다.
// 가성비 랭킹은 1시간 이상 플레이한 게임끼리만 비교한다.
export const MIN_HOURS_FOR_HOURLY = 1

export const netAmount = game =>
  game.amount == null ? null : Math.max(0, game.amount - (game.refund || 0))
export const isPaid = game => netAmount(game) > 0
export function summarize(games) {
  const paid = games.filter(isPaid)
  const matched = paid.filter(game => Number.isFinite(game.hours) && game.hours >= 0)
  const total = paid.reduce((sum, game) => sum + netAmount(game), 0)
  const hours = matched.reduce((sum, game) => sum + game.hours, 0)
  const matchedAmount = matched.reduce((sum, game) => sum + netAmount(game), 0)
  const unplayed = paid.filter(game => game.hours === 0)
  return {
    total,
    average: paid.length ? total / paid.length : null,
    hourly: hours > 0 ? matchedAmount / hours : null,
    hours,
    paidCount: paid.length,
    unplayed,
    unplayedAmount: unplayed.reduce((sum, game) => sum + netAmount(game), 0),
    unknownCount: games.filter(game => game.amount == null).length,
  }
}

export function genreSpending(games) {
  const groups = {}
  games.forEach(game => {
    if (isPaid(game)) groups[game.genre] = (groups[game.genre] || 0) + netAmount(game)
  })
  const total = Object.values(groups).reduce((a, b) => a + b, 0)
  return Object.entries(groups)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({ name, amount, percent: total ? (amount / total) * 100 : 0 }))
}

// 플레이 시간 마커: 0시간 이하는 '미플레이', 2시간 이하는 '플레이타임 매우 적음'. 시간을 모르거나 충분히 했으면 null
const LOW_PLAYTIME_HOURS = 2
export function playtimeMarker(hours) {
  if (hours == null) return null
  if (hours <= 0) return 'unplayed'
  if (hours <= LOW_PLAYTIME_HOURS) return 'low'
  return null
}

// 시간당 비용 구간: AI 분석 '게임 가성비'와 같은 기준(1,000 / 3,000 / 10,000원). 계산할 수 없으면(무료·금액/시간 모름) null
export function hourlyTone(game) {
  if (game.amount == null || game.amountSource === 'FREE' || game.hours == null) return null
  const hourly = netAmount(game) / Math.max(game.hours, MIN_HOURS_FOR_HOURLY)
  if (hourly < 1000) return 'great'
  if (hourly < 3000) return 'good'
  if (hourly < 10000) return 'fair'
  return 'poor'
}

// 표·상세 창에 쓰는 시간당 비용 문구
export function hourlyText(game) {
  if (game.amount == null) return '-'
  if (game.amountSource === 'FREE') return '무료'
  if (game.hours == null) return '계산 전'
  return money(netAmount(game) / Math.max(game.hours, MIN_HOURS_FOR_HOURLY))
}

// 플레이 시간 문구. 1시간이 안 되면 분으로 보여준다 (0.1시간처럼 소수로 보이면 몇 분인지 알기 어렵다)
export function hoursText(hours) {
  if (hours == null) return '시간 미확인'
  if (hours > 0 && hours < 1) return Math.max(1, Math.round(hours * 60)) + '분'
  return number(hours) + '시간'
}
