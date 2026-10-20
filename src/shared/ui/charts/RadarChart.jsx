// 여러 항목을 한 도형으로 비교하는 레이더 차트(SVG). 항목은 3개 이상이어야 도형이 된다.
// items: [{ label, value }]  (value는 0~max, 기본 100)
const SIZE = 320
const CENTER = SIZE / 2
const RADIUS = 105
const RINGS = [0.25, 0.5, 0.75, 1]

const point = (index, count, ratio) => {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2
  return [CENTER + Math.cos(angle) * RADIUS * ratio, CENTER + Math.sin(angle) * RADIUS * ratio]
}
const toPoints = list => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

export default function RadarChart({ items, max = 100 }) {
  const count = items.length
  const data = items.map((item, index) => point(index, count, Math.min(item.value / max, 1)))
  return (
    <svg
      className="w-full max-w-[420px] mx-auto"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={items.map(item => `${item.label} ${item.value}점`).join(', ')}
    >
      {RINGS.map(ratio => (
        <polygon key={ratio} points={toPoints(items.map((_, index) => point(index, count, ratio)))} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {items.map((_, index) => {
        const [x, y] = point(index, count, 1)
        return <line key={index} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />
      })}
      <polygon className="gs-radar-in" style={{ transformOrigin: `${CENTER}px ${CENTER}px` }} points={toPoints(data)} fill="var(--primary)" fillOpacity="0.22" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
      {data.map(([x, y], index) => (
        <circle key={index} className="gs-fade" style={{ animationDelay: `${500 + index * 80}ms` }} cx={x} cy={y} r="4" fill="var(--primary)" />
      ))}
      {items.map((item, index) => {
        const [x, y] = point(index, count, 1.22)
        return (
          <text key={item.label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize="13" fontWeight="600">
            {item.label}
            <tspan x={x} dy="16" fill="var(--muted)" fontWeight="500" fontSize="12">
              {item.value}점
            </tspan>
          </text>
        )
      })}
    </svg>
  )
}
