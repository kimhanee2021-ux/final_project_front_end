import { useState } from 'react'
import Card from '../../../components/common/Card'
import { money, number } from '../../../utils/formatters'
export default function MonthlySpendingChart({ months }) {
  const [selectedKey, setSelectedKey] = useState(null)
  const selected = months.find(month => month.key === selectedKey) || months[months.length - 1]
  const max = Math.max(...months.map(month => month.total), 10000)
  const ceiling = Math.ceil(max / 50000) * 50000
  return (
    <Card
      title="월별 지출 추이"
      subtitle="언제, 얼마나 구매했는지 확인해 보세요."
      action={<span className="text-[10px] text-muted mt-[4px]">단위: 원</span>}
    >
      <div className="mt-[21px] mb-[17px] ml-[2px] flex items-baseline gap-[12px]" aria-live="polite">
        <span className="text-[11px] text-muted">{selected.key.replace('-', '년 ')}월 구매 금액</span>
        <strong className="text-[21px] tracking-[-0.6px]">{money(selected.total)}</strong>
      </div>
      <div className="flex h-[170px] gap-[12px] min-[1600px]:h-[185px]">
        <div className="w-[30px] pb-[30px] flex flex-col justify-between text-[9px] text-muted text-right shrink-0">
          {[ceiling, ceiling / 2, 0].map(value => (
            <span key={value}>{value === 0 ? '0' : number(value / 10000) + '만'}</span>
          ))}
        </div>
        <div className="flex-1 min-w-0 flex gap-[clamp(8px,2vw,28px)] px-[12px] overflow-x-auto [background:repeating-linear-gradient(to_top,transparent_0,transparent_calc(50%_-_1px),var(--border)_calc(50%_-_1px),var(--border)_50%)_top/100%_140px_no-repeat] min-[1600px]:[background-size:100%_155px]">
          {months.map(month => {
            const active = month.key === selected.key
            return (
              <button
                key={month.key}
                className="group flex flex-col flex-1 min-w-[26px] bg-transparent p-0 items-center text-muted"
                onClick={() => setSelectedKey(month.key)}
                aria-label={month.key + ' 구매 금액 ' + money(month.total)}
                aria-pressed={active}
              >
                <span className="h-[140px] w-full max-w-[56px] flex items-end min-[1600px]:h-[155px]">
                  <span
                    className={`w-full rounded-[6px_6px_0_0] [transition:height_.25s,opacity_.2s] group-hover:opacity-100 ${active ? 'bg-chart-1 opacity-100' : 'bg-chart-2 opacity-[.55]'}`}
                    style={{ height: Math.max((month.total / ceiling) * 100, 1) + '%' }}
                  />
                </span>
                <span className={`text-[10px] pt-[12px] ${active ? 'text-primary-text font-bold' : ''}`}>{month.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-[7px] mt-[18px] pt-[14px] border-t border-border text-[9px] text-muted">
        <span className="w-[7px] h-[7px] rounded-full bg-chart-1 inline-block shrink-0" />
        실제 결제 금액 기준 <span className="ml-auto">막대를 선택해 금액 확인</span>
      </div>
    </Card>
  )
}
