import { chartColor } from './chartColor'

// 전체를 100%로 보고 항목별 비중을 색으로 나눈 긴 띠 하나.
// items: [{ label, value }]  — 색은 순서대로(chartColor) 정해지므로 아래 카드와 같은 순서로 넘기면 색이 맞는다.
export default function RatioStrip({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  if (!total) return null
  return (
    <div className="flex h-[56px] gap-[4px] overflow-hidden rounded-[16px]" role="img" aria-label={items.map(item => `${item.label} ${Math.round((item.value / total) * 100)}%`).join(', ')}>
      {items.map((item, index) => {
        const percent = (item.value / total) * 100
        return (
          <div
            key={item.label}
            className="gs-grow-x min-w-0 flex items-center justify-center text-[13px] font-[650] overflow-hidden"
            style={{ flex: `${item.value} 1 0`, background: chartColor(index), color: index < 3 ? 'var(--on-primary)' : '#17181F', animationDelay: `${index * 90}ms` }}
            title={`${item.label} ${Math.round(percent)}%`}
          >
            {percent >= 7 && `${Math.round(percent)}%`}
          </div>
        )
      })}
    </div>
  )
}
