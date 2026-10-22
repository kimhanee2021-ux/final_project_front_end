import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { forgetOnboarding, isOnboardingDone, safeReturnTo, useAuth } from '@/features/auth'
import { MySpendingProvider, useMySpendingContext, useSpendingStatus } from '@/features/spending'
import AuthShell from './shell/AuthShell'
import SteamStep from './onboarding/SteamStep'
import ExtrasStep from './onboarding/ExtrasStep'

// 가입 직후 "내 게임 라이프"를 시작하는 곳. 로그인 주소 '/'는 랜딩이라 기본 목적지는 내 라이브러리로 둔다.
const DEFAULT_NEXT = '/library'

// 2단계(스팀 연동) → 3단계(구매 내역·PC 사양). 스팀 연동이 확인되면 3단계로 넘어간다.
function Onboarding() {
  const { user } = useAuth()
  const { reload, data } = useMySpendingContext()
  const { status } = useSpendingStatus()
  // 구매 내역을 가져오면 데이터를 다시 받는 동안 status가 잠깐 loading이 된다. 3단계에 한 번 들어왔으면 그대로 둔다.
  const [linked, setLinked] = useState(false)
  if (status === 'ready' && !linked) setLinked(true)
  const [params] = useSearchParams()
  const requested = safeReturnTo(params.get('next'))
  const next = requested === '/' ? DEFAULT_NEXT : requested

  useEffect(() => {
    const previous = document.title
    document.title = '시작하기 | GameSense'
    forgetOnboarding()
    return () => { document.title = previous }
  }, [])

  // 이미 연동과 추가 정보 단계를 마친 계정은 로그인하자마자 원래 가려던 곳으로 간다.
  if (status === 'ready' && isOnboardingDone(user.id)) return <Navigate to={next} replace />

  return (
    <AuthShell>
      {linked ? (
        <ExtrasStep userId={user.id} next={next} hasHistory={Boolean(data?.hasPurchaseHistory)} onImported={reload} />
      ) : (
        <SteamStep next={next} status={status} onRetry={reload} />
      )}
    </AuthShell>
  )
}

// 로그인한 사람만 들어오는 화면(RequireAuth 안). 스팀 연동 상태는 소비 분석 데이터에서 읽어 온다.
export default function OnboardingPage() {
  return (
    <MySpendingProvider>
      <Onboarding />
    </MySpendingProvider>
  )
}
