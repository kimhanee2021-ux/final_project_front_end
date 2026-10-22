import { GSIcon } from '@/shared/ui'

// AI 분석 화면(AiAnalysisSection)과 같은 각진 그라데이션 라벨 + 반짝이는 별로 "AI가 만든 결과"임을 표시한다.
export default function AiBadge() {
  return (
    <span className="ai-badge relative inline-flex items-center gap-[6px] px-[11px] py-[4px] rounded-[6px] text-[12px] font-[800] tracking-[0.4px] text-[#14131c] overflow-hidden">
      <GSIcon name="spark" size={14} className="ai-badge-spark" />
      AI추천
    </span>
  )
}
