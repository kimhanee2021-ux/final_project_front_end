import { useAuth } from '@/features/auth'
import { MyGameAnalysis, DemoGameAnalysis } from '@/features/gameAnalysis'

// 나의 분석: view='analysis'는 게임별 분석, 'overall'은 종합 분석.
// 로그인 사용자는 스팀 보유 게임 데이터를, 데모 체험 사용자는 데모 데이터를 본다.
export default function AnalysisPage({ view = 'analysis' }) {
  const { isAuthenticated } = useAuth()
  const overall = view === 'overall'
  return isAuthenticated ? <MyGameAnalysis overall={overall} /> : <DemoGameAnalysis overall={overall} />
}
