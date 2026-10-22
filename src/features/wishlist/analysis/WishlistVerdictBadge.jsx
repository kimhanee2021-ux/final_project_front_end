// [변경] 카드 오른쪽 맨 위의 AI 구매 판단 칩. 썸네일 위 작은 배지에서 카드의 주인공 자리로 옮겼다.
// 스팀 게임(숫자 id)만 보여 주고, 판단 결과는 WishlistSummaryContext가 페이지 단위로 받아 둔 것을 읽는다.
import { GSIcon } from '@/shared/ui'
import { useWishlistSummary } from './WishlistSummaryContext'
import { VERDICTS, verdictKind } from './verdict'

export default function WishlistVerdictBadge({ item }) {
  const { advice } = useWishlistSummary()
  if (typeof item.id !== 'number') return null // 데모 게임은 판단하지 않는다

  const kind = verdictKind(advice[item.id])
  return (
    <div className="flex items-center gap-[8px]">
      <span className="text-[12px] font-[700] text-muted">AI 판단</span>
      {kind ? (
        <span
          className="inline-flex items-center gap-[5px] h-[28px] px-[12px] rounded-full text-[13px] font-[800] text-white"
          style={{ background: VERDICTS[kind].bg }}
        >
          <GSIcon name={VERDICTS[kind].icon} size={14} />
          {VERDICTS[kind].label}
        </span>
      ) : (
        // 판단이 오기 전 자리표시
        <span className="h-[28px] w-[84px] animate-pulse rounded-full bg-text opacity-10" />
      )}
    </div>
  )
}
