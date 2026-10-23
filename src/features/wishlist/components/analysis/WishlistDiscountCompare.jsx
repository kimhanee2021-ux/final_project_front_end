// [추가] AI 판단의 근거: 지금 할인율과 남은 기간의 기대 할인율(작년 같은 달 최대)을 막대 두 줄로 비교한다.
// 판단에 쓴 숫자가 없으면(데이터 부족 · 신작 · 12월) 막대 대신 판단이 어려운 이유만 보여 준다.
import { useWishlistSummary } from '../../context/WishlistSummaryContext'

function Bar({ label, percent, strong }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)_44px] items-center gap-[10px] text-[12px]">
      <span className={strong ? 'font-[700] text-text' : 'text-muted'}>{label}</span>
      <span className="h-[6px] rounded-full bg-bg overflow-hidden" aria-hidden="true">
        <span className={`block h-full rounded-full ${strong ? 'bg-primary' : 'bg-subtle'}`} style={{ width: `${percent}%` }} />
      </span>
      <span className={`text-right tabular-nums ${strong ? 'font-[800] text-primary-text' : 'font-[600] text-muted'}`}>-{percent}%</span>
    </div>
  )
}

export default function WishlistDiscountCompare({ item }) {
  const { advice } = useWishlistSummary()
  if (typeof item.id !== 'number') return null
  const data = advice[item.id]
  if (!data) return null

  // 숫자가 없으면 판단이 어려운 이유만 한 줄로
  if (data.currentPercent == null || data.expectedPercent == null) {
    return data.reason ? <p className="text-[12px] text-muted">{data.reason}</p> : null
  }

  const gap = data.expectedPercent - data.currentPercent
  const expectedLabel = data.expectedMonth ? `${data.expectedMonth}월 기대` : '기대 할인'
  return (
    <div className="flex flex-col gap-[6px]">
      <Bar label="지금" percent={data.currentPercent} strong={gap <= 0} />
      <Bar label={expectedLabel} percent={data.expectedPercent} strong={gap > 0} />
      <p className="mt-[2px] text-[12px] font-[600] text-text">
        {gap > 0
          ? `${data.expectedMonth ? `${data.expectedMonth}월까지` : '조금 더'} 기다리면 ${gap}%p 더 싸질 수 있어요`
          : `${data.windowText ? `${data.windowText} 중` : '남은 기간에'} 더 큰 할인은 없을 것 같아요`}
      </p>
    </div>
  )
}
