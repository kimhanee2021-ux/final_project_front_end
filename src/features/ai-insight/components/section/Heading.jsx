import { GSIcon, PageHeading } from '@/shared/ui'

// 분석 주제 태그(둥근 알약)와 헷갈리지 않도록 모서리가 각진 그라데이션 라벨 + 반짝이는 별로 "AI가 만든 결과"임을 따로 표시한다.
const BADGE = 'ai-badge relative inline-flex items-center gap-[6px] px-[11px] py-[4px] rounded-[6px] text-[12px] font-[800] tracking-[0.4px] text-[#14131c] overflow-hidden'

// 영역 제목 + AI 분석 배지. 스팀 연동 전과 후가 같은 모양을 쓴다.
export default function Heading({ title, description }) {
  return (
    <>
      <PageHeading title={title} description={description} />
      <span className={BADGE + ' mb-[16px]'}>
        <GSIcon name="spark" size={14} className="ai-badge-spark" />
        AI분석
      </span>
    </>
  )
}
