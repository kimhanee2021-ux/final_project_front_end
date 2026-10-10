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
      className="trend-card"
      action={<span className="chart-unit">단위: 원</span>}
    >
      <div className="chart-selected" aria-live="polite">
        <span>{selected.key.replace('-', '년 ')}월 구매 금액</span>
        <strong>{money(selected.total)}</strong>
      </div>
      <div className="bar-chart">
        <div className="chart-axis">
          {[ceiling, ceiling / 2, 0].map(value => (
            <span key={value}>{value === 0 ? '0' : number(value / 10000) + '만'}</span>
          ))}
        </div>
        <div className="bars">
          {months.map(month => (
            <button
              key={month.key}
              className={'bar-column ' + (month.key === selected.key ? 'active' : '')}
              onClick={() => setSelectedKey(month.key)}
              aria-label={month.key + ' 구매 금액 ' + money(month.total)}
              aria-pressed={month.key === selected.key}
            >
              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{ height: Math.max((month.total / ceiling) * 100, 1) + '%' }}
                />
              </span>
              <span className="bar-label">{month.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="chart-foot">
        <span className="legend-dot" />
        실제 결제 금액 기준 <span>막대를 선택해 금액 확인</span>
      </div>
    </Card>
  )
}
