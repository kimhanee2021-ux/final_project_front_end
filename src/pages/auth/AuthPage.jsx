import { Navigate, useSearchParams } from 'react-router-dom'
import { onboardingLink, safeReturnTo, useAuth } from '@/features/auth'
import AuthShell from './shell/AuthShell'
import AuthIntro from './sign-in/AuthIntro'
import AuthCard from './sign-in/AuthCard'

// 로그인(/login) · 회원가입(/signup) · 비밀번호 찾기(/forgot-password)
export default function AuthPage({ mode = 'login' }) {
  const { isAuthenticated } = useAuth()
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('next'))
  // 로그인/가입이 성공하면 isAuthenticated가 바뀌면서 온보딩(스팀 연동 확인)으로 넘어간다.
  // 이미 연동을 마친 사람은 온보딩이 바로 returnTo로 다시 보내 준다.
  if (isAuthenticated) return <Navigate to={onboardingLink(returnTo)} replace />
  return (
    <AuthShell>
      <AuthIntro />
      <AuthCard mode={mode} returnTo={returnTo} />
    </AuthShell>
  )
}
