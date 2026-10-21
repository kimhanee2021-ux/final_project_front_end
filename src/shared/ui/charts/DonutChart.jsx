import { chartColor } from './chartColor'
import { donutSlices } from './donutSlices'

const GAP = 0.8

// 전체를 100%로 보고 항목별 비중을 색으로 나눈 도넛 하나. 조각은 12시 방향부터 차례로 그려지며 나타나고,
// 가운데(children)에는 전체를 대표하는 숫자를 둔다. 색은 순서대로(chartColor) 정해지므로 범례도 같은 순서로 그리면 색이 맞는다.
// items: [{ label, value }]
export default function DonutChart({ items, children, size = 200 }) {
  const slices = donutSlices(items)
  if (!slices.length) return null
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 42 42"
        width={size}
        height={size}
        className="-rotate-90"
        role="img"
        aria-label={slices.map(slice => `${slice.label} ${slice.percent}%`).join(', ')}
      >
        {slices.map((slice, index) => {
          // 조각 사이에 작은 틈을 둔다 (조각이 하나뿐이면 틈 없이 한 바퀴)
          const length = slices.length > 1 ? Math.max(slice.length - GAP, 0.5) : slice.length
          return (
            <circle
              key={slice.label}
              className="gs-donut-slice"
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              strokeWidth="5.5"
              pathLength="100"
              stroke={chartColor(index)}
              strokeDasharray={`${length} ${100 - length}`}
              strokeDashoffset={-slice.start}
              style={{ '--slice': length, '--rest': 100 - length, animationDelay: `${index * 140}ms` }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">{children}</div>
    </div>
  )
}
