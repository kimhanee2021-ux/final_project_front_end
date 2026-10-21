import { Navigate, useLocation } from 'react-router-dom'
import { onboardingLink, peekOnboardingReturn } from '@/pages/auth/onboardingFlow'

// 처음 접속하는 루트('/')의 랜딩 화면은 App의 LandingCover(public/landing을 iframe으로 띄움)가 그린다.
// 스팀 연동이 끝나면 백엔드가 '/?steamLinked=true'로 돌려보내므로, 그 경우만 앱 안으로 보낸다.
// 온보딩 중에 연동을 시작했다면 온보딩(추가 정보 단계)으로, 아니면 내 라이브러리로 간다.
export default function LandingPage() {
  const { search } = useLocation()
  if (new URLSearchParams(search).get('steamLinked') !== 'true') return null
  const onboardingNext = peekOnboardingReturn()
  return <Navigate to={onboardingNext ? onboardingLink(onboardingNext) : '/library?steamLinked=true'} replace />
}
