const decimal = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 })

export function formatMillions(value) {
  return value === null ? '자료 없음' : decimal.format(value / 1_000_000)
}
