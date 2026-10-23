import AiBadge from '../parts/AiBadge'

// 추천 결과 영역의 배지 줄: AI추천 배지 + 작은 제목
export default function ResultBadge() {
  return (
    <div className="flex items-center gap-[10px]">
      <AiBadge />
      <span className="text-[14px] font-[650] text-primary-text">AI가 찾은 내 취향</span>
    </div>
  )
}
