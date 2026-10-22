import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from '@/app/App'
import { PageBox } from '@/shared/ui'
import GameSenseLayout from '@/app/layout/GameSenseLayout'
import LandingPage from '@/pages/landing/LandingPage'
import StartPage from '@/pages/landing/StartPage'
import ExplorePage from '@/pages/explore/ExplorePage'
import SettingsPage from '@/pages/settings/SettingsPage'
import AiCoachPage from '@/pages/aiCoach/AiCoachPage'
import AnalysisPage from '@/pages/analysis/AnalysisPage'
import PurchasesPage from '@/pages/purchases/PurchasesPage'
import WishlistPage from '@/pages/wishlist/WishlistPage'
import PcDiagnosisPage from '@/pages/performance/PcDiagnosisPage'
import HangulBlocks from '@/pages/blocks/HangulBlocks'
import MyPage from '@/pages/mypage/MyPage'
import AuthPage from '@/pages/auth/AuthPage'
import OnboardingPage from '@/pages/auth/OnboardingPage'
import { RequireAuth } from '@/features/auth'
import LibraryPage from '@/pages/library/LibraryPage'
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

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'start', element: <StartPage /> },
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
          { path: 'trending', element: <Navigate to="/explore" replace /> },
          { path: 'pc-check', element: <PcDiagnosisPage /> },
          // 종합평가는 AI PC 진단 페이지로 합쳐졌다 (예전 주소로 들어와도 열리게 한다)
          { path: 'pc-check/evaluation', element: <Navigate to="/pc-check" replace /> },
          { path: 'pc-check/diagnosis', element: <Navigate to="/pc-check" replace /> },
          { path: 'hangul-blocks', element: <HangulBlocks /> },
          {
            // 로그인이 필요한 페이지
            element: <RequireAuth />,
            children: [
              { path: 'library', element: <LibraryPage /> },
              { path: 'wishlist', element: contained(<WishlistPage />) },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'mypage', element: <MyPage /> },
              { path: 'community', element: contained(<CommunityPage />) },
              { path: 'community/new', element: contained(<CommunityWritePage />) },
              { path: 'community/:id', element: contained(<CommunityPostPage />) },
              { path: 'community/:id/edit', element: contained(<CommunityWritePage />) },
              { path: 'analysis', element: <AnalysisPage /> },
              // 종합 분석은 AI 분석 페이지로 합쳐졌다 (예전 주소로 들어와도 열리게 한다)
              { path: 'analysis/overall', element: <Navigate to="/analysis" replace /> },
              { path: 'ai-coach', element: <AiCoachPage /> },
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
