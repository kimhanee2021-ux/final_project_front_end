import { chartColor } from '@/shared/ui'

// 장르별 카드: 장르 이름(색 점) 아래에 지표를 큰 숫자로 보여준다. 지표 개수는 카드마다 같다.
// items: [{ label, metrics: [{ value, caption }] }] — 순서가 RatioStrip의 색 순서와 같다.
export default function GenreStatCards({ items }) {
  return (
    <ul className="gs-stagger grid grid-cols-3 gap-[12px] max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
      {items.map((item, index) => (
        <li key={item.label} className="p-[20px] rounded-[20px] bg-bg min-w-0">
          <p className="flex items-center gap-[8px] text-[14px] font-[600] min-w-0">
            <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: chartColor(index) }} />
            <span className="truncate" title={item.label}>{item.label}</span>
          </p>
          <div className="mt-[14px] flex flex-wrap gap-x-[24px] gap-y-[10px]">
            {item.metrics.map(metric => (
              <div key={metric.caption} className="min-w-0">
                <strong className="block text-[22px] font-[750] tracking-[-0.6px] tabular-nums">{metric.value}</strong>
                <small className="text-[12px] text-muted">{metric.caption}</small>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  )
}
