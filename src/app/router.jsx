import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from '@/app/App'
import GameSenseLayout from '@/app/layout/GameSenseLayout'
import LandingPage from '@/pages/landing/LandingPage'
import StartPage from '@/pages/landing/StartPage'
import ExplorePage from '@/pages/explore/ExplorePage'
import GameNewsPage from '@/pages/game-news/GameNewsPage'
import GameNewsDetailPage from '@/pages/game-news/GameNewsDetailPage'
import AiCoachPage from '@/pages/ai-coach/AiCoachPage'
import AnalysisPage from '@/pages/analysis/AnalysisPage'
import WishlistPage from '@/pages/wishlist/WishlistPage'
import PcDiagnosisPage from '@/pages/performance/PcDiagnosisPage'
import MyPage from '@/pages/mypage/MyPage'
import AuthPage from '@/pages/auth/AuthPage'
import OnboardingPage from '@/pages/auth/OnboardingPage'
import { RequireAuth } from '@/features/auth'
import LibraryPage from '@/pages/library/LibraryPage'
import AiRecommendsPage from '@/pages/ai-recommends/AiRecommendsPage'
import LandingMapPage from '@/pages/landing/LandingMapPage'

// 같은 컴포넌트를 mode만 바꿔 쓰는 라우트는 key로 구분해 페이지 이동 시 상태를 초기화한다.
const authRoutes = ['login', 'signup', 'forgot-password'].map(mode => ({
  path: mode,
  element: <AuthPage key={mode} mode={mode} />,
}))

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'start', element: <StartPage /> },
      // 랜딩 페이지(public/landing) 안에 iframe으로 끼워 넣는 게이머 지도 화면
      { path: 'landing-map', element: <LandingMapPage /> },
      ...authRoutes,
      {
        // 가입·로그인 직후 스팀 연동(필수)과 추가 정보(선택)를 받는 단계
        element: <RequireAuth />,
        children: [{ path: 'onboarding', element: <OnboardingPage /> }],
      },
      {
        element: <GameSenseLayout />,
        children: [
          { path: 'explore', element: <ExplorePage /> },
          { path: 'bbs', element: <GameNewsPage /> },
          { path: 'bbs/:appId/:newsId', element: <GameNewsDetailPage /> },
          // 게이머 지도는 랜딩 페이지로, 프로·스트리머 영상은 AI 게임 추천 카드로 옮겼다 (예전 주소로 들어와도 열리게 한다)
          { path: 'gamer-map', element: <Navigate to="/" replace /> },
          { path: 'pro-streamer-play', element: <Navigate to="/ai-recommends" replace /> },
          { path: 'trending', element: <Navigate to="/explore" replace /> },
          { path: 'pc-check', element: <PcDiagnosisPage /> },
          // 종합평가는 AI PC 진단 페이지로 합쳐졌다 (예전 주소로 들어와도 열리게 한다)
          { path: 'pc-check/evaluation', element: <Navigate to="/pc-check" replace /> },
          { path: 'pc-check/diagnosis', element: <Navigate to="/pc-check" replace /> },
          {
            // 로그인이 필요한 페이지
            element: <RequireAuth />,
            children: [
              { path: 'library', element: <LibraryPage /> },
              { path: 'ai-recommends', element: <AiRecommendsPage /> },
              { path: 'wishlist', element: <WishlistPage /> },
              // AI 게임 추천은 /ai-recommends 하나로 합쳐졌다 (예전 주소로 들어와도 열리게 한다)
              { path: 'recommendations', element: <Navigate to="/ai-recommends" replace /> },
              // 설정 페이지는 없앴다 (테마는 헤더 톱니바퀴에서 바꾼다). 예전 주소로 들어오면 마이페이지로 보낸다
              { path: 'settings', element: <Navigate to="/mypage" replace /> },
              { path: 'mypage', element: <MyPage /> },
              { path: 'analysis', element: <AnalysisPage /> },
              // 종합 분석은 AI 분석 페이지로 합쳐졌다 (예전 주소로 들어와도 열리게 한다)
              { path: 'analysis/overall', element: <Navigate to="/analysis" replace /> },
              { path: 'ai-coach', element: <AiCoachPage /> },
            ],
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])

export default router
