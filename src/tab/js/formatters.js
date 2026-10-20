const number = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 })
const decimal = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 })

export function formatNumber(value) {
  return number.format(value)
}
export function formatPeople(value) {
  return value === null ? '자료 없음' : `${number.format(value)}명`
}
export function formatCompact(value) {
  if (value === null) return '자료 없음'
  if (value >= 100_000_000) return `${decimal.format(value / 100_000_000)}억`
  return `${decimal.format(value / 10_000)}만`
}
export function formatCells(value) {
  return decimal.format(value)
}
export function formatMillions(value) {
  return value === null ? '자료 없음' : decimal.format(value / 1_000_000)
}
