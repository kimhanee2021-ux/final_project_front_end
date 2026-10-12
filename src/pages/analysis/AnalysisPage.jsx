import { useRef, useState } from 'react'
import { useDashboardData } from '../../features/dashboard/hooks/useDashboardData'
import PeriodFilter from '../../components/common/PeriodFilter'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import GSIcon from '../../components/common/GSIcon'
import DashboardIntro from '../../features/dashboard/components/DashboardIntro'
import SpendingSummary from '../../features/dashboard/components/SpendingSummary'
import MonthlySpendingChart from '../../features/dashboard/components/MonthlySpendingChart'
import GenreSpendingChart from '../../features/dashboard/components/GenreSpendingChart'
import SpendingInsights from '../../features/dashboard/components/SpendingInsights'
import UnplayedSpendingCard from '../../features/dashboard/components/UnplayedSpendingCard'
import PurchasedGamesTable from '../../features/dashboard/components/PurchasedGamesTable'
import GameDetailDialog from '../../features/dashboard/components/GameDetailDialog'
import {
  filterPeriod,
  summarize,
  monthlySpending,
  genreSpending,
} from '../../features/dashboard/spendingMetrics'
import { getSpendingInsights } from '../../features/dashboard/spendingInsights'
export default function AnalysisPage({ view = 'dashboard' }) {
  const { data, loading, error, retry } = useDashboardData()
  const [period, setPeriod] = useState('six')
  const [filter, setFilter] = useState('all')
  const [genre, setGenre] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const tableRef = useRef(null)
  if (loading) return <Skeleton />
  if (error) return <ErrorState onRetry={retry} />
  const games = data.games
  const selected = filterPeriod(games, period, data.asOf)
  const summary = summarize(games),
    periodSummary = summarize(selected)
  const explore = (item = {}) => {
    setFilter(item.filter || 'all')
    setGenre(item.genre || null)
    tableRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    })
    tableRef.current?.focus({ preventScroll: true })
  }
  return (
    <>
      <DashboardIntro view={view} asOf={data.asOf} />
      {view !== 'library' && (
        <>
          <SpendingSummary summary={summary} />
          <div className="flex justify-between gap-[16px] items-center mt-[32px] mb-[17px] max-[1200px]:[&>div:first-child]:block max-[760px]:mt-[25px] max-[580px]:items-start max-[580px]:flex-col max-[580px]:gap-[12px] max-[580px]:[&>div:first-child]:w-full">
            <div>
              <h2 className="text-[15px] tracking-[-0.5px]">{view === 'analysis' ? '소비 패턴 자세히 보기' : '나의 소비 돌아보기'}</h2>
              <span className="text-[10px] text-muted max-[1200px]:block max-[1200px]:mt-[4px] max-[760px]:max-w-[180px] max-[580px]:max-w-none">구매일 기준 · 누적 요약에는 영향을 주지 않아요</span>
            </div>
            <PeriodFilter
              value={period}
              onChange={value => {
                setPeriod(value)
                setGenre(null)
              }}
            />
          </div>
          <div className="grid grid-cols-[1.5fr_1fr] gap-[20px] max-[1000px]:grid-cols-[1.2fr_1fr] max-[760px]:grid-cols-[1.2fr_1fr] max-[580px]:grid-cols-1">
            <MonthlySpendingChart months={monthlySpending(games, period, data.asOf)} />
            <GenreSpendingChart genres={genreSpending(selected)} total={periodSummary.total} />
          </div>
          <div className="grid grid-cols-[1.5fr_1fr] gap-[20px] my-[20px] max-[1000px]:grid-cols-1 max-[580px]:grid-cols-1">
            <SpendingInsights insights={getSpendingInsights(selected)} onExplore={explore} />
            <UnplayedSpendingCard
              summary={periodSummary}
              onExplore={() => explore({ filter: 'unplayed' })}
            />
          </div>
        </>
      )}
      <div ref={tableRef} tabIndex={-1} className="scroll-mt-[20px]">
        <PurchasedGamesTable
          games={view === 'library' ? games : selected}
          filter={filter}
          setFilter={setFilter}
          genre={view === 'library' ? null : genre}
          clearGenre={() => setGenre(null)}
          onSelect={setSelectedGame}
          library={view === 'library'}
        />
      </div>
      <div className="flex items-start gap-[8px] mt-[18px] text-muted text-[10px]">
        <GSIcon name="info" size={16} className="shrink-0" />
        <p>
          현재는 데모 데이터로 표시됩니다.{' '}
          {summary.unknownCount > 0 && (
            <>구매 금액 미확인 게임 {summary.unknownCount}개는 지출 집계에서 제외했어요. </>
          )}
          계정 연동 및 실제 구매 내역 연결은 추후 제공됩니다.
        </p>
      </div>
      {view === 'analysis' && (
        <details className="mt-[18px] border border-border rounded-[10px] p-[16px] text-[12px] bg-surface">
          <summary className="cursor-pointer">지표 계산 기준 확인하기</summary>
          <p className="text-muted leading-[1.9] mt-[15px]">
            누적 지출은 확인된 결제 금액에서 환불을 차감한 금액입니다. 평균 구매 금액은 환불 반영 후
            금액이 남아 있는 유료 게임 기준입니다. 시간당 비용은 금액과 누적 플레이 시간을 모두
            확인할 수 있는 유료 게임들의 금액 합계를 시간 합계로 나눕니다. 미플레이 게임의 구매
            금액도 포함하며, 총 플레이 시간이 0이면 계산하지 않습니다. 번들 개별 가격이 없는
            데이터는 게임별 평균에 임의 배분하지 않습니다.
          </p>
        </details>
      )}
      <GameDetailDialog game={selectedGame} onClose={() => setSelectedGame(null)} />
    </>
  )
}
