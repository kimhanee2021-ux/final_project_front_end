// [변경] 카드 아래 AI 문장. 펼침/접기 없이 항상 보인다.
// - 분석 중이면 카드 자리에 자리표시 막대를 보여 준다. 문장이 오면 실제 문장으로 바뀐다.
// - 스팀 게임만 AI 문장을 보여 준다 (데모 게임은 아무것도 그리지 않는다).
// - "기대 할인율" 줄은 없앴다. AI 문장만 남긴다.
import { useWishlistSummary } from './WishlistSummaryContext'

export default function WishlistCardSummary({ item }) {
  const { items, loading } = useWishlistSummary()
  const steam = typeof item.id === 'number'
  if (!steam) return null

  // 아직 분석 결과가 없으면: 분석 중일 때만 자리표시 막대를 보여 주고, 아니면 아무것도 그리지 않는다
  if (!items) {
    if (!loading) return null
    return (
      <div className="flex flex-col gap-[6px] rounded-[8px] bg-surface p-[10px]">
        {/* [추가] 문장이 올 자리 표시 (분석 중에만 보인다) */}
        <div className="h-[8px] w-[80%] animate-pulse rounded bg-text opacity-10" />
        <div className="h-[8px] w-[55%] animate-pulse rounded bg-text opacity-10" />
      </div>
    )
  }

  const summary = items[item.id] // 이 게임의 AI 문장 (규칙 문장일 수도 있다)
  if (!summary) return null

  return (
    <div className="rounded-[8px] bg-surface p-[10px] text-[12px] leading-[1.6] text-text">
      {/* 출처 표시: AI가 만든 문장인지, 기본 규칙 문장인지 */}
      <span className="mb-[4px] inline-block rounded-full border border-border px-[8px] py-[1px] text-[10px] text-muted">
        {summary.source === 'AI' ? 'AI 분석' : '기본 분석'}
      </span>
      <p>{summary.sentence}</p>
    </div>
  )
}