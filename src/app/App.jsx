import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import GameSenseProvider from './providers/GameSenseProvider'

// 최상위 라우트 컴포넌트. 라우터 훅을 쓰는 Provider들이 라우터 안에 있어야 해서 여기서 감싼다.
export default function App() {
  return (
    <AuthProvider>
      <GameSenseProvider>
        <Outlet />
      </GameSenseProvider>
    </AuthProvider>
  )
}
