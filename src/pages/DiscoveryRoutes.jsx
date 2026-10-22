import { lazy, Suspense } from 'react'
import { PageBox } from '@/shared/ui'

const GamerMapPage = lazy(() => import('@/pages/gamerMap/GamerMapPage'))
const WeeklyRankingsPage = lazy(() => import('@/pages/rankings/WeeklyRankingsPage'))

function DiscoveryPage({ children }) {
  return (
    <Suspense fallback={<PageBox><p role="status" className="py-[48px] text-center text-muted">페이지를 불러오고 있어요.</p></PageBox>}>
      {children}
    </Suspense>
  )
}

export function GamerMapRoute() {
  return <DiscoveryPage><GamerMapPage /></DiscoveryPage>
}

export function WeeklyRankingsRoute() {
  return <DiscoveryPage><WeeklyRankingsPage /></DiscoveryPage>
}
