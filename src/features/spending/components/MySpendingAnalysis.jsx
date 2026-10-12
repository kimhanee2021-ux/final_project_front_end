import { useRef, useState } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import { useMySpending } from '../hooks/useMySpending'
import Skeleton from '../../../components/common/Skeleton'
import EmptyState from '../../../components/common/EmptyState'
import GSIcon from '../../../components/common/GSIcon'
import DashboardIntro from '../../dashboard/components/DashboardIntro'
import SpendingSummary from '../../dashboard/components/SpendingSummary'
import GenreSpendingChart from '../../dashboard/components/GenreSpendingChart'
import MonthlySpendingChart from '../../dashboard/components/MonthlySpendingChart'
import PeriodFilter from '../../../components/common/PeriodFilter'
import PurchaseImportDialog from '../../purchaseImport/components/PurchaseImportDialog'
import SpendingInsights from '../../dashboard/components/SpendingInsights'
import UnplayedSpendingCard from '../../dashboard/components/UnplayedSpendingCard'
import PurchasedGamesTable from '../../dashboard/components/PurchasedGamesTable'
import GameDetailDialog from '../../dashboard/components/GameDetailDialog'
import ValueRankingCard from './ValueRankingCard'
import { summarize, genreSpending } from '../../dashboard/spendingMetrics'
import { getSpendingInsights } from '../../dashboard/spendingInsights'
import { amountSourceCounts, periodStart, recentFocus, spendingBuckets, valueRanking } from '../spendingModel'
import { money, number } from '../../../utils/formatters'

const BADGE = '스팀 연동 · 정가 추정'
const HISTORY_BADGE = '구매내역 연동 · 실제 결제액'

function savingInsight(data) {
  const discounted = data.transactions.filter(t => t.savedKrw > 0)
  if (!data.savedKrw) return []
  return [
    {
      id: 'saved',
      title: '할인으로 ' + money(data.savedKrw) + '을 아꼈어요',
      description: '할인 구매 ' + number(discounted.length) + '건에서 정가 대비 아낀 금액이에요 (구매일 환율 기준).',
      action: '구매 금액순으로 보기',
      filter: 'all',
    },
  ]
}

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

// 로그인 사용자의 스팀 보유 게임으로 만드는 개인 소비 분석 화면.
// 구매내역을 가져오기 전: 현재 한국 정가로 추정 (스팀 API는 구매일·결제액을 주지 않아 월별 차트·기간 필터는 숨김)
// 구매내역을 가져온 뒤: 실제 결제액(구매일 환율 원화 환산)과 구매일로 월별 차트·기간 필터까지 보여준다.
export default function MySpendingAnalysis() {
  const { user, startSteamLink } = useAuth()
  const { data, loading, syncing, error, notLinked, reload, sync } = useMySpending(user?.id)
  const [filter, setFilter] = useState('all')
  const [genre, setGenre] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [period, setPeriod] = useState('all')
  const [importOpen, setImportOpen] = useState(false)
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
  const history = data.hasPurchaseHistory
  const sources = amountSourceCounts(games)
  const summary = summarize(games)
  // 번들·선물·보유하지 않은 게임처럼 게임별로 나눌 수 없는 지출도 누적 지출에는 넣는다
  const totalSummary = history ? { ...summary, total: summary.total + data.unallocatedKrw } : summary
  const from = periodStart(period, asOf)
  // 기간을 고르면 그 기간에 산 게임만, 전체면 구매 기록 없는 게임·무료 게임까지 모두 보여준다
  const periodGames = history && period !== 'all' ? games.filter(g => g.purchasedAt && g.purchasedAt >= from) : games
  const periodSummary = summarize(periodGames)
  const chart = history ? spendingBuckets(data.transactions, period, asOf) : null
  const insights = [
    ...recentInsight(games),
    ...(history ? savingInsight(data) : []),
    ...getSpendingInsights(periodGames, !history),
  ]
  const explore = (item = {}) => {
    setFilter(item.filter || 'all')
    setGenre(item.genre || null)
    tableRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    })
    tableRef.current?.focus({ preventScroll: true })
  }
  const importButton = (
    <button type="button" className="text-button" onClick={() => setImportOpen(true)}>
      {history ? '구매내역 다시 가져오기' : '구매내역 가져오기'}
      <GSIcon name="library" size={15} />
    </button>
  )

  return (
    <>
      <DashboardIntro view="analysis" asOf={asOf} badgeLabel={history ? HISTORY_BADGE : BADGE} />
      <SpendingSummary
        summary={totalSummary}
        estimated={!history}
        totalNote={
          history && data.unallocatedKrw > 0
            ? '확인된 유료 게임 ' + summary.paidCount + '개 + 게임별로 나눌 수 없는 지출 ' + money(data.unallocatedKrw)
            : undefined
        }
      />
      <div className="section-heading">
        <div>
          <h2>나의 소비 패턴</h2>
          <span>
            스팀 보유 게임 {games.length}개 · {history ? '실제 결제액 (구매일 환율로 원화 환산)' : '현재 한국 정가 기준 추정'}
          </span>
        </div>
        <div className="section-actions">
          {history && (
            <PeriodFilter
              value={period}
              onChange={value => {
                setPeriod(value)
                setGenre(null)
              }}
            />
          )}
          {importButton}
          {syncButton}
        </div>
      </div>
      {error && (
        <p className="data-notice" role="alert">
          {error}
        </p>
      )}
      {!history && (
        <div className="import-callout">
          <GSIcon name="spark" size={18} />
          <p>
            스팀 구매내역을 가져오면 <strong>실제로 낸 금액과 구매일</strong>로 분석이 바뀌고, 월별 지출과 할인으로 아낀 금액도
            볼 수 있어요.
          </p>
          <button type="button" className="primary-button" onClick={() => setImportOpen(true)}>
            구매내역 가져오기
          </button>
        </div>
      )}
      <div className="charts-grid">
        {history ? (
          <MonthlySpendingChart
            months={chart.buckets}
            title={chart.unit === 'year' ? '연도별 지출 추이' : '월별 지출 추이'}
          />
        ) : (
          <ValueRankingCard ranking={valueRanking(games)} onSelect={setSelectedGame} />
        )}
        <GenreSpendingChart
          genres={genreSpending(periodGames)}
          total={history ? periodSummary.total : summary.total}
          estimated={!history}
        />
      </div>
      <div className="insights-grid">
        <SpendingInsights insights={insights} onExplore={explore} />
        <UnplayedSpendingCard
          summary={history ? periodSummary : summary}
          onExplore={() => explore({ filter: 'unplayed' })}
        />
      </div>
      {history && (
        <div className="value-row">
          <ValueRankingCard ranking={valueRanking(games)} onSelect={setSelectedGame} confirmed />
        </div>
      )}
      <div ref={tableRef} tabIndex={-1} className="table-anchor">
        <PurchasedGamesTable
          games={periodGames}
          filter={filter}
          setFilter={setFilter}
          genre={genre}
          clearGenre={() => setGenre(null)}
          onSelect={setSelectedGame}
        />
      </div>
      <div className="data-notice">
        <GSIcon name="info" size={16} />
        {history ? (
          <p>
            금액은 스팀 구매내역의 <strong>실제 결제액</strong>을 구매일 환율로 원화로 바꾼 값이에요 (DLC는 본편에 합산, 환불은
            차감).
            {sources.NO_RECORD > 0 && (
              <> 구매 기록이 없는 게임 {sources.NO_RECORD}개(선물·키 등록·무료 배포 등)는 지출에서 제외했어요.</>
            )}
            {data.unallocatedKrw > 0 && (
              <>
                {' '}
                게임별로 나눌 수 없는 지출 {money(data.unallocatedKrw)}(여러 게임 번들·선물·보유하지 않은 게임)은 누적
                지출에만 포함했어요.
              </>
            )}
            {data.unconvertedCount > 0 && <> 환율을 구하지 못한 거래 {data.unconvertedCount}건은 제외했어요.</>}
          </p>
        ) : (
          <p>
            금액은 실제 결제액이 아니라 <strong>현재 한국 스팀 정가</strong>로 추정한 값이에요. 할인 구매, 번들, 선물은 반영되지
            않아요. 무료 게임 {sources.FREE}개는 0원으로 계산했고
            {sources.UNKNOWN > 0 && (
              <>, 가격 정보가 없는 게임 {sources.UNKNOWN}개(판매 종료·한국 미판매)는 지출 집계에서 제외했어요</>
            )}
            .
          </p>
        )}
      </div>
      <details className="calculation-notes">
        <summary>지표 계산 기준 확인하기</summary>
        {history ? (
          <p>
            누적 지출은 가져온 구매내역의 결제액에서 환불을 뺀 금액이며, 원화가 아닌 결제는 구매일(주말·공휴일은 직전
            영업일) 유럽중앙은행 기준 환율로 바꿨습니다. 지갑 충전·통화 변환·장터 거래는 지출이 아니거나 중복이라 제외합니다.
            DLC는 스팀에서 본편이 확인된 경우에만 본편 게임에 합산합니다. 기간 필터와 월별 차트는 구매일 기준이고, 가성비
            랭킹은 전체 기간의 결제액을 누적 플레이 시간으로 나눈 값입니다.
          </p>
        ) : (
          <p>
            보유 게임 정가 합계는 가격을 확인한 유료 게임의 현재 한국 정가(할인 전)를 더한 값입니다. 시간당 비용은 정가를
            스팀 누적 플레이 시간으로 나눈 값이며, 가성비 랭킹은 1시간 이상 플레이한 유료 게임만 비교합니다. 미플레이 게임은
            누적 플레이 시간이 0분인 유료 게임입니다. 스팀 공개 API는 구매일과 실제 결제 금액을 제공하지 않아 기간별 지출은
            구매내역을 가져온 뒤에 제공됩니다.
          </p>
        )}
      </details>
      <GameDetailDialog game={selectedGame} onClose={() => setSelectedGame(null)} />
      <PurchaseImportDialog
        open={importOpen}
        hasHistory={history}
        onClose={() => setImportOpen(false)}
        onImported={reload}
      />
    </>
  )
}
