import { useDashboardData } from '@/features/spending'
import { PageBox, Skeleton, ErrorState } from '@/shared/ui'
import GameAnalysisView from './GameAnalysisView'
import OverallAnalysisView from './OverallAnalysisView'

// 데모 체험 사용자: 기존 데모 데이터로 게임별 분석을 보여준다.
export default function DemoGameAnalysis({ overall = false }) {
  const { data, loading, error, retry } = useDashboardData()
  if (loading) return <PageBox><Skeleton /></PageBox>
  if (error) return <PageBox><ErrorState onRetry={retry} /></PageBox>
  const View = overall ? OverallAnalysisView : GameAnalysisView
  return <View games={data.games} asOf={data.asOf} />
}
