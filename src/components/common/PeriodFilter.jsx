export default function PeriodFilter({ value, onChange }) {
  return (
    <div className="flex bg-surface p-[4px] rounded-[9px] border border-border max-[580px]:self-end" role="group" aria-label="분석 조회 기간">
      {[
        ['month', '이번 달'],
        ['six', '최근 6개월'],
        ['all', '전체'],
      ].map(([key, label]) => (
        <button
          key={key}
          aria-pressed={key === value}
          className={`bg-transparent text-[11px] py-[7px] px-[13px] max-[760px]:px-[10px] rounded-[6px] whitespace-nowrap ${key === value ? 'text-primary-text bg-primary-soft font-bold' : 'text-muted'}`}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
