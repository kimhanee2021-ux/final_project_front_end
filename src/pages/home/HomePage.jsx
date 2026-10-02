import { useRef, useState } from 'react'
import { useDashboardData } from '../../hooks/useDashboardData'
import PeriodFilter from '../../components/common/PeriodFilter'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import Icon from '../../components/common/Icon'
import DashboardIntro from './components/DashboardIntro'
import SpendingSummary from './components/SpendingSummary'
import MonthlySpendingChart from './components/MonthlySpendingChart'
import GenreSpendingChart from './components/GenreSpendingChart'
import SpendingInsights from './components/SpendingInsights'
import UnplayedSpendingCard from './components/UnplayedSpendingCard'
import PurchasedGamesTable from './components/PurchasedGamesTable'
import GameDetailDialog from './components/GameDetailDialog'
import { filterPeriod, summarize, monthlySpending, genreSpending } from '../../utils/spendingMetrics'
import { getSpendingInsights } from '../../utils/spendingInsights'
export default function HomePage({ view = 'dashboard' }) {
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
  const summary = summarize(games), periodSummary = summarize(selected)
  const explore = (item = {}) => { setFilter(item.filter || 'all'); setGenre(item.genre || null); tableRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); tableRef.current?.focus({ preventScroll: true }) }
  return <><DashboardIntro view={view} asOf={data.asOf} />
    {view !== 'library' && <><SpendingSummary summary={summary} /><div className="section-heading"><div><h2>{view === 'analysis' ? '소비 패턴 자세히 보기' : '나의 소비 돌아보기'}</h2><span>구매일 기준 · 누적 요약에는 영향을 주지 않아요</span></div><PeriodFilter value={period} onChange={value => { setPeriod(value); setGenre(null) }} /></div><div className="charts-grid"><MonthlySpendingChart months={monthlySpending(games, period, data.asOf)} /><GenreSpendingChart genres={genreSpending(selected)} total={periodSummary.total} /></div><div className="insights-grid"><SpendingInsights insights={getSpendingInsights(selected)} onExplore={explore} /><UnplayedSpendingCard summary={periodSummary} onExplore={() => explore({ filter: 'unplayed' })} /></div></>}
    <div ref={tableRef} tabIndex={-1} className="table-anchor"><PurchasedGamesTable games={view === 'library' ? games : selected} filter={filter} setFilter={setFilter} genre={view === 'library' ? null : genre} clearGenre={() => setGenre(null)} onSelect={setSelectedGame} library={view === 'library'} /></div>
    <div className="data-notice"><Icon name="info" size={16} /><p>현재는 데모 데이터로 표시됩니다. {summary.unknownCount > 0 && <>구매 금액 미확인 게임 {summary.unknownCount}개는 지출 집계에서 제외했어요. </>}계정 연동 및 실제 구매 내역 연결은 추후 제공됩니다.</p></div>
    {view === 'analysis' && <details className="calculation-notes"><summary>지표 계산 기준 확인하기</summary><p>누적 지출은 확인된 결제 금액에서 환불을 차감한 금액입니다. 평균 구매 금액은 환불 반영 후 금액이 남아 있는 유료 게임 기준입니다. 시간당 비용은 금액과 누적 플레이 시간을 모두 확인할 수 있는 유료 게임들의 금액 합계를 시간 합계로 나눕니다. 미플레이 게임의 구매 금액도 포함하며, 총 플레이 시간이 0이면 계산하지 않습니다. 번들 개별 가격이 없는 데이터는 게임별 평균에 임의 배분하지 않습니다.</p></details>}
    <GameDetailDialog game={selectedGame} onClose={() => setSelectedGame(null)} /></>
}
