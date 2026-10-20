import { useAuth } from '@/features/auth'
import { useMySpending } from '../hooks/useMySpending'
import { MySpendingContext } from './MySpendingContext'

// 내 소비 분석 데이터(/api/analysis/spending)를 레이아웃 단계에서 딱 한 번만 받아 와서
// 홈 본문, 상단 스팀 상태, 사이드바 스팀 카드, 분석 화면이 같이 쓰게 한다.
// (각자 useMySpending을 부르면 같은 API를 화면마다 중복 호출하고, 스팀 동기화 결과도 서로 어긋난다.)
export default function MySpendingProvider({ children }) {
  const { user } = useAuth()
  const spending = useMySpending(user?.id)
  return <MySpendingContext.Provider value={spending}>{children}</MySpendingContext.Provider>
}
