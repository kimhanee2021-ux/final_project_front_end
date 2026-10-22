import { useEffect, useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { fetchDiscountOutlook } from '../../api'
import { useWishlistSummary } from '../../context/WishlistSummaryContext'
import WishlistDiscountCompare from './WishlistDiscountCompare'
import SaleCalendar from './sale/SaleCalendar'

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
