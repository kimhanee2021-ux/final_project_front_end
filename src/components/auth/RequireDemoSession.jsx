import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authLink } from '../../features/auth/authSession'

// A navigation gate for the prototype, not a server authorization boundary.
export default function RequireDemoSession() {
  const { isDemoSignedIn } = useAuth()
  const location = useLocation()
  return isDemoSignedIn ? <Outlet /> : <Navigate replace to={authLink('login', location.pathname + location.search + location.hash)} state={{ loginRequired: true }} />
}
