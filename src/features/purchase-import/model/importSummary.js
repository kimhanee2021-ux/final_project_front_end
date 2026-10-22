import { dateLabel, number } from '../../../shared/utils/formatters.js'

// 미리보기·결과 화면에 쓰는 문구 계산 (화면과 무관한 순수 함수)

export const TYPE_LABELS = { PURCHASE: '구매', REFUND: '환불', IN_GAME: '게임 내 구매', GIFT: '선물 구매' }
export const EXCLUDED_LABELS = { WALLET_CREDIT: '지갑 충전', CONVERSION: '통화 변환', MARKET: '장터 거래', UNKNOWN: '기타' }

// 목록을 key 값별로 센다: [{ type: 'A' }, { type: 'A' }] → { A: 2 }
export const countBy = (list, key) => list.reduce((counts, item) => ({ ...counts, [item[key]]: (counts[item[key]] ?? 0) + 1 }), {})

// { A: 2, B: 1 } → '라벨A 2건 · 라벨B 1건'
export const describe = (counts, labels) =>
  Object.entries(counts)
    .map(([key, count]) => `${labels[key] ?? key} ${number(count)}건`)
    .join(' · ')

// 날짜 목록의 처음 ~ 끝
export const range = dates => {
  const sorted = [...dates].sort()
  return `${dateLabel(sorted[0])} ~ ${dateLabel(sorted[sorted.length - 1])}`
}

// 원래 통화 그대로의 결제 금액 (금액이 없으면 전액 환불)
export function paidText(amount, currency) {
  if (amount == null) return '전액 환불'
  return `${currency ?? ''} ${amount.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}`.trim()
}
