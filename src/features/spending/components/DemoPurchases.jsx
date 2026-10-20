import { useState } from 'react'
import { useDashboardData } from '../hooks/useDashboardData'
import { Skeleton, ErrorState, GSIcon } from '@/shared/ui'
import DashboardIntro from './DashboardIntro'
import PurchasedGamesTable from './PurchasedGamesTable'
import GameDetailDialog from './GameDetailDialog'
import { summarize } from '../model/spendingMetrics'

// 데모 체험 사용자의 구매 내역 화면: 데모 데이터로 보유 게임과 구매 표를 보여준다.
export default function DemoPurchases() {
  const { data, loading, error, retry } = useDashboardData()
  const [filter, setFilter] = useState('all')
  const [selectedGame, setSelectedGame] = useState(null)
  if (loading) return <Skeleton />
  if (error) return <ErrorState onRetry={retry} />
  const summary = summarize(data.games)
  return (
    <>
      <DashboardIntro view="library" asOf={data.asOf} />
      <PurchasedGamesTable
        games={data.games}
        filter={filter}
        setFilter={setFilter}
        genre={null}
        clearGenre={() => {}}
        onSelect={setSelectedGame}
        library
      />
      <div className="flex items-start gap-[8px] mt-[24px] text-faint text-[12px]">
        <GSIcon name="info" size={16} className="shrink-0" />
        <p>
          현재는 데모 데이터로 표시됩니다.{' '}
          {summary.unknownCount > 0 && <>구매 금액 미확인 게임 {summary.unknownCount}개는 지출 집계에서 제외했어요. </>}
          계정 연동 및 실제 구매 내역 연결은 추후 제공됩니다.
        </p>
      </div>
      <GameDetailDialog game={selectedGame} onClose={() => setSelectedGame(null)} />
    </>
  )
}
