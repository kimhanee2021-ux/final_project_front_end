import { useRef, useState } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import { useMySpending } from '../hooks/useMySpending'
import Skeleton from '../../../components/common/Skeleton'
import EmptyState from '../../../components/common/EmptyState'
import GSIcon from '../../../components/common/GSIcon'
import DashboardIntro from '../../dashboard/components/DashboardIntro'
import SpendingSummary from '../../dashboard/components/SpendingSummary'
import GenreSpendingChart from '../../dashboard/components/GenreSpendingChart'
import SpendingInsights from '../../dashboard/components/SpendingInsights'
import UnplayedSpendingCard from '../../dashboard/components/UnplayedSpendingCard'
import PurchasedGamesTable from '../../dashboard/components/PurchasedGamesTable'
import GameDetailDialog from '../../dashboard/components/GameDetailDialog'
import ValueRankingCard from './ValueRankingCard'
import { summarize, genreSpending } from '../../dashboard/spendingMetrics'
import { getSpendingInsights } from '../../dashboard/spendingInsights'
import { amountSourceCounts, recentFocus, valueRanking } from '../spendingModel'
import { number } from '../../../utils/formatters'

const BADGE = '스팀 연동 · 정가 추정'

function recentInsight(games) {
  const game = recentFocus(games)
  if (!game) return []
  return [
    {
      id: 'recent',
      title: '요즘은 ' + game.name + '에 빠져 있어요',
      description: '최근 2주 동안 ' + number(game.recentHours) + '시간 플레이했어요. 지금 가장 손이 가는 게임이에요.',
      action: game.genre + ' 게임 모아 보기',
      genre: game.genre,
    },
  ]
}

// 로그인 사용자의 스팀 보유 게임 + 한국 정가로 만드는 개인 소비 분석 화면.
// 스팀은 구매일을 주지 않아서 기간 필터/월별 차트 대신 가성비·최근 몰입 같은 보유 게임 기준 분석을 보여준다.
export default function MySpendingAnalysis() {
  const { user, startSteamLink } = useAuth()
  const { data, loading, syncing, error, notLinked, reload, sync } = useMySpending(user?.id)
  const [filter, setFilter] = useState('all')
  const [genre, setGenre] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const tableRef = useRef(null)

  const asOf = data?.asOf ?? new Date().toISOString().slice(0, 10)
  const syncButton = (
    <button type="button" className="text-button" onClick={sync} disabled={syncing}>
      {syncing ? '스팀에서 불러오는 중...' : '스팀 다시 동기화'}
      <GSIcon name="refresh" size={15} />
    </button>
  )

  if (loading) return <Skeleton />
  if (notLinked || error || !data?.games.length) {
    return (
      <>
        <DashboardIntro view="analysis" asOf={asOf} badgeLabel={BADGE} />
        {notLinked ? (
          <EmptyState
            title="스팀 계정을 연동해 주세요"
            description="보유 게임과 플레이 시간을 불러와 나만의 소비 패턴을 분석해 드려요."
            action={
              <button type="button" className="text-button" onClick={startSteamLink}>
                Steam 계정 연동하기
                <GSIcon name="arrow" size={15} />
              </button>
            }
          />
        ) : error ? (
          <EmptyState
            title="소비 분석을 불러오지 못했어요"
            description={error}
            action={
              <button type="button" className="text-button" onClick={reload}>
                다시 시도
                <GSIcon name="refresh" size={15} />
              </button>
            }
          />
        ) : (
          <EmptyState
            title="아직 불러온 보유 게임이 없어요"
            description="스팀 라이브러리를 동기화하면 소비 패턴을 바로 분석해 드려요."
            action={syncButton}
          />
        )}
      </>
    )
  }

  const games = data.games
  const summary = summarize(games)
  const sources = amountSourceCounts(games)
  const explore = (item = {}) => {
    setFilter(item.filter || 'all')
    setGenre(item.genre || null)
    tableRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    })
    tableRef.current?.focus({ preventScroll: true })
  }

  return (
    <>
      <DashboardIntro view="analysis" asOf={asOf} badgeLabel={BADGE} />
      <SpendingSummary summary={summary} estimated />
      <div className="section-heading">
        <div>
          <h2>나의 소비 패턴</h2>
          <span>스팀 보유 게임 {games.length}개 · 현재 한국 정가 기준 추정</span>
        </div>
        {syncButton}
      </div>
      {error && <p className="data-notice" role="alert">{error}</p>}
      <div className="charts-grid">
        <ValueRankingCard ranking={valueRanking(games)} onSelect={setSelectedGame} />
        <GenreSpendingChart genres={genreSpending(games)} total={summary.total} estimated />
      </div>
      <div className="insights-grid">
        <SpendingInsights insights={[...recentInsight(games), ...getSpendingInsights(games, true)]} onExplore={explore} />
        <UnplayedSpendingCard summary={summary} onExplore={() => explore({ filter: 'unplayed' })} />
      </div>
      <div ref={tableRef} tabIndex={-1} className="table-anchor">
        <PurchasedGamesTable
          games={games}
          filter={filter}
          setFilter={setFilter}
          genre={genre}
          clearGenre={() => setGenre(null)}
          onSelect={setSelectedGame}
        />
      </div>
      <div className="data-notice">
        <GSIcon name="info" size={16} />
        <p>
          금액은 실제 결제액이 아니라 <strong>현재 한국 스팀 정가</strong>로 추정한 값이에요. 할인 구매, 번들, 선물은 반영되지
          않아요. 무료 게임 {sources.FREE}개는 0원으로 계산했고
          {sources.UNKNOWN > 0 && <>, 가격을 확인할 수 없는 게임 {sources.UNKNOWN}개는 지출 집계에서 제외했어요</>}.
        </p>
      </div>
      <details className="calculation-notes">
        <summary>지표 계산 기준 확인하기</summary>
        <p>
          보유 게임 정가 합계는 가격을 확인한 유료 게임의 현재 한국 정가(할인 전)를 더한 값입니다. 시간당 비용은 정가를 스팀
          누적 플레이 시간으로 나눈 값이며, 가성비 랭킹은 1시간 이상 플레이한 유료 게임만 비교합니다. 미플레이 게임은 누적
          플레이 시간이 0분인 유료 게임입니다. 스팀 공개 API는 구매일과 실제 결제 금액을 제공하지 않아 기간별 지출은 구매내역
          연동 이후에 제공됩니다.
        </p>
      </details>
      <GameDetailDialog game={selectedGame} onClose={() => setSelectedGame(null)} />
    </>
  )
}
