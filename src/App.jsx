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

export default function App() {
  return (
    <Routes>
      <Route element={<GameSenseLayout />}>
        <Route index element={<DiscoverPage />} />
        {['explore', 'genres', 'trending', 'library', 'wishlist', 'recommendations'].map(mode => (
          <Route key={mode} path={mode} element={<GameCatalog key={mode} mode={mode} />} />
        ))}
        <Route path="upcoming" element={<UpcomingPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="pc-check" element={<PerformancePage />} />
        <Route path="mypage" element={<MyPage />} />
        <Route
          path="analysis"
          element={
            <div className="gs-legacy">
              <HomePage view="analysis" />
            </div>
          }
        />
        <Route
          path="purchases"
          element={
            <div className="gs-legacy">
              <HomePage view="library" />
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
