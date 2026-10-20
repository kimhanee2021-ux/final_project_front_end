import { useAuth } from '@/features/auth'
import { useMySpendingContext } from '../context/MySpendingContext'

// 홈 카드, 상단 스팀 상태, 사이드바 스팀 카드가 공통으로 필요한 "지금 데이터가 어떤 상태인가"를 한 곳에서 판단한다.
//  guest(로그인 전) / loading / notLinked(스팀 미연동) / error / ready(data 있음)
export function useSpendingStatus() {
  const { isAuthenticated, isAuthLoading } = useAuth()
  const { data, loading, notLinked, error } = useMySpendingContext()

  if (isAuthLoading || (isAuthenticated && loading)) return { status: 'loading' }
  if (!isAuthenticated) return { status: 'guest' }
  if (notLinked) return { status: 'notLinked' }
  if (!data) return { status: 'error', error }
  return { status: 'ready', data }
}
