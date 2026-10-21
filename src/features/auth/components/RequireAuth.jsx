import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authLink } from '../model/authSession'

// 로그인한 사용자만 자식 라우트를 보여준다. 로그인 전이면 로그인 화면으로 보내고, 로그인 뒤 원래 보던 화면으로 돌아온다.
// 화면 이동용 가드일 뿐, 실제 권한 검사는 백엔드(JWT)가 한다.
export default function RequireAuth() {
  const { isAuthenticated, isAuthLoading } = useAuth()
  const location = useLocation()
  if (isAuthLoading) return null
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate replace to={authLink('login', location.pathname + location.search + location.hash)} state={{ loginRequired: true }} />
  )
}
