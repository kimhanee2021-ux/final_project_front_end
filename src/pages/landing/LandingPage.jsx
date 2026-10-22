import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

// 처음 접속하는 루트('/')는 정적 랜딩 페이지(public/landing)로 연결한다.
// 스팀 연동이 끝나면 백엔드가 '/?steamLinked=true'로 돌려보내므로, 그 경우만 앱 안으로 보낸다.
export default function LandingPage() {
  const { search } = useLocation()
  const steamLinked = new URLSearchParams(search).get('steamLinked') === 'true'
  useEffect(() => {
    if (!steamLinked) window.location.replace('/landing/index.html')
  }, [steamLinked])
  return steamLinked ? <Navigate to="/library?steamLinked=true" replace /> : null
}
