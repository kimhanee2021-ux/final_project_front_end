import { MyGameAnalysis } from '@/features/gameAnalysis'

// 나의 분석: view='analysis'는 게임별 분석, 'overall'은 종합 분석. 로그인한 사용자의 스팀 보유 게임 데이터를 보여준다.
export default function AnalysisPage({ view = 'analysis' }) {
  return <MyGameAnalysis overall={view === 'overall'} />
}
