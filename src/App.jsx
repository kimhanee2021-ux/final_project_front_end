import { Navigate, Route, Routes } from 'react-router-dom'
import GameSenseLayout from './layouts/GameSenseLayout'
import DiscoverPage, { GameCatalog } from './pages/discover/DiscoverPage'
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
import AuthProvider from './contexts/AuthProvider'
import GameSenseProvider from './contexts/GameSenseProvider'
import RequireDemoSession from './components/auth/RequireDemoSession'

export default function App() {
  return (
    <AuthProvider>
      <GameSenseProvider>
        <Routes>
          {['login', 'signup', 'forgot-password'].map(mode => (
            <Route key={mode} path={`/${mode}`} element={<AuthPage key={mode} mode={mode} />} />
          ))}
          <Route element={<GameSenseLayout />}>
            <Route index element={<DiscoverPage />} />
            {['explore', 'genres', 'trending', 'recommendations'].map(mode => (
              <Route key={mode} path={mode} element={<GameCatalog key={mode} mode={mode} />} />
            ))}
            <Route path="upcoming" element={<UpcomingPage />} />
            <Route path="pc-check" element={<PerformancePage />} />
            <Route element={<RequireDemoSession />}>
              {['library', 'wishlist'].map(mode => (
                <Route key={mode} path={mode} element={<GameCatalog key={mode} mode={mode} />} />
              ))}
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="mypage" element={<MyPage />} />
              <Route path="analysis" element={<div className="gs-legacy"><HomePage view="analysis" /></div>} />
              <Route path="purchases" element={<div className="gs-legacy"><HomePage view="library" /></div>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </GameSenseProvider>
    </AuthProvider>
  )
}
