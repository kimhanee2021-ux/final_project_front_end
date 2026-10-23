import { noRecordLabel } from '@/features/purchase-import'
import { money } from '@/shared/utils/formatters'
import { netAmount } from './spendingMetrics'

const NO_AMOUNT_LABELS = { NO_RECORD: '구매 기록 없음', UNKNOWN: '가격 정보 없음' }

// 게임 하나의 구매 금액 문구: 무료 / 금액을 모를 때의 이유 / 환불을 뺀 금액
export function amountText(game) {
  if (game.amountSource === 'FREE') return '무료'
  if (game.amount != null) return money(netAmount(game))
  if (game.amountSource === 'NO_RECORD') return noRecordLabel(game.acquisitionMethod)
  return NO_AMOUNT_LABELS[game.amountSource] ?? '금액 미확인'
}
