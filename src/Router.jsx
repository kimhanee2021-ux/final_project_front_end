import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App'
import GameSenseLayout from './layouts/GameSenseLayout'
import DiscoverPage, { GameCatalog } from './pages/discover/DiscoverPage'
import ExplorePage from './pages/explore/ExplorePage'
import {
  ActivityPage,
  CollectionsPage,
  SettingsPage,
  UpcomingPage,
} from './pages/discover/LibraryPages'
import HomePage from './pages/home/HomePage'
import PerformancePage from './pages/performance/PerformancePage'
import MyPage from './pages/mypage/MyPage'
import AuthPage from './pages/auth/AuthPage'
import RequireDemoSession from './components/auth/RequireDemoSession'
import AiGames from './pages/ai/AiGames'

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
          { index: true, element: <DiscoverPage /> },
          { path: 'explore', element: <ExplorePage /> },
          ...catalogRoutes(['genres', 'trending', 'recommendations']),
          { path: 'upcoming', element: <UpcomingPage /> },
          { path: 'pc-check', element: <PerformancePage /> },
          { path: 'ai-games', element: <AiGames /> },
          {
            // 로그인(데모 세션)이 필요한 페이지
            element: <RequireDemoSession />,
            children: [
              ...catalogRoutes(['library', 'wishlist']),
              { path: 'collections', element: <CollectionsPage /> },
              { path: 'activity', element: <ActivityPage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'mypage', element: <MyPage /> },
              {
                path: 'analysis',
                element: <div className="gs-legacy"><HomePage view="analysis" /></div>,
              },
              {
                path: 'purchases',
                element: <div className="gs-legacy"><HomePage view="library" /></div>,
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
