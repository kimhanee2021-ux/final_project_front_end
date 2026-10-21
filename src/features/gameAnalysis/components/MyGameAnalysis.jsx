import { useAuth } from '@/features/auth'
import { useMySpendingContext, TEXT_BUTTON } from '@/features/spending'
import { FloatingDock, PageBox, PanelPage, Skeleton, EmptyState } from '@/shared/ui'
import { CoachEntry } from '@/features/ai-coach'
import { AiAnalysisSection } from '@/features/ai-insight'
import DataSectionTitle from './DataSectionTitle'
import GameAnalysisPanels from './GameAnalysisPanels'
import OverallAnalysisPanels from './OverallAnalysisPanels'
import TopicVisual from './TopicVisual'

// 로그인 사용자: 스팀 보유 게임 데이터로 AI 분석 페이지(AI 분석 + 게임별·종합 데이터)를 보여준다. 데이터가 없을 때의 안내만 여기서 맡는다 (스팀 연동 전 안내는 AI 분석 영역이 대신 보여준다).
export default function MyGameAnalysis() {
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
      <PanelPage>
        <AiAnalysisSection title="AI 분석" description="스팀 계정을 연동하면 AI가 내 게임을 분석해 드려요." onLinkSteam={startSteamLink} />
      </PanelPage>
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
  // 맨 위에 AI 분석, 그 아래로 게임별 데이터 → 종합 데이터가 이어진다
  return (
    <PanelPage>
      <AiAnalysisSection
        title="AI 분석"
        description="AI가 내 게임 소비를 진단하고, 아래에서 근거가 된 데이터를 확인할 수 있어요."
        renderVisual={topic => <TopicVisual key={topic} topic={topic} games={data.games} />}
        ask={<CoachEntry />}
      />
      <DataSectionTitle title="게임별 데이터" description="패널마다 하나씩, 내 게임을 살펴보세요." />
      <GameAnalysisPanels games={data.games} asOf={data.asOf} />
      <DataSectionTitle title="종합 데이터" description="패널마다 숫자 하나씩, 내 게임 생활을 짚어 볼게요." />
      <OverallAnalysisPanels games={data.games} hasHistory={data.hasPurchaseHistory} />
      {/* 오른쪽 아래: 맨 위/맨 아래 이동 버튼 */}
      <FloatingDock />
    </PanelPage>
  )
}
