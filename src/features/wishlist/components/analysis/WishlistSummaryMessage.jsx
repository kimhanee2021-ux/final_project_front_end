// [변경] AI 전체 요약 한 문단.
// - 분석 중이면 회전 아이콘과 자리표시 막대를 보여 준다. 쿨다운 대기 중이면 남은 초를 함께 보여 준다.
// - 실패하면 실패 문구, 완료되면 전체 요약을 보여 준다.
import { useWishlistSummary } from '../../context/WishlistSummaryContext'

// 공통 상자 모양
function Box({ children }) {
  return (
    <div className="mb-[16px] rounded-[12px] border border-border bg-surface p-[14px] text-[14px] leading-[1.7] text-text">
      {children}
    </div>
  )
}

export default function WishlistSummaryMessage() {
  const { items, message, loading, error, retryIn } = useWishlistSummary()

  // 실패
  if (error) {
    return <Box><p>분석을 불러오지 못했어요. 페이지를 새로고침해 주세요.</p></Box>
  }

  // 분석 중 (쿨다운 대기 포함): 회전 아이콘 + 안내 + 자리표시 막대
  if (loading) {
    return (
      <Box>
        <div className="flex items-center gap-[8px]">
          {/* [추가] 회전 아이콘: 멈춘 게 아니라 진행 중이라는 표시 */}
          <span className="inline-block h-[14px] w-[14px] animate-spin rounded-full border-2 border-border border-t-text" />
          <span>
            {retryIn > 0
              ? `다른 분이 방금 분석을 요청해서 ${retryIn}초 뒤에 자동으로 다시 시도해요`
              : 'AI가 위시리스트를 분석하는 중이에요…'}
          </span>
        </div>
        {/* [추가] 결과가 올 자리를 미리 보여 주는 막대 (흐릿하게 깜빡임) */}
        <div className="mt-[10px] flex flex-col gap-[6px]">
          <div className="h-[10px] w-[92%] animate-pulse rounded bg-text opacity-10" />
          <div className="h-[10px] w-[70%] animate-pulse rounded bg-text opacity-10" />
        </div>
      </Box>
    )
  }

  // 완료: 전체 요약이 있으면 보여 준다
  if (items && message) {
    return <Box><p>{message}</p></Box>
  }

  return null
}