

// 분석 요약 숫자 3칸: AI가 얼마나 많은 데이터를 보고 골랐는지 보여준다
export default function AnalysisStats({ stats }) {
  return (
    <dl className="grid grid-cols-3 gap-[8px]">
      {stats.map(stat => (
        <div key={stat.label} className="rounded-[16px] bg-surface px-[14px] py-[12px] min-w-0">
          <dt className="text-[12px] text-muted truncate">{stat.label}</dt>
          <dd className="mt-[2px] text-[22px] font-[750] tracking-[-0.5px] tabular-nums truncate">
            {stat.value}
            <small className="ml-[2px] text-[12px] font-[500] text-muted">{stat.unit}</small>
          </dd>
        </div>
      ))}
    </dl>
  )
}
