import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authLink } from '../authSession'

// 화면 이동용 가드일 뿐, 실제 권한 검사는 백엔드(JWT)가 한다.
// 실제 로그인 또는 데모 세션이면 통과시킨다.
export default function RequireDemoSession() {
  const { isSignedIn, isAuthLoading } = useAuth()
  const location = useLocation()
  if (isAuthLoading) return null
  return isSignedIn ? <Outlet /> : <Navigate replace to={authLink('login', location.pathname + location.search + location.hash)} state={{ loginRequired: true }} />
}
