export const netAmount = game => game.amount == null ? null : Math.max(0, game.amount - (game.refund || 0))
export const isPaid = game => netAmount(game) > 0
export function summarize(games) {
  const paid = games.filter(isPaid)
  const matched = paid.filter(game => Number.isFinite(game.hours) && game.hours >= 0)
  const total = paid.reduce((sum, game) => sum + netAmount(game), 0)
  const hours = matched.reduce((sum, game) => sum + game.hours, 0)
  const matchedAmount = matched.reduce((sum, game) => sum + netAmount(game), 0)
  const unplayed = paid.filter(game => game.hours === 0)
  return { total, average: paid.length ? total / paid.length : null, hourly: hours > 0 ? matchedAmount / hours : null, hours, paidCount: paid.length, unplayed, unplayedAmount: unplayed.reduce((sum, game) => sum + netAmount(game), 0), unknownCount: games.filter(game => game.amount == null).length }
}
export function filterPeriod(games, period, asOf) {
  const year = Number(asOf.slice(0, 4)), month = Number(asOf.slice(5, 7)) - 1
  const start = period === 'month' ? asOf.slice(0, 7) + '-01' : period === 'six' ? new Date(Date.UTC(year, month - 5, 1)).toISOString().slice(0, 10) : '0000-01-01'
  return games.filter(game => game.purchasedAt >= start && game.purchasedAt <= asOf)
}
export function monthlySpending(games, period, asOf) {
  const selected = filterPeriod(games, period, asOf)
  const year = Number(asOf.slice(0, 4)), month = Number(asOf.slice(5, 7)) - 1
  const first = period === 'month' ? asOf.slice(0, 7) : period === 'six' ? new Date(Date.UTC(year, month - 5, 1)).toISOString().slice(0, 7) : [...selected].sort((a, b) => a.purchasedAt.localeCompare(b.purchasedAt))[0]?.purchasedAt.slice(0, 7) || asOf.slice(0, 7)
  const cursor = new Date(first + '-01T00:00:00Z'), end = asOf.slice(0, 7), result = []
  while (cursor.toISOString().slice(0, 7) <= end) {
    const key = cursor.toISOString().slice(0, 7)
    result.push({ key, label: Number(key.slice(5)) + '월', total: selected.filter(g => g.purchasedAt.startsWith(key)).reduce((sum, g) => sum + (netAmount(g) || 0), 0) })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return result
}
export function genreSpending(games) {
  const groups = {}
  games.forEach(game => { if (isPaid(game)) groups[game.genre] = (groups[game.genre] || 0) + netAmount(game) })
  const total = Object.values(groups).reduce((a, b) => a + b, 0)
  return Object.entries(groups).sort((a, b) => b[1] - a[1]).map(([name, amount]) => ({ name, amount, percent: total ? amount / total * 100 : 0 }))
}
