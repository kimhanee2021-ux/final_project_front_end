// 2~3개 중 하나를 고르는 짧은 토글. 선택된 항목은 흰 알약으로만 구분한다(색 강조 없음).
export default function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div className="inline-flex p-[3px] rounded-full bg-bg" role="group" aria-label={label}>
      {options.map(option => (
        <button
          key={option.key}
          type="button"
          aria-pressed={option.key === value}
          className={`h-[32px] px-[14px] rounded-full text-[13px] whitespace-nowrap transition-colors ${
            option.key === value ? 'bg-surface text-text font-[650] shadow-[var(--shadow)]' : 'bg-transparent text-muted hover:text-text'
          }`}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
