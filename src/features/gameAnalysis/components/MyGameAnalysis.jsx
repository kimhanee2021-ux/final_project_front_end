import { useAuth } from '@/features/auth'
import { useMySpendingContext, TEXT_BUTTON } from '@/features/spending'
import { PageBox, Skeleton, EmptyState } from '@/shared/ui'
import GameAnalysisView from './GameAnalysisView'
import OverallAnalysisView from './OverallAnalysisView'

// 로그인 사용자: 스팀 보유 게임 데이터로 게임별 분석을 보여준다. 데이터가 없을 때의 안내만 여기서 맡는다.
export default function MyGameAnalysis({ overall = false }) {
  const { startSteamLink } = useAuth()
  const { data, loading, syncing, error, notLinked, reload, sync } = useMySpendingContext()
  if (loading)
    return (
      <PageBox>
        <Skeleton />
      </PageBox>
    )
  if (notLinked)
    return (
      <PageBox>
        <EmptyState
          title="스팀 계정을 연동해 주세요"
          description="보유 게임과 플레이 시간을 불러와 게임별 분석을 만들어 드려요."
          action={<button type="button" className={TEXT_BUTTON} onClick={startSteamLink}>Steam 계정 연동하기</button>}
        />
      </PageBox>
    )
  if (error)
    return (
      <PageBox>
        <EmptyState
          title="분석을 불러오지 못했어요"
          description={error}
          action={<button type="button" className={TEXT_BUTTON} onClick={reload}>다시 시도</button>}
        />
      </PageBox>
    )
  if (!data?.games.length)
    return (
      <PageBox>
        <EmptyState
          title="아직 불러온 보유 게임이 없어요"
          description="스팀 라이브러리를 동기화하면 바로 분석해 드려요."
          action={
            <button type="button" className={TEXT_BUTTON} onClick={sync} disabled={syncing}>
              {syncing ? '스팀에서 불러오는 중...' : '스팀 동기화'}
            </button>
          }
        />
      </PageBox>
    )
  const View = overall ? OverallAnalysisView : GameAnalysisView
  return <View games={data.games} asOf={data.asOf} />
}
