export const money = value => value == null ? '금액 미확인' : '₩' + Math.round(value).toLocaleString('ko-KR')
export const number = value => value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })
export const dateLabel = value => value.replaceAll('-', '.')
