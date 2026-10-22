import { MyGameAnalysis } from '@/features/gameAnalysis'

// 나의 분석 > AI 분석: 맨 위에 AI 분석, 그 아래로 게임별·종합 데이터. 로그인한 사용자의 스팀 보유 게임 데이터를 보여준다.
export default function AnalysisPage() {
  return <MyGameAnalysis />
}
