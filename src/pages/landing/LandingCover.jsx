import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// 랜딩(public/landing)은 스크롤 연출이 있는 정적 페이지라 iframe으로 앱 위에 띄운다.
// 가입/로그인 링크를 누르면 앱이 먼저 해당 화면으로 이동해 아래에 그려 두고,
// 랜딩을 왼쪽을 축으로 책장처럼 넘겨서 그 화면이 비쳐 보이게 한다. 새로 불러오는 구간이 없다.
const GO_PATHS = new Set(['/signup', '/login', '/start'])
const CHAPTER_KEY = 'gamesense-chapter'

export default function LandingCover() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const frame = useRef(null)
  const [turning, setTurning] = useState(false)
  // 스팀 연동 뒤 돌아오는 주소(/?steamLinked=true)는 LandingPage가 앱 안으로 보낸다.
  const onLanding = pathname === '/' && !new URLSearchParams(search).get('steamLinked')

  useEffect(() => {
    const onMessage = event => {
      const { data } = event
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return
      if (data?.type !== 'gamesense:go' || !GO_PATHS.has(data.path)) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        navigate(data.path)
        return
      }
      try { sessionStorage.setItem(CHAPTER_KEY, '1') } catch { /* 등장 연출만 생략된다. */ }
      setTurning(true)
      navigate(data.path)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [navigate])

  if (!onLanding && !turning) return null
  return (
    <div className={`landing-cover fixed inset-0 z-[100] ${turning ? 'turning pointer-events-none' : ''}`}>
      <div
        className={`landing-sheet absolute inset-0 bg-[#17121a] ${turning ? 'turning' : ''}`}
        onAnimationEnd={() => setTurning(false)}
      >
        <iframe ref={frame} title="GameSense 소개" src="/landing/index.html" className="block w-full h-full border-0" />
        <div className="landing-shade absolute inset-0" />
      </div>
    </div>
  )
}
