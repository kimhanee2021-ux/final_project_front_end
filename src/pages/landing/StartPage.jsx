import { Navigate } from 'react-router-dom'
import { useStartLink } from '@/features/auth'

// 랜딩의 '시작하기' 링크가 향하는 곳. 로그인 전이면 로그인 창, 로그인 상태면 내 라이브러리로 보낸다.
export default function StartPage() {
  return <Navigate to={useStartLink()} replace />
}
