// The URL stores the Steam country and the Tuesday that starts the chart period.
export const DEFAULT_COUNTRY = 'KR'
export const DEFAULT_WEEK = '2026-10-06'
const DAY = 24 * 60 * 60 * 1000

export function isValidWeek(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && date.getUTCDay() === 2
}

export function shiftWeek(week, amount) {
  if (!isValidWeek(week) || !Number.isInteger(amount)) return null
  return new Date(new Date(`${week}T00:00:00Z`).getTime() + amount * 7 * DAY).toISOString().slice(0, 10)
}

export function readRankingSelection(searchParams, countries) {
  const requestedCountry = searchParams.get('country')
  const requestedWeek = searchParams.get('week')
  const country = requestedCountry?.toUpperCase() || DEFAULT_COUNTRY
  const invalidCountry = Boolean(requestedCountry) && !countries.some(item => item.code === country)
  const invalidWeek = Boolean(requestedWeek) && !isValidWeek(requestedWeek)
  return {
    country: invalidCountry ? DEFAULT_COUNTRY : country,
    week: !requestedWeek || invalidWeek ? DEFAULT_WEEK : requestedWeek,
    invalidCountry,
    invalidWeek,
  }
}

export function getSteamChartUrl(country, week) {
  if (!/^[A-Z]{2}$/.test(country) || !isValidWeek(week)) return null
  const [year, month, day] = week.split('-').map(Number)
  return `https://store.steampowered.com/charts/topsellers/${country}/${year}-${month}-${day}`
}

export function getWeekOptions(selectedWeek, availableWeeks = [], now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const daysSinceTuesday = (today.getUTCDay() + 5) % 7
  const latestTuesday = new Date(today.getTime() - daysSinceTuesday * DAY).toISOString().slice(0, 10)
  const options = new Set([DEFAULT_WEEK, selectedWeek, ...availableWeeks])
  for (let index = 0; index < 12; index += 1) options.add(shiftWeek(latestTuesday, -index))
  // Include neighbours for historical deep links as well as the recent weeks.
  options.add(shiftWeek(selectedWeek, -1))
  options.add(shiftWeek(selectedWeek, 1))
  return [...options].filter(isValidWeek).sort((left, right) => right.localeCompare(left))
}

export function formatWeekPeriod(week) {
  if (!isValidWeek(week)) return ''
  return `${week.replaceAll('-', '.')} – ${shiftWeek(week, 1).replaceAll('-', '.')}`
}

export function describeRankChange(value, language = 'ko') {
  const korean = language === 'ko'
  if (value === 'NEW') return { text: 'NEW', label: korean ? '첫 진입' : 'New entry', tone: 'new' }
  if (value === 'RETURNING') return { text: korean ? '재진입' : 'RETURNING', label: korean ? '차트 재진입' : 'Chart re-entry', tone: 'returning' }
  if (typeof value !== 'number' || !Number.isInteger(value)) return { text: korean ? '미확인' : 'Unknown', label: korean ? '변동 정보 없음' : 'Change unavailable', tone: 'unknown' }
  if (value === 0) return { text: '—', label: korean ? '전주와 동일' : 'No change', tone: 'same' }
  return {
    text: `${value > 0 ? '↑' : '↓'} ${Math.abs(value)}`,
    label: korean ? `전주 대비 ${Math.abs(value)}계단 ${value > 0 ? '상승' : '하락'}` : `${value > 0 ? 'Up' : 'Down'} ${Math.abs(value)} places`,
    tone: value > 0 ? 'up' : 'down',
  }
}

export function getTopGames(entries, limit = 5) {
  // Keep Steam's ranks when a non-game item creates a gap in the source chart.
  return [...entries].sort((left, right) => left.sourceRank - right.sourceRank).slice(0, limit)
}
