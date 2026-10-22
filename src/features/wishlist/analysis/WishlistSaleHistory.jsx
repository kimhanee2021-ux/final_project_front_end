// [추가] 위시리스트 AI 영역에서 고른 게임 한 개의 할인 기록과 AI 판단 이유.
// 왼쪽: 12개월 할인 달력 (작년 · 올해 30% 이상 할인한 달, 남은 달의 할인 확률) — discount-outlook
// 오른쪽: 지금 vs 기대 할인 막대 + AI가 그렇게 판단한 이유 — buy-advice · ai-summary
import { useEffect, useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { fetchDiscountOutlook } from './api'
import { useWishlistSummary } from './WishlistSummaryContext'
import WishlistDiscountCompare from './WishlistDiscountCompare'

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
function SaleCalendar({ outlook }) {
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

// 남은 달 중 할인 확률이 가장 높은 달 한 줄
function bestChanceText(outlook) {
  const best = [...outlook.upcoming].sort((a, b) => b.percent - a.percent)[0]
  return best ? `남은 달 중 ${best.month}월 할인 확률이 ${best.percent}%로 가장 높아요.` : null
}

export default function WishlistSaleHistory({ item }) {
  const { advice, items } = useWishlistSummary()
  const [state, setState] = useState({ appId: null, outlook: null, error: false })

  useEffect(() => {
    let alive = true
    fetchDiscountOutlook(item.id)
      .then(outlook => { if (alive) setState({ appId: item.id, outlook, error: false }) })
      .catch(() => { if (alive) setState({ appId: item.id, outlook: null, error: true }) })
    return () => { alive = false }
  }, [item.id])

  // 다른 게임을 고른 직후에는 이전 게임 결과를 보여 주지 않는다
  const ready = state.appId === item.id
  const outlook = ready && state.outlook?.status === 'OK' ? state.outlook : null
  const aiSentence = items?.[item.id]
  const ruleSentence = advice[item.id]?.sentence

  return (
    <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-[24px] rounded-[20px] bg-surface p-[20px] max-[860px]:grid-cols-1">
      <div className="flex flex-col min-w-0">
        <p className="mb-[12px] text-[14px] font-[700]">할인 기록</p>
        {/* 제목 아래 남은 칸의 가로 · 세로 가운데에 달력 · 범례 · 안내 문장을 둔다 */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {!ready ? (
            <div className="h-[110px] w-full max-w-[460px] animate-pulse rounded-[12px] bg-text opacity-10" />
          ) : outlook ? (
            <div className="w-full max-w-[460px]">
              <SaleCalendar outlook={outlook} />
              {bestChanceText(outlook) && <p className="mt-[12px] text-[13px] font-[600]">{bestChanceText(outlook)}</p>}
            </div>
          ) : (
            <p className="text-[13px] text-muted">
              {state.error ? '할인 기록을 불러오지 못했어요.' : (state.outlook?.reason ?? '할인 기록이 부족해요.')}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-[14px] min-w-0">
        <p className="text-[14px] font-[700]">지금 vs 기대 할인</p>
        <WishlistDiscountCompare item={item} />
        <div className="rounded-[12px] bg-bg p-[12px] text-[13px] leading-[1.6]">
          <span className="mb-[4px] inline-flex items-center gap-[4px] text-[11px] font-[700] text-primary-text">
            <GSIcon name="spark" size={12} />
            AI가 이렇게 판단했어요
          </span>
          <p>{aiSentence?.sentence ?? ruleSentence ?? '판단 이유를 불러오는 중이에요…'}</p>
          {aiSentence?.sentence && ruleSentence && <p className="mt-[6px] text-[12px] text-muted">근거 · {ruleSentence}</p>}
        </div>
      </div>
    </div>
  )
}
