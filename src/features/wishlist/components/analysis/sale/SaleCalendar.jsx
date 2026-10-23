import { GSIcon } from '@/shared/ui'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

// 이번 달 (화면을 연 시점 기준. 달이 바뀌는 순간까지 정확할 필요는 없다)
const THIS_MONTH = new Date().getMonth() + 1

function Cell({ children, className = '', style }) {
  return (
    <span className={`grid place-items-center h-[30px] rounded-[8px] text-[11px] font-[700] tabular-nums ${className}`} style={style}>
      {children}
    </span>
  )
}

// 12개월 달력. 할인한 달은 보라색 칸, 남은 달은 할인 확률만큼 진하게 칠하고 숫자를 쓴다
export default function SaleCalendar({ outlook }) {
  const lastYear = new Set(outlook.lastYearSaleMonths)
  const thisYear = new Set(outlook.thisYearSaleMonths)
  const chance = Object.fromEntries(outlook.upcoming.map(item => [item.month, item.percent]))
  return (
    <div>
      <div className="grid grid-cols-[40px_repeat(12,minmax(0,1fr))] gap-[4px] items-center">
        <span />
        {MONTHS.map(month => (
          <span key={month} className={`text-center text-[11px] ${month === THIS_MONTH ? 'font-[800] text-primary-text' : 'text-muted'}`}>
            {month}
          </span>
        ))}
        <span className="text-[12px] text-muted">작년</span>
        {MONTHS.map(month => (
          <Cell key={month} className={lastYear.has(month) ? 'bg-primary text-on-primary' : 'bg-bg'}>
            {lastYear.has(month) ? <GSIcon name="check" size={12} /> : null}
          </Cell>
        ))}
        <span className="text-[12px] text-muted">올해</span>
        {MONTHS.map(month =>
          month <= THIS_MONTH ? (
            <Cell
              key={month}
              className={`${thisYear.has(month) ? 'bg-primary text-on-primary' : 'bg-bg'} ${month === THIS_MONTH ? 'ring-2 ring-primary-text' : ''}`}
            >
              {thisYear.has(month) ? <GSIcon name="check" size={12} /> : null}
            </Cell>
          ) : (
            <Cell
              key={month}
              className="border border-dashed border-primary-text text-primary-text"
              style={chance[month] != null ? { background: `color-mix(in srgb, var(--primary) ${chance[month]}%, transparent)` } : undefined}
            >
              {chance[month] != null ? `${chance[month]}` : ''}
            </Cell>
          )
        )}
      </div>
      <p className="mt-[10px] flex flex-wrap justify-center gap-x-[14px] gap-y-[4px] text-[11px] text-muted">
        <span className="inline-flex items-center gap-[5px]">
          <i className="inline-block w-[10px] h-[10px] rounded-[3px] bg-primary" />
          {outlook.threshold}% 이상 할인한 달
        </span>
        <span className="inline-flex items-center gap-[5px]">
          <i className="inline-block w-[10px] h-[10px] rounded-[3px] border border-dashed border-primary-text" />
          남은 달 할인 확률(%)
        </span>
      </p>
    </div>
  )
}
