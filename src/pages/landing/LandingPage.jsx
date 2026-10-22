import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { announceSteamLinked, onboardingLink, peekOnboardingReturn } from '@/features/auth'

// 스팀 연동을 새 창으로 띄웠다면 이 화면이 그 창의 마지막이다: 원래 창에 알리고 스스로 닫는다.
function SteamLinkedPopup() {
  useEffect(() => {
    announceSteamLinked()
    const timer = window.setTimeout(() => window.close(), 600)
    return () => window.clearTimeout(timer)
  }, [])
  return (
    <main className="min-h-[100svh] grid place-content-center gap-[10px] bg-[#17121a] px-[24px] text-center text-[#e8ece6]" role="status">
      <strong className="text-[22px] font-[600]">스팀 연동이 완료됐어요</strong>
      <p className="text-[14px] text-[#a9b8ae]">이 창은 자동으로 닫혀요. 닫히지 않으면 직접 닫고 원래 창으로 돌아가 주세요.</p>
    </main>
  )
}

// 처음 접속하는 루트('/')의 랜딩 화면은 App의 LandingCover(public/landing을 iframe으로 띄움)가 그린다.
// 스팀 연동이 끝나면 백엔드가 '/?steamLinked=true'로 돌려보내므로, 그 경우만 앱 안으로 보낸다.
// 새 창(popup=true)이면 원래 창에 알리고 닫는다. 이 창 전체를 이동시켜 연동한 예전 방식이면, 온보딩 중에 시작했을 때는
// 온보딩(추가 정보 단계)으로, 아니면 내 라이브러리로 간다.
export default function LandingPage() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  if (params.get('steamLinked') !== 'true') return null
  if (params.get('popup') === 'true') return <SteamLinkedPopup />
  const onboardingNext = peekOnboardingReturn()
  return <Navigate to={onboardingNext ? onboardingLink(onboardingNext) : '/library?steamLinked=true'} replace />
}
