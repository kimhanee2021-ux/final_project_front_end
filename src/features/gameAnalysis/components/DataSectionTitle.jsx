// AI 분석 아래에 이어지는 데이터 묶음의 소제목 (게임별 데이터 / 종합 데이터)
export default function DataSectionTitle({ title, description }) {
  return (
    <div className="mt-[16px] px-[4px]">
      <h2 className="text-[22px] font-[750] tracking-[-0.6px]">{title}</h2>
      {description && <p className="mt-[4px] text-[14px] text-muted">{description}</p>}
    </div>
  )
}
