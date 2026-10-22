import { useAuth } from '../context/AuthContext'
import { authLink } from '../model/authSession'

const AFTER_LOGIN = '/library'

// 시작하기 버튼이 갈 곳: 로그인 전이면 로그인 창(로그인 뒤 내 라이브러리), 로그인 중이면 내 라이브러리.
export function useStartLink() {
  const { isSignedIn } = useAuth()
  return isSignedIn ? AFTER_LOGIN : authLink('login', AFTER_LOGIN)
}
