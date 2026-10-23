import { lazy, Suspense, useEffect } from 'react'

// 지도 데이터가 커서 이 화면을 열 때만 불러온다.
const GamerMapEmbed = lazy(() => import('@/features/gamer-map').then(module => ({ default: module.GamerMapEmbed })))

// 랜딩 페이지(public/landing)의 "전 세계 PC 게이머" 장면에 iframe으로 들어가는 화면.
// 랜딩의 어두운 배경이 비쳐 보이도록 페이지 바탕을 투명하게 둔다.
export default function LandingMapPage() {
  useEffect(() => {
    const targets = [document.documentElement, document.body]
    const previous = targets.map(element => element.style.background)
    targets.forEach(element => { element.style.background = 'transparent' })
    return () => targets.forEach((element, index) => { element.style.background = previous[index] })
  }, [])
  return (
    // 지도를 화면 세로 가운데에 둔다. 랜딩은 이 화면(iframe)의 가운데를 왼쪽 문구 높이에 맞춘다.
    <main className="min-h-[100svh] flex flex-col justify-center p-[4px]">
      <Suspense fallback={null}>
        <GamerMapEmbed />
      </Suspense>
    </main>
  )
}
