import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App'
import GameSenseLayout from './layouts/GameSenseLayout'
import HomePage from './pages/home/HomePage'
import ExplorePage from './pages/explore/ExplorePage'
import UpcomingPage from './pages/upcoming/UpcomingPage'
import CollectionsPage from './pages/collections/CollectionsPage'
import ActivityPage from './pages/activity/ActivityPage'
import SettingsPage from './pages/settings/SettingsPage'
import AnalysisPage from './pages/analysis/AnalysisPage'
import PerformancePage from './pages/performance/PerformancePage'
import MyPage from './pages/mypage/MyPage'
import AuthPage from './pages/auth/AuthPage'
import RequireDemoSession from './features/auth/components/RequireDemoSession'
import GameCatalog from './features/games/components/GameCatalog'
import CommunityPage from './pages/community/CommunityPage'
import CommunityPostPage from './pages/community/CommunityPostPage'
import CommunityWritePage from './pages/community/CommunityWritePage'
import AiGames from './pages/ai/AiGames'
import ScreenshotAnalysis from './pages/ai/ScreenshotAnalysis'
import HangulBlocks from './pages/blocks/HangulBlocks'
import TasteWorldcup from './pages/worldcup/TasteWorldcup'
import GameManager from './pages/manager/GameManager'


// 같은 컴포넌트를 mode만 바꿔 쓰는 라우트는 key로 구분해 페이지 이동 시 상태를 초기화한다.
const authRoutes = ['login', 'signup', 'forgot-password'].map(mode => ({
  path: mode,
  element: <AuthPage key={mode} mode={mode} />,
}))
const catalogRoutes = modes =>
  modes.map(mode => ({
    path: mode,
    element: <GameCatalog key={mode} mode={mode} />,
  }))

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      ...authRoutes,
      {
        element: <GameSenseLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'explore', element: <ExplorePage /> },
          ...catalogRoutes(['genres', 'trending', 'recommendations']),
          { path: 'upcoming', element: <UpcomingPage /> },
          { path: 'pc-check', element: <PerformancePage /> },
          { path: 'ai-games', element: <AiGames /> },
          { path: 'ai-screenshots', element: <ScreenshotAnalysis /> },
          { path: 'ai-worldcup', element: <TasteWorldcup /> },
          { path: 'ai-game-manager', element: <GameManager /> },
          { path: 'hangul-blocks', element: <HangulBlocks /> },
          {
            // 로그인(데모 세션)이 필요한 페이지
            element: <RequireDemoSession />,
            children: [
              ...catalogRoutes(['library', 'wishlist']),
              { path: 'collections', element: <CollectionsPage /> },
              { path: 'activity', element: <ActivityPage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'mypage', element: <MyPage /> },
              { path: 'community', element: <CommunityPage /> },
              { path: 'community/new', element: <CommunityWritePage /> },
              { path: 'community/:id', element: <CommunityPostPage /> },
              { path: 'community/:id/edit', element: <CommunityWritePage /> },
              {
                path: 'analysis',
                element: <div className="gs-legacy"><AnalysisPage view="analysis" /></div>,
              },
              {
                path: 'purchases',
                element: <div className="gs-legacy"><AnalysisPage view="library" /></div>,
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
