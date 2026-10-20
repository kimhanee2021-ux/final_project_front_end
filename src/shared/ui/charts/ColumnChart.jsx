// 세로 막대(컬럼) 차트. 값은 막대 위에, 이름은 막대 아래에 적고, 가장 큰 값을 가장 높은 막대로 둔다.
// 이름이 길면 두 줄까지 아래로 내려가고(영역 높이를 두 줄로 고정), 막대와 값은 항상 같은 줄에 맞춘다.
// items: [{ key?, label, value, text }]
// - 기본: 가장 큰 막대만 포인트 색, 나머지는 옅은 톤
// - onSelect를 주면 막대가 눌리는 버튼이 되고, activeKey로 고른 막대만 포인트 색으로 강조하며 아래에 삼각 표시를 단다.
export default function ColumnChart({ items, height = 260, activeKey, onSelect }) {
  const interactive = Boolean(onSelect)
  const max = Math.max(...items.map(item => item.value), 1)
  return (
    <div
      className="flex items-start gap-[clamp(8px,2vw,24px)]"
      role={interactive ? 'group' : 'img'}
      aria-label={interactive ? '막대를 눌러 구간 선택' : items.map(item => `${item.label} ${item.text}`).join(', ')}
    >
      {items.map((item, index) => {
        const key = item.key ?? item.label
        const emphasized = interactive ? key === activeKey : item.value === max
        const column = (
          <>
            <span className={`text-[13px] tabular-nums ${emphasized ? 'font-[700] text-text' : 'text-muted'}`}>{item.text}</span>
            <div className="w-full flex items-end" style={{ height }}>
              <div
                className={`gs-grow-y w-full rounded-[12px_12px_4px_4px] transition-colors ${emphasized ? 'bg-primary' : 'bg-primary-soft'}`}
                style={{ height: `${Math.max((item.value / max) * 100, item.value > 0 ? 3 : 0)}%`, animationDelay: `${index * 80}ms` }}
              />
            </div>
            <span
              className={`w-full min-h-[2.8em] text-center text-[12px] leading-[1.4] line-clamp-2 [overflow-wrap:anywhere] ${emphasized ? 'font-[650] text-text' : 'text-muted'}`}
              title={item.label}
            >
              {item.label}
            </span>
            {/* 선택한 막대 아래에서 목록 박스로 이어지는 삼각 표시(자리는 항상 차지해서 높이가 흔들리지 않는다) */}
            {interactive && (
              <span
                aria-hidden="true"
                className={`block w-0 h-0 border-x-[10px] border-x-transparent border-b-[10px] ${key === activeKey ? 'border-b-primary-soft' : 'border-b-transparent'}`}
              />
            )}
          </>
        )
        const className = 'flex-1 min-w-0 flex flex-col items-center gap-[10px]'
        return interactive ? (
          <button
            key={key}
            type="button"
            className={`${className} bg-transparent p-0 hover:opacity-80`}
            aria-pressed={key === activeKey}
            onClick={() => onSelect(key)}
          >
            {column}
          </button>
        ) : (
          <div key={key} className={className}>
            {column}
          </div>
        )
      })}
    </div>
  )
}
