// 도넛 차트의 조각 계산 (React·화면 없이 테스트한다).
// items: [{ label, value }] → 각 조각의 비율(percent)과, 둘레를 100으로 본 시작 위치(start)·길이(length)를 구한다.
// 값이 0 이하인 항목은 조각에서 뺀다. 전체가 0이면 빈 배열.
export function donutSlices(items) {
  const visible = items.filter(item => item.value > 0)
  const total = visible.reduce((sum, item) => sum + item.value, 0)
  if (!total) return []
  let start = 0
  return visible.map(item => {
    const length = (item.value / total) * 100
    const slice = { label: item.label, value: item.value, percent: Math.round(length), start, length }
    start += length
    return slice
  })
}
