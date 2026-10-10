import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import './styles/ai-shell.css'

function App() {
  return (
    <div className="ai-shell">
      <Sidebar />
      <main className="ai-workspace">
        <div className="ai-shell-header"><span>GameSense <span className="ai-breadcrumb">/ 게임 도우미</span></span><span>Play Smarter</span></div>
        <Outlet />
      </main>
    </div>
  )
}

export default App
