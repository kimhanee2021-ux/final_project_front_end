// 가로로 늘어놓은 필터 칩. 선택된 칩만 검정(반전)으로 두고 나머지는 옅은 회색으로 낮춘다.
export default function FilterChips({ label, options, activeKey, onSelect, className = '' }) {
  return (
    <div
      className={`flex gap-[8px] overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      role="group"
      aria-label={label}
    >
      {options.map(option => {
        const active = option.key === activeKey
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            className={`h-[36px] px-[16px] rounded-full text-[13px] whitespace-nowrap transition-colors ${
              active ? 'bg-text text-surface font-[650]' : 'bg-bg text-muted hover:text-text'
            }`}
            onClick={() => onSelect(option.key)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
