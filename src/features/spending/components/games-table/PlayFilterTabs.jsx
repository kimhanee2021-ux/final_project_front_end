// 플레이 상태 세그먼트 탭: 옅은 틀 안에서 고른 탭만 흰 카드처럼 떠오르고, 탭마다 개수 뱃지를 단다.
// tabs: [{ key, label, count }]
export default function PlayFilterTabs({ tabs, active, onSelect }) {
  return (
    <div className="inline-flex p-[4px] rounded-full bg-bg" role="group" aria-label="플레이 상태 필터">
      {tabs.map(tab => {
        const selected = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(tab.key)}
            className={`inline-flex items-center gap-[8px] h-[34px] px-[16px] rounded-full text-[13px] whitespace-nowrap transition-[background,color,box-shadow] duration-200 ${
              selected ? 'bg-surface text-primary-text font-[700] shadow-[var(--shadow)]' : 'text-muted hover:text-text'
            }`}
          >
            {tab.label}
            <span
              className={`min-w-[22px] px-[6px] py-[1px] rounded-full text-[11px] font-[650] tabular-nums ${
                selected ? 'bg-primary-soft text-primary-text' : 'bg-surface text-faint'
              }`}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
