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
import { useAuth } from '../../features/auth/context/AuthContext'
import MySpendingAnalysis from '../../features/spending/components/MySpendingAnalysis'

// 로그인(JWT) 사용자는 스팀 보유 게임 기반 개인 분석/구매 내역을, 데모 체험 사용자는 기존 데모 데이터를 본다.
export default function AnalysisPage({ view = 'dashboard' }) {
  const { isAuthenticated } = useAuth()
  if ((view === 'analysis' || view === 'library') && isAuthenticated) return <MySpendingAnalysis view={view} />
  return <DemoAnalysisPage view={view} />
}

function DemoAnalysisPage({ view }) {
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
          <div className="section-heading">
            <div>
              <h2>{view === 'analysis' ? '소비 패턴 자세히 보기' : '나의 소비 돌아보기'}</h2>
              <span>구매일 기준 · 누적 요약에는 영향을 주지 않아요</span>
            </div>
            <PeriodFilter
              value={period}
              onChange={value => {
                setPeriod(value)
                setGenre(null)
              }}
            />
          </div>
          <div className="charts-grid">
            <MonthlySpendingChart months={monthlySpending(games, period, data.asOf)} />
            <GenreSpendingChart genres={genreSpending(selected)} total={periodSummary.total} />
          </div>
          <div className="insights-grid">
            <SpendingInsights insights={getSpendingInsights(selected)} onExplore={explore} />
            <UnplayedSpendingCard
              summary={periodSummary}
              onExplore={() => explore({ filter: 'unplayed' })}
            />
          </div>
        </>
      )}
      <div ref={tableRef} tabIndex={-1} className="table-anchor">
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
      <div className="data-notice">
        <GSIcon name="info" size={16} />
        <p>
          현재는 데모 데이터로 표시됩니다.{' '}
          {summary.unknownCount > 0 && (
            <>구매 금액 미확인 게임 {summary.unknownCount}개는 지출 집계에서 제외했어요. </>
          )}
          계정 연동 및 실제 구매 내역 연결은 추후 제공됩니다.
        </p>
      </div>
      {view === 'analysis' && (
        <details className="calculation-notes">
          <summary>지표 계산 기준 확인하기</summary>
          <p>
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
