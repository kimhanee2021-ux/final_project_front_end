import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { useMySpendingContext } from '../context/MySpendingContext'
import { Skeleton, EmptyState, GSIcon } from '@/shared/ui'
import DashboardIntro from './DashboardIntro'
import { PurchaseImportDialog } from '@/features/purchaseImport'
import PurchasedGamesTable from './PurchasedGamesTable'
import GameDetailDialog from './GameDetailDialog'
import { NOTICE, TEXT_BUTTON } from '../styles'

const BADGE = '스팀 연동 · 정가 추정'
const HISTORY_BADGE = '구매내역 연동 · 실제 결제액'

// 로그인 사용자의 구매 내역 화면(/purchases): 스팀 보유 게임과 구매 표.
// 구매내역을 가져오기 전에는 현재 한국 정가로 추정한 금액을, 가져온 뒤에는 실제 결제액(구매일 환율 원화 환산)을 보여준다.
export default function MyPurchases() {
  const { startSteamLink } = useAuth()
  const { data, loading, syncing, error, notLinked, reload, sync } = useMySpendingContext()
  const [filter, setFilter] = useState('all')
  const [selectedGame, setSelectedGame] = useState(null)
  const [importOpen, setImportOpen] = useState(false)

  const asOf = data?.asOf ?? new Date().toISOString().slice(0, 10)
  const syncButton = (
    <button type="button" className={TEXT_BUTTON} onClick={sync} disabled={syncing}>
      {syncing ? '스팀에서 불러오는 중...' : '스팀 다시 동기화'}
      <GSIcon name="refresh" size={15} />
    </button>
  )

  if (loading) return <Skeleton />
  if (notLinked || error || !data?.games.length) {
    return (
      <>
        <DashboardIntro view="library" asOf={asOf} badgeLabel={BADGE} />
        {notLinked ? (
          <EmptyState
            title="스팀 계정을 연동해 주세요"
            description="보유 게임과 구매 내역을 불러와 보여 드려요."
            action={
              <button type="button" className={TEXT_BUTTON} onClick={startSteamLink}>
                Steam 계정 연동하기
                <GSIcon name="arrow" size={15} />
              </button>
            }
          />
        ) : error ? (
          <EmptyState
            title="구매 내역을 불러오지 못했어요"
            description={error}
            action={
              <button type="button" className={TEXT_BUTTON} onClick={reload}>
                다시 시도
                <GSIcon name="refresh" size={15} />
              </button>
            }
          />
        ) : (
          <EmptyState
            title="아직 불러온 보유 게임이 없어요"
            description="스팀 라이브러리를 동기화하면 구매 내역을 바로 보여 드려요."
            action={syncButton}
          />
        )}
      </>
    )
  }

  const games = data.games
  const history = data.hasPurchaseHistory
  return (
    <>
      <DashboardIntro view="library" asOf={asOf} badgeLabel={history ? HISTORY_BADGE : BADGE} />
      <div className="flex justify-between gap-[16px] items-center mb-[17px] max-[580px]:items-start max-[580px]:flex-col max-[580px]:gap-[12px]">
        <div>
          <h2 className="text-[18px] font-[700] tracking-[-0.5px]">내 게임과 구매 내역</h2>
          <span className="text-[13px] text-muted">
            스팀 보유 게임 {games.length}개 · {history ? '실제 결제액 (구매일 환율로 원화 환산)' : '현재 한국 정가 기준 추정'}
          </span>
        </div>
        <div className="flex items-center gap-[14px] flex-wrap justify-end max-[580px]:justify-start">
          <button type="button" className={TEXT_BUTTON} onClick={() => setImportOpen(true)}>
            {history ? '구매내역 다시 가져오기' : '구매내역 가져오기'}
            <GSIcon name="library" size={15} />
          </button>
          {syncButton}
        </div>
      </div>
      <PurchasedGamesTable
        games={games}
        filter={filter}
        setFilter={setFilter}
        genre={null}
        clearGenre={() => {}}
        onSelect={setSelectedGame}
        library
      />
      <div className={NOTICE}>
        <GSIcon name="info" size={16} className="shrink-0" />
        <p>
          {history
            ? '금액은 스팀 구매내역의 실제 결제액을 구매일 환율로 원화로 바꾼 값이에요. 구매 기록 없음은 선물·키 등록·무료 배포 등으로 얻은 게임이에요.'
            : '금액은 실제 결제액이 아니라 현재 한국 스팀 정가로 추정한 값이에요. 구매내역을 가져오면 실제 결제액과 구매일로 바뀌어요.'}
        </p>
      </div>
      <GameDetailDialog game={selectedGame} onClose={() => setSelectedGame(null)} />
      <PurchaseImportDialog open={importOpen} hasHistory={history} onClose={() => setImportOpen(false)} onImported={reload} />
    </>
  )
}
