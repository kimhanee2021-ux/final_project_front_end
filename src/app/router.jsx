import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from '@/app/App'
import { PageBox } from '@/shared/ui'
import GameSenseLayout from '@/app/layout/GameSenseLayout'
import LandingPage from '@/pages/landing/LandingPage'
import StartPage from '@/pages/landing/StartPage'
import ExplorePage from '@/pages/explore/ExplorePage'
import CollectionsPage from '@/pages/collections/CollectionsPage'
import ActivityPage from '@/pages/activity/ActivityPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import AnalysisPage from '@/pages/analysis/AnalysisPage'
import PurchasesPage from '@/pages/purchases/PurchasesPage'
import WishlistPage from '@/pages/wishlist/WishlistPage'
import PcSpecPage from '@/pages/performance/PcSpecPage'
import PcEvaluationPage from '@/pages/performance/PcEvaluationPage'
import PerformancePage from '@/pages/performance/PerformancePage'
import HangulBlocks from '@/pages/blocks/HangulBlocks'
import MyPage from '@/pages/mypage/MyPage'
import AuthPage from '@/pages/auth/AuthPage'
import { RequireDemoSession } from '@/features/auth'
import { GameCatalog } from '@/features/games'
import CommunityPage from '@/pages/community/CommunityPage'
import CommunityPostPage from '@/pages/community/CommunityPostPage'
import CommunityWritePage from '@/pages/community/CommunityWritePage'

// 스크롤 섹션으로 만들지 않은 목록·글 화면은 가운데 정렬된 컨테이너 안에 놓는다.
const contained = element => <PageBox>{element}</PageBox>

// 같은 컴포넌트를 mode만 바꿔 쓰는 라우트는 key로 구분해 페이지 이동 시 상태를 초기화한다.
const authRoutes = ['login', 'signup', 'forgot-password'].map(mode => ({
  path: mode,
  element: <AuthPage key={mode} mode={mode} />,
}))
const catalogRoutes = modes =>
  modes.map(mode => ({
    path: mode,
    element: contained(<GameCatalog key={mode} mode={mode} />),
  }))

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'start', element: <StartPage /> },
      ...authRoutes,
      {
        element: <GameSenseLayout />,
        children: [
          { path: 'explore', element: <ExplorePage /> },
          { path: 'trending', element: <Navigate to="/explore" replace /> },
          ...catalogRoutes(['recommendations']),
          { path: 'pc-check', element: <PcSpecPage /> },
          { path: 'pc-check/evaluation', element: <PcEvaluationPage /> },
          { path: 'pc-check/diagnosis', element: <PerformancePage /> },
          { path: 'hangul-blocks', element: <HangulBlocks /> },
          {
            // 로그인(데모 세션)이 필요한 페이지
            element: <RequireDemoSession />,
            children: [
              ...catalogRoutes(['library']),
              { path: 'wishlist', element: contained(<WishlistPage />) },
              { path: 'collections', element: <CollectionsPage /> },
              { path: 'activity', element: contained(<ActivityPage />) },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'mypage', element: <MyPage /> },
              { path: 'community', element: contained(<CommunityPage />) },
              { path: 'community/new', element: contained(<CommunityWritePage />) },
              { path: 'community/:id', element: contained(<CommunityPostPage />) },
              { path: 'community/:id/edit', element: contained(<CommunityWritePage />) },
              {
                path: 'analysis',
                element: <AnalysisPage view="analysis" />,
              },
              {
                path: 'analysis/overall',
                element: <AnalysisPage view="overall" />,
              },
              {
                path: 'purchases',
                element: contained(<PurchasesPage />),
              },
            ],
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])

export default router
