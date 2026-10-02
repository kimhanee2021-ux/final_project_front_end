export default function PeriodFilter({ value, onChange }) {
  return <div className="period-filter" role="group" aria-label="분석 조회 기간">{[['month', '이번 달'], ['six', '최근 6개월'], ['all', '전체']].map(([key, label]) => <button key={key} aria-pressed={key === value} className={key === value ? 'selected' : ''} onClick={() => onChange(key)}>{label}</button>)}</div>
}
